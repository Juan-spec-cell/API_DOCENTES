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

// Definimos las relaciones en este método
Carrera.relaciones = (models) => {
    Carrera.hasMany(models.Estudiante, { foreignKey: 'id_carrera' });
    Carrera.hasMany(models.Asignatura, { foreignKey: 'id_carrera' });
};

module.exports = Carrera;
