// ============================================
// Echo Backend — Pruebas de Integración: API de Evaluaciones (eval.api.test.js)
// ============================================
const request = require('supertest');
const jwt = require('jsonwebtoken');
const { createApp } = require('../../src/app');

// ─── Setup ───
// Configurar variable de entorno para JWT antes de crear la app
process.env.JWT_SECRET = 'test-secret-for-integration-tests-12345';
process.env.NODE_ENV = 'test';

const app = createApp({ corsOrigin: '*' });

/**
 * Genera un token JWT válido para las pruebas.
 * @param {Object} payload — Datos a incluir en el token
 * @returns {string} Token JWT firmado
 */
const generateTestToken = (payload = { id: '507f1f77bcf86cd799439011', correo: 'test@echo.com' }) => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '30m' });
};

// ─────────────────────────────────────────────
// SUITE DE PRUEBAS DE INTEGRACIÓN
// ─────────────────────────────────────────────
describe('API de Evaluaciones — POST /api/v1/evaluaciones/responder', () => {
  // ─── TA-01: Error 401 si no hay token JWT ───
  describe('TA-01: Autenticación requerida', () => {
    it('debe retornar 401 si no se envía el header Authorization', async () => {
      const response = await request(app)
        .post('/api/v1/evaluaciones/responder')
        .send({
          cursoId: '507f1f77bcf86cd799439011',
          numeroModulo: 1,
          respuestas: [{ preguntaId: 'p1', respuesta: 'A' }],
        });

      expect(response.status).toBe(401);
      expect(response.body.ok).toBe(false);
      expect(response.body.error).toMatch(/token/i);
    });

    it('debe retornar 401 si el token es inválido', async () => {
      const response = await request(app)
        .post('/api/v1/evaluaciones/responder')
        .set('Authorization', 'Bearer token-invalido-12345')
        .send({
          cursoId: '507f1f77bcf86cd799439011',
          numeroModulo: 1,
          respuestas: [{ preguntaId: 'p1', respuesta: 'A' }],
        });

      expect(response.status).toBe(401);
      expect(response.body.ok).toBe(false);
    });

    it('debe retornar 401 si el formato del header es incorrecto (sin Bearer)', async () => {
      const token = generateTestToken();
      const response = await request(app)
        .post('/api/v1/evaluaciones/responder')
        .set('Authorization', token) // Sin prefijo "Bearer "
        .send({
          cursoId: '507f1f77bcf86cd799439011',
          numeroModulo: 1,
          respuestas: [{ preguntaId: 'p1', respuesta: 'A' }],
        });

      expect(response.status).toBe(401);
      expect(response.body.ok).toBe(false);
    });
  });

  // ─── TA-02: Error 400 si el arreglo de respuestas viene vacío ───
  describe('TA-02: Validación de body', () => {
    it('debe retornar 400 si el arreglo de respuestas está vacío', async () => {
      const token = generateTestToken();

      const response = await request(app)
        .post('/api/v1/evaluaciones/responder')
        .set('Authorization', `Bearer ${token}`)
        .send({
          cursoId: '507f1f77bcf86cd799439011',
          numeroModulo: 1,
          respuestas: [],  // Arreglo vacío — debe fallar validación Zod
        });

      expect(response.status).toBe(400);
      expect(response.body.ok).toBe(false);
      expect(response.body.error).toMatch(/validación/i);
    });

    it('debe retornar 400 si falta el campo cursoId', async () => {
      const token = generateTestToken();

      const response = await request(app)
        .post('/api/v1/evaluaciones/responder')
        .set('Authorization', `Bearer ${token}`)
        .send({
          numeroModulo: 1,
          respuestas: [{ preguntaId: 'p1', respuesta: 'A' }],
        });

      expect(response.status).toBe(400);
      expect(response.body.ok).toBe(false);
    });

    it('debe retornar 400 si el body está completamente vacío', async () => {
      const token = generateTestToken();

      const response = await request(app)
        .post('/api/v1/evaluaciones/responder')
        .set('Authorization', `Bearer ${token}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.ok).toBe(false);
    });

    it('debe retornar 400 si el cursoId no es un ObjectId válido', async () => {
      const token = generateTestToken();

      const response = await request(app)
        .post('/api/v1/evaluaciones/responder')
        .set('Authorization', `Bearer ${token}`)
        .send({
          cursoId: 'no-es-un-objectid',
          numeroModulo: 1,
          respuestas: [{ preguntaId: 'p1', respuesta: 'A' }],
        });

      expect(response.status).toBe(400);
      expect(response.body.ok).toBe(false);
    });
  });

  // ─── Ruta de salud ───
  describe('Health Check', () => {
    it('GET /api/v1/health debe retornar 200 ok', async () => {
      const response = await request(app).get('/api/v1/health');

      expect(response.status).toBe(200);
      expect(response.body.ok).toBe(true);
      expect(response.body.version).toBe('2.0.0');
    });
  });
});
