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
      numero_leccion: i,
      titulo: `Leccion ${i}: ${moduloTitulo}`,
      tipo: 'lectura',
      contenido: `Contenido de estudio para la leccion ${i} del modulo "${moduloTitulo}". Aqui el estudiante lee el material antes de presentar el examen final.`,
      preguntas: [],
    });
  }

  // Leccion 10: evaluacion final con 10 preguntas
  const opciones = ['A', 'B', 'C', 'D'];
  const preguntas = [];
  for (let i = 1; i <= 10; i++) {
    preguntas.push({
      preguntaId: `p${i}`,
      enunciado: `Pregunta ${i} sobre ${moduloTitulo}: Seleccione la respuesta correcta.`,
      opciones: [
        `A) Opcion A de la pregunta ${i}`,
        `B) Opcion B de la pregunta ${i}`,
        `C) Opcion C de la pregunta ${i}`,
        `D) Opcion D de la pregunta ${i}`,
      ],
      respuesta_correcta: opciones[(i - 1) % 4], // A, B, C, D, A, B, C, D, A, B
    });
  }

  lecciones.push({
    numero_leccion: 10,
    titulo: `Evaluacion Final: ${moduloTitulo}`,
    tipo: 'evaluacion',
    contenido: '',
    preguntas,
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
      titulo: 'Fundamentos de Bases de Datos',
      descripcion: 'Curso introductorio sobre bases de datos relacionales y NoSQL. Incluye teoria y practica con MongoDB.',
      modulos: [
        {
          numero_modulo: 1,
          titulo: 'Introduccion a Bases de Datos',
          descripcion: 'Conceptos fundamentales: que es una BD, tipos, modelos de datos.',
          lecciones: generarLecciones('Introduccion a Bases de Datos'),
        },
        {
          numero_modulo: 2,
          titulo: 'Modelo Relacional y SQL',
          descripcion: 'Tablas, claves primarias, relaciones y consultas SQL basicas.',
          lecciones: generarLecciones('Modelo Relacional y SQL'),
        },
        {
          numero_modulo: 3,
          titulo: 'Bases de Datos NoSQL y MongoDB',
          descripcion: 'Documentos, colecciones, CRUD en MongoDB y diseno de esquemas.',
          lecciones: generarLecciones('Bases de Datos NoSQL y MongoDB'),
        },
      ],
    });

    console.log(`Curso creado: "${curso.titulo}" (ID: ${curso._id})`);
    console.log(`  - ${curso.modulos.length} modulos, cada uno con 10 lecciones`);

    // ─── Crear estudiante de prueba ───
    console.log('\nCreando estudiante de prueba...');
    const contrasenaHash = await bcrypt.hash('password123', 10);
    const estudiante = await Student.create({
      nombre: 'Diego Zarate',
      correo_electronico: 'diego@echo.com',
      contrasena_hash: contrasenaHash,
    });

    console.log(`Estudiante creado: "${estudiante.nombre}" (ID: ${estudiante._id})`);

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
