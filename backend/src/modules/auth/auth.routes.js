// ============================================
// Echo Backend — Rutas de Autenticacion
// ============================================
const { Router } = require('express');
const { z } = require('zod');
const { register, login } = require('./auth.controller');
const { validate } = require('../../middlewares/validator.middleware');

const router = Router();

// Schema Zod para registro
const registerSchema = z.object({
  nombre: z.string({ required_error: 'El nombre es obligatorio' }).min(2).max(100),
  correo_electronico: z
    .string({ required_error: 'El correo es obligatorio' })
    .email('Formato de correo invalido'),
  contrasena: z
    .string({ required_error: 'La contrasena es obligatoria' })
    .min(6, 'La contrasena debe tener al menos 6 caracteres'),
});

// Schema Zod para login
const loginSchema = z.object({
  correo_electronico: z
    .string({ required_error: 'El correo es obligatorio' })
    .email('Formato de correo invalido'),
  contrasena: z
    .string({ required_error: 'La contrasena es obligatoria' })
    .min(1, 'La contrasena es obligatoria'),
});

// POST /api/auth/register
router.post('/register', validate(registerSchema), register);

// POST /api/auth/login
router.post('/login', validate(loginSchema), login);

module.exports = router;
