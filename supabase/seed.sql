-- ═══════════════════════════════════════════════════════════════
--  FutureTrack — Development Seed Data
--  Run AFTER schema.sql. Creates test users via auth.users.
--  Only run in development/staging environments.
-- ═══════════════════════════════════════════════════════════════

-- NOTE: Create the auth users first via Supabase dashboard or API,
-- then update the UUIDs below to match. The trigger will auto-create
-- the public.users rows, but we UPDATE them here to fill extra fields.

-- ── Sample unauthorized devices ──────────────────────────────
INSERT INTO public.unauthorized_devices
  (device_name, device_ip, mac_address, device_type, os, attempts, blocked)
VALUES
  ('Unknown Android',    '192.168.1.210', 'e8:3f:19:77:dc:42', 'mobile',  'Android 12', 7,  false),
  ('Unknown Desktop',    '192.168.1.220', 'f2:11:88:30:4a:b6', 'desktop', NULL,         12, false),
  ('Suspicious Tablet',  '192.168.2.15',  'a4:cc:70:12:ef:09', 'tablet',  NULL,         34, true)
ON CONFLICT DO NOTHING;
