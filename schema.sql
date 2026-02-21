CREATE TABLE IF NOT EXISTS audit_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  timestamp TEXT NOT NULL DEFAULT (datetime('now')),
  tool_name TEXT NOT NULL,
  upstream_endpoint TEXT,
  upstream_method TEXT,
  upstream_status INTEGER,
  latency_ms INTEGER,
  session_hash TEXT NOT NULL,
  domain TEXT,
  error_code TEXT
);

CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_log(timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_session ON audit_log(session_hash);
CREATE INDEX IF NOT EXISTS idx_audit_tool ON audit_log(tool_name);
