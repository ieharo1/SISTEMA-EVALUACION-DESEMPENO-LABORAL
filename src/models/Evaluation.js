const mongoose = require('mongoose');

const evaluationSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  evaluator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  period: { type: String, required: true },
  competencies: [{
    name: { type: String, required: true },
    score: { type: Number, required: true, min: 1, max: 5 },
    comments: { type: String }
  }],
  generalScore: { type: Number, required: true, min: 1, max: 100 },
  performanceLevel: { type: String, enum: ['excellent', 'good', 'regular', 'poor'], required: true },
  strengths: [{ type: String }],
  areasForImprovement: [{ type: String }],
  goals: [{ type: String }],
  overallComments: { type: String },
  status: { type: String, enum: ['draft', 'completed', 'archived'], default: 'draft' }
}, { timestamps: true });

evaluationSchema.pre('save', function(next) {
  let totalScore = 0;
  this.competencies.forEach(c => { totalScore += c.score; });
  const avgScore = this.competencies.length > 0 ? (totalScore / this.competencies.length) * 20 : 0;
  this.generalScore = Math.round(avgScore);
  
  if (this.generalScore >= 80) this.performanceLevel = 'excellent';
  else if (this.generalScore >= 60) this.performanceLevel = 'good';
  else if (this.generalScore >= 40) this.performanceLevel = 'regular';
  else this.performanceLevel = 'poor';
  
  next();
});

module.exports = mongoose.model('Evaluation', evaluationSchema);
