const express = require('express');
require('dotenv').config();
const morgan = require('morgan');
const helmet = require('helmet'); // Importar Helmet
const rateLimit = require('express-rate-limit');
const cors = require('cors'); // Importar CORS
const db = require('./configuracion/db');
const swagger = require('./documentacion/swagger'); // Importar Swagger
const PORT = process.env.PORT || 3002;

// Modelos
const ModeloCarrera = require('./modelos/carrera');
const ModeloDocente = require('./modelos/docente');
const ModeloEstudiante = require('./modelos/estudiante');
const ModeloAsignatura = require('./modelos/asignatura');
const ModeloCalificacion = require('./modelos/calificacion');
const ModeloAsistencia = require('./modelos/asistencia');
const ModeloPeriodo = require('./modelos/periodo');
const ModeloMatricula = require('./modelos/matricula');
const ModeloActividad = require('./modelos/actividad');

// Conexión a la base de datos
db.authenticate()
    .then(async () => {
        console.log("Conexión establecida");

        // Definición de relaciones
        ModeloCarrera.hasMany(ModeloEstudiante, { foreignKey: 'id_carrera' });
        ModeloEstudiante.belongsTo(ModeloCarrera, { foreignKey: 'id_carrera' });

        ModeloDocente.hasMany(ModeloAsignatura, { foreignKey: 'id_docente' });
        ModeloAsignatura.belongsTo(ModeloDocente, { foreignKey: 'id_docente' });

        ModeloCarrera.hasMany(ModeloAsignatura, { foreignKey: 'id_carrera' });
        ModeloAsignatura.belongsTo(ModeloCarrera, { foreignKey: 'id_carrera' });

        ModeloEstudiante.hasMany(ModeloCalificacion, { foreignKey: 'id_estudiante' });
        ModeloCalificacion.belongsTo(ModeloEstudiante, { foreignKey: 'id_estudiante' });

        ModeloAsignatura.hasMany(ModeloCalificacion, { foreignKey: 'id_asignatura' });
        ModeloCalificacion.belongsTo(ModeloAsignatura, { foreignKey: 'id_asignatura' });

        ModeloEstudiante.hasMany(ModeloAsistencia, { foreignKey: 'id_estudiante' });
        ModeloAsistencia.belongsTo(ModeloEstudiante, { foreignKey: 'id_estudiante' });

        ModeloAsignatura.hasMany(ModeloAsistencia, { foreignKey: 'id_asignatura' });
        ModeloAsistencia.belongsTo(ModeloAsignatura, { foreignKey: 'id_asignatura' });

        ModeloPeriodo.hasMany(ModeloMatricula, { foreignKey: 'id_periodo' });
        ModeloMatricula.belongsTo(ModeloPeriodo, { foreignKey: 'id_periodo' });

        ModeloActividad.hasMany(ModeloCalificacion, { foreignKey: 'id_asignatura' });
        ModeloCalificacion.belongsTo(ModeloActividad, { foreignKey: 'id_asignatura' });

        // Sincronización de modelos
        try {
            await Promise.all([
                ModeloCarrera.sync(),
                ModeloDocente.sync(),
                ModeloEstudiante.sync(),
                ModeloAsignatura.sync(),
                ModeloCalificacion.sync(),
                ModeloAsistencia.sync(),
                ModeloPeriodo.sync(),
                ModeloMatricula.sync(),
                ModeloActividad.sync(),
            ]);
            console.log("Todos los modelos fueron creados correctamente");
        } catch (error) {
            console.error("Error al crear uno o más modelos:", error);
        }
    })
    .catch((error) => {
        console.error("Error de conexión: ", error);
    });

const app = express();
app.set('port', PORT);
app.use(morgan('dev'));
app.use(helmet()); // Usar Helmet para proteger la aplicación

// Configuración de CORS
const corsOptions = {
    origin: [
        'http://localhost:3002'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Permitir estos métodos
    allowedHeaders: ['Content-Type', 'Authorization'], // Permitir ciertos encabezados
};

app.use(cors(corsOptions)); // Aplicar CORS con las opciones especificadas
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Inicializar Swagger
swagger(app);

// Implementar rate limiting
const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minuto
    max: 10, // Limite de 10 peticiones
    message: 'Demasiadas peticiones, por favor intente de nuevo más tarde.'
});

// Aplicar el limitador a todas las rutas
app.use(limiter);

// Rutas
app.use('/api/carreras', require('./rutas/rutasCarrera'));
app.use('/api/docentes', require('./rutas/rutasDocente'));
app.use('/api/asignaturas', require('./rutas/rutasAsignatura'));
app.use('/api/actividades', require('./rutas/rutasActividad'));
app.use('/api/asistencias', require('./rutas/rutasAsistencia'));
app.use('/api/calificaciones', require('./rutas/rutasCalificacion'));
app.use('/api/estudiantes', require('./rutas/rutasEstudiante'));
app.use('/api/matriculas', require('./rutas/rutasMatricula'));
app.use('/api/periodos', require('./rutas/rutasPeriodo'));

app.listen(app.get('port'), () => {
    console.log('Servidor iniciado en el puerto ' + app.get('port'));
    console.log(`Documentación de Swagger disponible en: http://localhost:${app.get('port')}/api-docs`);
});
