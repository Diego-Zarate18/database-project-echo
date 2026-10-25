# Guía de Agentes de Desarrollo — Backend Echo (v2.0.0)

**Propósito:** Este documento define los roles, responsabilidades, restricciones y contexto de trabajo para los agentes de Inteligencia Artificial (y desarrolladores) que colaboran en el desarrollo, mantenimiento y refactorización del backend del proyecto **Echo**.

---

## 1. Reglas Globales para Todos los Agentes

1. **Arquitectura Imparable:** Respeta estrictamente la separación por capas (`presentation` $\rightarrow$ `application` $\rightarrow$ `domain` $\leftarrow$ `infrastructure`). Los controladores no deben contener consultas a la base de datos ni lógica de cálculo.
2. **Preservación del Lenguaje NATIVO:** Toda variable, comentario o documentación en el código debe seguir la nomenclatura oficial establecida en la documentación técnica en inglés y español según la guía del proyecto.
3. **Manejo de Errores Estandarizado:** No retornes errores con estructuras personalizadas fuera del contrato estándar JSON definido en la especificación de API HTTP.
4. **Respeto a las Reglas de Negocio:**
   * **Autenticación Local:** Registro e inicio de sesión local mediante correo electrónico único y contraseña encriptada con **Bcrypt**. Tokens **JWT** con expiración de $30\,\text{min}$ por inactividad.
   * **Estructura Educativa:** Cada módulo se compone de 10 lecciones. Las lecciones 1 a 9 contienen lecturas de estudio y la lección 10 corresponde a la evaluación final del módulo.
   * **Evaluación Final y Reintentos:** La evaluación final (Lección 10) requiere una calificación mínima del $70\%$ para su aprobación ($\text{Nota} \ge 70\%$). Si el estudiante no alcanza este porcentaje, se permiten **reintentos inmediatos e ilimitados** sin temporizadores de bloqueo.
   * **Cálculo del Progreso:** El avance del estudiante se determina por la suma de las lecciones leídas (1 a 9) y la aprobación del examen final (Lección 10 con nota $\ge 70\%$).

---

## 2. Definición de Agentes por Rol

### 🤖 Agente 1: Arquitecto Backend & Estructura (Backend Architect)
- **Objetivo:** Velar por la integridad estructural del código, el desacoplamiento de capas y la correcta implementación de patrones de diseño.
- **Alcance de Trabajo:** Archivos en `src/config/`, `src/app.js`, `src/server.js`, carpetas `modules/` y arquitectura general del repositorio.
- **Instrucciones Clave:**
  * Asegura la inversión de dependencias: los servicios dependen de interfaces o repositorios abstractos, nunca del driver de Mongoose directamente.
  * Valida que no existan ciclos de dependencia entre los módulos (`auth`, `courses`, `evaluations`, `progress`).
  * Mantiene la latencia de respuesta HTTP por debajo de los $3\,\text{s}$.

---

### 🔐 Agente 2: Seguridad y Autenticación (Security & Auth Agent)
- **Objetivo:** Garantizar la protección perimetral de los endpoints, la gestión del token JWT local, el cifrado seguro de contraseñas y la sanitización de entradas.
- **Alcance de Trabajo:** `src/middlewares/`, `src/config/security.js`, `src/modules/auth/`.
- **Instrucciones Clave:**
  * Revisa que ningún endpoint sensible quede expuesto sin el `auth.middleware.js`.
  * Asegura que las contraseñas se almacenen utilizando Bcrypt con un factor de costo adecuado ($10$ salt rounds).
  * Verifica el cumplimiento del índice único en `correo_electronico` para evitar registros duplicados.
  * Implementa cabeceras HTTP seguras utilizando Helmet.js, protección contra inyecciones NoSQL y políticas de CORS restrictivas.

---

### 🗄️ Agente 3: Persistencia y Base de Datos (Database & Data Agent)
- **Objetivo:** Diseñar y optimizar los esquemas NoSQL en MongoDB, mantener los modelos de Mongoose, crear índices de rendimiento y actualizar los scripts de *seeding*.
- **Alcance de Trabajo:** `src/models/`, `src/repositories/`, `src/config/database.js`, `scripts/`.
- **Instrucciones Clave:**
  * Define esquemas estrictos en Mongoose para las colecciones: `estudiantes`, `cursos`, `intentos_evaluacion` y `registro_avance`.
  * Configura el índice único en el campo `correo_electronico` en la colección `estudiantes`.
  * Mantiene actualizado el script `scripts/seed.js` para la carga inicial de los módulos con sus 10 lecciones correspondientes.

---

### 🧪 Agente 4: Calidad y Pruebas (QA & Testing Agent)
- **Objetivo:** Construir y mantener la suite de pruebas unitarias y de integración para asegurar que las reglas de negocio no sufran regresiones.
- **Alcance de Trabajo:** Carpeta `tests/` (`unit/` e `integration/`).
- **Instrucciones Clave:**
  * Escribe pruebas automatizadas utilizando **Jest** y **Supertest**.
  * Diseña casos de prueba específicos para la regla de aprobación de la lección 10 ($\text{Nota} \ge 70\%$).
  * Verifica que los reintentos del examen final se registren correctamente y se puedan ejecutar de forma inmediata tras un intento reprobatorio ($< 70\%$).
  * Valida la unicidad del correo electrónico en el registro y el cálculo preciso del progreso global del estudiante.

---

## 3. Matriz de Mapeo de Tareas

| Tarea / Funcionalidad | Agente Principal | Agente Secundario |
| :--- | :--- | :--- |
| Crear o refactorizar un endpoint REST | Arquitecto | Seguridad |
| Implementar / Modificar flujo de registro y login | Seguridad | Base de Datos |
| Cambiar criterios de evaluación del 70% | Arquitecto | QA & Testing |
| Agregar un nuevo campo a un modelo MongoDB | Base de Datos | Arquitecto |
| Configurar limitador de tasa (Rate Limit) | Seguridad | Arquitecto |
| Actualizar script `seed.js` (10 lecciones por módulo) | Base de Datos | QA & Testing |
| Escribir pruebas para reintentos inmediatos | QA & Testing | Base de Datos |
| Escribir pruebas de regresión de autenticación JWT | QA & Testing | Seguridad |