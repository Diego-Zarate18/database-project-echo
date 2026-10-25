// ============================================
// Echo Backend — Servicio de Cursos
// ============================================
const courseRepository = require('../../repositories/course.repository');
const { AppError } = require('../../middlewares/error.middleware');

const sanitizeCourse = (course) => {
  const plainCourse = course.toObject ? course.toObject() : course;

  return {
    ...plainCourse,
    modulos: plainCourse.modules.map((modulo) => ({
      ...modulo,
      lecciones: modulo.lessons.map((leccion) => ({
        ...leccion,
        preguntas: leccion.questions.map(({ correct_answer, ...pregunta }) => pregunta),
      })),
    })),
  };
};

const courseService = {
  async listCourses() {
    const cursos = await courseRepository.findAll();
    return cursos.map(sanitizeCourse);
  },

  async getCourse(cursoId) {
    const curso = await courseRepository.findById(cursoId);
    if (!curso) {
      throw new AppError('Curso no encontrado.', 404);
    }

    return sanitizeCourse(curso);
  },
};

module.exports = courseService;