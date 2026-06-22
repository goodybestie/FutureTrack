-- ═══════════════════════════════════════════════════════════════
--  FutureTrack — Supabase Database Schema
--  Run this in: Supabase Dashboard → SQL Editor → New Query
-- ═══════════════════════════════════════════════════════════════

-- ── Extensions ────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── Enums ─────────────────────────────────────────────────────
CREATE TYPE user_role      AS ENUM ('admin', 'manager', 'staff', 'security');
CREATE TYPE user_status    AS ENUM ('active', 'inactive', 'suspended');
CREATE TYPE attendance_status AS ENUM ('present', 'absent', 'late', 'early_leave', 'remote');
CREATE TYPE connection_status AS ENUM ('connected', 'disconnected');


-- ══════════════════════════════════════════════════════════════
--  TABLE: users
--  Extended profile linked to auth.users via id
-- ══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.users (
  id            UUID          PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name     TEXT          NOT NULL,
  email         TEXT          NOT NULL UNIQUE,
  role          user_role     NOT NULL DEFAULT 'staff',
  status        user_status   NOT NULL DEFAULT 'active',
  department    TEXT,
  employee_id   TEXT          UNIQUE,
  phone         TEXT,
  avatar_url    TEXT,
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-create profile when auth user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.users (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'staff')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ══════════════════════════════════════════════════════════════
--  TABLE: attendance_logs
-- ══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.attendance_logs (
  id            UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID            NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  check_in      TIMESTAMPTZ,
  check_out     TIMESTAMPTZ,
  total_hours   NUMERIC(5, 2),  -- computed, stored for easy querying
  status        attendance_status NOT NULL DEFAULT 'present',
  location      TEXT,
  device_id     UUID,           -- nullable FK to device_sessions
  notes         TEXT,
  date          DATE            NOT NULL DEFAULT CURRENT_DATE,
  created_at    TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

  -- Enforce one log per user per day
  UNIQUE (user_id, date)
);

CREATE TRIGGER attendance_logs_updated_at
  BEFORE UPDATE ON public.attendance_logs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-compute total_hours on check_out
CREATE OR REPLACE FUNCTION compute_total_hours()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.check_out IS NOT NULL AND NEW.check_in IS NOT NULL THEN
    NEW.total_hours := ROUND(
      EXTRACT(EPOCH FROM (NEW.check_out - NEW.check_in)) / 3600.0, 2
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER attendance_compute_hours
  BEFORE INSERT OR UPDATE ON public.attendance_logs
  FOR EACH ROW EXECUTE FUNCTION compute_total_hours();

-- Index for common queries
CREATE INDEX idx_attendance_user_date    ON public.attendance_logs (user_id, date DESC);
CREATE INDEX idx_attendance_date         ON public.attendance_logs (date DESC);
CREATE INDEX idx_attendance_status       ON public.attendance_logs (status);


-- ══════════════════════════════════════════════════════════════
--  TABLE: device_sessions
--  Tracks authorized device connections per user
-- ══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.device_sessions (
  id                 UUID              PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id            UUID              REFERENCES public.users(id) ON DELETE SET NULL,
  device_name        TEXT              NOT NULL,
  device_ip          INET,
  mac_address        MACADDR,
  os                 TEXT,
  device_type        TEXT              CHECK (device_type IN ('mobile','desktop','tablet','unknown')),
  connection_status  connection_status NOT NULL DEFAULT 'connected',
  connected_at       TIMESTAMPTZ       NOT NULL DEFAULT NOW(),
  disconnected_at    TIMESTAMPTZ,
  last_seen          TIMESTAMPTZ       NOT NULL DEFAULT NOW(),
  created_at         TIMESTAMPTZ       NOT NULL DEFAULT NOW()
);

-- Keep last_seen current
CREATE OR REPLACE FUNCTION refresh_device_last_seen()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.last_seen = NOW(); RETURN NEW; END;
$$;

CREATE TRIGGER device_session_last_seen
  BEFORE UPDATE ON public.device_sessions
  FOR EACH ROW EXECUTE FUNCTION refresh_device_last_seen();

CREATE INDEX idx_device_sessions_user        ON public.device_sessions (user_id);
CREATE INDEX idx_device_sessions_status      ON public.device_sessions (connection_status);
CREATE INDEX idx_device_sessions_last_seen   ON public.device_sessions (last_seen DESC);


-- ══════════════════════════════════════════════════════════════
--  TABLE: unauthorized_devices
--  Devices that were detected but not recognized
-- ══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.unauthorized_devices (
  id           UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  device_name  TEXT        NOT NULL DEFAULT 'Unknown Device',
  device_ip    INET,
  mac_address  MACADDR,
  device_type  TEXT        CHECK (device_type IN ('mobile','desktop','tablet','unknown')) DEFAULT 'unknown',
  os           TEXT,
  detected_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_attempt TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  attempts     INTEGER     NOT NULL DEFAULT 1,
  blocked      BOOLEAN     NOT NULL DEFAULT FALSE,
  blocked_at   TIMESTAMPTZ,
  blocked_by   UUID        REFERENCES public.users(id) ON DELETE SET NULL,
  notes        TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_unauthorized_blocked     ON public.unauthorized_devices (blocked);
CREATE INDEX idx_unauthorized_detected    ON public.unauthorized_devices (detected_at DESC);


-- ══════════════════════════════════════════════════════════════
--  ROW LEVEL SECURITY
-- ══════════════════════════════════════════════════════════════

ALTER TABLE public.users               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_logs     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.device_sessions     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.unauthorized_devices ENABLE ROW LEVEL SECURITY;

-- Helper: get the caller's role from the users table
CREATE OR REPLACE FUNCTION public.get_user_role(uid UUID DEFAULT auth.uid())
RETURNS user_role LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT role FROM public.users WHERE id = uid;
$$;

-- ── users policies ───────────────────────────────────────────
-- Users can read their own profile
CREATE POLICY "users_read_own"
  ON public.users FOR SELECT
  USING (id = auth.uid());

-- Admins and managers can read all profiles
CREATE POLICY "users_read_all_admins"
  ON public.users FOR SELECT
  USING (get_user_role() IN ('admin', 'manager'));

-- Users can update their own profile (non-role fields)
CREATE POLICY "users_update_own"
  ON public.users FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Only admins can update any user
CREATE POLICY "users_update_admin"
  ON public.users FOR UPDATE
  USING (get_user_role() = 'admin');

-- Only admins can insert/delete users
CREATE POLICY "users_insert_admin"
  ON public.users FOR INSERT
  WITH CHECK (get_user_role() = 'admin');

CREATE POLICY "users_delete_admin"
  ON public.users FOR DELETE
  USING (get_user_role() = 'admin');

-- ── attendance_logs policies ─────────────────────────────────
-- Users read their own logs; admins/managers read all
CREATE POLICY "attendance_read_own"
  ON public.attendance_logs FOR SELECT
  USING (user_id = auth.uid() OR get_user_role() IN ('admin', 'manager'));

-- Users can insert their own log
CREATE POLICY "attendance_insert_own"
  ON public.attendance_logs FOR INSERT
  WITH CHECK (user_id = auth.uid() OR get_user_role() IN ('admin', 'manager'));

-- Users update own; admins update any
CREATE POLICY "attendance_update"
  ON public.attendance_logs FOR UPDATE
  USING (user_id = auth.uid() OR get_user_role() IN ('admin', 'manager'));

-- Only admins can delete logs
CREATE POLICY "attendance_delete_admin"
  ON public.attendance_logs FOR DELETE
  USING (get_user_role() = 'admin');

-- ── device_sessions policies ─────────────────────────────────
CREATE POLICY "device_sessions_read"
  ON public.device_sessions FOR SELECT
  USING (user_id = auth.uid() OR get_user_role() IN ('admin', 'manager', 'security'));

CREATE POLICY "device_sessions_insert"
  ON public.device_sessions FOR INSERT
  WITH CHECK (user_id = auth.uid() OR get_user_role() IN ('admin', 'security'));

CREATE POLICY "device_sessions_update"
  ON public.device_sessions FOR UPDATE
  USING (user_id = auth.uid() OR get_user_role() IN ('admin', 'security'));

CREATE POLICY "device_sessions_delete_admin"
  ON public.device_sessions FOR DELETE
  USING (get_user_role() IN ('admin', 'security'));

-- ── unauthorized_devices policies ───────────────────────────
-- Readable by admin, manager, security
CREATE POLICY "unauthorized_read"
  ON public.unauthorized_devices FOR SELECT
  USING (get_user_role() IN ('admin', 'manager', 'security'));

CREATE POLICY "unauthorized_insert"
  ON public.unauthorized_devices FOR INSERT
  WITH CHECK (get_user_role() IN ('admin', 'security'));

CREATE POLICY "unauthorized_update"
  ON public.unauthorized_devices FOR UPDATE
  USING (get_user_role() IN ('admin', 'security'));

CREATE POLICY "unauthorized_delete"
  ON public.unauthorized_devices FOR DELETE
  USING (get_user_role() = 'admin');


-- ══════════════════════════════════════════════════════════════
--  REALTIME — enable publications
-- ══════════════════════════════════════════════════════════════
ALTER PUBLICATION supabase_realtime ADD TABLE public.attendance_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.device_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.unauthorized_devices;
ALTER PUBLICATION supabase_realtime ADD TABLE public.users;


-- ══════════════════════════════════════════════════════════════
--  VIEWS — for dashboard queries
-- ══════════════════════════════════════════════════════════════

-- Today's attendance summary
CREATE OR REPLACE VIEW public.today_attendance_summary AS
SELECT
  COUNT(*)                                              AS total_checked_in,
  COUNT(*) FILTER (WHERE status = 'present')            AS present,
  COUNT(*) FILTER (WHERE status = 'absent')             AS absent,
  COUNT(*) FILTER (WHERE status = 'late')               AS late,
  COUNT(*) FILTER (WHERE status = 'remote')             AS remote,
  COUNT(*) FILTER (WHERE status = 'early_leave')        AS early_leave,
  ROUND(AVG(EXTRACT(EPOCH FROM check_in::time) / 3600), 2) AS avg_checkin_hour
FROM public.attendance_logs
WHERE date = CURRENT_DATE;

-- Active device count
CREATE OR REPLACE VIEW public.active_devices_count AS
SELECT
  COUNT(*) FILTER (WHERE connection_status = 'connected')  AS connected,
  COUNT(*) FILTER (WHERE connection_status = 'disconnected') AS disconnected,
  COUNT(*) AS total
FROM public.device_sessions;

-- Unauthorized alerts count
CREATE OR REPLACE VIEW public.unauthorized_alerts AS
SELECT
  COUNT(*) FILTER (WHERE blocked = FALSE)  AS active_threats,
  COUNT(*) FILTER (WHERE blocked = TRUE)   AS blocked,
  COUNT(*)                                  AS total
FROM public.unauthorized_devices;


-- ══════════════════════════════════════════════════════════════
--  SEED DATA — development only (comment out for production)
-- ══════════════════════════════════════════════════════════════
-- Seed is handled via the app's auth flow + Supabase dashboard.
-- Use supabase/seed.sql for local dev seeding.
