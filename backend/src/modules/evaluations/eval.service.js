// ============================================
// Echo Backend — Servicio de Evaluaciones (CU-03)
// ============================================
const { AppError } = require('../../middlewares/error.middleware');

/**
 * Servicio de Evaluaciones — Caso de Uso CU-03
 * "Enviar y calificar evaluación final de un módulo (Lección #10)"
 *
 * Responsabilidades:
 * 1. Obtener la clave oficial del examen (lección 10) desde el curso.
 * 2. Deduplicar respuestas por preguntaId (última respuesta gana).
 * 3. Comparar respuestas contra la clave oficial.
 * 4. Calcular la nota sobre 100.
 * 5. Aprobar si nota >= 70.
 * 6. Guardar intento en el repositorio.
 * 7. Actualizar progreso si aprobó.
 *
 * Inyección de dependencias: recibe repositorios por constructor
 * para facilitar pruebas unitarias y respetar inversión de dependencias.
 */
class EvalService {
  /**
   * @param {Object} deps — Dependencias inyectadas
   * @param {Object} deps.evalAttemptRepository — Repositorio de intentos
   * @param {Object} deps.progressLogRepository — Repositorio de avance
   * @param {Object} deps.courseRepository — Repositorio de cursos
   */
  constructor({ evalAttemptRepository, progressLogRepository, courseRepository }) {
    this.evalAttemptRepo = evalAttemptRepository;
    this.progressLogRepo = progressLogRepository;
    this.courseRepo = courseRepository;
  }

  /**
   * Procesa el envío de una evaluación final.
   *
   * @param {Object} params
   * @param {string} params.estudianteId — ID del estudiante autenticado
   * @param {string} params.cursoId — ID del curso
   * @param {number} params.numeroModulo — Número del módulo (1-based)
   * @param {Array<{preguntaId: string, respuesta: string}>} params.respuestas — Respuestas del estudiante
   * @returns {Promise<Object>} Resultado con nota, aprobado, detalles del intento
   */
  async submitEvaluation({ estudianteId, cursoId, numeroModulo, respuestas }) {
    // 1. Obtener el curso y validar existencia
    const curso = await this.courseRepo.findById(cursoId);
    if (!curso) {
      throw new AppError('Curso no encontrado.', 404);
    }

    // 2. Obtener el módulo
    const modulo = curso.modules.find((m) => m.module_number === numeroModulo);
    if (!modulo) {
      throw new AppError('Módulo no encontrado.', 404);
    }

    // 3. Obtener la lección 10 (evaluación final)
    const leccion10 = modulo.lessons.find(
      (l) => l.lesson_number === 10 && l.type === 'evaluation'
    );
    if (!leccion10 || !leccion10.questions || leccion10.questions.length === 0) {
      throw new AppError('La evaluación final de este módulo no está configurada.', 404);
    }

    // 4. Obtener la clave oficial
    const claveOficial = leccion10.questions;

    // 5. Calificar las respuestas
    const resultado = this.gradeAnswers(respuestas, claveOficial);

    // 6. Contar intentos previos para obtener el número consecutivo
    const intentosPrevios = await this.evalAttemptRepo.countAttempts(
      estudianteId,
      cursoId,
      numeroModulo
    );

    // 7. Guardar el intento
    const intento = await this.evalAttemptRepo.create({
      student_id: estudianteId,
      course_id: cursoId,
      module_number: numeroModulo,
      answers: resultado.detalle,
      score: resultado.nota,
      passed: resultado.aprobado,
      attempt_number: intentosPrevios + 1,
    });

    // 8. Si aprobó, actualizar el registro de avance
    if (resultado.aprobado) {
      await this.progressLogRepo.upsert(estudianteId, cursoId, numeroModulo, {
        passed: true,
        passing_score: resultado.nota,
        passed_at: new Date(),
      });
    }

    return {
      intento_id: intento._id,
      numero_intento: intento.attempt_number,
      nota: resultado.nota,
      aprobado: resultado.aprobado,
      total_preguntas: claveOficial.length,
      respuestas_correctas: resultado.correctas,
      detalle: resultado.detalle.map((answer) => ({
        preguntaId: answer.question_id,
        respuesta_estudiante: answer.student_answer,
        es_correcta: answer.is_correct,
      })),
    };
  }

  /**
   * Califica las respuestas del estudiante contra la clave oficial.
   *
   * Lógica de deduplicación: si el estudiante envía múltiples respuestas
   * para el mismo preguntaId, solo se toma la ÚLTIMA ocurrencia.
   *
   * Cálculo de nota: (correctas / total_preguntas) * 100, redondeado a 2 decimales.
   * Regla del 70%: aprobado si nota >= 70.
   *
   * @param {Array<{preguntaId: string, respuesta: string}>} respuestas — Respuestas del estudiante
   * @param {Array<{preguntaId: string, respuesta_correcta: string}>} claveOficial — Clave del examen
   * @returns {{nota: number, aprobado: boolean, correctas: number, detalle: Array}}
   */
  gradeAnswers(respuestas, claveOficial) {
    // Deduplicar por preguntaId (última respuesta gana)
    const respuestasMap = new Map();
    for (const resp of respuestas) {
      respuestasMap.set(resp.preguntaId, resp.respuesta);
    }

    let correctas = 0;
    const detalle = [];

    for (const pregunta of claveOficial) {
      const respuestaEstudiante = respuestasMap.get(pregunta.question_id) || null;
      const esCorrecta = respuestaEstudiante === pregunta.correct_answer;

      if (esCorrecta) {
        correctas++;
      }

      detalle.push({
        question_id: pregunta.question_id,
        student_answer: respuestaEstudiante,
        is_correct: esCorrecta,
      });
    }

    const nota = Math.round((correctas / claveOficial.length) * 100 * 100) / 100;
    const aprobado = nota >= 70;

    return { nota, aprobado, correctas, detalle };
  }
}

module.exports = EvalService;
