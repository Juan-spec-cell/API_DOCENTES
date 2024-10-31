const { DataTypes } = require('sequelize');
const db = require('../configuracion/db');

const Carrera = db.define(
    "Carrera",
    {
        id_carrera: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
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

// Definimos las relaciones en este método
Carrera.associate = (models) => {
    Carrera.hasMany(models.Estudiante, { foreignKey: 'id_carrera' });
    Carrera.hasMany(models.Asignatura, { foreignKey: 'id_carrera' });
};

module.exports = Carrera;