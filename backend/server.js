const express = require("express");
const sqlite3 = require("sqlite3").verbose();

const app = express();
const PORT = 3000;

const db = new sqlite3.Database("./backend/database.db");

app.get("/", (req, res) => {
    res.send("PillCue API funguje");
});

app.get("/api/medicines", (req, res) => {
    const query = req.query.q || "";
    const limitRaw = req.query.limit;

    let sql = `
        SELECT sukl_code, name
        FROM medicines
        WHERE name LIKE ?
    `;

    const params = [`%${query}%`];

    // limit jen pokud ho zadáš
    if (limitRaw !== undefined) {
        const limit = parseInt(limitRaw, 10);

        if (isNaN(limit) || limit <= 0) {
            return res.status(400).json({ error: "limit musí být číslo" });
        }

        sql += " LIMIT ?";
        params.push(limit);
    }

    db.all(
    `SELECT id, sukl_code, name
     FROM medicines
     WHERE name LIKE ?`,
    [`%${query}%`],
    (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        res.json(rows);
    }
);
});

app.listen(PORT, () => {
    console.log(`Server běží na portu ${PORT}`);
});