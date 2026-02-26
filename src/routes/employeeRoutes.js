const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { body } = require('express-validator');
const employeeController = require('../controllers/employeeController');

router.use(protect);

router.get('/', employeeController.getAllEmployees);
router.get('/departments', employeeController.getDepartments);
router.get('/:id', employeeController.getEmployee);
router.post('/', [
  body('name').trim().notEmpty(),
  body('lastName').trim().notEmpty(),
  body('email').isEmail(),
  body('department').notEmpty(),
  body('position').notEmpty(),
  body('hireDate').isISO8601()
], employeeController.createEmployee);
router.put('/:id', employeeController.updateEmployee);
router.delete('/:id', employeeController.deleteEmployee);

module.exports = router;
