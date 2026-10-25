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
 * @param {'body'|'params'} source — Parte de la petición que se valida
 * @returns {Function} Middleware de Express
 */
const validate = (schema, source = 'body') => (req, res, next) => {
  const result = schema.safeParse(req[source]);

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

  // Reemplazar la entrada con los datos sanitizados por Zod
  req[source] = result.data;
  next();
};

module.exports = { validate };
