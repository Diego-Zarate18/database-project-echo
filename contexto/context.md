# Especificación Técnica Backend y Arquitectura — Proyecto Echo

**Versión:** 2.0  
**Patrón:** Monolito Modular por Capas (Clean Architecture)  
**Motor de Base de Datos:** MongoDB (NoSQL)  

---

## 1. Estructura Completa del Proyecto

```text
echo-backend/
├── .env.example                    # Plantilla de variables de entorno
├── .gitignore                      # Exclusiones de Git
├── Dockerfile                      # Configuración de contenedor Docker
├── docker-compose.yml              # Entorno local (Node.js + MongoDB)
├── package.json                    # Dependencias y scripts de ejecución
├── README.md                       # Documentación general de instalación
├── agentes.md                      # Guía operativa para asistentes y agentes IA
│
├── scripts/                        # Scripts utilitarios y de mantenimiento
│   ├── seed.js                     # Carga inicial del catálogo de cursos y lecciones
│   └── reset_db.js                 # Limpieza de base de datos para entornos Dev/Test
│
├── tests/                          # Suite global de pruebas
│   ├── unit/                       # Pruebas unitarias (Servicios, Regla del 70% de aprobación)
│   └── integration/                # Pruebas de integración (Endpoints API, Base de datos)
│
└── src/
    ├── app.js                      # Inicialización de Express y registro de Middlewares
    ├── server.js                   # Arranque del servidor HTTP
    │
    ├── config/                     # Configuraciones globales
    │   ├── database.js             # Conexión y configuración de Mongoose
    │   ├── env.js                  # Validación y exportación de variables de entorno
    │   ├── security.js             # Ajustes de CORS y políticas de seguridad
    │   └── logger.js               # Logger estructurado (Winston / Pino)
    │
    ├── middlewares/                # Middlewares globales de seguridad e infraestructura
    │   ├── auth.middleware.js      # Validación de JWT local y tiempo de inactividad
    │   ├── security.middleware.js  # Configuración de Helmet y CORS
    │   ├── rateLimit.middleware.js # Protección contra ataques de fuerza bruta en login/registro
    │   ├── validator.middleware.js # Validación de schemas/DTOs de entrada
    │   ├── logger.middleware.js    # Auditoría HTTP y registro de latencia (< 3s)
    │   └── error.middleware.js     # Formateador global de respuestas de error JSON
    │
    ├── modules/                    # Módulos funcionales de la aplicación
    │   ├── auth/                   # Autenticación Local
    │   │   ├── auth.controller.js  # Endpoints /api/v1/auth
    │   │   ├── auth.routes.js      # Definición de rutas de autenticación
    │   │   └── auth.service.js     # Hash bcrypt, emisión de JWT y verificación de correo único
    │   │
    │   ├── courses/                # Cursos, Módulos y Lecciones
    │   │   ├── course.controller.js# Endpoints /api/v1/courses
    │   │   ├── course.routes.js    # Rutas de consulta de catálogo y lecciones (1 a 9)
    │   │   └── course.service.js  # Lógica de navegación del contenido
    │   │
    │   ├── evaluations/            # Evaluaciones Finales (Lección 10)
    │   │   ├── eval.controller.js  # Endpoints /api/v1/evaluations
    │   │   ├── eval.routes.js      # Rutas de envío y calificación de exámenes
    │   │   └── eval.service.js    # Calificación automática, reintentos inmediatos y regla del 70%
    │   │
    │   └── progress/               # Avance y Seguimiento Educativo
    │       ├── progress.controller.js # Endpoints /api/v1/progress
    │       ├── progress.routes.js  # Rutas del panel "Mi Progreso"
    │       └── progress.service.js # Recálculo de avance (Lecciones leídas + Evaluaciones aprobadas)
    │
    ├── repositories/               # Capa de Acceso a Datos NoSQL (Patrón Repositorio)
    │   ├── student.repository.js   # Operaciones sobre la colección 'estudiantes'
    │   ├── course.repository.js    # Operaciones sobre la colección 'cursos'
    │   ├── evalAttempt.repository.js # Operaciones sobre la colección 'intentos_evaluacion'
    │   └── progressLog.repository.js # Operaciones sobre la colección 'registro_avance'
    │
    └── models/                     # Esquemas de Mongoose con validación NoSQL
        ├── student.model.js        # Modelo Estudiante (Índice único en correo_electronico)
        ├── course.model.js         # Modelo Curso (Módulos de 10 lecciones, lección 10 = examen)
        ├── evalAttempt.model.js    # Modelo IntentoEvaluacion (Historial de reintentos ilimitados)
        └── progressLog.model.js    # Modelo RegistroAvance (Eventos de interacción)
```

---

## 2. Detalle de Middlewares y Capa de Seguridad

| Middleware | Ubicación | Responsabilidad Principal |
| :--- | :--- | :--- |
| **`security.middleware.js`** | `src/middlewares` | Aplica **Helmet.js** para ocultar cabeceras vulnerables (`X-Powered-By`) y configura **CORS** para restringir peticiones exclusivamente al dominio cliente autorizado de Echo. |
| **`rateLimit.middleware.js`** | `src/middlewares` | Limita la tasa de peticiones por IP en las rutas de `/api/v1/auth/login` y `/api/v1/auth/register` para prevenir ataques de fuerza bruta. |
| **`auth.middleware.js`** | `src/middlewares` | Valida la presencia y firma del token JWT en el encabezado `Authorization: Bearer <token>`, gestionando la sesión local del estudiante y la expiración por inactividad ($30\text{ min}$). |
| **`validator.middleware.js`** | `src/middlewares` | Intercepta y sanitiza los datos de entrada en el cuerpo (`body`) o parámetros de la petición mediante esquemas estrictos (Zod / Joi) antes de llegar a los controladores. |
| **`logger.middleware.js`** | `src/middlewares` | Mide el tiempo exacto de procesamiento de cada petición HTTP. Registra alertas si el tiempo de respuesta supera el umbral de latencia de $3\text{ segundos}$. |
| **`error.middleware.js`** | `src/middlewares` | Captura excepciones no controladas y devuelve una respuesta estructurada JSON con códigos HTTP $4xx$ o $5xx$, protegiendo el *stack trace* en entornos de producción. |

---

## 3. Reglas de Negocio Clave en el Backend

1. **Autenticación Local Única**: La creación de cuenta requiere un correo electrónico único (`correo_electronico`). El motor de base de datos fuerza la unicidad mediante un índice único NoSQL a nivel de colección.
2. **Estructura Instruccional**: Cada módulo consta de **10 lecciones**. Las lecciones de la 1 a la 9 corresponden a contenido teórico/práctico, mientras que la **lección #10** es la evaluación final del módulo.
3. **Criterio de Aprobación**: Una evaluación se considera **aprobada** si la calificación obtenida es igual o superior al **70%** ($\ge 70/100$).
4. **Reintentos Inmediatos**: No existen periodos de bloqueo o penalización por tiempo tras reprobar un examen. El estudiante puede volver a presentar la evaluación final de forma inmediata e ilimitada.
5. **Cálculo de Avance del Curso**: El porcentaje de avance del estudiante combina la lectura confirmada de las lecciones 1 a 9 y la aprobación con $\ge 70\%$ de la lección 10 (evaluación final).

---

## 4. Estrategia de Carga de Datos (*Seeding*)

Para mantener los contenidos desacoplados del código fuente de la aplicación:

1. El catálogo de cursos, módulos y las 10 lecciones asociadas se definen en un archivo JSON estructurado (`scripts/data/cursos_iniciales.json`).
2. El script `scripts/seed.js` se ejecuta mediante el comando `npm run seed`.
3. El script ejecuta una operación de *upsert* (actualización si existe, inserción si no existe) en la colección `cursos` de MongoDB y regenera los índices necesarios para optimizar las lecturas.