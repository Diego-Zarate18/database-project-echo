// ============================================
// Echo Backend — Repositorio: Cursos
// ============================================
const Course = require('../models/course.model');

/**
 * Patrón Repository para la colección "cursos".
 */
const courseRepository = {
  /**
   * Busca un curso por su ID.
   * @param {string} cursoId — ID del curso
   * @returns {Promise<Object|null>}
   */
  async findById(cursoId) {
    return Course.findById(cursoId);
  },
};

module.exports = courseRepository;
