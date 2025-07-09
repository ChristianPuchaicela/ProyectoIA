// === controllers/diarioController.js ===
const sql = require('mssql');
exports.registrarEntrada = async (req, res) => {
  const { idUsuario, texto } = req.body;
  try {
    const pool = await sql.connect();
    await pool.request()
      .input('idUsuario', sql.Int, idUsuario)
      .input('texto', sql.Text, texto)
      .query('INSERT INTO DiarioEmocional (idUsuario, texto, fecha) VALUES (@idUsuario, @texto, GETDATE())');
    res.json({ mensaje: 'Entrada registrada' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};