const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sql, poolPromise } = require('../config/db');
require('dotenv').config();

exports.register = async (req, res) => {
  const { nombre, email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const pool = await poolPromise;

    await pool.request()
      .input('nombre', sql.VarChar, nombre)
      .input('correo', sql.VarChar, email)
      .input('contraseña', sql.VarChar, hashedPassword)
      .input('tipoUsuario', sql.VarChar, 'paciente') // fijo como paciente
      .query(`INSERT INTO Usuarios (nombre, correo, contraseña, tipoUsuario, fechaRegistro)
              VALUES (@nombre, @correo, @contraseña, @tipoUsuario, GETDATE())`);

    res.status(201).json({ mensaje: 'Usuario registrado exitosamente' });
  } catch (err) {
    console.error("❌ Error al registrar usuario:", err);
    if (err.message.includes("UNIQUE")) {
      res.status(400).json({ error: "Ya existe un usuario con ese correo" });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const pool = await poolPromise;

    const result = await pool.request()
      .input('correo', sql.VarChar, email)
      .query('SELECT * FROM Usuarios WHERE correo = @correo');

    const user = result.recordset[0];
    if (!user) return res.status(400).json({ error: 'Usuario no encontrado' });

    const match = await bcrypt.compare(password, user.contraseña);
    if (!match) return res.status(401).json({ error: 'Contraseña incorrecta' });

    const token = jwt.sign(
      { idUsuario: user.idUsuario, tipoUsuario: user.tipoUsuario },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      token,
      idUsuario: user.idUsuario,
      tipoUsuario: user.tipoUsuario,
      nombre: user.nombre
    });
  } catch (err) {
    console.error('❌ Error en login:', err);
    res.status(500).json({ error: err.message });
  }
};
