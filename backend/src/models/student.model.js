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
    name: {
      type: String,
      required: [true, 'El nombre es obligatorio'],
      trim: true,
      minlength: [2, 'El nombre debe tener al menos 2 caracteres'],
      maxlength: [100, 'El nombre no puede exceder los 100 caracteres'],
    },
    email: {
      type: String,
      required: [true, 'El correo electrónico es obligatorio'],
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Formato de correo electrónico inválido'],
    },
    password_hash: {
      type: String,
      required: [true, 'La contraseña es obligatoria'],
    },
  },
  {
    timestamps: true,
    collection: 'students',
  }
);

// Índice único explícito en correo_electronico
studentSchema.index({ email: 1 }, { unique: true });

const Student = mongoose.model('Student', studentSchema);

module.exports = Student;
