const ModeloCarrera = require('../modelos/carrera');
const ModeloDocente = require('../modelos/docente');
const ModeloEstudiante = require('../modelos/estudiante');
const ModeloAsignatura = require('../modelos/asignatura');
const ModeloCalificacion = require('../modelos/calificacion');
const ModeloAsistencia = require('../modelos/asistencia');
const ModeloPeriodo = require('../modelos/periodo');
const ModeloMatricula = require('../modelos/matricula');
const ModeloActividad = require('../modelos/actividad');

async function sincronizarModelos() {
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
    };

    // Establecer las relaciones llamando al método en cada modelo
    Object.values(modelos).forEach(modelo => {
        if (modelo.relaciones) {
            modelo.relaciones(modelos);
        }
    });


    try {
        await Promise.all(Object.values(modelos).map(modelo => modelo.sync()));
        console.log("Todos los modelos fueron creados correctamente");
    } catch (error) {
        console.error("Error al crear uno o más modelos:", error);
    }
}

module.exports = sincronizarModelos;