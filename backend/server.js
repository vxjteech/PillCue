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

    db.all(
        `SELECT * FROM medicines WHERE name LIKE ? LIMIT 10`,
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