const express = require('express');
const { sql, poolPromise } = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Registro de paciente
router.post('/registro', async (req, res) => {
  const { nombre, correo, contrasena } = req.body;

  try {
    const pool = await poolPromise;
    const hashed = await bcrypt.hash(contrasena, 10);

    await pool.request().query(`
      INSERT INTO Usuarios (nombre, correo, contraseña, tipoUsuario)
      VALUES ('${nombre}', '${correo}', '${hashed}', 'paciente')
    `);

    res.status(200).json({ msg: 'Registro exitoso' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { correo, contrasena } = req.body;

  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT * FROM Usuarios WHERE correo = '${correo}'
    `);

    const user = result.recordset[0];

    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    const valid = await bcrypt.compare(contrasena, user.contraseña || user["contraseña"]);

    if (!valid) return res.status(401).json({ error: 'Contraseña incorrecta' });

    // Generar token JWT
    const token = jwt.sign(
      { idUsuario: user.idUsuario, tipoUsuario: user.tipoUsuario },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      token,
      idUsuario: user.idUsuario,
      nombre: user.nombre,
      tipoUsuario: user.tipoUsuario
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
