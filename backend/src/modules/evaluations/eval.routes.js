// ============================================
// Echo Backend — Rutas de Evaluaciones (CU-03)
// ============================================
const { Router } = require('express');
const { z } = require('zod');
const { submitEvaluation } = require('./eval.controller');
const { authMiddleware } = require('../../middlewares/auth.middleware');
const { validate } = require('../../middlewares/validator.middleware');

const router = Router();

/**
 * Esquema Zod para validar el body de POST /api/evaluaciones/responder
 *
 * - cursoId: ID válido de MongoDB (24 caracteres hex).
 * - numeroModulo: Entero positivo >= 1.
 * - respuestas: Arreglo no vacío de objetos {preguntaId, respuesta}.
 */
const submitEvalSchema = z.object({
  cursoId: z
    .string({ required_error: 'El cursoId es obligatorio' })
    .regex(/^[0-9a-fA-F]{24}$/, 'cursoId debe ser un ObjectId válido'),
  numeroModulo: z
    .number({ required_error: 'El número de módulo es obligatorio' })
    .int('El número de módulo debe ser entero')
    .positive('El número de módulo debe ser positivo'),
  respuestas: z
    .array(
      z.object({
        preguntaId: z.string({ required_error: 'preguntaId es obligatorio' }).min(1),
        respuesta: z.string({ required_error: 'respuesta es obligatoria' }).min(1),
      })
    )
    .min(1, 'Debe enviar al menos una respuesta'),
});

/**
 * POST /api/evaluaciones/responder
 *
 * Pipeline de middlewares:
 * 1. authMiddleware — Verifica JWT válido
 * 2. validate(schema) — Sanitiza y valida el body
 * 3. submitEvaluation — Ejecuta la lógica de negocio
 */
router.post(
  '/responder',
  authMiddleware,
  validate(submitEvalSchema),
  submitEvaluation
);

module.exports = router;
