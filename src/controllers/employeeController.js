const Employee = require('../models/Employee');
const AuditLog = require('../models/AuditLog');
const { validationResult } = require('express-validator');

const sanitizeInput = (input) => input ? input.trim().replace(/[<>]/g, '') : '';

const createAuditLog = async (userId, action, entity, entityId, changes, ipAddress) => {
  await AuditLog.create({ user: userId, action, entity, entityId, changes, ipAddress });
};

exports.getAllEmployees = async (req, res) => {
  try {
    const { status, department, search, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;
    if (department) query.department = department;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const employees = await Employee.find(query).skip((page - 1) * limit).limit(parseInt(limit)).sort({ createdAt: -1 });
    const total = await Employee.countDocuments(query);

    res.json({ success: true, data: employees, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
};

exports.getEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ success: false, message: 'Empleado no encontrado' });
    res.json({ success: true, data: employee });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
};

exports.createEmployee = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    const employee = await Employee.create({
      name: sanitizeInput(req.body.name),
      lastName: sanitizeInput(req.body.lastName),
      email: sanitizeInput(req.body.email),
      department: req.body.department,
      position: req.body.position,
      hireDate: req.body.hireDate,
      status: 'activo',
      salary: req.body.salary,
      phone: req.body.phone,
      address: req.body.address
    });

    await createAuditLog(req.user.id, 'create', 'Employee', employee._id, req.body, req.ip);

    res.status(201).json({ success: true, data: employee });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al crear empleado' });
  }
};

exports.updateEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ success: false, message: 'Empleado no encontrado' });

    const oldData = employee.toObject();
    const updates = { ...req.body };
    Object.keys(updates).forEach(key => { employee[key] = sanitizeInput(updates[key]) || updates[key]; });
    await employee.save();

    await createAuditLog(req.user.id, 'update', 'Employee', employee._id, { old: oldData, new: employee.toObject() }, req.ip);

    res.json({ success: true, data: employee });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al actualizar empleado' });
  }
};

exports.deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ success: false, message: 'Empleado no encontrado' });

    await employee.deleteOne();
    await createAuditLog(req.user.id, 'delete', 'Employee', req.params.id, employee.toObject(), req.ip);

    res.json({ success: true, message: 'Empleado eliminado' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al eliminar empleado' });
  }
};

exports.getDepartments = async (req, res) => {
  try {
    const departments = await Employee.distinct('department');
    res.json({ success: true, data: departments });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
};
