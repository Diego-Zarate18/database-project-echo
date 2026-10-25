// ============================================
// Echo Backend — Controlador de Autenticacion
// ============================================
const authService = require('./auth.service');

/**
 * POST /api/v1/auth/register
 */
const register = async (req, res, next) => {
  try {
    const { nombre, correo_electronico, contrasena } = req.body;
    const resultado = await authService.register({ nombre, correo_electronico, contrasena });

    return res.status(201).json({
      ok: true,
      mensaje: 'Estudiante registrado exitosamente.',
      data: resultado,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/auth/login
 */
const login = async (req, res, next) => {
  try {
    const { correo_electronico, contrasena } = req.body;
    const resultado = await authService.login({ correo_electronico, contrasena });

    return res.status(200).json({
      ok: true,
      mensaje: 'Inicio de sesion exitoso.',
      data: resultado,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login };
