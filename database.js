import Database from "better-sqlite3";

const db = new Database("miles.db");

// Create riders table if it doesn't exist
db.exec(`
CREATE TABLE IF NOT EXISTS riders (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expires_at INTEGER NOT NULL
);
`);

export default db;