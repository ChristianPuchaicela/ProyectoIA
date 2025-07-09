// === routes/prediccionRoutes.js ===
const express = require('express');
const router = express.Router();
const { guardarPrediccion } = require('../controllers/prediccionController');
const { verifyToken } = require('../middleware/authMiddleware');

router.post('/', verifyToken, guardarPrediccion);
module.exports = router;
