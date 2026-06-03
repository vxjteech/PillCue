const fs = require("fs");
const csv = require("csv-parser");
const sqlite3 = require("sqlite3").verbose();
const iconv = require("iconv-lite");

const db = new sqlite3.Database("./backend/database.db");

db.serialize(() => {
    db.run("DROP TABLE IF EXISTS medicines");

    db.run(`
        CREATE TABLE medicines (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sukl_code TEXT UNIQUE,
            name TEXT NOT NULL
        )
    `);

    const stmt = db.prepare(`
        INSERT OR IGNORE INTO medicines (sukl_code, name)
        VALUES (?, ?)
    `);

    let pending = 0;
    let inserted = 0;

    const stream = fs.createReadStream("./backend/SÚKLDataset/dlp_lecivepripravky.csv")
        .pipe(iconv.decodeStream("cp1250"))
        .pipe(csv({ separator: ";" }));

    stream.on("data", (row) => {
        pending++;

        stmt.run(row.KOD_SUKL, row.NAZEV, (err) => {
            pending--;
            if (!err) inserted++;
        });
    });

    stream.on("end", () => {
        const wait = setInterval(() => {
            if (pending === 0) {
                clearInterval(wait);

                stmt.finalize(() => {
                    db.close(() => {
                        console.log(`Insert dokončen. Vloženo: ${inserted}`);
                    });
                });
            }
        }, 50);
    });
});