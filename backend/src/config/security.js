// ============================================
// Echo Backend — Configuración de Seguridad (Helmet + CORS)
// ============================================
const helmet = require('helmet');
const cors = require('cors');

/**
 * Retorna un arreglo de middlewares de seguridad perimetral.
 * - Helmet: oculta cabeceras sensibles (X-Powered-By, etc.)
 * - CORS: restringe los orígenes permitidos al cliente Echo
 *
 * @param {string} corsOrigin — Origen permitido (e.g. http://localhost:5173)
 * @returns {Array<Function>}
 */
const securityMiddlewares = (corsOrigin) => [
  helmet(),
  cors({
    origin: corsOrigin,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  }),
];

module.exports = { securityMiddlewares };
