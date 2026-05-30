-- Batchly — FIX v3: signup via SECURITY DEFINER RPC (robust, final)
-- Daripada bergantung pada policy INSERT yang rapuh, buat org + link user
-- lewat SATU fungsi tepercaya yang jalan sebagai owner (bypass RLS).
-- Jalankan di Supabase → SQL Editor → Run. Aman diulang.
-- ============================================================

CREATE OR REPLACE FUNCTION get_current_organization_id()
RETURNS uuid AS $$
  SELECT organization_id FROM users WHERE id = auth.uid()
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- RPC: buat organization untuk user yang sedang login, lalu link.
-- Mengembalikan baris organization yang baru dibuat.
CREATE OR REPLACE FUNCTION create_org_for_current_user(org_name text, org_slug text)
RETURNS organizations AS $$
DECLARE
  uid uuid := auth.uid();
  new_org organizations;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Tidak ada sesi login';
  END IF;

  -- Kalau user sudah punya org, kembalikan yang itu (idempoten)
  SELECT o.* INTO new_org FROM organizations o
    JOIN users u ON u.organization_id = o.id
    WHERE u.id = uid;
  IF FOUND THEN
    RETURN new_org;
  END IF;

  INSERT INTO organizations (name, slug)
    VALUES (org_name, org_slug)
    RETURNING * INTO new_org;

  INSERT INTO users (id, organization_id)
    VALUES (uid, new_org.id)
    ON CONFLICT (id) DO UPDATE SET organization_id = EXCLUDED.organization_id;

  RETURN new_org;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION create_org_for_current_user(text, text) TO authenticated;
