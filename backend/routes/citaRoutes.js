// === routes/citaRoutes.js ===
const express = require('express');
const router = express.Router();
const { crearCita, obtenerPsicologos, obtenerCitasPsicologo, obtenerCitasPaciente } = require('../controllers/citaController');
const { verifyToken } = require('../middleware/authMiddleware');

router.post('/', verifyToken, crearCita);
router.get('/psicologos', obtenerPsicologos);
router.get('/psicologo/:idPsicologo', obtenerCitasPsicologo);
router.get('/paciente/:idPaciente', obtenerCitasPaciente);

module.exports = router;