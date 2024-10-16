const sequelize = require('sequelize');
const db = require('../configuracion/db');

const Calificacion = db.define(
    "calificacion",
    {
        id_calificacion: {
            type: sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        id_asignatura: {
            type: sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'asignaturas',
                key: 'id_asignatura',
            }
        },
        id_estudiante: {
            type: sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'estudiantes',
                key: 'id_estudiante',
            }
        },
        calificacion: {
            type: sequelize.DECIMAL(5, 2),
            allowNull: false,
        },
        fecha: {
            type: sequelize.DATE,
            allowNull: false,
        }
    },
    {
        tableName: "calificaciones"
    }
);

module.exports = Calificacion;
