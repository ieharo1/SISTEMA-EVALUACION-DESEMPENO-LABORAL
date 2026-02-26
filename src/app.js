require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');

const app = express();

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'src/public')));

const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: { success: false, message: 'Demasiadas solicitudes, intente más tarde.' }
});
app.use('/api/', limiter);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/views'));

const connectDB = require('./src/config/database');
const errorHandler = require('./src/middlewares/errorHandler');

app.use('/', require('./src/routes/authRoutes'));
app.use('/dashboard', require('./src/routes/dashboardRoutes'));
app.use('/api/employees', require('./src/routes/employeeRoutes'));
app.use('/api/evaluations', require('./src/routes/evaluationRoutes'));

app.get('/', (req, res) => {
  res.render('index', { title: 'Evaluación de Desempeño - Inicio' });
});

app.use(errorHandler);

const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB conectado');
    app.listen(PORT, () => {
      console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ Error al conectar MongoDB:', err.message);
    process.exit(1);
  });

module.exports = app;
