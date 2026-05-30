# Batchly — UI Components

## Component Philosophy

- Text-first. If an icon is removed, the interface is still understandable.
- Minimal. Every component must justify its existence.
- Mobile-first. All components tested at 375px width.
- Accessible. Tap targets ≥ 44px. Color not the only differentiator.
- No decorative components. No illustrations, no empty states with graphics, no gradients.

---

## Component Tree

```
<ThemeProvider>
<App>
  <AuthProvider>
    <QueryClientProvider>
      <BrowserRouter>
        <Routes>
          <PublicLayout>
            <LoginPage />
            <SignupPage />
          </PublicLayout>
          <AppLayout>
            <TopBar />
            <BottomNav />          ← Mobile
            <Sidebar />            ← Desktop (1024px+)
            <main>
              <DashboardPage />
              <InventoryPage />
              <IngredientDetailPage />
              <StockOpnamePage />
              <StockInForm />
              <StockOutForm />
              <SuppliersPage />
              <SupplierDetailPage />
              <SupplierForm />
              <RecipesPage />
              <RecipeDetailPage />
              <RecipeForm />
              <ProductsPage />
              <ProductForm />
              <SalesPage />
              <SaleForm />
              <SettingsPage />
            </main>
          </AppLayout>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  </AuthProvider>
</App>
</ThemeProvider>
```

---

## Shared UI Components (shadcn/ui based)

### Button
- **Variants**: primary (bg #111827 text white), secondary (bg white border #E5E7EB), ghost (no bg), danger (text #B91C1C)
- **Sizes**: large (h-12 px-6 text-base), default (h-10 px-4 text-sm), small (h-8 px-3 text-sm)
- **States**: default, hover, active, disabled
- **Usage**: Large buttons on mobile for primary actions. Text labels only. No icon-only buttons.

### Input
- **Style**: border #E5E7EB, bg white, rounded-lg, px-4 py-3 (h-12), text-base
- **States**: default, focus (border #111827), error (border #B91C1C), disabled (bg #F9FAFB)
- **Types**: text, number, email, phone, date
- **Labels**: text-sm font-medium, text-secondary (#6B7280), stacked above input

### Select / Dropdown
- **Style**: Same border/height as Input
- **Behavior**: Native select on mobile (<select>), custom dropdown on desktop
- **Search**: For lists > 10 items, show filter input at top of dropdown

### Card
- **Style**: bg white, rounded-xl (16px), border #E5E7EB, p-4
- **Usage**: Summary cards on dashboard, recipe cards, ingredient cards
- **No shadows**. Subtle border only.

### Table
- **Style**: Full-width, border-collapse, text-sm
- **Header**: bg #F9FAFB, text-secondary, font-medium, text-xs uppercase
- **Rows**: border-b #E5E7EB, h-12
- **Mobile**: Horizontal scroll on wide tables, or card-list pattern on small screens

### Summary Card (Dashboard-specific)
- **Layout**: Horizontal row of 3 cards
- **Content**: Label (text-xs uppercase text-secondary), Value (text-2xl font-semibold), optional secondary metric
- **Width**: Equal width, flex-1

### Activity Feed Item
- **Layout**: Horizontal layout. Time | Event type (colored dot or subtle label) | Description
- **Event types**: stock-in (green), stock-out (red), sale (blue), adjustment (orange)
- **Description**: text-sm, secondary text for metadata

### Form
- **Layout**: Single column, full-width inputs
- **Spacing**: 24px gap between fields
- **Submit**: Full-width button at bottom
- **Errors**: Inline text below input, text-sm text-danger
- **Validation**: On submit (not real-time) — simpler for target users

### Modal / Bottom Sheet
- **Mobile**: Slides up from bottom, 80% screen height, rounded-top corners, close on backdrop tap
- **Desktop**: Centered dialog, max-w-md, close on Escape
- **Usage**: Quick-add ingredient/supplier during a flow, confirmation dialogs

### Toast / Sonner
- **Position**: Bottom-center on mobile, top-right on desktop
- **Duration**: 4 seconds for success, persistent for errors
- **Types**: Success (green text), Error (red text), Info (neutral)

### Top Bar
- **Height**: h-14
- **Content**: Back arrow (left), page title (center), action button (right)
- **Style**: bg white, border-b #E5E7EB

### Bottom Navigation
- **Height**: h-16 (safe area padded)
- **Items**: 4 tabs max
- **Active**: text-primary, font-medium
- **Inactive**: text-secondary
- **Style**: bg white, border-t #E5E7EB
- **Text-first**: Tab labels are text, not icons. Subtle icon optional.

### Loading State
- **Style**: Skeleton loader matching component shape (rounded, animate-pulse bg-gray-100)
- **No spinners** except for initial auth check
- **Implementation**: `<Skeleton className="h-12 w-full" />`

### Error State
- **Content**: Error message in text (not illustration), retry button
- **Style**: Centered, p-8, text-secondary

### Empty State
- **Content**: Short message explaining what this page is for + CTA button
- **Style**: Centered text, p-8
- **No illustrations**. Example: "Belum ada resep. Buat resep pertama Anda."
- **CTA**: Primary button "Buat Resep"

---

## Page-Specific Components

### IngredientRow
| Prop | Type |
|------|------|
| name | string |
| stock | number |
| unit | string |
| price | number |
| lowStock | boolean |
| category | string |
| onClick | () => void |

Renders in inventory list. Shows name, stock with unit, price per unit. Orange dot if lowStock.

### RecipeCard
| Prop | Type |
|------|------|
| name | string |
| yield | string (e.g., "24 pcs") |
| hpp | number |
| sellingPrice | number |
| margin | number |
| onClick | () => void |

Renders in recipe list. Key metrics in a compact card.

### CostBreakdown
| Prop | Type |
|------|------|
| items | CostItem[] (name, qty, cost) |
| overheadPct | number |
| packagingCost | number |
| totalHpp | number |
| perUnitHpp | number |
| marginPct | number |

Renders in recipe detail. Ingredient cost table + summary.

### TransactionRow
| Prop | Type |
|------|------|
| date | string |
| type | 'in' | 'out' | 'adjustment' |
| quantity | number |
| unitPrice | number (optional) |
| reason | string (optional) |
| supplier | string (optional) |
| onClick | () => void |

Renders in movement history and activity feed. Color-coded by type.

### SummaryCards
3 cards in horizontal layout:
1. **Resep**: count + subtitle "Total resep"
2. **Bahan**: count + subtitle "⚠️ X stok menipis" (if any)
3. **Laba**: formatted currency + subtitle "Bulan ini"

### SaleEntry
| Prop | Type |
|------|------|
| time | string |
| productName | string |
| quantity | number |
| unitPrice | number |
| profit | number |

Renders in sales list. Shows time, product, qty, revenue, profit.

### SupplierCard
| Prop | Type |
|------|------|
| name | string |
| contactPerson | string (optional) |
| phone | string (optional) |
| transactionCount | number |
| onClick | () => void |

Renders in supplier list. Contact info and purchase count.

---

## Form Patterns

### Stock-In Form
```
Fields:
  - ingredient_id (searchable dropdown, REQUIRED)
  - quantity (numeric, REQUIRED)
  - unit_price (numeric, pre-filled from latest_price)
  - supplier_id (searchable dropdown, optional, with "Tambah" option)
  - transaction_date (date, default today)
Calculated: total = quantity × unit_price (displayed, not stored)
```

### Stock-Out Form
```
Fields:
  - ingredient_id (searchable dropdown, REQUIRED)
  - quantity (numeric, REQUIRED)
  - reason (radio: used, expired, damaged, adjustment, REQUIRED)
  - notes (optional text)
```

### Recipe Form
```
Step 1:
  - name (text)
  - yield_amount (numeric)
  - yield_unit (dropdown: pcs, box, jar, kg, liter)

Step 2:
  - recipe_items[] (dynamically added)
    - ingredient_id (searchable dropdown)
    - quantity (numeric)
    - unit (auto-filled from ingredient)

Step 3 (expandable section):
  - overhead_pct (numeric %, default 0)
  - packaging_cost (numeric Rp, default 0)
  - selling_price (numeric Rp)

Live preview: cost breakdown + margin
```

### Sale Form
```
Fields:
  - product_id (searchable dropdown, REQUIRED)
  - quantity (numeric, REQUIRED)
  - unit_price (numeric, pre-filled from product.default_price)
  - sale_date (date, default today)
```

---

## Responsive Breakpoint Adaptations

### Mobile (< 640px)
- Full-width forms
- Bottom tab navigation
- Single-column lists
- Filter as top-of-page section (not sidebar)

### Tablet (640-1023px)
- Two-column grid where appropriate
- Sidebar can be shown (hamburger toggle)
- Forms: max-w-md centered

### Desktop (1024px+)
- Persistent left sidebar (w-56)
- Content area: max-w-4xl centered
- Forms: max-w-lg centered
- Tables: full-width with sticky header
- Sidebar navigation replaces bottom tabs

---

## Color Application (Per Taste Guidelines)

- **Primary buttons**: bg #111827, text white, hover darken
- **Secondary buttons**: bg white, border #E5E7EB, text #111827
- **Danger**: text #B91C1C (buttons, alerts)
- **Warning**: text #B45309 (low stock indicators)
- **Success**: text #15803D (stock-in amounts, profit)
- **Surface**: bg white (cards, content areas)
- **Page background**: #F7F7F5
- **Borders**: #E5E7EB
- **Text primary**: #111827
- **Text secondary**: #6B7280
- **Links**: underlined text-primary (no blue links)

No gradients, no glassmorphism, no color transitions.
