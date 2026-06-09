const fs = require("fs");
const csv = require("csv-parser");
const sqlite3 = require("sqlite3").verbose();
const iconv = require("iconv-lite");

const db = new sqlite3.Database("./backend/database.db");

function importMedicines() {
    return new Promise((resolve) => {
        db.serialize(() => {
            db.run("DROP TABLE IF EXISTS medicines");

            db.run(`
                CREATE TABLE medicines (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    sukl_code TEXT UNIQUE,
                    name TEXT NOT NULL,
                    strength TEXT,
                    substances TEXT
                )
            `);

            const stmt = db.prepare(`
                INSERT OR IGNORE INTO medicines
                (sukl_code, name, strength, substances)
                VALUES (?, ?, ?, ?)
            `);

            let inserted = 0;
            let pending = 0;

            fs.createReadStream("./backend/SÚKLDataset/novaDatabazePillcue.csv")
                .pipe(iconv.decodeStream("cp1250"))
                .pipe(csv({ separator: ";" }))
                .on("data", (row) => {
                    pending++;

                    const kody =
                        (row.KODY_LATEK || "")
                            .split(";")
                            .map(x => x.trim())
                            .filter(Boolean);

                    const nazvy =
                        (row.NAZVY_LATEK || "")
                            .split(";")
                            .map(x => x.trim())
                            .filter(Boolean);

                    const latky = [];

                    for (let i = 0; i < Math.max(kody.length, nazvy.length); i++) {
                        latky.push({
                            kod: kody[i] || "",
                            nazev: nazvy[i] || ""
                        });
                    }

                    stmt.run(
                        row.KOD_SUKL,
                        row.NAZEV,
                        row.SILA,
                        JSON.stringify(latky),
                        (err) => {
                            pending--;

                            if (!err) {
                                inserted++;
                            } else {
                                console.error(err);
                            }
                        }
                    );
                })
                .on("end", () => {
                    const wait = setInterval(() => {
                        if (pending === 0) {
                            clearInterval(wait);

                            stmt.finalize(() => {
                                console.log(
                                    `Import dokončen. Vloženo: ${inserted}`
                                );

                                resolve();
                            });
                        }
                    }, 100);
                });
        });
    });
}

(async () => {
    console.log("Importuji léčiva...");
    await importMedicines();

    db.close();
})();