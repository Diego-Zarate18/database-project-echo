// ============================================
// Echo Backend — Repositorio: Intentos de Evaluación
// ============================================
const EvalAttempt = require('../models/evalAttempt.model');

/**
 * Patrón Repository para la colección "intentos_evaluacion".
 * Abstrae las operaciones de Mongoose del dominio de la aplicación.
 */
const evalAttemptRepository = {
  /**
   * Crea un nuevo registro de intento de evaluación.
   * @param {Object} attemptData — Datos del intento
   * @returns {Promise<Object>} Documento creado
   */
  async create(attemptData) {
    const attempt = new EvalAttempt(attemptData);
    return attempt.save();
  },

  /**
   * Cuenta el número de intentos previos para un estudiante en un módulo.
   * Se usa para calcular el numero_intento consecutivo.
   *
   * @param {string} estudianteId — ID del estudiante
   * @param {string} cursoId — ID del curso
   * @param {number} numeroModulo — Número del módulo
   * @returns {Promise<number>}
   */
  async countAttempts(estudianteId, cursoId, numeroModulo) {
    return EvalAttempt.countDocuments({
      estudiante_id: estudianteId,
      curso_id: cursoId,
      numero_modulo: numeroModulo,
    });
  },

  /**
   * Obtiene todos los intentos de un estudiante en un módulo específico,
   * ordenados por fecha de creación descendente.
   *
   * @param {string} estudianteId — ID del estudiante
   * @param {string} cursoId — ID del curso
   * @param {number} numeroModulo — Número del módulo
   * @returns {Promise<Array>}
   */
  async findByStudentAndModule(estudianteId, cursoId, numeroModulo) {
    return EvalAttempt.find({
      estudiante_id: estudianteId,
      curso_id: cursoId,
      numero_modulo: numeroModulo,
    }).sort({ createdAt: -1 });
  },
};

module.exports = evalAttemptRepository;
