require('dotenv').config();
const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET;

function generarToken(user) {
    return jwt.sign({ id: user.id }, SECRET, { expiresIn: '2h' });
}

function verificarToken(req, res, next) {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(403).json({ error: "Token requerido" });
    }

    jwt.verify(token, SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: "Token inválido" });
        }

        req.user = decoded;
        next();
    });
}

module.exports = { generarToken, verificarToken };