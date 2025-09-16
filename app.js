const express = require('express');
const bodyParser = require('body-parser');
const pool = require('./db');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../public')));

// Crear tabla si no existe
(async () => {
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS players (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nombre VARCHAR(100),
      intento INT,
      tiempo FLOAT,
      errores INT,
      gano BOOLEAN
    )
  `;
  const conn = await pool.getConnection();
  await conn.query(createTableSQL);
  conn.release();
})();

// Guardar datos del jugador
app.post('/save', async (req, res) => {
  try {
    const { nombre, intento, tiempo, errores, gano } = req.body;
    const [result] = await pool.query(
      `INSERT INTO players (nombre, intento, tiempo, errores, gano) VALUES (?, ?, ?, ?, ?)`,
      [nombre, intento, tiempo, errores, gano || false]
    );
    res.json({ id: result.insertId, message: 'Jugador guardado correctamente' });
  } catch (err) {
    console.error('Error al guardar:', err);
    res.status(500).json({ error: err.message });
  }
});

// Obtener lista de jugadores
app.get('/users', async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT * FROM players`);
    res.json({ users: rows });
  } catch (err) {
    console.error('Error al obtener usuarios:', err);
    res.status(500).json({ error: err.message });
  }
});

// Iniciar servidor
app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
