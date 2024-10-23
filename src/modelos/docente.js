const sequelize = require('sequelize');
const db = require('../configuracion/db');

const Docente = db.define(
    "docente",
    {
        id_docente: {
            type: sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true, // Solo un campo debe tener autoIncrement
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

// Definir las relaciones
Docente.relaciones = (models) => {
    Docente.hasMany(models.Asignatura, { foreignKey: 'id_docente' });
};

module.exports = Docente;
