// ============================================
// Echo Backend — Validación de Variables de Entorno
// ============================================
const { z } = require('zod');

const envSchema = z.object({
  PORT: z.string().default('3000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  MONGODB_URI: z.string().min(1, 'MONGODB_URI es requerido'),
  JWT_SECRET: z.string().min(10, 'JWT_SECRET debe tener al menos 10 caracteres'),
  JWT_EXPIRES_IN: z.string().default('30m'),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
});

/**
 * Valida y exporta las variables de entorno con valores por defecto seguros.
 * Si alguna variable requerida falta, lanza un error descriptivo al arrancar.
 */
const validateEnv = () => {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const formatted = result.error.issues
      .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');
    throw new Error(`❌ Variables de entorno inválidas:\n${formatted}`);
  }

  return result.data;
};

module.exports = { validateEnv };
