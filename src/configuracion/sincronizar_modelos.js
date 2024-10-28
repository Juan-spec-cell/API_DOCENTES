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

// Definir las relaciones para el modelo de usuario
ModeloUsuarios.relaciones = function(modelos) {
    this.hasMany(modelos.Calificacion, { foreignKey: 'usuarioId' });
    this.hasOne(modelos.Docente, { foreignKey: 'usuarioId' });
    this.hasOne(modelos.Estudiante, { foreignKey: 'usuarioId' });
};

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
    Usuario: ModeloUsuarios,
};

// Establecer las relaciones llamando al método en cada modelo
Object.values(modelos).forEach(modelo => {
    if (modelo.relaciones) {
        modelo.relaciones(modelos);
    }
});

async function sincronizarModelos() {
    try {
        // Sincroniza primero el modelo de Usuarios
        await modelos.Usuario.sync();

        // Luego, sincroniza el resto de los modelos
        await Promise.all(Object.values(modelos).filter(modelo => modelo !== modelos.Usuario).map(modelo => modelo.sync()));

        console.log("Todos los modelos fueron sincronizados correctamente");
    } catch (error) {
        console.error("Error al sincronizar uno o más modelos:", error);
    }
}


module.exports = sincronizarModelos;
