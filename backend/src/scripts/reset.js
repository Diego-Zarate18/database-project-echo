require('dotenv').config();
const { connectDB, disconnectDB } = require('../config/database');
const Course = require('../models/course.model');
const EvalAttempt = require('../models/evalAttempt.model');
const ProgressLog = require('../models/progressLog.model');
const Student = require('../models/student.model');

const reset = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/echo_db';
    await connectDB(uri);

    await Promise.all([
      Course.deleteMany({}),
      EvalAttempt.deleteMany({}),
      ProgressLog.deleteMany({}),
      Student.deleteMany({}),
    ]);

    console.log('Base de datos de desarrollo reiniciada correctamente.');
  } catch (error) {
    console.error('Error al reiniciar la base de datos:', error.message);
    process.exitCode = 1;
  } finally {
    await disconnectDB();
  }
};

reset();