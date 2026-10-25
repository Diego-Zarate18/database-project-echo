// ============================================
// Echo Backend — Controlador de Evaluaciones (CU-03)
// ============================================
const EvalService = require('./eval.service');
const evalAttemptRepository = require('../../repositories/evalAttempt.repository');
const progressLogRepository = require('../../repositories/progressLog.repository');
const courseRepository = require('../../repositories/course.repository');

// Instancia del servicio con repositorios reales inyectados
const evalService = new EvalService({
  evalAttemptRepository,
  progressLogRepository,
  courseRepository,
});

/**
 * Controlador para el endpoint POST /api/v1/evaluaciones/responder
 *
 * Recibe las respuestas del estudiante autenticado, las envía al servicio
 * de evaluación para calificación y retorna el resultado.
 *
 * req.user proviene del authMiddleware (contiene el id del estudiante).
 * req.body proviene del validatorMiddleware (datos sanitizados por Zod).
 */
const submitEvaluation = async (req, res, next) => {
  try {
    const { cursoId, numeroModulo, respuestas } = req.body;
    const estudianteId = req.user.id;

    const resultado = await evalService.submitEvaluation({
      estudianteId,
      cursoId,
      numeroModulo,
      respuestas,
    });

    const statusCode = resultado.aprobado ? 200 : 200;

    return res.status(statusCode).json({
      ok: true,
      mensaje: resultado.aprobado
        ? `¡Felicidades! Aprobaste el módulo ${numeroModulo} con una nota de ${resultado.nota}/100.`
        : `No aprobaste. Obtuviste ${resultado.nota}/100. Necesitas al menos 70/100. Puedes reintentar inmediatamente.`,
      data: resultado,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { submitEvaluation };
