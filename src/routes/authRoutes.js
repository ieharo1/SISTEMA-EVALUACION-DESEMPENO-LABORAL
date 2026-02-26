const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');

router.post('/register', [
  body('username').trim().isLength({ min: 3, max: 30 }).withMessage('Usuario entre 3-30 caracteres'),
  body('email').isEmail().normalizeEmail().withMessage('Email inválido'),
  body('password').isLength({ min: 6 }).withMessage('Contraseña min 6 caracteres')
], authController.register);

router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], authController.login);

router.get('/me', authController.getMe);

module.exports = router;
