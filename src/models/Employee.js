const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  department: { type: String, required: true },
  position: { type: String, required: true },
  hireDate: { type: Date, required: true },
  status: { type: String, enum: ['activo', 'inactivo', 'vacaciones', 'retirado'], default: 'activo' },
  salary: { type: Number },
  phone: { type: String },
  address: { type: String }
}, { timestamps: true });

employeeSchema.virtual('fullName').get(function() {
  return `${this.name} ${this.lastName}`;
});

module.exports = mongoose.model('Employee', employeeSchema);
