const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise'); // versión promise para async/await
const app = express();
const port = process.env.PORT || 3000;

// Configurar middleware
app.use(bodyParser.json());
app.use(express.static('public')); // Carpeta donde se encuentra tu archivo HTML

// Configurar conexión a MySQL
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'mysql.railway.internal',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'WyXiejblgfpjJtImaggAZXRCsbjFjBPM',
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
                nombre VARCHAR(100),
                intento INT,
                tiempo INT,
                errores INT
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
        const { nombre, intento, tiempo, errores } = req.body;
        const [result] = await pool.query(
            `INSERT INTO players (nombre, intento, tiempo, errores) VALUES (?, ?, ?, ?)`,
            [nombre, intento, tiempo, errores]
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
        const [rows] = await pool.query(`SELECT * FROM players`);
        res.json({ users: rows });
    } catch (err) {
        console.error('Error al obtener datos:', err);
        res.status(500).json({ error: err.message });
    }
});

app.listen(port, () => {
    console.log(`Servidor escuchando en el puerto ${port}`);
});
