const { DataTypes } = require('sequelize');
const db = require('../configuracion/db');
const asignatura = require('./asignatura');
const estudiante = require('./estudiante');

const asistencia = db.define(
    "Asistencia",
    {
        fecha: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        estado: {
            type: DataTypes.ENUM('Presente', 'Ausente', 'Tardanza'),
            allowNull: false,
        }
    },
    {
        tableName: "asistencias"
    }
);

// Definimos las relaciones en este método
estudiante.hasMany(asistencia, { foreignKey: 'estudianteId' });
asistencia.belongsTo(estudiante, { foreignKey: 'estudianteId' });

asignatura.hasMany(asistencia, { foreignKey: 'asignaturaId' });
asistencia.belongsTo(asignatura, { foreignKey: 'asignaturaId' });


module.exports = asistencia;