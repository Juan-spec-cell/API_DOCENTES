const { DataTypes } = require('sequelize');
const db = require('../configuracion/db');

const carrera = db.define(
    "Carrera",
    {
        nombre_carrera: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        facultad: {
            type: DataTypes.STRING(100),
            allowNull: false,
        }
    },
    {
        tableName: "carreras"
    }
);

module.exports = carrera;