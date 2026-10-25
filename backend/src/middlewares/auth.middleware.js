// ============================================
// Echo Backend — Middleware de Autenticación JWT
// ============================================
const jwt = require('jsonwebtoken');

/**
 * Middleware que verifica el token JWT en el header Authorization.
 * Formato esperado: "Bearer <token>"
 *
 * Si el token es válido, adjunta los datos decodificados a req.user.
 * Si falta o es inválido, responde con 401 Unauthorized.
 */
const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        ok: false,
        error: 'Acceso denegado. Token no proporcionado.',
      });
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET;

    const decoded = jwt.verify(token, secret);
    req.user = decoded;

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        ok: false,
        error: 'Token expirado. Inicia sesión nuevamente.',
      });
    }

    return res.status(401).json({
      ok: false,
      error: 'Token inválido.',
    });
  }
};

module.exports = { authMiddleware };
