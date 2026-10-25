// ============================================
// Echo Backend — Modelo: Registro de Avance (progressLog.model.js)
// ============================================
const mongoose = require('mongoose');

/**
 * Schema Mongoose para la colección "registro_avance".
 *
 * Rastrea el estado de aprobación de cada módulo por estudiante.
 * Se marca como aprobado cuando el estudiante obtiene nota >= 70% en la lección 10.
 */
const progressLogSchema = new mongoose.Schema(
  {
    student_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    course_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    module_number: {
      type: Number,
      required: true,
    },
    passed: {
      type: Boolean,
      default: false,
    },
    passing_score: {
      type: Number,
      default: null,
    },
    passed_at: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: 'progress_logs',
  }
);

// Índice único compuesto: un registro por estudiante + curso + módulo
progressLogSchema.index(
  { student_id: 1, course_id: 1, module_number: 1 },
  { unique: true }
);

const ProgressLog = mongoose.model('ProgressLog', progressLogSchema);

module.exports = ProgressLog;
