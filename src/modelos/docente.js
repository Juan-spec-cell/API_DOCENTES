const { DataTypes } = require('sequelize');
const db = require('../configuracion/db');


const Docente = db.define(
    "docente",
    {
        id_docente: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        nombre: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        email: {  // Cambiando "correo" a "email"
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true,
        },
    },
    {
        tableName: "docentes"
    }
);

// Definir las relaciones
Docente.relaciones = (models) => {
    Docente.hasMany(models.Asignatura, { foreignKey: 'id_docente' });
};

module.exports = Docente;
