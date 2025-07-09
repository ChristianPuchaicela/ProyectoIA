// === routes/diarioRoutes.js ===
const express = require('express');
const router = express.Router();
const { registrarEntrada } = require('../controllers/diarioController');
const { verifyToken } = require('../middleware/authMiddleware');

router.post('/', verifyToken, registrarEntrada);
module.exports = router;