const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

const sanitizeInput = (input) => input ? input.trim().replace(/[<>]/g, '') : '';

exports.register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    const { username, email, password } = req.body;
    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) return res.status(400).json({ success: false, message: 'Usuario o email ya existe' });

    const user = await User.create({
      username: sanitizeInput(username),
      email: sanitizeInput(email),
      password,
      role: 'evaluador'
    });

    const token = generateToken(user._id);
    res.status(201).json({ success: true, token, user: { id: user._id, username: user.username, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
};

exports.login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user || !user.isActive) return res.status(401).json({ success: false, message: 'Credenciales inválidas' });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Credenciales inválidas' });

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const token = generateToken(user._id);
    res.json({ success: true, token, user: { id: user._id, username: user.username, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
};

exports.getMe = async (req, res) => {
  const user = await User.findById(req.user.id);
  res.json({ success: true, user: { id: user._id, username: user.username, email: user.email, role: user.role } });
};
