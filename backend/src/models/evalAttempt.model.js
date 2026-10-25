// ============================================
// Echo Backend — Modelo: Intento de Evaluación (evalAttempt.model.js)
// ============================================
const mongoose = require('mongoose');

/**
 * Sub-schema para cada respuesta individual del estudiante en un intento.
 */
const answerSchema = new mongoose.Schema(
  {
    preguntaId: {
      type: String,
      required: true,
    },
    respuesta_estudiante: {
      type: String,
      required: true,
    },
    es_correcta: {
      type: Boolean,
      required: true,
    },
  },
  { _id: false }
);

/**
 * Schema Mongoose para la colección "intentos_evaluacion".
 *
 * Registra cada intento del estudiante en la evaluación final (lección 10).
 * Permite reintentos ilimitados e inmediatos (sin temporizadores de bloqueo).
 *
 * - nota: Calificación obtenida sobre 100.
 * - aprobado: true si nota >= 70.
 * - numero_intento: Consecutivo del intento para este estudiante/módulo.
 */
const evalAttemptSchema = new mongoose.Schema(
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
    respuestas: {
      type: [answerSchema],
      required: true,
    },
    nota: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    aprobado: {
      type: Boolean,
      required: true,
    },
    numero_intento: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  {
    timestamps: true,
    collection: 'intentos_evaluacion',
  }
);

// Índice compuesto para consultas por estudiante y módulo
evalAttemptSchema.index({ estudiante_id: 1, curso_id: 1, numero_modulo: 1 });

const EvalAttempt = mongoose.model('EvalAttempt', evalAttemptSchema);

module.exports = EvalAttempt;
