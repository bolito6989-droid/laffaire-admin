require('dotenv').config();

const express = require('express');
const jwt = require('jsonwebtoken');
const path = require('path');
const supabase = require('./supabase');

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

const SECRET = process.env.JWT_SECRET || "laffaire_secret";

// ================= LOGIN =================
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .eq('password', password)
        .single();

    if (error || !data) {
        return res.status(401).json({ error: "Credenciales incorrectas" });
    }

    const token = jwt.sign({ username: data.username }, SECRET, { expiresIn: '8h' });
    res.json({ token, username: data.username });
});

// ================= AUTH =================
function auth(req, res, next) {
    const token = req.headers.authorization;
    if (!token) return res.sendStatus(403);

    jwt.verify(token, SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

// ================= GET PARTICIPANTES =================
app.get('/participantes', auth, async (req, res) => {

    let query = supabase.from('participantes').select('*');

    // Solo admin ve todo
    if (req.user.username !== "admin") {
        query = query.eq('usuario', req.user.username);
    }

    const { data, error } = await query;

    if (error) return res.status(500).json({ error });

    res.json(data || []);
});

// ================= CREAR PARTICIPANTE =================
app.post('/participantes', auth, async (req, res) => {

    const { nombre, telefono, edad, rol, banco, pago } = req.body;

    if (!nombre) {
        return res.status(400).json({ error: "Nombre requerido" });
    }

    const { error } = await supabase.from('participantes').insert([{
        nombre,
        telefono,
        edad,
        rol,
        banco,
        pago: Number(pago) || 0,
        usuario: req.user.username // 🔥 CAPTADOR
    }]);

    if (error) return res.status(500).json({ error });

    res.json({ ok: true });
});

// ================= ELIMINAR =================
app.delete('/participantes/:id', auth, async (req, res) => {

    const { error } = await supabase
        .from('participantes')
        .delete()
        .eq('id', req.params.id);

    if (error) return res.status(500).json({ error });

    res.json({ ok: true });
});

// ================= DASHBOARD =================
app.get('/dashboard', auth, async (req, res) => {

    let query = supabase.from('participantes').select('*');

    if (req.user.username !== "admin") {
        query = query.eq('usuario', req.user.username);
    }

    const { data, error } = await query;

    if (error) return res.status(500).json({ error });

    let total = data.length;
    let ingresos = 0;
    let comisiones = 0;

    data.forEach(p => {
        const pago = Number(p.pago) || 0;
        ingresos += pago;

        // comisión por venta válida (cover >= 25)
        if (pago >= 25) {
            comisiones += 7;
        }
    });

    res.json({
        total,
        ingresos,
        comisiones
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Servidor listo en puerto " + PORT));