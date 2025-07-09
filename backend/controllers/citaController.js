// === controllers/citaController.js ===
const { sql, poolPromise } = require('../config/db');

exports.crearCita = async (req, res) => {
  const { idPaciente, idPsicologo, fechaCita, motivo } = req.body;
  try {
    const pool = await poolPromise;
    await pool.request()
      .input('idPaciente', sql.Int, idPaciente)
      .input('idPsicologo', sql.Int, idPsicologo)
      .input('fechaCita', sql.DateTime, fechaCita)
      .input('motivo', sql.VarChar, motivo)
      .query('INSERT INTO Citas (idPaciente, idPsicologo, fechaCita, motivo) VALUES (@idPaciente, @idPsicologo, @fechaCita, @motivo)');
    res.json({ mensaje: 'Cita agendada correctamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.obtenerPsicologos = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .query("SELECT idUsuario, nombre FROM Usuarios WHERE tipoUsuario = 'psicologo'");
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.obtenerCitasPsicologo = async (req, res) => {
  const { idPsicologo } = req.params;
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('idPsicologo', sql.Int, idPsicologo)
      .query(`
        SELECT c.idCita, c.fechaCita, c.estado, c.motivo, u.nombre AS paciente
        FROM Citas c
        JOIN Usuarios u ON c.idPaciente = u.idUsuario
        WHERE c.idPsicologo = @idPsicologo
        ORDER BY c.fechaCita DESC
      `);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.obtenerCitasPaciente = async (req, res) => {
  const { idPaciente } = req.params;
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('idPaciente', sql.Int, idPaciente)
      .query(`
        SELECT c.idCita, c.fechaCita, c.estado, c.motivo, u.nombre AS psicologo
        FROM Citas c
        JOIN Usuarios u ON c.idPsicologo = u.idUsuario
        WHERE c.idPaciente = @idPaciente
        ORDER BY c.fechaCita DESC
      `);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Obtener pacientes de un psicólogo autenticado
exports.obtenerPacientesDePsicologo = async (req, res) => {
  const idPsicologo = req.user.idUsuario;
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('idPsicologo', sql.Int, idPsicologo)
      .query(`
        SELECT DISTINCT u.idUsuario, u.nombre, u.correo
        FROM Citas c
        JOIN Usuarios u ON c.idPaciente = u.idUsuario
        WHERE c.idPsicologo = @idPsicologo
      `);
    res.json(result.recordset);
  } catch (err) {
    console.error('Error en obtenerPacientesDePsicologo:', err); // Log detallado
    res.status(500).json({ error: err.message });
  }
};

// Cambiar el estado de una cita
exports.cambiarEstadoCita = async (req, res) => {
  const { idCita } = req.params;
  const { estado } = req.body;
  try {
    const pool = await poolPromise;
    await pool.request()
      .input('idCita', sql.Int, idCita)
      .input('estado', sql.VarChar, estado)
      .query('UPDATE Citas SET estado = @estado WHERE idCita = @idCita');
    res.json({ mensaje: 'Estado de la cita actualizado' });
  } catch (err) {
    console.error('Error en cambiarEstadoCita:', err); // Log detallado
    res.status(500).json({ error: err.message });
  }
};