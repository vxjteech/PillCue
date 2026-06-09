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

    let limit = parseInt(req.query.limit, 10);

    if (isNaN(limit) || limit <= 0) {
        limit = 20;
    }

    db.all(
        `
        SELECT *
        FROM medicines
        WHERE
            name LIKE ?
            OR sukl_code LIKE ?
        ORDER BY name ASC
        LIMIT ?
        `,
        [`%${query}%`, `%${query}%`, limit],
        (err, rows) => {
            if (err) {
                return res.status(500).json({
                    error: err.message
                });
            }

            res.json(
                rows.map(row => ({
                    ID: row.id,
                    KOD_SUKL: row.sukl_code,
                    NAZEV: row.name,
                    SILA: row.strength,
                    LATKY: JSON.parse(row.substances || "[]")
                }))
            );
        }
    );
});

app.listen(PORT, () => {
    console.log(`Server běží na portu ${PORT}`);
});