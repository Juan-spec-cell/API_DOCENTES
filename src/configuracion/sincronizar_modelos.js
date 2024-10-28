const dbconnect = require('../configuracion/db'); 

const ModeloCarrera = require('../modelos/carrera');
const ModeloDocente = require('../modelos/docente');
const ModeloEstudiante = require('../modelos/estudiante');
const ModeloAsignatura = require('../modelos/asignatura');
const ModeloCalificacion = require('../modelos/calificacion');
const ModeloAsistencia = require('../modelos/asistencia');
const ModeloPeriodo = require('../modelos/periodo');
const ModeloMatricula = require('../modelos/matricula');
const ModeloActividad = require('../modelos/actividad');
const ModeloUsuarios = require('../modelos/usuario'); // Corregido: Asegúrate de que esta ruta sea correcta
const ModeloRoles = require('../modelos/roles');

// Definir las relaciones para el modelo de usuario
ModeloUsuarios.relaciones = function(modelos) {
    this.belongsTo(modelos.Roles, { foreignKey: 'rolId', as: 'rol' });
};

// Definir las relaciones para el modelo de roles
ModeloRoles.relaciones = function(modelos) {
    this.hasMany(modelos.Usuarios, { foreignKey: 'rolId', as: 'usuarios' });
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
    Usuarios: ModeloUsuarios,
    Roles: ModeloRoles,
};

// Establecer las relaciones llamando al método en cada modelo
Object.values(modelos).forEach(modelo => {
    if (modelo.relaciones) {
        modelo.relaciones(modelos);
    }
});

async function sincronizarModelos() {
    try {
        // Sincroniza primero el modelo de Usuarios y Roles
        await modelos.Roles.sync();
        await modelos.Usuarios.sync();

        // Luego, sincroniza el resto de los modelos
        await Promise.all(Object.values(modelos).filter(modelo => modelo !== modelos.Usuarios && modelo !== modelos.Roles).map(modelo => modelo.sync()));

        console.log("Todos los modelos fueron sincronizados correctamente");
    } catch (error) {
        console.error("Error al sincronizar uno o más modelos:", error);
    }
}

module.exports = sincronizarModelos;