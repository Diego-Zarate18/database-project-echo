// ============================================
// Echo Backend — Repositorio: Estudiantes
// ============================================
const Student = require('../models/student.model');

/**
 * Patron Repository para la coleccion "estudiantes".
 */
const studentRepository = {
  /**
   * Crea un nuevo estudiante.
   * @param {Object} studentData — Datos del estudiante
   * @returns {Promise<Object>} Documento creado
   */
  async create(studentData) {
    const student = new Student(studentData);
    return student.save();
  },

  /**
   * Busca un estudiante por correo electronico.
   * @param {string} correo — Correo del estudiante
   * @returns {Promise<Object|null>}
   */
  async findByEmail(correo) {
    return Student.findOne({ correo_electronico: correo });
  },

  /**
   * Busca un estudiante por su ID.
   * @param {string} id — ID del estudiante
   * @returns {Promise<Object|null>}
   */
  async findById(id) {
    return Student.findById(id);
  },
};

module.exports = studentRepository;
