require('dotenv').config();  //Inicializar las variables de entorno 
const express = require('express');  //Importa los modulos utilizados
const morgan = require('morgan');
const helmet = require('helmet');       //Middleware para mejorar la seguridad del servidor configurando cabeceras HTTP.
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const db = require('./configuracion/db');
const swagger = require('./documentacion/swagger');
const sincronizarModelos = require('./configuracion/sincronizar_modelos');
const passport = require('passport');
const path = require('path');

const PORT = process.env.PORT || 3002;
const app = express();
app.set('port', PORT);

// Middleware
app.use(morgan('dev'));
app.use(helmet());
app.use(cors(require('./configuracion/cors')));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(passport.initialize());

// Inicializar Swagger
swagger(app);

// Implementar rate limiting
const limitador = rateLimit({
    windowMs: 1000 * 60 * 10, // cada 10 minutos
    max: 100,                   //si un usuario supera las 100 solicitudes en 10 minutos, recibirá un mensaje de error 
    message: 'Demasiadas peticiones, por favor intente de nuevo más tarde.'
});
app.use(limitador);


app.use('/api/carreras', require('./rutas/rutasCarrera'));
app.use('/api/docentes', require('./rutas/rutasDocente'));
app.use('/api/asignaturas', require('./rutas/rutasAsignatura'));
app.use('/api/actividades', require('./rutas/rutasActividad'));
app.use('/api/asistencias', require('./rutas/rutasAsistencia'));
app.use('/api/calificaciones', require('./rutas/rutasCalificacion'));
app.use('/api/estudiantes', require('./rutas/rutasEstudiante'));
app.use('/api/matriculas', require('./rutas/rutasMatricula'));
app.use('/api/periodos', require('./rutas/rutasPeriodo'));
//añadiendo ruta para imagenes
app.use('/api/archivos' , require('./rutas/rutasArchivo'));
app.use('/api/imagenes', express.static(path.join(__dirname, '../public/img')));
app.use('/api/usuarios', require('./rutas/rutasUsuarios')); // Ruta para gestionar usuarios

// Conexión a la base de datos y sincronización de modelos
db.authenticate()
    .then(async () => {
        console.log('Conexión a la base de datos establecida');
        await sincronizarModelos(); // Asegúrate de que esto funcione correctamente
        app.listen(app.get('port'), () => {
            console.log(`Servidor corriendo en el puerto ${app.get('port')}`);
            console.log(`Documentación de Swagger disponible en: http://localhost:${app.get('port')}/api-docs`);
        });
    })
    .catch((error) => {
        console.error('Error al conectar a la base de datos:', error);
    });
