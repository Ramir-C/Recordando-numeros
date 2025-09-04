
const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const port = process.env.PORT || 3000;

// Configurar middleware
app.use(bodyParser.json());
app.use(express.static('public')); // Carpeta donde se encuentra tu archivo HTML

// Conectar a la base de datos SQLite
let db = new sqlite3.Database('basededatos.sqlite', (err) => {
    if (err) {
        console.error('Error al conectar con la base de datos:', err);
    } else {
        console.log('Conectado a la base de datos SQLite.');
        db.run(`CREATE TABLE IF NOT EXISTS players (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT,
            intento INTEGER,
            tiempo INTEGER,
            errores INTEGER
        )`);
    }
});

// Endpoint para guardar datos del jugador
app.post('/save', (req, res) => {
    const { nombre, intento, tiempo, errores } = req.body;
    db.run(`INSERT INTO players (nombre, intento, tiempo, errores) VALUES (?, ?, ?, ?)`,
        [nombre, intento, tiempo, errores], function(err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json({ id: this.lastID });
        });
});

// Endpoint para obtener datos de jugadores
app.get('/users', (req, res) => {
    db.all(`SELECT * FROM players`, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ users: rows });
    });
});

app.listen(port, () => {
    console.log(`Servidor escuchando en el puerto ${port}`);
});
