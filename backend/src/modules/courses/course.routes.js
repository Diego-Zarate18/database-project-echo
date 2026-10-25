// ============================================
// Echo Backend — Rutas de Cursos
// ============================================
const { Router } = require('express');
const { z } = require('zod');
const { listCourses, getCourse } = require('./course.controller');
const { validate } = require('../../middlewares/validator.middleware');

const router = Router();

const courseIdSchema = z.object({
  cursoId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'cursoId debe ser un ObjectId válido'),
});

router.get('/', listCourses);
router.get('/:cursoId', validate(courseIdSchema, 'params'), getCourse);

module.exports = router;