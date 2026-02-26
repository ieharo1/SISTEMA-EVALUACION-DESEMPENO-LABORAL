const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const dashboardController = require('../controllers/dashboardController');

router.use(protect);

router.get('/', dashboardController.renderDashboard);
router.get('/dashboard', dashboardController.renderDashboard);
router.get('/empleados', dashboardController.renderEmployees);
router.get('/evaluaciones', dashboardController.renderEvaluations);
router.get('/evaluacion/nueva', dashboardController.renderNewEvaluation);
router.get('/metricas', dashboardController.renderMetrics);
router.get('/bitacora', dashboardController.renderAuditLog);

module.exports = router;
