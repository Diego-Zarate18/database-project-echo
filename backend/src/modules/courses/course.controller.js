// ============================================
// Echo Backend — Controlador de Cursos
// ============================================
const courseService = require('./course.service');

const listCourses = async (req, res, next) => {
  try {
    const cursos = await courseService.listCourses();
    return res.status(200).json({ ok: true, data: cursos });
  } catch (error) {
    next(error);
  }
};

const getCourse = async (req, res, next) => {
  try {
    const curso = await courseService.getCourse(req.params.cursoId);
    return res.status(200).json({ ok: true, data: curso });
  } catch (error) {
    next(error);
  }
};

module.exports = { listCourses, getCourse };