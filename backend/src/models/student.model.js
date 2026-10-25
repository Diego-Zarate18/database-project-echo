// ============================================
// Echo Backend — Modelo: Estudiante (student.model.js)
// ============================================
const mongoose = require('mongoose');

/**
 * Schema Mongoose para la colección "estudiantes".
 *
 * Campos principales:
 * - nombre: Nombre completo del estudiante.
 * - correo_electronico: Email único (índice único para evitar duplicados).
 * - contrasena_hash: Hash bcrypt de la contraseña (nunca se almacena en texto plano).
 */
const studentSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre es obligatorio'],
      trim: true,
      minlength: [2, 'El nombre debe tener al menos 2 caracteres'],
      maxlength: [100, 'El nombre no puede exceder los 100 caracteres'],
    },
    correo_electronico: {
      type: String,
      required: [true, 'El correo electrónico es obligatorio'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Formato de correo electrónico inválido'],
    },
    contrasena_hash: {
      type: String,
      required: [true, 'La contraseña es obligatoria'],
    },
  },
  {
    timestamps: true,
    collection: 'estudiantes',
  }
);

// Índice único explícito en correo_electronico
studentSchema.index({ correo_electronico: 1 }, { unique: true });

const Student = mongoose.model('Student', studentSchema);

module.exports = Student;
