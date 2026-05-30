-- Batchly — Demo Seed Data (bakery / UMKM F&B)
-- ============================================================
-- HOW TO USE:
-- 1. Sign up in the app FIRST (this creates your organization + user link).
-- 2. Open Supabase → SQL Editor → paste this whole file → Run.
-- 3. Refresh the app. Data appears because it is tied to YOUR org.
--
-- Note: this seeds into the FIRST organization in your project.
-- RLS is bypassed here because the SQL Editor runs as service role.
-- Safe to re-run: it clears previous demo rows for that org first.
-- ============================================================

DO $$
DECLARE
  org uuid;
  ing_tepung uuid; ing_gula uuid; ing_mentega uuid; ing_telur uuid; ing_cokelat uuid; ing_keju uuid;
  rec_donat uuid; rec_brownies uuid; rec_cheese uuid;
  prod_donat uuid; prod_brownies uuid; prod_cheese uuid;
  d date := current_date;
BEGIN
  SELECT id INTO org FROM organizations ORDER BY created_at LIMIT 1;
  IF org IS NULL THEN
    RAISE EXCEPTION 'Belum ada organization. Daftar (sign up) di app dulu, lalu jalankan seed ini.';
  END IF;

  -- Clean previous demo rows for this org
  DELETE FROM sales WHERE organization_id = org;
  DELETE FROM expenses WHERE organization_id = org;
  DELETE FROM products WHERE organization_id = org;
  DELETE FROM recipe_items WHERE organization_id = org;
  DELETE FROM recipes WHERE organization_id = org;
  DELETE FROM ingredients WHERE organization_id = org;

  -- Ingredients. latest_price is CURRENT price (some risen vs recipe cost_at_create).
  INSERT INTO ingredients (organization_id, name, unit, current_stock, latest_price, min_stock_level)
    VALUES (org,'Tepung Terigu','kg',25,15000,10) RETURNING id INTO ing_tepung;
  INSERT INTO ingredients (organization_id, name, unit, current_stock, latest_price, min_stock_level)
    VALUES (org,'Gula Pasir','kg',8,18000,10) RETURNING id INTO ing_gula;   -- low stock
  INSERT INTO ingredients (organization_id, name, unit, current_stock, latest_price, min_stock_level)
    VALUES (org,'Mentega','kg',12,55000,5) RETURNING id INTO ing_mentega;
  INSERT INTO ingredients (organization_id, name, unit, current_stock, latest_price, min_stock_level)
    VALUES (org,'Telur','kg',20,32000,8) RETURNING id INTO ing_telur;
  INSERT INTO ingredients (organization_id, name, unit, current_stock, latest_price, min_stock_level)
    VALUES (org,'Cokelat Blok','kg',6,95000,4) RETURNING id INTO ing_cokelat;
  INSERT INTO ingredients (organization_id, name, unit, current_stock, latest_price, min_stock_level)
    VALUES (org,'Keju Cheddar','kg',3,82000,5) RETURNING id INTO ing_keju;   -- low stock

  -- Recipes (cost_at_create below uses OLD prices, so HPP terkini naik → Margin Guard aktif)
  INSERT INTO recipes (organization_id, name, yield_amount, yield_unit, overhead_pct, packaging_cost, selling_price)
    VALUES (org,'Donat Gula',20,'pcs',10,500,4000) RETURNING id INTO rec_donat;
  INSERT INTO recipes (organization_id, name, yield_amount, yield_unit, overhead_pct, packaging_cost, selling_price)
    VALUES (org,'Brownies Cokelat',12,'pcs',15,1000,12000) RETURNING id INTO rec_brownies;
  INSERT INTO recipes (organization_id, name, yield_amount, yield_unit, overhead_pct, packaging_cost, selling_price)
    VALUES (org,'Cheese Stick',30,'pcs',10,800,3000) RETURNING id INTO rec_cheese;

  -- Recipe items. cost_at_create = price WHEN recipe was made (lower than latest_price).
  INSERT INTO recipe_items (organization_id, recipe_id, ingredient_id, quantity, unit, cost_at_create) VALUES
    (org, rec_donat, ing_tepung, 1.0,'kg',12000),
    (org, rec_donat, ing_gula, 0.3,'kg',14000),
    (org, rec_donat, ing_telur, 0.4,'kg',28000),
    (org, rec_brownies, ing_tepung, 0.5,'kg',12000),
    (org, rec_brownies, ing_cokelat, 0.6,'kg',80000),
    (org, rec_brownies, ing_mentega, 0.4,'kg',48000),
    (org, rec_brownies, ing_telur, 0.5,'kg',28000),
    (org, rec_cheese, ing_tepung, 1.2,'kg',12000),
    (org, rec_cheese, ing_keju, 0.5,'kg',70000),
    (org, rec_cheese, ing_mentega, 0.2,'kg',48000);

  -- Products
  INSERT INTO products (organization_id, recipe_id, name, sku, unit, default_price)
    VALUES (org, rec_donat,'Donat Gula','DNT-01','pcs',4000) RETURNING id INTO prod_donat;
  INSERT INTO products (organization_id, recipe_id, name, sku, unit, default_price)
    VALUES (org, rec_brownies,'Brownies Cokelat','BRW-01','pcs',12000) RETURNING id INTO prod_brownies;
  INSERT INTO products (organization_id, recipe_id, name, sku, unit, default_price)
    VALUES (org, rec_cheese,'Cheese Stick','CHS-01','pcs',3000) RETURNING id INTO prod_cheese;

  -- Sales across last ~4 weeks
  INSERT INTO sales (organization_id, product_id, quantity, unit_price, sale_date) VALUES
    (org, prod_donat, 40, 4000, d - 1),
    (org, prod_brownies, 15, 12000, d - 1),
    (org, prod_cheese, 60, 3000, d - 2),
    (org, prod_donat, 35, 4000, d - 3),
    (org, prod_brownies, 20, 12000, d - 5),
    (org, prod_cheese, 50, 3000, d - 8),
    (org, prod_donat, 45, 4000, d - 9),
    (org, prod_brownies, 18, 12000, d - 12),
    (org, prod_donat, 38, 4000, d - 16),
    (org, prod_cheese, 70, 3000, d - 20),
    (org, prod_brownies, 22, 12000, d - 24),
    (org, prod_donat, 50, 4000, d - 28);

  -- Operational expenses
  INSERT INTO expenses (organization_id, category, description, amount, expense_date) VALUES
    (org,'Sewa','Sewa kios bulanan',1500000, d - 3),
    (org,'Listrik & Air','Tagihan PLN + PDAM',450000, d - 5),
    (org,'Gas','Refill gas 3kg x4',120000, d - 7),
    (org,'Gaji','Gaji 1 karyawan',1800000, d - 10),
    (org,'Pemasaran','Iklan Instagram',200000, d - 12);

END $$;
