# Batchly — Frontend Architecture

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | React | 18.x |
| Build | Vite | 5.x |
| Language | TypeScript | 5.x |
| Routing | React Router | v6 |
| Server State | TanStack Query | 5.x |
| Forms | React Hook Form | 7.x + Zod |
| UI Library | shadcn/ui (Radix primitives) | Latest |
| Styling | Tailwind CSS | 3.x |
| Backend Client | Supabase JS | 2.x |
| Auth State | Zustand | 4.x |
| Testing | Vitest + Testing Library | Latest |
| PWA | vite-plugin-pwa | Latest |

---

## Project Structure

```
src/
├── App.tsx                    # Root component, providers, router
├── main.tsx                   # Entry point
├── index.css                  # Global styles, Tailwind imports
├── vite-env.d.ts
│
├── pages/                     # Route-level page components
│   ├── auth/
│   │   ├── LoginPage.tsx
│   │   └── SignupPage.tsx
│   ├── dashboard/
│   │   └── DashboardPage.tsx
│   ├── inventory/
│   │   ├── InventoryPage.tsx
│   │   ├── IngredientDetailPage.tsx
│   │   ├── StockOpnamePage.tsx
│   │   ├── StockInPage.tsx
│   │   └── StockOutPage.tsx
│   ├── suppliers/
│   │   ├── SuppliersPage.tsx
│   │   ├── SupplierDetailPage.tsx
│   │   └── SupplierFormPage.tsx
│   ├── recipes/
│   │   ├── RecipesPage.tsx
│   │   ├── RecipeDetailPage.tsx
│   │   └── RecipeFormPage.tsx
│   ├── products/
│   │   ├── ProductsPage.tsx
│   │   └── ProductFormPage.tsx
│   ├── sales/
│   │   ├── SalesPage.tsx
│   │   └── SaleFormPage.tsx
│   └── settings/
│       └── SettingsPage.tsx
│
├── components/                # Reusable UI components
│   ├── ui/                    # shadcn/ui primitives (generated)
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── toast.tsx
│   │   └── ...
│   ├── layout/
│   │   ├── AppLayout.tsx      # TopBar + content + BottomNav/Sidebar
│   │   ├── TopBar.tsx
│   │   ├── BottomNav.tsx
│   │   ├── Sidebar.tsx
│   │   └── PublicLayout.tsx
│   ├── inventory/
│   │   ├── IngredientRow.tsx
│   │   ├── StockInForm.tsx
│   │   ├── StockOutForm.tsx
│   │   └── OpnameRow.tsx
│   ├── suppliers/
│   │   ├── SupplierCard.tsx
│   │   └── PurchaseHistory.tsx
│   ├── recipes/
│   │   ├── RecipeCard.tsx
│   │   ├── RecipeIngredientList.tsx
│   │   └── CostBreakdown.tsx
│   ├── products/
│   │   └── ProductCard.tsx
│   ├── sales/
│   │   ├── SaleEntry.tsx
│   │   └── SaleForm.tsx
│   ├── dashboard/
│   │   ├── SummaryCards.tsx
│   │   ├── LowStockList.tsx
│   │   └── ActivityFeed.tsx
│   └── shared/
│       ├── SearchInput.tsx
│       ├── ConfirmDialog.tsx
│       ├── Skeleton.tsx
│       ├── EmptyState.tsx
│       └── ErrorState.tsx
│
├── hooks/                     # Custom React hooks
│   ├── useAuth.ts             # Auth state + actions
│   ├── useOrganization.ts     # Current org context
│   ├── useIngredients.ts      # CRUD + list queries
│   ├── useIngredient.ts       # Single ingredient + transactions
│   ├── useSuppliers.ts        # CRUD + list queries
│   ├── useSupplier.ts         # Single supplier detail
│   ├── useRecipes.ts          # CRUD + list queries
│   ├── useRecipe.ts           # Single recipe + items + cost calc
│   ├── useProducts.ts         # CRUD + list queries
│   ├── useSales.ts            # CRUD + list + profit analysis
│   └── useDashboard.ts        # Dashboard aggregated data
│
├── lib/                       # Utility functions & services
│   ├── supabase.ts            # Supabase client instance
│   ├── calculations.ts        # HPP, margin, cost calculations
│   ├── format.ts              # Currency, date, number formatters
│   └── constants.ts           # Units, categories, reasons
│
├── types/                     # TypeScript type definitions
│   ├── database.ts            # Supabase database types
│   ├── forms.ts               # Form schema types (Zod)
│   └── components.ts          # Shared component prop types
│
├── styles/                    # Additional styles
│   └── globals.css            # Custom utility classes
│
└── test/                      # Test utilities
    ├── setup.ts
    └── mocks.ts
```

---

## Route Configuration

```typescript
// src/App.tsx
const router = createBrowserRouter([
  // Public routes
  { path: '/login', element: <LoginPage /> },
  { path: '/signup', element: <SignupPage /> },

  // Protected routes
  {
    path: '/app',
    element: <AppLayout />,  // Auth guard + layout
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'inventory', element: <InventoryPage /> },
      { path: 'inventory/stock-in', element: <StockInPage /> },
      { path: 'inventory/stock-out', element: <StockOutPage /> },
      { path: 'inventory/opname', element: <StockOpnamePage /> },
      { path: 'inventory/:id', element: <IngredientDetailPage /> },
      { path: 'suppliers', element: <SuppliersPage /> },
      { path: 'suppliers/new', element: <SupplierFormPage /> },
      { path: 'suppliers/:id', element: <SupplierDetailPage /> },
      { path: 'suppliers/:id/edit', element: <SupplierFormPage /> },
      { path: 'recipes', element: <RecipesPage /> },
      { path: 'recipes/new', element: <RecipeFormPage /> },
      { path: 'recipes/:id', element: <RecipeDetailPage /> },
      { path: 'recipes/:id/edit', element: <RecipeFormPage /> },
      { path: 'products', element: <ProductsPage /> },
      { path: 'products/new', element: <ProductFormPage /> },
      { path: 'sales', element: <SalesPage /> },
      { path: 'sales/new', element: <SaleFormPage /> },
      { path: 'settings', element: <SettingsPage /> },
    ],
  },
]);
```

---

## Data Flow Pattern

### Pattern: TanStack Query + Supabase

```typescript
// hooks/useIngredients.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Ingredient } from '@/types/database';

export function useIngredients() {
  return useQuery({
    queryKey: ['ingredients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ingredients')
        .select('*, category:ingredient_categories(name)')
        .order('name');

      if (error) throw error;
      return data as Ingredient[];
    },
    staleTime: 60_000,       // 1 minute
    gcTime: 5 * 60_000,      // 5 minutes
  });
}

export function useCreateIngredient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ingredient: NewIngredient) => {
      const { data, error } = await supabase
        .from('ingredients')
        .insert(ingredient)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ingredients'] });
    },
  });
}
```

### Pattern: Optimistic Updates for Stock-In

```typescript
export function useStockIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (transaction: NewTransaction) => {
      const { data, error } = await supabase
        .from('inventory_transactions')
        .insert({ ...transaction, type: 'in' })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onMutate: async (newTx) => {
      // Optimistically update ingredient stock
      await queryClient.cancelQueries({ queryKey: ['ingredients'] });
      const prev = queryClient.getQueryData(['ingredients']);
      queryClient.setQueryData(['ingredients'], (old: any[]) =>
        old.map(i =>
          i.id === newTx.ingredient_id
            ? { ...i, current_stock: i.current_stock + newTx.quantity }
            : i
        )
      );
      return { prev };
    },
    onError: (err, vars, context) => {
      // Rollback on error
      queryClient.setQueryData(['ingredients'], context?.prev);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['ingredients'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
```

---

## State Management

### Zustand Store (Auth Only)

```typescript
// hooks/useAuth.ts
interface AuthState {
  user: User | null;
  organization: Organization | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  setOrganization: (org: Organization) => void;
}
```

- **Server state**: Everything in TanStack Query
- **Auth state**: Zustand (JWT lifecycle, org context)
- **Form state**: React Hook Form (local, transient)
- **No Redux, no global state for business data**

---

## HPP Calculation (Frontend)

```typescript
// lib/calculations.ts
export function calculateRecipeCost(recipe: Recipe, items: RecipeItem[]) {
  const productionCost = items.reduce(
    (sum, item) => sum + item.quantity * item.cost_at_create, 0
  );

  const overheadCost = productionCost * (recipe.overhead_pct / 100);
  const totalHpp = productionCost + overheadCost + recipe.packaging_cost;
  const perUnitHpp = recipe.yield_amount > 0
    ? totalHpp / recipe.yield_amount
    : 0;
  const margin = recipe.selling_price > 0
    ? ((recipe.selling_price - totalHpp) / recipe.selling_price) * 100
    : 0;

  return {
    productionCost,
    overheadCost,
    packagingCost: recipe.packaging_cost,
    totalHpp,
    perUnitHpp,
    margin,
  };
}

export function calculateSaleProfit(
  unitPrice: number,
  quantity: number,
  perUnitHpp: number
) {
  const revenue = unitPrice * quantity;
  const totalHpp = perUnitHpp * quantity;
  const grossProfit = revenue - totalHpp;
  const margin = revenue > 0 ? (grossProfit / revenue) * 100 : 0;

  return { revenue, totalHpp, grossProfit, margin };
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
```

---

## Authentication Flow

```
User submits credentials
  → supabase.auth.signInWithPassword()
  → Returns session (access_token, refresh_token)
  → Zustand stores user + session
  → Fetch organization from users table (via auth trigger)
  → Set organization_id in Zustand
  → Redirect to /app/dashboard
```

**On app load:**
```
supabase.auth.getSession()
  → If session exists: restore auth state
  → If no session: redirect to /login
```

**Session refresh:** Handled automatically by Supabase JS client (background token refresh).

---

## Error Handling Strategy

```
TanStack Query Error Boundary
  → Catches all query errors
  → Renders <ErrorState /> with retry button
  → No toast spam for auto-retried errors

Mutation Errors
  → Caught in onError callback
  → Show toast via sonner.toast() with error message
  → Roll back optimistic updates

Network Offline
  → TanStack Query pauses retries
  → Shows offline indicator in TopBar
  → Writes queued (future: Phase 2)
```

---

## Performance Strategy

- **Code splitting**: Route-based via React Router lazy loading
- **Bundle analysis**: Check with Rollup visualizer
- **Image optimization**: Supabase Storage with transformation
- **Query stale times**: Dashboard 30s, lists 60s, detail 120s
- **Pagination**: LIMIT 20, offset-based for MVP, cursor-based for future
- **Prefetching**: Dashboard data fetched on auth init
