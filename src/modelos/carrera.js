const sequelize = require('sequelize');
const db = require('../configuracion/db');

const Carrera = db.define(
    "carrera",
    {
        id_carrera: {
            type: sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        nombre_carrera: {
            type: sequelize.STRING(100),
            allowNull: false,
        },
        facultad: {
            type: sequelize.STRING(100),
            allowNull: false,
        }
    },
    {
        tableName: "carreras"
    }
);

module.exports = Carrera;
