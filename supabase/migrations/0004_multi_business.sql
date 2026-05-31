-- ============================================================
-- Batchly — 0004: Multi-business (satu akun, banyak usaha)
-- ------------------------------------------------------------
-- Desain aman: RLS & get_current_organization_id() TIDAK berubah.
-- - users.organization_id tetap = "org AKTIF" (dibaca RLS).
-- - memberships = daftar org yang boleh diakses user (many-to-many).
-- - Ganti usaha  = update users.organization_id (hanya jika member).
-- Aman dijalankan berulang (idempotent).
-- ============================================================

-- 1) Tabel keanggotaan: user bisa punya banyak org
CREATE TABLE IF NOT EXISTS memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'owner' CHECK (role IN ('owner', 'admin', 'staff')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, organization_id)
);

CREATE INDEX IF NOT EXISTS idx_memberships_user ON memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_memberships_org ON memberships(organization_id);

-- 2) Backfill: tiap user lama yang sudah punya organization_id → jadikan member
INSERT INTO memberships (user_id, organization_id, role)
SELECT u.id, u.organization_id, COALESCE(u.role, 'owner')
FROM users u
WHERE u.organization_id IS NOT NULL
ON CONFLICT (user_id, organization_id) DO NOTHING;

-- 3) RLS memberships: user hanya lihat keanggotaannya sendiri
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "memberships_select_own" ON memberships;
CREATE POLICY "memberships_select_own" ON memberships
  FOR SELECT USING (user_id = auth.uid());

-- 4) organizations: izinkan SELECT untuk SEMUA org tempat user jadi member
--    (sebelumnya hanya org aktif). Supaya switcher bisa menampilkan namanya.
DROP POLICY IF EXISTS "orgs_select_own" ON organizations;
CREATE POLICY "orgs_select_member" ON organizations
  FOR SELECT USING (
    id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid())
  );

-- 5) RPC: daftar semua usaha milik user (untuk switcher)
CREATE OR REPLACE FUNCTION list_my_organizations()
RETURNS TABLE (id uuid, name text, slug text, role text, is_active boolean)
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT o.id, o.name, o.slug, m.role,
         (o.id = (SELECT organization_id FROM users WHERE id = auth.uid())) AS is_active
  FROM memberships m
  JOIN organizations o ON o.id = m.organization_id
  WHERE m.user_id = auth.uid()
  ORDER BY o.name;
$$;
GRANT EXECUTE ON FUNCTION list_my_organizations() TO authenticated;

-- 6) RPC: ganti usaha aktif (hanya jika user member org tsb)
CREATE OR REPLACE FUNCTION set_active_organization(org_id uuid)
RETURNS organizations LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  uid uuid := auth.uid();
  result organizations;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Tidak ada sesi login'; END IF;
  IF NOT EXISTS (SELECT 1 FROM memberships WHERE user_id = uid AND organization_id = org_id) THEN
    RAISE EXCEPTION 'Bukan anggota usaha ini';
  END IF;
  UPDATE users SET organization_id = org_id, updated_at = now() WHERE id = uid;
  SELECT * INTO result FROM organizations WHERE id = org_id;
  RETURN result;
END;
$$;
GRANT EXECUTE ON FUNCTION set_active_organization(uuid) TO authenticated;

-- 7) RPC: buat usaha tambahan, jadikan member + langsung aktif
CREATE OR REPLACE FUNCTION create_additional_business(org_name text, org_slug text)
RETURNS organizations LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  uid uuid := auth.uid();
  new_org organizations;
  final_slug text := org_slug;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Tidak ada sesi login'; END IF;

  -- slug unik: tambah sufiks angka bila bentrok
  WHILE EXISTS (SELECT 1 FROM organizations WHERE slug = final_slug) LOOP
    final_slug := org_slug || '-' || floor(random() * 10000)::text;
  END LOOP;

  INSERT INTO organizations (name, slug) VALUES (org_name, final_slug)
    RETURNING * INTO new_org;

  INSERT INTO memberships (user_id, organization_id, role)
    VALUES (uid, new_org.id, 'owner');

  -- langsung jadikan aktif
  UPDATE users SET organization_id = new_org.id, updated_at = now() WHERE id = uid;

  RETURN new_org;
END;
$$;
GRANT EXECUTE ON FUNCTION create_additional_business(text, text) TO authenticated;

-- 8) Selaraskan RPC signup lama: buat membership juga (idempotent)
CREATE OR REPLACE FUNCTION create_org_for_current_user(org_name text, org_slug text)
RETURNS organizations AS $$
DECLARE
  uid uuid := auth.uid();
  new_org organizations;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Tidak ada sesi login'; END IF;

  SELECT o.* INTO new_org FROM organizations o
    JOIN users u ON u.organization_id = o.id
    WHERE u.id = uid;
  IF FOUND THEN RETURN new_org; END IF;

  INSERT INTO organizations (name, slug) VALUES (org_name, org_slug)
    RETURNING * INTO new_org;

  INSERT INTO users (id, organization_id) VALUES (uid, new_org.id)
    ON CONFLICT (id) DO UPDATE SET organization_id = EXCLUDED.organization_id;

  INSERT INTO memberships (user_id, organization_id, role)
    VALUES (uid, new_org.id, 'owner')
    ON CONFLICT (user_id, organization_id) DO NOTHING;

  RETURN new_org;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
GRANT EXECUTE ON FUNCTION create_org_for_current_user(text, text) TO authenticated;
