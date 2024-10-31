const { DataTypes } = require('sequelize');
const db = require('../configuracion/db');
const Estudiante = require('./estudiante');
const Asignatura = require('./asignatura');

const Calificacion = db.define(
    "Calificacion",
    {
        id_calificacion: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        id_estudiante: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: Estudiante,
                key: 'id_estudiante',
            }
        },
        id_asignatura: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: Asignatura,
                key: 'id_asignatura',
            }
        },
        nota: {
            type: DataTypes.FLOAT,
            allowNull: false,
        }
    },
    {
        tableName: "calificaciones"
    }
);

// Definición de las relaciones
Calificacion.associate = (modelos) => {
    Calificacion.belongsTo(modelos.Estudiante, { foreignKey: 'id_estudiante' });
    Calificacion.belongsTo(modelos.Asignatura, { foreignKey: 'id_asignatura' });
};

module.exports = Calificacion;