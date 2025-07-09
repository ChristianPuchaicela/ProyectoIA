// === controllers/prediccionController.js ===
const sql = require('mssql');
exports.guardarPrediccion = async (req, res) => {
  const { idUsuario, emocion } = req.body;
  try {
    const pool = await sql.connect();
    await pool.request()
      .input('idUsuario', sql.Int, idUsuario)
      .input('emocion', sql.VarChar, emocion)
      .query('INSERT INTO Predicciones (idUsuario, emocion, fecha) VALUES (@idUsuario, @emocion, GETDATE())');
    res.json({ mensaje: 'Predicción registrada' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};