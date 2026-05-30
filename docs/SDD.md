# Batchly - System Design Document (SDD)

## 1. System Architecture Overview

### 1.1 Architecture Pattern
**BFF (Backend-for-Frontend) + Supabase**

Batchly uses Supabase as the backend platform (PostgreSQL, Auth, Row Level Security, Storage). The frontend communicates directly with Supabase via the JavaScript client library. Edge Functions handle complex business logic (PDF generation, recalculation jobs).

```
┌─────────────────────────────────────┐
│          Mobile Browser             │
│    (PWA - add to home screen)       │
├─────────────────────────────────────┤
│         React SPA (Vite)            │
│   TanStack Query │ React Router     │
│   shadcn/ui      │ Zustand (auth)   │
├─────────────────────────────────────┤
│         Supabase JS Client          │
└──────────────────┬──────────────────┘
                   │
    ┌──────────────┴──────────────┐
    │         Supabase            │
    │  ┌─────────┐ ┌──────────┐   │
    │  │  Auth   │ │PostgreSQL│   │
    │  │(GoTrue) │ │  (RLS)   │   │
    │  └─────────┘ └──────────┘   │
    │  ┌─────────┐ ┌──────────┐   │
    │  │ Storage │ │  Edge    │   │
    │  │ (media) │ │Functions │   │
    │  └─────────┘ └──────────┘   │
    └─────────────────────────────┘
```

### 1.2 Why Supabase
- PostgreSQL: mature, proven, excellent for multi-tenant SaaS
- RLS: security at database level (never trust the client)
- Auth: built-in with email, Google OAuth, session management
- Edge Functions: Deno-based, deploy globally, no cold start management
- Scalable: read replicas, connection pooling, point-in-time recovery
- Cost: generous free tier for MVP

### 1.3 Why Not Alternative Approaches
- **Custom backend (Node/Express)**: Overhead for MVP. Auth, RLS, migrations would all need custom implementation.
- **Firebase**: No RLS on Cloud Firestore (security rules are document-level, less robust). No native joins.
- **tRPC**: Added type-safety but MVP doesn't need tight client-server coupling. Supabase SDK is sufficient.

---

## 2. Multi-Tenancy Model

### 2.1 Organization-Based Isolation

```
organizations (tenant root)
    │
    ├── users (members)
    ├── ingredients
    ├── suppliers
    ├── inventory_transactions
    ├── recipes
    ├── recipe_items
    ├── products
    └── sales
```

Every row in a business table carries `organization_id`. RLS policies enforce:
```sql
CREATE POLICY "tenant_isolation" ON ingredients
  FOR ALL USING (organization_id = auth.jwt() ->> 'organization_id');
```

### 2.2 JWT Claims
On login/auth, the Supabase Auth trigger sets a custom claim `organization_id` in the JWT. This is used by RLS policies and frontend routing.

---

## 3. Database Design Principles

- **UUIDs** for all primary keys (never auto-increment)
- **created_at / updated_at** on every table
- **No calculated values stored** (HPP, margin, total are computed)
- **current_stock** on ingredients is maintained via DB trigger (practical concession)
- **Soft deletes** via `deleted_at` for suppliers with history
- **Audit logging** via trigger-based `audit_logs` table for critical inventory movements

---

## 4. Data Flow Examples

### 4.1 Recording a Stock-In
```
User fills form → React component → supabase.from('inventory_transactions').insert()
    → PostgreSQL INSERT trigger:
        1. Updates ingredient.current_stock += quantity
        2. Updates ingredient.purchase_price = unit_price (if price > 0)
        3. Inserts audit_log entry
    → TanStack Query invalidates cache → UI updates
```

### 4.2 Calculating Recipe HPP
```
User views recipe detail → React component
    → Query recipe_items with ingredient prices JOIN
    → Frontend calculates:
        production_cost = SUM(qty * cost_at_create)
        overhead_cost = production_cost * (overhead_pct / 100)
        total_hpp = production_cost + overhead_cost + packaging_cost
        per_unit_hpp = total_hpp / yield_amount
    → Display computed values
```

### 4.3 Running Stock Opname
```
User navigates to Stock Opname → React fetches all ingredients with current_stock
    → User enters physical_quantity per ingredient
    → On submit:
        1. System calculates difference
        2. User reviews differences
        3. On confirm: INSERT adjustment inventory_transaction for each difference
    → Trigger updates current_stock → UI updates
```

---

## 5. API Layer

### 5.1 Supabase Client-Side SDK
All CRUD operations use the Supabase JS client directly. RLS enforces security.

### 5.2 Edge Functions (Deno)
Used for operations requiring server-side computation:
- `recalculate-recipe-costs` → Batch update recipe_items.cost_at_create
- `export-report` → Generate PDF/CSV for sales or inventory
- `webhooks` → Stripe/Midtrans subscription management

### 5.3 Database Views for Common Queries
```sql
-- Profitability view
CREATE VIEW product_profitability AS
SELECT
    p.id,
    p.name,
    COUNT(s.id) as sales_count,
    SUM(s.quantity) as total_units,
    SUM(s.quantity * s.unit_price) as total_revenue,
    SUM(s.quantity * r.per_unit_hpp) as total_hpp,
    SUM(s.quantity * s.unit_price) - SUM(s.quantity * r.per_unit_hpp) as gross_profit
FROM products p
LEFT JOIN sales s ON s.product_id = p.id
LEFT JOIN recipes r ON r.id = p.recipe_id
GROUP BY p.id, p.name;
```

---

## 6. Frontend Architecture

### 6.1 Route Structure (React Router v6)
```
/                          → Landing (not in app)
/login                     → Auth
/signup                    → Auth
/app                       → Protected layout (sidebar + content)
  /app/dashboard           → Workspace home
  /app/inventory           → Ingredient list
  /app/inventory/:id       → Ingredient detail + movements
  /app/inventory/opname    → Stock opname
  /app/suppliers           → Supplier list
  /app/suppliers/:id       → Supplier detail + purchase history
  /app/suppliers/new       → New supplier
  /app/recipes             → Recipe list
  /app/recipes/new         → New recipe
  /app/recipes/:id         → Recipe detail (ingredients, cost, pricing)
  /app/products            → Product list
  /app/products/new        → New product
  /app/sales               → Sales list
  /app/sales/new           → Record sale
  /app/settings            → Organization settings, profile
```

### 6.2 Component Tree (Simplified)
```
<App>
  <AuthProvider>
    <QueryClientProvider>
      <Router>
        <Routes>
          <PublicRoute> → Login, Signup
          <ProtectedRoute>
            <AppShell>
              <MobileNav />    ← Bottom tab bar (mobile)
              <TopBar />       ← Search, user menu
              <main>           ← Page content
              </main>
            </AppShell>
          </ProtectedRoute>
        </Routes>
      </Router>
    </QueryClientProvider>
  </AuthProvider>
</App>
```

### 6.3 State Management
- **Server state**: TanStack Query (caching, invalidation, optimistic updates)
- **Auth state**: Zustand store (JWT, user profile, organization)
- **Form state**: React Hook Form + Zod validation
- **No global state for business data** (everything from server)

---

## 7. Mobile-First Layout Strategy

### 7.1 Breakpoints
| Breakpoint | Target |
|-----------|--------|
| < 640px | Mobile (primary) |
| 640-1023px | Tablet |
| 1024px+ | Desktop |

### 7.2 Navigation
- **Mobile**: Bottom tab bar (Dashboard, Inventory, Recipes, Sales, More)
- **Desktop**: Left sidebar (collapsible)

### 7.3 Interactions
- Tap targets: min 44x44px
- Forms: single-column, full-width inputs
- Modals: full-screen on mobile, centered dialog on desktop
- Lists: infinite scroll + pull-to-refresh

---

## 8. Offline Strategy (Phase 1 → Phase 2)

**Phase 1**: Online-only. PWA caching for static assets only.
**Phase 2**: Service Worker + IndexedDB for stock opname offline capability. Queue writes when online.

---

## 9. Security Architecture

### 9.1 Authentication Flow
```
User submits credentials → Supabase Auth
    → Returns JWT (access + refresh token)
    → Store in Zustand
    → Custom claim: organization_id set via trigger
    → All queries include Authorization header
    → RLS validates organization_id matches JWT
```

### 9.2 RLS Policy Pattern
Every table has 3 policies:
1. **SELECT**: organization_id = auth.jwt() ->> 'org_id'
2. **INSERT**: organization_id = auth.jwt() ->> 'org_id'
3. **UPDATE/DELETE**: Same as SELECT

### 9.3 Audit Logging
Trigger on inventory_transactions INSERT records to `audit_logs`:
- actor_id (user)
- action (INSERT, UPDATE, DELETE)
- table_name
- record_id
- old_data (for UPDATE/DELETE)
- new_data (for INSERT/UPDATE)
- timestamp

---

## 10. Performance Considerations

- **Pagination**: All list queries LIMIT 20 with cursor-based pagination
- **Indexes**: organization_id + created_at on all tables, foreign keys
- **Query batching**: Recipe detail page loads recipe + items + ingredient costs in single query via JOIN
- **Preloading**: Dashboard data prefetched after login
- **TanStack Query stale times**: Dashboard 30s, lists 60s, detail views 120s

---

## 11. Scalability Path

| Scale | Users | Strategy |
|-------|-------|----------|
| MVP | 0-100 | Single Supabase project, no replicas |
| Growth | 100-1,000 | Supabase Pro plan, connection pooling |
| Scale | 1,000-10,000 | Read replicas, Edge Functions for heavy calcs |
| Enterprise | 10,000+ | Dedicated Supabase project per region, CDN for assets |
