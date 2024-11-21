const sequelize = require('../configuracion/db');
const ModeloCarrera = require('../modelos/carrera');
const ModeloDocente = require('../modelos/docente');
const ModeloEstudiante = require('../modelos/estudiante');
const ModeloAsignatura = require('../modelos/asignatura');
const ModeloCalificacion = require('../modelos/calificacion');
const ModeloAsistencia = require('../modelos/asistencia');
const ModeloPeriodo = require('../modelos/periodo');
const ModeloMatricula = require('../modelos/matricula');
const ModeloActividad = require('../modelos/actividad');
const ModeloUsuarios = require('../modelos/usuario');

// Definición de relaciones entre los modelos
const modelos = {
    Carrera: ModeloCarrera,
    Docente: ModeloDocente,
    Estudiante: ModeloEstudiante,
    Asignatura: ModeloAsignatura,
    Calificacion: ModeloCalificacion,
    Asistencia: ModeloAsistencia,
    Periodo: ModeloPeriodo,
    Matricula: ModeloMatricula,
    Actividad: ModeloActividad,
    Usuarios: ModeloUsuarios,
};

// Establecer las relaciones llamando al método en cada modelo
Object.values(modelos).forEach(modelo => {
    if (modelo.associate) {
        modelo.associate(modelos);
    }
});

async function sincronizarModelos() {
    try {
        // Sincroniza los modelos en el orden correcto
        await modelos.Usuarios.sync();
        await modelos.Docente.sync();
        await modelos.Carrera.sync();
        await modelos.Asignatura.sync(); // Asegúrate de que Asignatura se sincronice antes que Estudiante
        await modelos.Estudiante.sync();
        await modelos.Periodo.sync();
        await modelos.Matricula.sync();
        await modelos.Actividad.sync();
        await modelos.Asistencia.sync();
        await modelos.Calificacion.sync();
        console.log("Todos los modelos fueron sincronizados correctamente");
    } catch (error) {
        console.error("Error al sincronizar uno o más modelos:", error);
    }
}

module.exports = sincronizarModelos;