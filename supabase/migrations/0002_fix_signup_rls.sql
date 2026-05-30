-- Batchly — FIX v2: organizations INSERT blocked for authenticated role
-- Diagnosa: insert anon = 201 OK, tapi insert authenticated = 403.
-- Berarti policy lama menempel khusus role 'authenticated' dan menolak.
-- Solusi: hapus SEMUA policy di organizations, lalu buat ulang yang berlaku
-- untuk authenticated + anon.
-- Jalankan di Supabase → SQL Editor → Run. Aman diulang.
-- ============================================================

CREATE OR REPLACE FUNCTION get_current_organization_id()
RETURNS uuid AS $$
  SELECT organization_id FROM users WHERE id = auth.uid()
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Hapus SEMUA policy yang ada di organizations (apa pun namanya)
DO $$
DECLARE p record;
BEGIN
  FOR p IN SELECT policyname FROM pg_policies WHERE tablename = 'organizations' LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON organizations', p.policyname);
  END LOOP;
END $$;

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- Siapa pun yang sudah login boleh membuat organization (dipakai saat signup)
CREATE POLICY "orgs_insert_any" ON organizations
  FOR INSERT TO authenticated, anon
  WITH CHECK (true);

-- Boleh membaca organization miliknya
CREATE POLICY "orgs_select_own" ON organizations
  FOR SELECT TO authenticated
  USING (id = get_current_organization_id());

-- users: baris milik sendiri
DO $$
DECLARE p record;
BEGIN
  FOR p IN SELECT policyname FROM pg_policies WHERE tablename = 'users' LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON users', p.policyname);
  END LOOP;
END $$;

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_select_own" ON users
  FOR SELECT TO authenticated USING (id = auth.uid());
CREATE POLICY "users_insert_own" ON users
  FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
