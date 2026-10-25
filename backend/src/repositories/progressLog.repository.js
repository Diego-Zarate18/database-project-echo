// ============================================
// Echo Backend — Repositorio: Registro de Avance
// ============================================
const ProgressLog = require('../models/progressLog.model');

/**
 * Patrón Repository para la colección "registro_avance".
 * Abstrae las operaciones de Mongoose del dominio de la aplicación.
 */
const progressLogRepository = {
  /**
   * Busca o crea el registro de avance para un estudiante/curso/módulo.
   * Si ya existe, lo actualiza con los datos de aprobación.
   * Si no existe, lo crea con los datos proporcionados.
   *
   * Utiliza upsert para atomicidad.
   *
   * @param {string} estudianteId — ID del estudiante
   * @param {string} cursoId — ID del curso
   * @param {number} numeroModulo — Número del módulo
   * @param {Object} updateData — Datos de actualización (aprobado, nota_aprobacion, fecha_aprobacion)
   * @returns {Promise<Object>} Documento actualizado o creado
   */
  async upsert(estudianteId, cursoId, numeroModulo, updateData) {
    return ProgressLog.findOneAndUpdate(
      {
        student_id: estudianteId,
        course_id: cursoId,
        module_number: numeroModulo,
      },
      { $set: updateData },
      { upsert: true, new: true }
    );
  },

  /**
   * Busca el registro de avance de un estudiante para un módulo específico.
   *
   * @param {string} estudianteId — ID del estudiante
   * @param {string} cursoId — ID del curso
   * @param {number} numeroModulo — Número del módulo
   * @returns {Promise<Object|null>}
   */
  async findByStudentAndModule(estudianteId, cursoId, numeroModulo) {
    return ProgressLog.findOne({
      student_id: estudianteId,
      course_id: cursoId,
      module_number: numeroModulo,
    });
  },

  /**
   * Obtiene todos los registros de avance de un estudiante en un curso.
   *
   * @param {string} estudianteId — ID del estudiante
   * @param {string} cursoId — ID del curso
   * @returns {Promise<Array>}
   */
  async findByStudentAndCourse(estudianteId, cursoId) {
    return ProgressLog.find({
      student_id: estudianteId,
      course_id: cursoId,
    });
  },
};

module.exports = progressLogRepository;
