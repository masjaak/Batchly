-- Batchly — FIX: RLS policies for signup (organizations + users)
-- Jalankan sekali di Supabase → SQL Editor → Run.
-- Aman diulang. Ini memperbaiki "signup gagal bikin organization" yang
-- menyebabkan semua tombol Simpan gagal (karena organization_id kosong).
-- ============================================================

-- Pastikan helper ada (dipakai policy isolation org)
CREATE OR REPLACE FUNCTION get_current_organization_id()
RETURNS uuid AS $$
  SELECT organization_id FROM users WHERE id = auth.uid()
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- organizations: user yang login boleh BUAT org, dan baca org miliknya
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "orgs_select_own" ON organizations;
DROP POLICY IF EXISTS "orgs_insert" ON organizations;
CREATE POLICY "orgs_select_own" ON organizations FOR SELECT USING (id = get_current_organization_id());
CREATE POLICY "orgs_insert" ON organizations FOR INSERT WITH CHECK (true);

-- users: hanya boleh baca & buat baris miliknya sendiri
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "users_select_own" ON users;
DROP POLICY IF EXISTS "users_insert_own" ON users;
CREATE POLICY "users_select_own" ON users FOR SELECT USING (id = auth.uid());
CREATE POLICY "users_insert_own" ON users FOR INSERT WITH CHECK (id = auth.uid());
