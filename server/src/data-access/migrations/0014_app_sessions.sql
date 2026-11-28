-- E-02 demo Student session (DL-27, DL-44). `students` comes from the E-03 foundation (0001).
-- Only a SHA-256 hash of the cookie value is stored, never the value itself.
CREATE TABLE app_sessions (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  token_hash text        NOT NULL UNIQUE,
  student_id uuid        NOT NULL REFERENCES students (id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL
);

CREATE INDEX app_sessions_student_id_idx ON app_sessions (student_id);
CREATE INDEX app_sessions_expires_at_idx ON app_sessions (expires_at);
