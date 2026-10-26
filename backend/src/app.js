// ============================================
// Echo Backend — Aplicación Express (app.js)
// ============================================
const express = require('express');
const { securityMiddlewares } = require('./config/security');
const { errorHandler } = require('./middlewares/error.middleware');
const authRoutes = require('./modules/auth/auth.routes');
const courseRoutes = require('./modules/courses/course.routes');
const evalRoutes = require('./modules/evaluations/eval.routes');

/**
 * Crea y configura la instancia de Express.
 * Separar la app del server permite hacer pruebas de integración
 * con Supertest sin levantar un puerto real.
 *
 * @param {Object} options
 * @param {string} options.corsOrigin — Origen CORS permitido
 * @returns {express.Application}
 */
const createApp = (options = {}) => {
  const app = express();

  // ─── Seguridad Perimetral ───
  const corsOrigin = options.corsOrigin || process.env.CORS_ORIGIN || '*';
  app.use(...securityMiddlewares(corsOrigin));

  // ─── Parseo de JSON ───
  app.use(express.json({ limit: '1mb' }));

  // ─── Ruta de Salud ───
  app.get('/api/health', (req, res) => {
    res.json({ ok: true, mensaje: 'Echo Backend operativo', version: '2.0.0' });
  });
  app.get('/api/health', (req, res) => {
    res.json({ ok: true, mensaje: 'Echo Backend operativo', version: '2.0.0' });
  });

  // ─── Rutas de Módulos ───
  app.use('/api/auth', authRoutes);
  app.use('/api/courses', courseRoutes);
  app.use('/api/evaluations', evalRoutes);
  app.use('/api/auth', authRoutes);
  app.use('/api/courses', courseRoutes);
  app.use('/api/evaluations', evalRoutes);

  // ─── Ruta 404 ───
  app.use((req, res) => {
    res.status(404).json({
      ok: false,
      error: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
    });
  });

  // ─── Manejador Global de Errores ───
  app.use(errorHandler);

  return app;
};

module.exports = { createApp };
