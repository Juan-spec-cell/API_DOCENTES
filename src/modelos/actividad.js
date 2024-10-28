const sequelize = require('sequelize');
const db = require('../configuracion/db');
const Asignatura = require('./asignatura');

const Actividad = db.define(
    "Actividad",
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
                model: Asignatura,
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

// Definición de las relaciones
Actividad.relaciones = () => {
    Actividad.belongsTo(Asignatura, { foreignKey: 'id_asignatura' });
};

module.exports = Actividad;