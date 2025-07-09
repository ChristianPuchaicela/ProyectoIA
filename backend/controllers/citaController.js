// === controllers/citaController.js ===
const sql = require('mssql');
exports.crearCita = async (req, res) => {
  const { idPaciente, idPsicologo, fecha, motivo } = req.body;
  try {
    const pool = await sql.connect();
    await pool.request()
      .input('idPaciente', sql.Int, idPaciente)
      .input('idPsicologo', sql.Int, idPsicologo)
      .input('fecha', sql.DateTime, fecha)
      .input('motivo', sql.VarChar, motivo)
      .query('INSERT INTO Citas (idPaciente, idPsicologo, fecha, motivo) VALUES (@idPaciente, @idPsicologo, @fecha, @motivo)');
    res.json({ mensaje: 'Cita agendada correctamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};