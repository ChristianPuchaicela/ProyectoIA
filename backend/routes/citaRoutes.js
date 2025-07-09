// === routes/citaRoutes.js ===
const express = require('express');
const router = express.Router();
const { crearCita, obtenerPsicologos, obtenerCitasPsicologo, obtenerCitasPaciente, obtenerPacientesDePsicologo, cambiarEstadoCita } = require('../controllers/citaController');
const { verifyToken } = require('../middleware/authMiddleware');

router.post('/', verifyToken, crearCita);
router.get('/psicologos', obtenerPsicologos);
router.get('/psicologo/:idPsicologo', obtenerCitasPsicologo);
router.get('/paciente/:idPaciente', obtenerCitasPaciente);
router.get('/pacientes/psicologo', verifyToken, obtenerPacientesDePsicologo);
router.patch('/estado/:idCita', verifyToken, cambiarEstadoCita);

module.exports = router;