# 📊 Sistema de Evaluación de Desempeño Laboral

![Node.js](https://img.shields.io/badge/Node.js-18.x-green)
![Express](https://img.shields.io/badge/Express-4.x-blue)
![MongoDB](https://img.shields.io/badge/MongoDB-6.x-green)
![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3-purple)

Sistema profesional para gestionar evaluaciones de desempeño laboral con métricas, competencias y bitácora.

## 📋 Descripción

Plataforma completa para la evaluación de desempeño de empleados que incluye:

- ✅ CRUD completo de empleados
- ✅ Evaluaciones por competencias con puntuación ponderada
- ✅ Sistema de niveles (Excellent, Good, Regular, Poor)
- ✅ Dashboard con métricas y gráficos
- ✅ Historial de evaluaciones por empleado
- ✅ Bitácora de cambios
- ✅ Control de roles (Admin, HR, Evaluador)
- ✅ Seguridad JWT

## 🛠 Stack Tecnológico

- **Backend**: Node.js + Express.js
- **Base de Datos**: MongoDB con Mongoose
- **Frontend**: Bootstrap 5 + EJS
- **Autenticación**: JWT + bcrypt
- **Seguridad**: Helmet, CORS, Rate Limiting

## 📦 Requisitos

- Node.js 18.x o superior
- MongoDB 6.x o superior

## 🚀 Cómo Instalar

```bash
git clone https://github.com/ieharo1/Pagina-Podo.git
cd Pagina-Podo
npm install
```

## ⚙️ Variables de Entorno

```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/evaluaciondesempeno
JWT_SECRET=tu_jwt_secret_key
JWT_EXPIRE=7d
```

## ▶️ Cómo Ejecutar

```bash
npm start
```

Servidor en: `http://localhost:3000`

## 📁 Estructura

```
src/
├── config/database.js
├── controllers/
│   ├── authController.js
│   ├── employeeController.js
│   ├── evaluationController.js
│   └── dashboardController.js
├── models/
│   ├── User.js
│   ├── Employee.js
│   ├── Evaluation.js
│   └── AuditLog.js
├── routes/
├── middlewares/
├── services/
├── views/
└── app.js
```

---

## 👨‍💻 Desarrollado por Isaac Esteban Haro Torres

**Ingeniero en Sistemas · Full Stack · Automatización · Data**

- 📧 Email: zackharo1@gmail.com
- 📱 WhatsApp: 098805517
- 💻 GitHub: https://github.com/ieharo1
- 🌐 Portafolio: https://ieharo1.github.io/portafolio-isaac.haro/

---

© 2026 Isaac Esteban Haro Torres - Todos los derechos reservados.
