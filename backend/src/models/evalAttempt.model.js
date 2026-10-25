// ============================================
// Echo Backend — Modelo: Intento de Evaluación (evalAttempt.model.js)
// ============================================
const mongoose = require('mongoose');

/**
 * Sub-schema para cada respuesta individual del estudiante en un intento.
 */
const answerSchema = new mongoose.Schema(
  {
    question_id: {
      type: String,
      required: true,
    },
    student_answer: {
      type: String,
      required: true,
    },
    is_correct: {
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
    answers: {
      type: [answerSchema],
      required: true,
    },
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    passed: {
      type: Boolean,
      required: true,
    },
    attempt_number: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  {
    timestamps: true,
    collection: 'evaluation_attempts',
  }
);

// Índice compuesto para consultas por estudiante y módulo
evalAttemptSchema.index({ student_id: 1, course_id: 1, module_number: 1 });

const EvalAttempt = mongoose.model('EvalAttempt', evalAttemptSchema);

module.exports = EvalAttempt;
