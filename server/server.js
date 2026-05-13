require('dotenv').config();

const express = require('express');
const jwt = require('jsonwebtoken');
const path = require('path');
const supabase = require('./supabase');

const app = express();

app.use(express.json());

app.use(express.static(path.join(__dirname, '..', 'public')));

// ================= HOME =================
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

const SECRET = process.env.JWT_SECRET || "laffaire_secret";

// ================= LOGIN =================
app.post('/login', async (req, res) => {

    const { username, password } = req.body;

    const { data } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .eq('password', password)
        .single();

    if (!data) {
        return res.status(401).json({
            error: "Credenciales incorrectas"
        });
    }

    const token = jwt.sign(
        { username: data.username },
        SECRET,
        { expiresIn: '8h' }
    );

    res.json({
        token,
        username: data.username
    });
});

// ================= AUTH =================
function auth(req, res, next) {

    const token = req.headers.authorization;

    if (!token) {
        return res.sendStatus(403);
    }

    jwt.verify(token, SECRET, (err, user) => {

        if (err) {
            return res.sendStatus(403);
        }

        req.user = user;

        next();
    });
}

// ================= GET PARTICIPANTES =================
app.get('/participantes', auth, async (req, res) => {

    let query = supabase
        .from('participantes')
        .select('*');

    // ADMIN VE TODO
    if (req.user.username !== "admin") {
        query = query.eq('usuario', req.user.username);
    }

    const { data } = await query;

    res.json(data || []);
});

// ================= CREAR =================
app.post('/participantes', auth, async (req, res) => {

    const {
        nombre,
        telefono,
        edad,
        rol,
        banco,
        pago
    } = req.body;

    await supabase
        .from('participantes')
        .insert([{
            nombre,
            telefono,
            edad,
            rol,
            banco,
            pago: Number(pago) || 0,
            usuario: req.user.username
        }]);

    res.json({
        ok: true
    });
});

// ================= EDITAR =================
app.put('/participantes/:id', auth, async (req, res) => {

    const {
        nombre,
        telefono,
        edad,
        rol,
        banco,
        pago
    } = req.body;

    await supabase
        .from('participantes')
        .update({
            nombre,
            telefono,
            edad,
            rol,
            banco,
            pago: Number(pago) || 0
        })
        .eq('id', req.params.id);

    res.json({
        ok: true
    });
});

// ================= ELIMINAR =================
app.delete('/participantes/:id', auth, async (req, res) => {

    await supabase
        .from('participantes')
        .delete()
        .eq('id', req.params.id);

    res.json({
        ok: true
    });
});

// ================= DASHBOARD =================
app.get('/dashboard', auth, async (req, res) => {

    let query = supabase
        .from('participantes')
        .select('*');

    if (req.user.username !== "admin") {
        query = query.eq('usuario', req.user.username);
    }

    const { data } = await query;

    let total = data.length;
    let ingresos = 0;
    let comisiones = 0;

    data.forEach(p => {

        ingresos += Number(p.pago) || 0;

        // comisión
        if ((Number(p.pago) || 0) >= 25) {
            comisiones += 7;
        }
    });

    res.json({
        total,
        ingresos,
        comisiones
    });
});

// ================= SERVER =================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("Servidor funcionando en puerto " + PORT);
});