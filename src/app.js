const express = require('express');
const morgan = require('morgan');
const db = require('./configuracion/db');
const ModeloCarrera = require('./modelos/carrera');
const ModeloDocente = require('./modelos/docente');
const ModeloEstudiante = require('./modelos/estudiante');
const ModeloAsignatura = require('./modelos/asignatura');
const ModeloCalificacion = require('./modelos/calificacion');
const ModeloAsistencia = require('./modelos/asistencia');
const ModeloPeriodo = require('./modelos/periodo'); 
const ModeloMatricula = require('./modelos/matricula'); 
const ModeloActividad = require('./modelos/actividad'); 
db.authenticate()
.then(async (data) => {
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

    ModeloActividad.hasMany(ModeloCalificacion, { foreignKey: 'id_asignatura' }); // Asumiendo que las actividades están relacionadas con las asignaturas
    ModeloCalificacion.belongsTo(ModeloActividad, { foreignKey: 'id_asignatura' });

    // Sincronización de modelos
    await ModeloCarrera.sync().then((da) => {
        console.log("Modelo Carrera creado correctamente");
    }).catch((e) => {
        console.log("Error al crear el modelo Carrera " + e);
    });

    await ModeloDocente.sync().then((da) => {
        console.log("Modelo Docente creado correctamente");
    }).catch((e) => {
        console.log("Error al crear el modelo Docente " + e);
    });

    await ModeloEstudiante.sync().then((da) => {
        console.log("Modelo Estudiante creado correctamente");
    }).catch((e) => {
        console.log("Error al crear el modelo Estudiante " + e);
    });

    await ModeloAsignatura.sync().then((da) => {
        console.log("Modelo Asignatura creado correctamente");
    }).catch((e) => {
        console.log("Error al crear el modelo Asignatura " + e);
    });

    await ModeloCalificacion.sync().then((da) => {
        console.log("Modelo Calificación creado correctamente");
    }).catch((e) => {
        console.log("Error al crear el modelo Calificación " + e);
    });

    await ModeloAsistencia.sync().then((da) => {
        console.log("Modelo Asistencia creado correctamente");
    }).catch((e) => {
        console.log("Error al crear el modelo Asistencia " + e);
    });

    await ModeloPeriodo.sync().then((da) => {
        console.log("Modelo Periodo creado correctamente");
    }).catch((e) => {
        console.log("Error al crear el modelo Periodo " + e);
    });

    await ModeloMatricula.sync().then((da) => {
        console.log("Modelo Matrícula creado correctamente");
    }).catch((e) => {
        console.log("Error al crear el modelo Matrícula " + e);
    });

    await ModeloActividad.sync().then((da) => {
        console.log("Modelo Actividad creado correctamente");
    }).catch((e) => {
        console.log("Error al crear el modelo Actividad " + e);
    });

})
.catch((er) => {
    console.log("Error: " + er);
});


const app = express();
app.set('port', 3002);
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
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
});