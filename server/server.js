require('dotenv').config();

const express = require('express');
const jwt = require('jsonwebtoken');
const path = require('path');
const supabase = require('./supabase');

const app = express();

app.use(express.json());

// ================= PUBLIC =================
app.use(express.static(path.join(__dirname, '..', 'public')));

// ================= HOME =================
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

const SECRET = process.env.JWT_SECRET || "laffaire_secret";

// ================= LOGIN =================
app.post('/login', async (req, res) => {

    try {

        const { username, password } = req.body;

        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('username', username)
            .eq('password', password)
            .single();

        if (error || !data) {
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

    } catch (err) {

        console.log(err);

        res.status(500).json({
            error: 'Error servidor'
        });
    }
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

// ================= CIUDAD STAFF =================
function obtenerCiudad(usuario) {

    const gye = ['abel', 'daniel', 'emmanuel'];

    if (gye.includes(usuario.toLowerCase())) {
        return 'Guayaquil';
    }

    return 'Quito';
}

// ================= GET PARTICIPANTES =================
app.get('/participantes', auth, async (req, res) => {

    try {

        let query = supabase
            .from('participantes')
            .select('*')
            .eq('archivado', false);

        if (req.user.username !== 'admin') {
            query = query.eq('usuario', req.user.username);
        }

        const { data, error } = await query;

        if (error) {
            console.log(error);
            return res.json([]);
        }

        res.json(data || []);

    } catch (err) {

        console.log(err);

        res.json([]);
    }
});

// ================= CREAR =================
app.post('/participantes', auth, async (req, res) => {

    try {

        const {
            nombre,
            telefono,
            edad,
            rol,
            banco,
            pago
        } = req.body;

        const ciudad = obtenerCiudad(req.user.username);

        const { error } = await supabase
            .from('participantes')
            .insert([{
                nombre,
                telefono,
                edad,
                rol,
                banco,
                pago: Number(pago) || 0,
                usuario: req.user.username,
                ciudad,
                evento: 'Evento 04 de Mayo',
                archivado: false
            }]);

        if (error) {
            console.log(error);

            return res.status(500).json({
                error: 'No se pudo guardar'
            });
        }

        res.json({
            ok: true
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            error: 'Error servidor'
        });
    }
});

// ================= EDITAR =================
app.put('/participantes/:id', auth, async (req, res) => {

    try {

        const {
            nombre,
            telefono,
            edad,
            rol,
            banco,
            pago
        } = req.body;

        const { error } = await supabase
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

        if (error) {
            console.log(error);
        }

        res.json({
            ok: true
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            error: 'Error servidor'
        });
    }
});

// ================= ELIMINAR =================
app.delete('/participantes/:id', auth, async (req, res) => {

    try {

        const { error } = await supabase
            .from('participantes')
            .delete()
            .eq('id', req.params.id);

        if (error) {
            console.log(error);
        }

        res.json({
            ok: true
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            error: 'Error servidor'
        });
    }
});

// ================= ARCHIVAR EVENTO =================
app.post('/archivar-evento', auth, async (req, res) => {

    try {

        if (req.user.username !== 'admin') {
            return res.sendStatus(403);
        }

        const { error } = await supabase
            .from('participantes')
            .update({
                archivado: true
            })
            .eq('evento', 'Evento 04 de Mayo');

        if (error) {
            console.log(error);
        }

        res.json({
            ok: true
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            error: 'Error servidor'
        });
    }
});

// ================= HISTORIAL =================
app.get('/historial', auth, async (req, res) => {

    try {

        if (req.user.username !== 'admin') {
            return res.sendStatus(403);
        }

        const { data, error } = await supabase
            .from('participantes')
            .select('*')
            .eq('archivado', true);

        if (error) {
            console.log(error);
            return res.json([]);
        }

        res.json(data || []);

    } catch (err) {

        console.log(err);

        res.json([]);
    }
});

// ================= DASHBOARD =================
app.get('/dashboard', auth, async (req, res) => {

    try {

        let query = supabase
            .from('participantes')
            .select('*')
            .eq('archivado', false);

        if (req.user.username !== 'admin') {
            query = query.eq('usuario', req.user.username);
        }

        const { data, error } = await query;

        if (error) {

            console.log(error);

            return res.json({
                total: 0,
                ingresos: 0,
                comisiones: 0,
                quito: 0,
                guayaquil: 0
            });
        }

        const participantes = data || [];

        let total = participantes.length;

        let ingresos = 0;
        let comisiones = 0;
        let quito = 0;
        let guayaquil = 0;

        participantes.forEach(p => {

            ingresos += Number(p.pago) || 0;

            if ((Number(p.pago) || 0) >= 25) {
                comisiones += 7;
            }

            if (p.ciudad === 'Quito') {
                quito++;
            }

            if (p.ciudad === 'Guayaquil') {
                guayaquil++;
            }
        });

        res.json({
            total,
            ingresos,
            comisiones,
            quito,
            guayaquil
        });

    } catch (err) {

        console.log(err);

        res.json({
            total: 0,
            ingresos: 0,
            comisiones: 0,
            quito: 0,
            guayaquil: 0
        });
    }
});

// ================= SERVER =================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("Servidor funcionando puerto " + PORT);
});