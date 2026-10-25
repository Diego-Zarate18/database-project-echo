// ============================================
// Echo Backend — Servicio de Autenticacion (Auth)
// ============================================
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const studentRepository = require('../../repositories/student.repository');
const { AppError } = require('../../middlewares/error.middleware');

const SALT_ROUNDS = 10;

/**
 * Servicio de autenticacion local.
 * - Registro: correo unico + contrasena hash bcrypt.
 * - Login: verificacion de credenciales + emision de JWT (30 min).
 */
const authService = {
  /**
   * Registra un nuevo estudiante.
   * @param {Object} params
   * @param {string} params.nombre — Nombre completo
   * @param {string} params.correo_electronico — Email (debe ser unico)
   * @param {string} params.contrasena — Contrasena en texto plano
   * @returns {Promise<Object>} Estudiante creado (sin hash)
   */
  async register({ nombre, correo_electronico, contrasena }) {
    // Verificar si el correo ya existe
    const existente = await studentRepository.findByEmail(correo_electronico);
    if (existente) {
      throw new AppError('El correo electronico ya esta registrado.', 409);
    }

    // Hash de la contrasena con bcrypt (10 salt rounds)
    const contrasena_hash = await bcrypt.hash(contrasena, SALT_ROUNDS);

    // Crear el estudiante
    const estudiante = await studentRepository.create({
      nombre,
      correo_electronico,
      contrasena_hash,
    });

    // Generar JWT
    const token = this._generateToken(estudiante);

    return {
      estudiante: {
        id: estudiante._id,
        nombre: estudiante.nombre,
        correo_electronico: estudiante.correo_electronico,
      },
      token,
    };
  },

  /**
   * Inicia sesion con correo y contrasena.
   * @param {Object} params
   * @param {string} params.correo_electronico — Email
   * @param {string} params.contrasena — Contrasena en texto plano
   * @returns {Promise<Object>} Datos del estudiante + token JWT
   */
  async login({ correo_electronico, contrasena }) {
    // Buscar estudiante por correo
    const estudiante = await studentRepository.findByEmail(correo_electronico);
    if (!estudiante) {
      throw new AppError('Credenciales invalidas.', 401);
    }

    // Verificar contrasena
    const contrasenaValida = await bcrypt.compare(contrasena, estudiante.contrasena_hash);
    if (!contrasenaValida) {
      throw new AppError('Credenciales invalidas.', 401);
    }

    // Generar JWT
    const token = this._generateToken(estudiante);

    return {
      estudiante: {
        id: estudiante._id,
        nombre: estudiante.nombre,
        correo_electronico: estudiante.correo_electronico,
      },
      token,
    };
  },

  /**
   * Genera un token JWT con el id y correo del estudiante.
   * @param {Object} estudiante — Documento del estudiante
   * @returns {string} Token JWT firmado
   */
  _generateToken(estudiante) {
    return jwt.sign(
      {
        id: estudiante._id.toString(),
        correo: estudiante.correo_electronico,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '30m' }
    );
  },
};

module.exports = authService;
