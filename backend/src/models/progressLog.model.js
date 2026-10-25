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
    estudiante_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    curso_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    numero_modulo: {
      type: Number,
      required: true,
    },
    aprobado: {
      type: Boolean,
      default: false,
    },
    nota_aprobacion: {
      type: Number,
      default: null,
    },
    fecha_aprobacion: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: 'registro_avance',
  }
);

// Índice único compuesto: un registro por estudiante + curso + módulo
progressLogSchema.index(
  { estudiante_id: 1, curso_id: 1, numero_modulo: 1 },
  { unique: true }
);

const ProgressLog = mongoose.model('ProgressLog', progressLogSchema);

module.exports = ProgressLog;
