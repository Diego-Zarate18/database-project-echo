// ============================================
// Echo Backend — Pruebas Unitarias: EvalService (eval.service.test.js)
// ============================================
const EvalService = require('../../src/modules/evaluations/eval.service');

/**
 * Fábrica de mocks para los repositorios inyectados.
 * Permite configurar el comportamiento por prueba sin tocar la DB real.
 */
const createMockRepos = (overrides = {}) => ({
  evalAttemptRepository: {
    create: jest.fn().mockResolvedValue({ _id: 'mock-attempt-id', numero_intento: 1 }),
    countAttempts: jest.fn().mockResolvedValue(0),
    findByStudentAndModule: jest.fn().mockResolvedValue([]),
    ...overrides.evalAttemptRepository,
  },
  progressLogRepository: {
    upsert: jest.fn().mockResolvedValue({}),
    findByStudentAndModule: jest.fn().mockResolvedValue(null),
    ...overrides.progressLogRepository,
  },
  courseRepository: {
    findById: jest.fn(),
    ...overrides.courseRepository,
  },
});

/**
 * Genera un curso mock con un módulo y N preguntas en la lección 10.
 * Todas las respuestas correctas son 'A', 'B', 'C', ... cíclicamente.
 *
 * @param {number} totalPreguntas — Número de preguntas del examen
 * @returns {Object} Curso mock de Mongoose
 */
const createMockCourse = (totalPreguntas = 10) => {
  const opciones = ['A', 'B', 'C', 'D'];
  const preguntas = [];

  for (let i = 1; i <= totalPreguntas; i++) {
    preguntas.push({
      preguntaId: `p${i}`,
      enunciado: `Pregunta ${i}`,
      opciones,
      respuesta_correcta: opciones[(i - 1) % opciones.length],
    });
  }

  // Generar lecciones 1-9 (lectura) + lección 10 (evaluación)
  const lecciones = [];
  for (let i = 1; i <= 9; i++) {
    lecciones.push({
      numero_leccion: i,
      titulo: `Lección ${i}`,
      tipo: 'lectura',
      contenido: `Contenido de la lección ${i}`,
      preguntas: [],
    });
  }
  lecciones.push({
    numero_leccion: 10,
    titulo: 'Evaluación Final',
    tipo: 'evaluacion',
    contenido: '',
    preguntas,
  });

  return {
    _id: 'course-id-123456789012',
    titulo: 'Curso de Prueba',
    modulos: [
      {
        numero_modulo: 1,
        titulo: 'Módulo 1',
        descripcion: 'Módulo de prueba',
        lecciones,
      },
    ],
  };
};

/**
 * Genera respuestas del estudiante.
 *
 * @param {number} totalPreguntas — Número total de preguntas
 * @param {number} correctas — Número de respuestas correctas (empezando desde p1)
 * @returns {Array<{preguntaId: string, respuesta: string}>}
 */
const generateStudentAnswers = (totalPreguntas, correctas) => {
  const opciones = ['A', 'B', 'C', 'D'];
  const respuestas = [];

  for (let i = 1; i <= totalPreguntas; i++) {
    const correctAnswer = opciones[(i - 1) % opciones.length];
    if (i <= correctas) {
      // Respuesta correcta
      respuestas.push({ preguntaId: `p${i}`, respuesta: correctAnswer });
    } else {
      // Respuesta incorrecta (seleccionar una opción diferente)
      const wrongAnswer = correctAnswer === 'A' ? 'B' : 'A';
      respuestas.push({ preguntaId: `p${i}`, respuesta: wrongAnswer });
    }
  }

  return respuestas;
};

// ─────────────────────────────────────────────
// SUITE DE PRUEBAS
// ─────────────────────────────────────────────
describe('EvalService — Calificación de Evaluación Final (CU-03)', () => {
  // ─── TU-01: Nota exactamente en 70% (debe aprobar) ───
  describe('TU-01: Nota exactamente en 70% (aprueba)', () => {
    it('debe aprobar con nota = 70 cuando 7 de 10 respuestas son correctas', async () => {
      const mockCourse = createMockCourse(10);
      const repos = createMockRepos({
        courseRepository: {
          findById: jest.fn().mockResolvedValue(mockCourse),
        },
      });
      const service = new EvalService(repos);

      // 7 correctas de 10 = 70%
      const respuestas = generateStudentAnswers(10, 7);

      const resultado = await service.submitEvaluation({
        estudianteId: 'student-id-123',
        cursoId: 'course-id-123456789012',
        numeroModulo: 1,
        respuestas,
      });

      expect(resultado.nota).toBe(70);
      expect(resultado.aprobado).toBe(true);
      expect(resultado.respuestas_correctas).toBe(7);
      expect(resultado.total_preguntas).toBe(10);

      // Debe haber guardado el intento
      expect(repos.evalAttemptRepository.create).toHaveBeenCalledTimes(1);

      // Debe haber actualizado el progreso al aprobar
      expect(repos.progressLogRepository.upsert).toHaveBeenCalledTimes(1);
      expect(repos.progressLogRepository.upsert).toHaveBeenCalledWith(
        'student-id-123',
        'course-id-123456789012',
        1,
        expect.objectContaining({
          aprobado: true,
          nota_aprobacion: 70,
        })
      );
    });
  });

  // ─── TU-02: Nota en 69% (debe reprobar) ───
  describe('TU-02: Nota < 70% (reprueba)', () => {
    it('debe reprobar cuando la nota es menor a 70 (ejemplo: 60%)', async () => {
      const mockCourse = createMockCourse(10);
      const repos = createMockRepos({
        courseRepository: {
          findById: jest.fn().mockResolvedValue(mockCourse),
        },
      });
      const service = new EvalService(repos);

      // 6 correctas de 10 = 60% (< 70%)
      const respuestas = generateStudentAnswers(10, 6);

      const resultado = await service.submitEvaluation({
        estudianteId: 'student-id-123',
        cursoId: 'course-id-123456789012',
        numeroModulo: 1,
        respuestas,
      });

      expect(resultado.nota).toBe(60);
      expect(resultado.aprobado).toBe(false);
      expect(resultado.respuestas_correctas).toBe(6);

      // Debe haber guardado el intento
      expect(repos.evalAttemptRepository.create).toHaveBeenCalledTimes(1);

      // NO debe haber actualizado el progreso al reprobar
      expect(repos.progressLogRepository.upsert).not.toHaveBeenCalled();
    });

    it('debe reprobar con 69% exacto (boundary case: 69 < 70)', async () => {
      // 100 preguntas, 69 correctas = 69%
      const mockCourse = createMockCourse(100);
      const repos = createMockRepos({
        courseRepository: {
          findById: jest.fn().mockResolvedValue(mockCourse),
        },
      });
      const service = new EvalService(repos);

      const respuestas = generateStudentAnswers(100, 69);

      const resultado = await service.submitEvaluation({
        estudianteId: 'student-id-123',
        cursoId: 'course-id-123456789012',
        numeroModulo: 1,
        respuestas,
      });

      expect(resultado.nota).toBe(69);
      expect(resultado.aprobado).toBe(false);

      // NO debe actualizar progreso
      expect(repos.progressLogRepository.upsert).not.toHaveBeenCalled();
    });
  });

  // ─── TU-03: Reintento inmediato permitido ───
  describe('TU-03: Reintento inmediato permitido', () => {
    it('debe permitir reintentar inmediatamente después de reprobar', async () => {
      const mockCourse = createMockCourse(10);

      // Simular que ya hay 2 intentos previos
      const repos = createMockRepos({
        courseRepository: {
          findById: jest.fn().mockResolvedValue(mockCourse),
        },
        evalAttemptRepository: {
          countAttempts: jest.fn().mockResolvedValue(2),
          create: jest.fn().mockResolvedValue({ _id: 'attempt-3', numero_intento: 3 }),
        },
      });
      const service = new EvalService(repos);

      // Primer intento: reprueba con 50%
      const respuestasReprobadas = generateStudentAnswers(10, 5);
      const resultado1 = await service.submitEvaluation({
        estudianteId: 'student-id-123',
        cursoId: 'course-id-123456789012',
        numeroModulo: 1,
        respuestas: respuestasReprobadas,
      });

      expect(resultado1.aprobado).toBe(false);
      expect(resultado1.numero_intento).toBe(3); // Es el tercer intento

      // Reintento inmediato: aprueba con 80%
      repos.evalAttemptRepository.countAttempts.mockResolvedValue(3);
      repos.evalAttemptRepository.create.mockResolvedValue({ _id: 'attempt-4', numero_intento: 4 });

      const respuestasAprobadas = generateStudentAnswers(10, 8);
      const resultado2 = await service.submitEvaluation({
        estudianteId: 'student-id-123',
        cursoId: 'course-id-123456789012',
        numeroModulo: 1,
        respuestas: respuestasAprobadas,
      });

      expect(resultado2.aprobado).toBe(true);
      expect(resultado2.nota).toBe(80);
      expect(resultado2.numero_intento).toBe(4);

      // El servicio fue llamado dos veces sin bloqueos ni temporizadores
      expect(repos.evalAttemptRepository.create).toHaveBeenCalledTimes(2);
      // El progreso se actualizó solo en el segundo intento (aprobado)
      expect(repos.progressLogRepository.upsert).toHaveBeenCalledTimes(1);
    });
  });

  // ─── Deduplicación de respuestas por preguntaId ───
  describe('Deduplicación de respuestas por preguntaId', () => {
    it('debe tomar solo la última respuesta cuando hay duplicados', () => {
      const service = new EvalService(createMockRepos());

      const claveOficial = [
        { preguntaId: 'p1', respuesta_correcta: 'A' },
        { preguntaId: 'p2', respuesta_correcta: 'B' },
      ];

      // El estudiante envía dos respuestas para p1: primero 'C' (incorrecta), luego 'A' (correcta)
      const respuestas = [
        { preguntaId: 'p1', respuesta: 'C' },
        { preguntaId: 'p1', respuesta: 'A' },
        { preguntaId: 'p2', respuesta: 'B' },
      ];

      const resultado = service.gradeAnswers(respuestas, claveOficial);

      expect(resultado.nota).toBe(100);
      expect(resultado.correctas).toBe(2);
    });
  });

  // ─── Curso o módulo no encontrado ───
  describe('Errores de validación', () => {
    it('debe lanzar error 404 si el curso no existe', async () => {
      const repos = createMockRepos({
        courseRepository: {
          findById: jest.fn().mockResolvedValue(null),
        },
      });
      const service = new EvalService(repos);

      await expect(
        service.submitEvaluation({
          estudianteId: 'student-id-123',
          cursoId: 'nonexistent-id',
          numeroModulo: 1,
          respuestas: [{ preguntaId: 'p1', respuesta: 'A' }],
        })
      ).rejects.toThrow('Curso no encontrado.');
    });

    it('debe lanzar error 404 si el módulo no existe', async () => {
      const mockCourse = createMockCourse(10);
      const repos = createMockRepos({
        courseRepository: {
          findById: jest.fn().mockResolvedValue(mockCourse),
        },
      });
      const service = new EvalService(repos);

      await expect(
        service.submitEvaluation({
          estudianteId: 'student-id-123',
          cursoId: 'course-id-123456789012',
          numeroModulo: 999, // módulo que no existe
          respuestas: [{ preguntaId: 'p1', respuesta: 'A' }],
        })
      ).rejects.toThrow('Módulo no encontrado.');
    });
  });
});
