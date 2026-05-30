# Batchly — Product Requirements Document

## 1. Vision

**Make food business operations boring.**

Micro food and beverage businesses in Indonesia run on instinct. Recipes are in notebooks. Ingredient costs are in WhatsApp messages. Profitability is a feeling, not a number.

Batchly gives these businesses an operational workspace where inventory, recipes, production costs, and sales live in one place. The vision is a platform that food business owners open daily — not to look at charts, but to record what happened, know what it cost, and decide what to make next.

Long-term, Batchly becomes the operating system for small-scale food production: from a home kitchen with one product to a multi-outlet operation with dozens of SKUs.

## 2. Problem Statement

Micro F&B businesses in Indonesia operate on thin margins — typically 10-30%. Most owners cannot answer three basic questions:

1. How much does this product actually cost to make?
2. Am I making money on every unit I sell?
3. Which products are profitable and which are losing money?

The root causes:

- **No structured cost tracking.** Ingredient prices fluctuate weekly. Purchase prices are forgotten. HPP (COGS) is calculated once at launch and never updated.
- **Inventory is managed informally.** Stock is checked visually. Expired ingredients go unnoticed. Overbuying is common.
- **Production cost is guessed.** Recipes exist as notes or memory. The cost of a batch is never calculated against current prices.
- **Sales data is scattered.** Revenue is in bank transfers, GoFood, Shopee Food, and cash. No single view of what sold and what it cost to produce.
- **Supplier relationships are undocumented.** Who sold the best flour? When was the last price increase? This knowledge exists only in chat history.

Existing solutions fail because:

- Excel is too complex for non-technical users.
- Accounting software (Jurnal, Accurate) is overkill — these businesses don't need debits and credits.
- POS systems assume a physical storefront.
- Inventory apps are designed for warehouses, not kitchen ingredients.

## 3. User Personas

### Persona 1: Rina — Home Bakery Owner
- **Age**: 32
- **Location**: Tangerang
- **Business**: Sells brownies, cookies, and cake jars from home
- **Revenue**: Rp 3-5 million/month
- **Current tools**: Instagram, WhatsApp, notes app, memory
- **Pain points**: Doesn't know if she's actually profitable after ingredients + packaging + delivery. Prices based on competitor rates. When flour prices go up, profit disappears silently.
- **Goals**: Know exact cost per jar. Price confidently. Scale to 10+ products.
- **Tech comfort**: Uses WhatsApp, Instagram, Gojek daily. Has never used Excel.

### Persona 2: Adi — Coffee Bottle Startup
- **Age**: 27
- **Location**: Bandung
- **Business**: Sells cold brew bottles to 10 cafes (B2B + direct)
- **Revenue**: Rp 15-20 million/month
- **Current tools**: Google Sheets (broken), receipt box, memory
- **Pain points**: 10 variants × different recipes. Loses track of which beans are in stock. Cafes order irregularly. Can't calculate cost per bottle accurately.
- **Goals**: Real-time ingredient stock. Accurate HPP per variant. Production planning based on sales.
- **Tech comfort**: Comfortable with phone apps. Used Excel briefly.

### Persona 3: Sari — Dessert Box Seller
- **Age**: 25
- **Location**: Jakarta
- **Business**: Sells tiramisu and dessert boxes via IG, 50+ orders/week
- **Revenue**: Rp 20-30 million/month
- **Current tools**: Notes app, calculator, WhatsApp
- **Pain points**: High volume of orders. Frequently runs out of mascarpone mid-week. Prices based on gut feel. Recently discovered she was losing money on her best-selling product.
- **Goals**: Low stock alerts. HPP visibility. Supplier price comparison.
- **Tech comfort**: Heavy phone user. Tech-savvy for social media.

### Persona 4: Pak Budi — Frozen Food Business
- **Age**: 45
- **Location**: Surabaya
- **Business**: Frozen dumplings and spring rolls, supplies 3 small shops
- **Revenue**: Rp 50+ million/month
- **Current tools**: Notes, worker reports, basic spreadsheet from accountant
- **Pain points**: Production batches are inconsistent. Waste is undocumented. Can't track which supplier increased prices.
- **Goals**: Batch-level cost tracking. Supplier management. Production yield analysis.
- **Tech comfort**: Basic smartphone user. Prefers simple interfaces.

## 4. User Stories

### Inventory
1. As a user, I can add ingredients with name, unit, and minimum stock level.
2. As a user, I can group ingredients by category (e.g., Bahan Baku, Bumbu, Kemasan).
3. As a user, I can record when I buy ingredients (stock-in) with quantity and price.
4. As a user, I can record when I use or discard ingredients (stock-out).
5. As a user, I can see every movement (in/out/adjust) for any ingredient.
6. As a user, I can run stock opname — enter physical counts and auto-adjust.
7. As a user, I see which ingredients are below minimum stock.

### Recipes
8. As a user, I can create a recipe with ingredient quantities.
9. As a user, I can set the yield (e.g., this recipe makes 24 brownies).
10. As a user, I see the total ingredient cost and cost-per-unit calculated automatically.
11. As a user, I can add overhead (%) and packaging cost.
12. As a user, I can set a selling price and see margin.
13. As a user, I can duplicate a recipe to create variations.

### Products
14. As a user, I can create a product linked to a recipe with a selling price.
15. As a user, I can see the HPP and margin for each product.

### Suppliers
16. As a user, I can save supplier contact information.
17. As a user, I can select a supplier when recording stock-in.
18. As a user, I can see all purchases I made from a supplier.

### Sales
19. As a user, I can record daily sales (which product, how many units, at what price).
20. As a user, I can see total revenue, HPP, and profit for any period.
21. As a user, I can see which products have the best margin.

### Dashboard
22. As a user, I can see at a glance: total products, low stock items, and this month's profit.
23. As a user, I can see recent activity (sales + stock movements).

## 5. Functional Requirements

### F1: Organization & Authentication
- Email/password registration and login
- Google OAuth
- Organization creation on first login
- Basic profile management
- Session management (30 min timeout)
- All data isolated by organization_id

### F2: Ingredient Management
- CRUD ingredient categories (with defaults: Bahan Baku, Bumbu, Kemasan, Lainnya)
- CRUD ingredients: name, unit (g, kg, ml, L, pcs, sdt, sdm, cup), current stock, min stock level, category
- Units: a curated list of 10-12 common F&B units. No custom units.
- current_stock maintained via DB trigger on inventory_transactions

### F3: Inventory Transactions
- **Stock-in**: ingredient, quantity, unit price, date, optional supplier, optional notes
- **Stock-out**: ingredient, quantity (negative), reason (used, expired, damaged, adjustment), notes
- **Movement history**: paginated list per ingredient, filterable by type and date
- Auto-update ingredient.current_stock on insert
- Auto-update ingredient.latest_price on stock-in

### F4: Stock Opname
- Page lists all ingredients with system quantity
- User enters physical quantity per ingredient
- System computes difference
- On confirmation, creates adjustment transactions and updates stock
- No offline support in MVP (online-only)

### F5: Supplier Management
- CRUD suppliers: name (required), contact person, phone, email, address, notes
- Supplier detail page with purchase history (all stock-in transactions linked to them)
- Supplier selectable in stock-in form
- Soft delete for suppliers with transaction history

### F6: Recipe Management
- CRUD recipes: name, yield amount, yield unit (pcs, box, jar, kg, liter), overhead %, packaging cost, selling price, notes
- Add/remove ingredients to recipe: ingredient, quantity
- Ingredient cost is snapshotted at time of addition (cost_at_create)
- Display: ingredient cost breakdown, production cost, overhead cost, total HPP, per-unit HPP, margin %
- No real-time cost tracking (manual recalculation button available)
- Duplicate recipe with all items

### F7: Product Management
- CRUD products: name (required), linked recipe, SKU (auto-generated), default selling price
- Display: product name, recipe name, default price, per-unit HPP, margin

### F8: Sales Recording
- Record sale: product, quantity, unit price (defaulted from product), date
- Sales list: paginated, filterable by product and date range
- Display: revenue, total HPP, gross profit, margin per sale entry

### F9: Dashboard
- Top section: 3 summary cards (total recipes, inventory count with low stock badge, MTD profit)
- Low stock alert list (name, current stock, min level, link to stock-in)
- Recent activity feed (last 10 transactions: stock movements + sales, chronological)

### F10: Low Stock Notifications
- Banner on dashboard if any ingredient is below minimum stock
- Low stock indicator on inventory list

## 6. Non-Functional Requirements

### Performance
- Initial page load < 2 seconds on 4G
- RLS queries execute in < 200ms
- Recipe cost calculation < 1 second for up to 200 ingredients
- Pagination: 20 items per page on all list views

### Security
- Row Level Security on all data tables
- UUID primary keys on all tables (never sequential IDs)
- HTTPS-only
- Input sanitization on all user inputs
- Rate limiting on auth endpoints
- Session timeout at 30 minutes
- Audit logging for inventory movements via DB triggers

### Reliability
- TanStack Query retry (3 attempts, exponential backoff)
- Graceful error handling with user-friendly messages
- Auto-save on forms (basic — save on submit, not real-time)

### Compatibility
- Mobile-first responsive design (primary target: mobile browsers)
- Desktop usable but NOT the primary target
- PWA enabled for add-to-home-screen
- Target browsers: Chrome (Android), Safari (iOS), Chrome (Desktop)
- Indonesian language interface (primary). English as fallback.

### Availability
- Target: 99.9% uptime (Supabase SLA)
- Planned maintenance window: 2 AM - 4 AM WIB (Sunday)

## 7. MVP Scope — First 90 Days

### What is IN scope

| Module | Features |
|--------|----------|
| Auth | Email/password, Google OAuth, org creation, profile |
| Ingredients | CRUD, categories, stock-in, stock-out, movement history, low stock alerts |
| Stock Opname | Physical count entry, auto-adjustment, difference review |
| Suppliers | CRUD, link to stock-in, purchase history view |
| Recipes | CRUD, ingredient items, cost calc, packaging/overhead, pricing, duplicate |
| Products | CRUD linked to recipes, HPP display |
| Sales | Daily recording, list view, profit per product |
| Dashboard | Summary cards, low stock list, recent activity feed |

### What is intentionally OUT of scope (first 90 days)

| Feature | Reason |
|---------|--------|
| Production batch tracking | Adds significant complexity. User story: "track this specific batch of 24 brownies made on Monday vs Tuesday." Requires batch-level yield, cost variance, expiry tracking. Phase 2. |
| Purchase orders | POs are B2B workflow. Micro-businesses just "buy stuff." Stock-in is sufficient. |
| Price history graphs | Nice-to-have analytics. Not operational. Phase 2. |
| Multi-user / team | Adds org invite, role management, permission complexity. Phase 4. |
| Offline mode | Requires Service Worker + IndexedDB sync engine. Significant engineering. Phase 2. |
| Export (PDF/CSV) | Useful but not essential for daily ops. Phase 2. |
| Recurring costs (subscriptions, rent) | Too close to accounting software. Not in scope. |
| Multi-outlet / multi-location | Phase 4. |
| AI features | Phase 3. |
| Payment integration | Not a POS. Not needed. |
| Email notifications | Added complexity. In-app alerts only. |

## 8. Future Scope

### Phase 2 (Month 4-6): Production & Data
- Production batch tracking (batch ID, date, qty produced, actual yield, cost variance)
- Automated stock deduction when production is recorded
- Supplier price history view
- CSV/PDF export for inventory and sales
- Offline stock opname (PWA + IndexedDB)
- Custom units support
- Product variants (same recipe, different packaging)

### Phase 3 (Month 7-9): Intelligence
- AI assistant: voice-input stock opname
- Recipe cost optimization (suggest cheaper ingredient substitutes)
- Low-stock auto-reorder suggestions
- Sales trend recognition
- Photo ingredient recognition (label → ingredient)

### Phase 4 (Month 10-12): Scale
- Multi-outlet inventory (transfer between locations)
- Role-based access: owner, staff, viewer
- Team invites and permissions
- Basic audit log UI

### Phase 5 (12+ months): Enterprise
- Public API
- Custom branding
- Advanced analytics (margin trends, waste analysis, yield optimization)
- White-label mobile apps (Android + iOS)

## 9. Success Metrics

### Adoption
- 500 registered organizations in the first 90 days
- 40% activation rate (create ≥1 recipe within 7 days of signup)
- 20% weekly active users / total registered

### Engagement
- DAU/MAU > 25%
- Average session duration > 4 minutes
- 3+ actions per session (sale recording, stock update, recipe view)

### Operational
- Time to first recipe: < 5 minutes from signup
- Time to stock opname: < 2 minutes
- HPP calculation: perceived as instant (< 1 second)

### Business
- Free → Pro conversion rate > 5% within 90 days
- Monthly churn < 8%
- NPS > 40 (target user segment)

## 10. Risks

| Risk | Impact | Likelihood | Mitigation |
|------|--------|-----------|------------|
| Users don't understand "HPP" concept | Low adoption | High | In-app tooltips, onboarding flow with examples ("Brownies: tepung 2kg = Rp 20,000, telur 10 = Rp 25,000...") |
| Users expect POS features | Feature confusion | Medium | Clear messaging: "Bukan POS, bukan akuntansi. Batchly untuk urusan dapur." |
| Mobile UX too complex for older users | Segment churn | Medium | 3-tap rule on critical actions. Large touch targets. No hidden menus. |
| Ingredient price data entry friction | Users skip stock-in | Medium | Pre-fill previous price. Quick-add from stock-in form. Supplier auto-select from history. |
| Supabase free tier limits exceeded | Unexpected cost | Medium | Monitor usage. Set hard row limits per org. Graceful upgrade prompt. |
| Users churn after stock-out errors | Trust loss | Medium | Confirmation dialogs on stock-out. Undo within 1 minute (future). Audit log for disputes. |
| Competitor launches similar product | Market pressure | Low | Focus on execution quality and UX simplicity. Mobile-first advantage. |

## 11. Assumptions

1. **Users have smartphones.** Target users (home business owners in Indonesia) have Android phones with 4G data.
2. **Users can read Bahasa Indonesia.** All interface copy and onboarding will be in Indonesian.
3. **Single-user per organization for MVP.** No team features needed in first 90 days.
4. **Users buy ingredients, not produce them.** No raw material production tracking (e.g., growing/herding).
5. **One recipe = one product.** A recipe does not produce multiple products in Phase 1.
6. **Sales occur daily or weekly.** Not real-time per-transaction. Daily batch recording is acceptable.
7. **Users know their ingredient costs.** They remember or can check what they paid. No receipt scanning.
8. **No integrations needed in MVP.** No GoFood, Shopee Food, Tokopedia, or WhatsApp API.
9. **Users prefer online-only over offline complexity.** Phase 1 will not support offline mode.
10. **Users will tolerate initial bugs if the core value is clear.** Speed to market > perfection in first 90 days.
