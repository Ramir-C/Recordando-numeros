const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise'); // versión promise para async/await
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// Configurar middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public'))); // Carpeta donde se encuentra tu archivo HTML

// Configurar conexión a MySQL
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'mysql.railway.internal',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'wWvwRafyqvbGnCintjVOBKkFudFKisPN',
    database: process.env.DB_NAME || 'railway',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Crear tabla si no existe
(async () => {
    try {
        const createTableSQL = `
            CREATE TABLE IF NOT EXISTS players (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nombre VARCHAR(100) NOT NULL,
                intento INT NOT NULL,
                tiempo INT NOT NULL,
                errores INT NOT NULL,
                resultado VARCHAR(20) NOT NULL
            )
        `;
        const conn = await pool.getConnection();
        await conn.query(createTableSQL);
        conn.release();
        console.log('Tabla "players" lista en MySQL.');
    } catch (err) {
        console.error('Error al crear la tabla:', err);
    }
})();

// Endpoint para guardar datos del jugador
app.post('/save', async (req, res) => {
    try {
        const { nombre, intento, tiempo, errores, resultado } = req.body;
        if (!nombre || intento == null || tiempo == null || errores == null || !resultado) {
            return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
        }
        const [result] = await pool.query(
            `INSERT INTO players (nombre, intento, tiempo, errores, resultado) VALUES (?, ?, ?, ?, ?)`,
            [nombre, intento, tiempo, errores, resultado]
        );
        res.json({ id: result.insertId });
    } catch (err) {
        console.error('Error al guardar datos:', err);
        res.status(500).json({ error: err.message });
    }
});

// Endpoint para obtener datos de jugadores
app.get('/users', async (req, res) => {
    try {
        const [rows] = await pool.query(`SELECT * FROM players ORDER BY nombre, intento, id`);
        res.json({ users: rows });
    } catch (err) {
        console.error('Error al obtener datos:', err);
        res.status(500).json({ error: err.message });
    }
});

app.listen(port, () => {
    console.log(`Servidor escuchando en el puerto ${port}`);
});
