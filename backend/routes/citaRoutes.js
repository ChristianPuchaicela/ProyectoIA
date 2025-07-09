// === routes/citaRoutes.js ===
const express = require('express');
const router = express.Router();
const { crearCita } = require('../controllers/citaController');
const { verifyToken } = require('../middleware/authMiddleware');

router.post('/', verifyToken, crearCita);
module.exports = router;