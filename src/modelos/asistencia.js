const sequelize = require('sequelize');
const db = require('../configuracion/db');

const Asistencia = db.define(
    "asistencia",
    {
        id_asistencia: {
            type: sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        id_estudiante: {
            type: sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'estudiantes',
                key: 'id_estudiante',
            }
        },
        id_asignatura: {
            type: sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'asignaturas',
                key: 'id_asignatura',
            }
        },
        fecha: {
            type: sequelize.DATE,
            allowNull: false,
        },
        estado: {
            type: sequelize.ENUM('Presente', 'Ausente', 'Tardanza'),
            allowNull: false,
        }
    },
    {
        tableName: "asistencias"
    }
);

module.exports = Asistencia;
