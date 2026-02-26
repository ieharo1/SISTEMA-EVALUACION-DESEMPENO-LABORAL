const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { body } = require('express-validator');
const evaluationController = require('../controllers/evaluationController');

router.use(protect);

router.get('/', evaluationController.getAllEvaluations);
router.get('/metrics', evaluationController.getMetrics);
router.get('/employee/:employeeId', evaluationController.getEmployeeEvaluations);
router.get('/:id', evaluationController.getEvaluation);
router.post('/', [
  body('employee').notEmpty(),
  body('period').notEmpty()
], evaluationController.createEvaluation);
router.put('/:id', evaluationController.updateEvaluation);
router.post('/:id/complete', evaluationController.completeEvaluation);

module.exports = router;
