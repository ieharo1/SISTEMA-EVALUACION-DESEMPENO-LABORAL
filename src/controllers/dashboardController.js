const Employee = require('../models/Employee');
const Evaluation = require('../models/Evaluation');
const AuditLog = require('../models/AuditLog');

exports.renderDashboard = async (req, res) => {
  try {
    const totalEmployees = await Employee.countDocuments({ status: 'activo' });
    const totalEvaluations = await Evaluation.countDocuments({ status: 'completed' });
    const pendingEvaluations = await Evaluation.countDocuments({ status: 'draft' });

    const byLevel = await Evaluation.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: '$performanceLevel', count: { $sum: 1 } } }
    ]);

    const departments = await Employee.aggregate([
      { $match: { status: 'activo' } },
      { $group: { _id: '$department', count: { $sum: 1 } } }
    ]);

    const recentEvals = await Evaluation.find({ status: 'completed' })
      .populate('employee', 'name lastName department')
      .sort({ createdAt: -1 })
      .limit(10);

    res.render('dashboard/index', {
      title: 'Dashboard - Evaluación de Desempeño',
      user: req.user,
      stats: { totalEmployees, totalEvaluations, pendingEvaluations, byLevel, departments },
      recentEvals
    });
  } catch (error) {
    res.status(500).render('error', { title: 'Error', error: { message: 'Error al cargar el dashboard' } });
  }
};

exports.renderEmployees = async (req, res) => {
  try {
    const employees = await Employee.find().sort({ createdAt: -1 });
    const departments = await Employee.distinct('department');
    res.render('dashboard/employees', { title: 'Empleados', user: req.user, employees, departments });
  } catch (error) {
    res.status(500).render('error', { title: 'Error', error: { message: 'Error al cargar' } });
  }
};

exports.renderEvaluations = async (req, res) => {
  try {
    const employees = await Employee.find({ status: 'activo' });
    const evaluations = await Evaluation.find().populate('employee', 'name lastName').sort({ createdAt: -1 });
    res.render('dashboard/evaluations', { title: 'Evaluaciones', user: req.user, employees, evaluations });
  } catch (error) {
    res.status(500).render('error', { title: 'Error', error: { message: 'Error al cargar' } });
  }
};

exports.renderNewEvaluation = async (req, res) => {
  try {
    const employees = await Employee.find({ status: 'activo' });
    res.render('dashboard/new-evaluation', { title: 'Nueva Evaluación', user: req.user, employees });
  } catch (error) {
    res.status(500).render('error', { title: 'Error', error: { message: 'Error al cargar' } });
  }
};

exports.renderMetrics = async (req, res) => {
  try {
    const totalEvaluations = await Evaluation.countDocuments({ status: 'completed' });
    const byLevel = await Evaluation.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: '$performanceLevel', count: { $sum: 1 } } }
    ]);
    const avgScore = await Evaluation.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, avgScore: { $avg: '$generalScore' } } }
    ]);
    const deptStats = await Evaluation.aggregate([
      { $match: { status: 'completed' } },
      { $lookup: { from: 'employees', localField: 'employee', foreignField: '_id', as: 'employeeData' } },
      { $unwind: '$employeeData' },
      { $group: { _id: '$employeeData.department', avgScore: { $avg: '$generalScore' }, count: { $sum: 1 } } }
    ]);

    res.render('dashboard/metrics', {
      title: 'Métricas',
      user: req.user,
      stats: { totalEvaluations, byLevel, avgScore: avgScore[0]?.avgScore || 0, deptStats }
    });
  } catch (error) {
    res.status(500).render('error', { title: 'Error', error: { message: 'Error al cargar métricas' } });
  }
};

exports.renderAuditLog = async (req, res) => {
  try {
    if (!['admin', 'hr'].includes(req.user.role)) {
      return res.status(403).render('error', { title: 'Acceso Denegado', error: { message: 'No tienes acceso a esta sección' } });
    }
    const logs = await AuditLog.find().populate('user', 'username').sort({ createdAt: -1 }).limit(50);
    res.render('dashboard/audit', { title: 'Bitácora', user: req.user, logs });
  } catch (error) {
    res.status(500).render('error', { title: 'Error', error: { message: 'Error al cargar' } });
  }
};
