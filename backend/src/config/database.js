// ============================================
// Echo Backend — Conexión a MongoDB (Mongoose)
// ============================================
const mongoose = require('mongoose');

/**
 * Establece la conexión a MongoDB utilizando la URI provista.
 * Aplica opciones de rendimiento y estabilidad recomendadas.
 *
 * @param {string} uri — URI de conexión a MongoDB
 * @returns {Promise<mongoose.Connection>}
 */
const connectDB = async (uri) => {
  try {
    await mongoose.connect(uri);
    console.log('✅ Conexión a MongoDB establecida correctamente');
    return mongoose.connection;
  } catch (error) {
    console.error('❌ Error al conectar con MongoDB:', error.message);
    process.exit(1);
  }
};

/**
 * Cierra la conexión activa con MongoDB.
 * Utilizado en pruebas de integración y shutdown graceful.
 */
const disconnectDB = async () => {
  await mongoose.disconnect();
};

module.exports = { connectDB, disconnectDB };
