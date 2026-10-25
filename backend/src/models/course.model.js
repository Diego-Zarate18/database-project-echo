// ============================================
// Echo Backend — Modelo: Curso (course.model.js)
// ============================================
const mongoose = require('mongoose');

/**
 * Sub-schema para una pregunta del examen final (lección 10).
 * Cada pregunta tiene un identificador, enunciado, opciones y respuesta correcta.
 */
const questionSchema = new mongoose.Schema(
  {
    question_id: {
      type: String,
      required: true,
    },
    prompt: {
      type: String,
      required: true,
    },
    options: {
      type: [String],
      required: true,
    },
    correct_answer: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

/**
 * Sub-schema para una lección dentro de un módulo.
 * - Lecciones 1 a 9: contenido de lectura (tipo: "lectura").
 * - Lección 10: evaluación final (tipo: "evaluacion") con preguntas.
 */
const lessonSchema = new mongoose.Schema(
  {
    lesson_number: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
    },
    title: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['reading', 'evaluation'],
      required: true,
    },
    content: {
      type: String,
      default: '',
    },
    questions: {
      type: [questionSchema],
      default: [],
    },
  },
  { _id: false }
);

/**
 * Sub-schema para un módulo dentro de un curso.
 * Cada módulo contiene exactamente 10 lecciones.
 */
const moduleSchema = new mongoose.Schema(
  {
    module_number: {
      type: Number,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    lessons: {
      type: [lessonSchema],
      validate: {
        validator: function (v) {
          return v.length === 10;
        },
        message: 'Cada módulo debe contener exactamente 10 lecciones.',
      },
    },
  },
  { _id: false }
);

/**
 * Schema Mongoose para la colección "cursos".
 * Un curso contiene uno o más módulos, cada uno con 10 lecciones.
 */
const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'El título del curso es obligatorio'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    modules: {
      type: [moduleSchema],
      required: true,
    },
  },
  {
    timestamps: true,
    collection: 'courses',
  }
);

const Course = mongoose.model('Course', courseSchema);

module.exports = Course;
