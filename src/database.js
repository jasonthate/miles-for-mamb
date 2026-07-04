import Database from "better-sqlite3";
import config from "./config.js";

const db = new Database(config.DATABASE.FILE);

// Create riders table
db.exec(`
CREATE TABLE IF NOT EXISTS riders (
    id INTEGER PRIMARY KEY,
    firstname TEXT NOT NULL,
    lastname TEXT NOT NULL,
    name TEXT NOT NULL,
    access_token TEXT NOT NULL,
    refresh_token TEXT NOT NULL,
    expires_at INTEGER NOT NULL,
    connected_at TEXT NOT NULL
);
`);

export function saveRider(rider) {
    db.prepare(`
        INSERT INTO riders (
            id,
            firstname,
            lastname,
            name,
            access_token,
            refresh_token,
            expires_at,
            connected_at
        )
        VALUES (
            @id,
            @firstname,
            @lastname,
            @name,
            @access_token,
            @refresh_token,
            @expires_at,
            @connected_at
        )
        ON CONFLICT(id)
        DO UPDATE SET
            firstname = excluded.firstname,
            lastname = excluded.lastname,
            name = excluded.name,
            access_token = excluded.access_token,
            refresh_token = excluded.refresh_token,
            expires_at = excluded.expires_at;
    `).run(rider);
}

export function getRider(id) {
    return db.prepare(
        "SELECT * FROM riders WHERE id = ?"
    ).get(id);
}

export function getAllRiders() {
    return db.prepare(
        "SELECT * FROM riders ORDER BY name"
    ).all();
}

export function updateTokens(id, access_token, refresh_token, expires_at) {
    db.prepare(`
        UPDATE riders
        SET
            access_token = ?,
            refresh_token = ?,
            expires_at = ?
        WHERE id = ?
    `).run(
        access_token,
        refresh_token,
        expires_at,
        id
    );
}

export default db;