const sequelize = require('sequelize');
const db = require('../configuracion/db');

const Docente = db.define(
    "docente",
    {
        id_docente: {
            type: sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        nombre: {
            type: sequelize.STRING(100),
            allowNull: false,
        },
        correo: {
            type: sequelize.STRING(100),
            allowNull: false,
            unique: true,
        }
    },
    {
        tableName: "docentes"
    }
);

// Definimos las relaciones en este método
Docente.relaciones = (models) => {
    Docente.hasMany(models.Asignatura, { foreignKey: 'id_docente' });
};

module.exports = Docente;
