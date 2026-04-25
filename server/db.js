require('dotenv').config();

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.resolve(process.env.DB_PATH);
const dbDir = path.dirname(dbPath);

if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath);

// crear tablas
const schemaPath = path.resolve(__dirname, 'database', 'schema.sql');

fs.readFile(schemaPath, 'utf8', (err, data) => {
    if (!err) {
        db.exec(data, () => {

            // 🔥 CREAR USUARIO AUTOMÁTICO SI NO EXISTE
            db.get("SELECT * FROM users WHERE username='admin'", (err, row) => {

                if (!row) {
                    db.run(
                        "INSERT INTO users (username, password) VALUES (?, ?)",
                        ['admin', '1234'],
                        () => {
                            console.log("✅ Usuario admin creado automáticamente");
                        }
                    );
                }

            });

        });
    }
});

module.exports = db;