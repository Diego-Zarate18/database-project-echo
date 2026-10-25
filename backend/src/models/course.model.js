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
    preguntaId: {
      type: String,
      required: true,
    },
    enunciado: {
      type: String,
      required: true,
    },
    opciones: {
      type: [String],
      required: true,
    },
    respuesta_correcta: {
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
    numero_leccion: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
    },
    titulo: {
      type: String,
      required: true,
    },
    tipo: {
      type: String,
      enum: ['lectura', 'evaluacion'],
      required: true,
    },
    contenido: {
      type: String,
      default: '',
    },
    preguntas: {
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
    numero_modulo: {
      type: Number,
      required: true,
    },
    titulo: {
      type: String,
      required: true,
    },
    descripcion: {
      type: String,
      default: '',
    },
    lecciones: {
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
    titulo: {
      type: String,
      required: [true, 'El título del curso es obligatorio'],
      trim: true,
    },
    descripcion: {
      type: String,
      default: '',
    },
    modulos: {
      type: [moduleSchema],
      required: true,
    },
  },
  {
    timestamps: true,
    collection: 'cursos',
  }
);

const Course = mongoose.model('Course', courseSchema);

module.exports = Course;
