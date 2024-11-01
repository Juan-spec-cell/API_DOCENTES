const { DataTypes } = require('sequelize');
const db = require('../configuracion/db');
const estudiante = require('./estudiante');
const asignatura = require('./asignatura');
const actividad = require('./actividad');

const calificacion = db.define(
    "Calificacion",
    {
        nota: {
            type: DataTypes.FLOAT,
            allowNull: false,
        }
    },
    {
        tableName: "calificaciones"
    }
);

estudiante.hasMany(calificacion, { foreignKey: 'estudianteId' });
calificacion.belongsTo(estudiante, { foreignKey: 'estudianteId' });

asignatura.hasMany(calificacion, { foreignKey: 'asignaturaId' });
calificacion.belongsTo(asignatura, { foreignKey: 'asignaturaId' });

actividad.hasMany(calificacion, { foreignKey: 'actividadId' });
calificacion.belongsTo(actividad, { foreignKey: 'actividadId' });

module.exports = calificacion;