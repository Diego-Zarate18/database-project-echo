// ============================================
// Echo Backend — Middleware de Validación (Zod)
// ============================================

/**
 * Fábrica de middleware que valida el body de la petición
 * contra un esquema Zod proporcionado.
 *
 * Si la validación falla, responde con 400 y los detalles del error.
 * Si pasa, reemplaza req.body con los datos sanitizados.
 *
 * @param {import('zod').ZodSchema} schema — Esquema Zod para validación
 * @returns {Function} Middleware de Express
 */
const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    const errors = result.error.issues.map((issue) => ({
      campo: issue.path.join('.'),
      mensaje: issue.message,
    }));

    return res.status(400).json({
      ok: false,
      error: 'Error de validación en los datos enviados.',
      detalles: errors,
    });
  }

  // Reemplazar body con los datos sanitizados por Zod
  req.body = result.data;
  next();
};

module.exports = { validate };
