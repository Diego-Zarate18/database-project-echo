// ============================================
// Echo Backend — Middleware Global de Errores
// ============================================

/**
 * Middleware de manejo global de errores.
 * Captura cualquier error no manejado y lo formatea como JSON estandarizado.
 *
 * Contrato de respuesta de error:
 * {
 *   ok: false,
 *   error: "<mensaje descriptivo>",
 *   ...(stack en desarrollo)
 * }
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, _next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Error interno del servidor.';

  const response = {
    ok: false,
    error: message,
  };

  // Solo incluir stack trace en desarrollo
  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  console.error(`[ERROR] ${req.method} ${req.originalUrl} — ${statusCode}: ${message}`);

  res.status(statusCode).json(response);
};

/**
 * Clase de error personalizado con statusCode para uso en servicios/controladores.
 * Permite lanzar errores con código HTTP específico que el errorHandler recoge.
 */
class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'AppError';
  }
}

module.exports = { errorHandler, AppError };
