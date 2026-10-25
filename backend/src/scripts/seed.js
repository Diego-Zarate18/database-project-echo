// ============================================
// Echo Backend — Script de Seed (Carga inicial de datos)
// ============================================
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { connectDB, disconnectDB } = require('../config/database');
const Course = require('../models/course.model');
const Student = require('../models/student.model');

/**
 * Genera las 10 lecciones de un modulo.
 * - Lecciones 1-9: tipo "lectura" con contenido de texto.
 * - Leccion 10: tipo "evaluacion" con 10 preguntas de opcion multiple.
 *
 * @param {string} moduloTitulo — Nombre del modulo (para personalizar contenido)
 * @returns {Array} Arreglo de 10 lecciones
 */
const generarLecciones = (moduloTitulo) => {
  const lecciones = [];

  // Lecciones 1 a 9: lectura
  for (let i = 1; i <= 9; i++) {
    lecciones.push({
      lesson_number: i,
      title: `Lesson ${i}: ${moduloTitulo}`,
      type: 'reading',
      content: `Study content for lesson ${i} of module "${moduloTitulo}".`,
      questions: [],
    });
  }

  // Leccion 10: evaluacion final con 10 preguntas
  const opciones = ['A', 'B', 'C', 'D'];
  const preguntas = [];
  for (let i = 1; i <= 10; i++) {
    preguntas.push({
      question_id: `p${i}`,
      prompt: `Question ${i} about ${moduloTitulo}: Select the correct answer.`,
      options: [
        `A) Option A for question ${i}`,
        `B) Option B for question ${i}`,
        `C) Option C for question ${i}`,
        `D) Option D for question ${i}`,
      ],
      correct_answer: opciones[(i - 1) % 4],
    });
  }

  lecciones.push({
    lesson_number: 10,
    title: `Final Evaluation: ${moduloTitulo}`,
    type: 'evaluation',
    content: '',
    questions: preguntas,
  });

  return lecciones;
};

/**
 * Ejecuta el seed: limpia la DB y carga datos iniciales.
 */
const seed = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/echo_db';
    await connectDB(uri);

    console.log('Limpiando colecciones existentes...');
    await Course.deleteMany({});
    await Student.deleteMany({});

    // ─── Crear curso de ejemplo ───
    console.log('Creando curso de ejemplo...');
    const curso = await Course.create({
      title: 'Database Fundamentals',
      description: 'Introductory course on relational and NoSQL databases, including MongoDB practice.',
      modules: [
        {
          module_number: 1,
          title: 'Introduction to Databases',
          description: 'Fundamental concepts: databases, types, and data models.',
          lessons: generarLecciones('Introduction to Databases'),
        },
        {
          module_number: 2,
          title: 'Relational Model and SQL',
          description: 'Tables, primary keys, relationships, and basic SQL queries.',
          lessons: generarLecciones('Relational Model and SQL'),
        },
        {
          module_number: 3,
          title: 'NoSQL Databases and MongoDB',
          description: 'Documents, collections, CRUD in MongoDB, and schema design.',
          lessons: generarLecciones('NoSQL Databases and MongoDB'),
        },
      ],
    });

    console.log(`Course created: "${curso.title}" (ID: ${curso._id})`);
    console.log(`  - ${curso.modules.length} modules, each with 10 lessons`);

    // ─── Crear estudiante de prueba ───
    console.log('\nCreando estudiante de prueba...');
    const contrasenaHash = await bcrypt.hash('password123', 10);
    const estudiante = await Student.create({
      name: 'Diego Zarate',
      email: 'diego@echo.com',
      password_hash: contrasenaHash,
    });

    console.log(`Student created: "${estudiante.name}" (ID: ${estudiante._id})`);

    // ─── Resumen ───
    console.log('\n========================================');
    console.log('  SEED COMPLETADO EXITOSAMENTE');
    console.log('========================================');
    console.log('\nDatos para Postman:');
    console.log(`  Curso ID:      ${curso._id}`);
    console.log(`  Estudiante ID: ${estudiante._id}`);
    console.log(`  Email:         diego@echo.com`);
    console.log(`  Password:      password123`);
    console.log('\nClave de respuestas del examen (Modulo 1):');
    console.log('  p1=A, p2=B, p3=C, p4=D, p5=A, p6=B, p7=C, p8=D, p9=A, p10=B');
    console.log('\nPara aprobar (70%): responde 7 de 10 correctas.');
    console.log('========================================\n');

    await disconnectDB();
    process.exit(0);
  } catch (error) {
    console.error('Error en seed:', error.message);
    await disconnectDB();
    process.exit(1);
  }
};

seed();
