const sequelize = require('sequelize');
const db = require('../configuracion/db');
const Estudiante = require('./estudiante');
const Asignatura = require('./asignatura');

const Calificacion = db.define(
    "Calificacion",
    {
        id_calificacion: {
            type: sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        id_estudiante: {
            type: sequelize.INTEGER,
            allowNull: false,
            references: {
                model: Estudiante,
                key: 'id_estudiante',
            }
        },
        id_asignatura: {
            type: sequelize.INTEGER,
            allowNull: false,
            references: {
                model: Asignatura,
                key: 'id_asignatura',
            }
        },
        nota: {
            type: sequelize.FLOAT,
            allowNull: false,
        }
    },
    {
        tableName: "calificaciones"
    }
);

// Definición de las relaciones
Calificacion.relaciones = (modelos) => {
    Calificacion.belongsTo(modelos.Estudiante, { foreignKey: 'id_estudiante' });
    Calificacion.belongsTo(modelos.Asignatura, { foreignKey: 'id_asignatura' });
};

module.exports = Calificacion;