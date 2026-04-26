require('dotenv').config();

const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const jwt = require('jsonwebtoken');
const path = require('path');

const app = express();
app.use(express.json());

// ================= PATH ABSOLUTO SEGURO =================
const publicPath = path.join(__dirname, '..', 'public');

// ================= STATIC =================
app.use(express.static(publicPath));

// ================= RUTA ROOT (FORZADA) =================
app.get('/', (req, res) => {
    res.sendFile(path.join(publicPath, 'login.html'));
});

// ================= TEST (DEBUG) =================
app.get('/test', (req, res) => {
    res.send("Servidor OK");
});

// ================= DB =================
const db = new sqlite3.Database('./server/database.db');

db.serialize(() => {

    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT,
            password TEXT
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS participantes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT,
            telefono TEXT,
            edad INTEGER,
            rol TEXT,
            banco TEXT,
            pago REAL,
            abono REAL,
            pendiente REAL,
            usuario TEXT
        )
    `);

    db.get("SELECT * FROM users WHERE username='admin'", (err, row) => {
        if (!row) {
            db.run(`
                INSERT INTO users (username, password) VALUES 
                ('admin','1234'),
                ('abel','1234'),
                ('daniel','1234'),
                ('emmanuel','1234')
            `);
        }
    });

});

const SECRET = process.env.JWT_SECRET || "laffaire_secret";

// ================= LOGIN =================
app.post('/login', (req, res) => {

    const { username, password } = req.body;

    db.get(
        "SELECT * FROM users WHERE username=? AND password=?",
        [username, password],
        (err, user) => {

            if (user) {
                const token = jwt.sign({ username: user.username }, SECRET);
                res.json({ token, username: user.username });
            } else {
                res.status(401).json({ error: "Credenciales incorrectas" });
            }
        }
    );
});

// ================= AUTH =================
function auth(req, res, next) {
    const token = req.headers.authorization;
    if (!token) return res.sendStatus(403);

    jwt.verify(token, SECRET, (err, data) => {
        if (err) return res.sendStatus(403);
        req.user = data;
        next();
    });
}

// ================= PARTICIPANTES =================
app.get('/participantes', auth, (req, res) => {

    if (req.user.username === "admin") {
        db.all("SELECT * FROM participantes", [], (e, rows) => res.json(rows));
    } else {
        db.all(
            "SELECT * FROM participantes WHERE usuario=?",
            [req.user.username],
            (e, rows) => res.json(rows)
        );
    }
});

// ================= CREAR =================
app.post('/participantes', auth, (req, res) => {

    const { nombre, telefono, edad, rol, banco, pago } = req.body;

    const pagoNum = Number(pago) || 0;

    const abono = pagoNum < 35 ? pagoNum : 0;
    const pagoCompleto = pagoNum >= 35 ? 35 : 0;
    const pendiente = Math.max(35 - pagoNum, 0);

    db.run(`
        INSERT INTO participantes
        (nombre, telefono, edad, rol, banco, pago, abono, pendiente, usuario)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [nombre, telefono, edad, rol, banco, pagoCompleto, abono, pendiente, req.user.username],
    () => res.json({ ok: true }));
});

// ================= START =================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("🔥 Servidor corriendo en puerto " + PORT);
});