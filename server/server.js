require('dotenv').config();
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());
app.use(express.static('public'));

const db = new sqlite3.Database('./server/database.db');
const SECRET = "laffaire_secret";

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
                res.status(401).json({ error: "Error" });
            }
        }
    );
});

// ================= AUTH =================
function auth(req, res, next){
    const token = req.headers.authorization;
    if(!token) return res.sendStatus(403);

    jwt.verify(token, SECRET, (err, data)=>{
        if(err) return res.sendStatus(403);
        req.user = data;
        next();
    });
}

// ================= GET PARTICIPANTES =================
app.get('/participantes', auth, (req, res) => {

    if(req.user.username === "admin"){
        db.all("SELECT * FROM participantes", [], (e,rows)=>res.json(rows));
    } else {
        db.all(
            "SELECT * FROM participantes WHERE usuario=?",
            [req.user.username],
            (e,rows)=>res.json(rows)
        );
    }
});

// ================= CREAR =================
app.post('/participantes', auth, (req, res) => {

    const { nombre, telefono, edad, rol, banco, pago } = req.body;

    const pagoNum = Number(pago) || 0;

    const abono = pagoNum < 35 ? pagoNum : 0;
    const pagoCompleto = pagoNum >= 35 ? 35 : 0;
    const pendiente = 35 - pagoNum;

    db.run(`
        INSERT INTO participantes
        (nombre, telefono, edad, rol, banco, pago, abono, pendiente, usuario)
        VALUES (?,?,?,?,?,?,?,?,?)
    `,
    [nombre, telefono, edad, rol, banco, pagoCompleto, abono, pendiente, req.user.username],
    () => res.json({ ok:true }));

});

// ================= DELETE =================
app.delete('/participantes/:id', auth, (req,res)=>{
    db.run("DELETE FROM participantes WHERE id=?", [req.params.id], ()=>res.json({ok:true}));
});

// ================= DASHBOARD =================
app.get('/dashboard', auth, (req,res)=>{

    let query = "SELECT COUNT(*) as total, SUM(pago+abono) as ingresos, SUM(pendiente) as pendiente FROM participantes";
    let params = [];

    if(req.user.username !== "admin"){
        query += " WHERE usuario=?";
        params.push(req.user.username);
    }

    db.get(query, params, (e,row)=>res.json(row));
});

app.listen(3000, ()=>console.log("🔥 SaaS listo"));