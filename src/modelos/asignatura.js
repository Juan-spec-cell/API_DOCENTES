const sequelize = require('sequelize');
const db = require('../configuracion/db');

const Asignatura = db.define(
    "asignatura",
    {
        id_asignatura: {
            type: sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        nombre_asignatura: {
            type: sequelize.STRING(100),
            allowNull: false,
        },
        id_docente: {
            type: sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'docentes',
                key: 'id_docente',
            }
        },
        id_carrera: {
            type: sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'carreras',
                key: 'id_carrera',
            }
        }
    },
    {
        tableName: "asignaturas"
    }
);

module.exports = Asignatura;
