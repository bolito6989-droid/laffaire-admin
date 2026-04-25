CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT,
    password TEXT
);

CREATE TABLE IF NOT EXISTS participantes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT,
    telefono TEXT,
    edad INTEGER,
    rol TEXT,
    captador TEXT,
    pago REAL DEFAULT 0,
    abono REAL DEFAULT 0,
    pendiente REAL DEFAULT 35,
    banco TEXT,
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO users (username, password) VALUES ('admin', '1234');