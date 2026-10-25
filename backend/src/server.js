// ============================================
// Echo Backend — Servidor HTTP (server.js)
// ============================================
require('dotenv').config();

const { validateEnv } = require('./config/env');
const { connectDB } = require('./config/database');
const { createApp } = require('./app');

/**
 * Punto de entrada principal del backend Echo.
 * 1. Valida variables de entorno.
 * 2. Conecta a MongoDB.
 * 3. Levanta el servidor Express.
 */
const startServer = async () => {
  try {
    // Validar variables de entorno
    const env = validateEnv();

    // Conectar a MongoDB
    await connectDB(env.MONGODB_URI);

    // Crear y arrancar la aplicación
    const app = createApp({ corsOrigin: env.CORS_ORIGIN });
    const port = parseInt(env.PORT, 10);

    app.listen(port, () => {
      console.log(`🚀 Echo Backend v2.0.0 corriendo en http://localhost:${port}`);
      console.log(`📦 Entorno: ${env.NODE_ENV}`);
    });
  } catch (error) {
    console.error('❌ Error fatal al iniciar el servidor:', error.message);
    process.exit(1);
  }
};

startServer();
