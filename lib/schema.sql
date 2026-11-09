-- Neario ReviewFlow: accounts, agencies, businesses, feedback, view-as log.
-- Safe to run more than once.
CREATE TABLE IF NOT EXISTS agencies (
  id          bigserial PRIMARY KEY,
  name        text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- agency_id NULL means a direct client (no agency).
CREATE TABLE IF NOT EXISTS businesses (
  id                 bigserial PRIMARY KEY,
  name               text NOT NULL,
  type               text NOT NULL DEFAULT 'Other',
  city               text,
  plan               text NOT NULL DEFAULT 'yearly' CHECK (plan IN ('monthly','yearly')),
  pay_status         text NOT NULL DEFAULT 'awaiting_payment' CHECK (pay_status IN ('awaiting_payment','paid','past_due','cancelled')),
  agency_id          bigint REFERENCES agencies(id),
  owner_permission_at timestamptz,            -- when the agency confirmed the owner agreed
  created_at         timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS businesses_agency_idx ON businesses(agency_id);

-- One row per login. Exactly one of these holds:
--   super_admin: agency_id and business_id both NULL
--   agency_user: agency_id set, business_id NULL
--   client_user: business_id set, agency_id NULL
CREATE TABLE IF NOT EXISTS users (
  id             bigserial PRIMARY KEY,
  email          text NOT NULL,
  name           text,
  role           text NOT NULL CHECK (role IN ('super_admin','agency_user','client_user')),
  agency_id      bigint REFERENCES agencies(id),
  business_id    bigint REFERENCES businesses(id),
  password_hash  text,
  status         text NOT NULL DEFAULT 'invited' CHECK (status IN ('invited','active','disabled')),
  failed_logins  int NOT NULL DEFAULT 0,
  locked_until   timestamptz,
  created_at     timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT users_scope_ck CHECK (
    (role = 'super_admin' AND agency_id IS NULL AND business_id IS NULL) OR
    (role = 'agency_user' AND agency_id IS NOT NULL AND business_id IS NULL) OR
    (role = 'client_user' AND business_id IS NOT NULL AND agency_id IS NULL))
);
CREATE UNIQUE INDEX IF NOT EXISTS users_email_uq ON users (lower(email));

CREATE TABLE IF NOT EXISTS invites (
  id          bigserial PRIMARY KEY,
  user_id     bigint NOT NULL REFERENCES users(id),
  token_hash  text NOT NULL UNIQUE,           -- sha256 of the emailed token; the token itself is never stored
  expires_at  timestamptz NOT NULL,
  used_at     timestamptz
);

CREATE TABLE IF NOT EXISTS feedback (
  id           bigserial PRIMARY KEY,
  business_id  bigint NOT NULL REFERENCES businesses(id),
  rating       int NOT NULL CHECK (rating BETWEEN 1 AND 5),
  text         text,
  created_at   timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS feedback_business_idx ON feedback(business_id, created_at DESC);

-- Written every time an agency or Neario admin opens a business's feedback.
CREATE TABLE IF NOT EXISTS view_log (
  id            bigserial PRIMARY KEY,
  actor_user_id bigint NOT NULL REFERENCES users(id),
  actor_role    text NOT NULL,
  business_id   bigint NOT NULL REFERENCES businesses(id),
  reason        text,
  created_at    timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS view_log_business_idx ON view_log(business_id, created_at DESC);
