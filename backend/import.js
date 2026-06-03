const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./backend/database.db");

db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS medicines (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            substance TEXT
        )
    `);

    db.run(`
        INSERT INTO medicines (name, substance)
        VALUES
        ('Paralen 500', 'Paracetamol'),
        ('Ibalgin 400', 'Ibuprofen'),
        ('Brufen 600', 'Ibuprofen')
    `);
});

db.close();

console.log("Databáze vytvořena.");