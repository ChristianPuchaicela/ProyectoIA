const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors');
require('dotenv').config();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Conexión a base de datos
const db = require('./config/db');

// Rutas
const authRoutes = require('./routes/authRoutes');
const citaRoutes = require('./routes/citaRoutes');
const diarioRoutes = require('./routes/diarioRoutes');
const prediccionRoutes = require('./routes/prediccionRoutes');

// Usar rutas
app.use('/api/auth', authRoutes);
app.use('/api/citas', citaRoutes);
app.use('/api/diarios', diarioRoutes);
app.use('/api/predicciones', prediccionRoutes);

// Servir frontend desde carpeta ../frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// Página raíz: index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Puerto del servidor
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});
