const sequelize = require('sequelize');
const db = require('../configuracion/db');


const Actividad = db.define(
    "actividad",
    {
        id_actividad: {
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
        tipo_actividad: {
            type: sequelize.ENUM('Acumulativo', 'Examen'),
            allowNull: false,
        },
        fecha: {
            type: sequelize.DATE,
            allowNull: false,
        }
    },
    {
        tableName: "actividades"
    }
);

module.exports = Actividad;
