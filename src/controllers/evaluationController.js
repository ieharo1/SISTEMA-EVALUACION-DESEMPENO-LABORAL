const Evaluation = require('../models/Evaluation');
const Employee = require('../models/Employee');
const AuditLog = require('../models/AuditLog');
const { validationResult } = require('express-validator');

const createAuditLog = async (userId, action, entity, entityId, changes, ipAddress) => {
  await AuditLog.create({ user: userId, action, entity, entityId, changes, ipAddress });
};

exports.getAllEvaluations = async (req, res) => {
  try {
    const { period, performanceLevel, employee, page = 1, limit = 20 } = req.query;
    const query = {};
    if (period) query.period = period;
    if (performanceLevel) query.performanceLevel = performanceLevel;
    if (employee) query.employee = employee;

    const evaluations = await Evaluation.find(query)
      .populate('employee', 'name lastName department position')
      .populate('evaluator', 'username')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Evaluation.countDocuments(query);

    res.json({ success: true, data: evaluations, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
};

exports.getEvaluation = async (req, res) => {
  try {
    const evaluation = await Evaluation.findById(req.params.id)
      .populate('employee')
      .populate('evaluator', 'username email');
    
    if (!evaluation) return res.status(404).json({ success: false, message: 'Evaluación no encontrada' });
    res.json({ success: true, data: evaluation });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
};

exports.createEvaluation = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    const employee = await Employee.findById(req.body.employee);
    if (!employee) return res.status(404).json({ success: false, message: 'Empleado no encontrado' });

    const evaluation = await Evaluation.create({
      employee: req.body.employee,
      evaluator: req.user.id,
      period: req.body.period,
      competencies: req.body.competencies || [],
      generalScore: 0,
      performanceLevel: 'regular',
      strengths: req.body.strengths || [],
      areasForImprovement: req.body.areasForImprovement || [],
      goals: req.body.goals || [],
      overallComments: req.body.overallComments,
      status: 'draft'
    });

    await createAuditLog(req.user.id, 'create', 'Evaluation', evaluation._id, req.body, req.ip);

    res.status(201).json({ success: true, data: evaluation });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al crear evaluación' });
  }
};

exports.updateEvaluation = async (req, res) => {
  try {
    const evaluation = await Evaluation.findById(req.params.id);
    if (!evaluation) return res.status(404).json({ success: false, message: 'Evaluación no encontrada' });

    const oldData = evaluation.toObject();
    Object.assign(evaluation, req.body);
    await evaluation.save();

    await createAuditLog(req.user.id, 'update', 'Evaluation', evaluation._id, { old: oldData, new: evaluation.toObject() }, req.ip);

    res.json({ success: true, data: evaluation });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al actualizar evaluación' });
  }
};

exports.completeEvaluation = async (req, res) => {
  try {
    const evaluation = await Evaluation.findById(req.params.id);
    if (!evaluation) return res.status(404).json({ success: false, message: 'Evaluación no encontrada' });

    evaluation.status = 'completed';
    await evaluation.save();

    await createAuditLog(req.user.id, 'complete', 'Evaluation', evaluation._id, { status: 'completed' }, req.ip);

    res.json({ success: true, data: evaluation });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al completar evaluación' });
  }
};

exports.getEmployeeEvaluations = async (req, res) => {
  try {
    const evaluations = await Evaluation.find({ employee: req.params.employeeId })
      .populate('evaluator', 'username')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: evaluations });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
};

exports.getMetrics = async (req, res) => {
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
    const recentEvals = await Evaluation.find({ status: 'completed' })
      .populate('employee', 'name lastName')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      success: true,
      data: {
        totalEvaluations,
        byLevel,
        avgScore: avgScore[0]?.avgScore || 0,
        recentEvals
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
};
