const sequelize = require('sequelize');
const db = require('../configuracion/db');

const Periodo = db.define(
    "periodo",
    {
        id_periodo: {
            type: sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        nombre_periodo: {
            type: sequelize.STRING(100),
            allowNull: false,
        },
        fecha_inicio: {
            type: sequelize.DATE,
            allowNull: false,
        },
        fecha_fin: {
            type: sequelize.DATE,
            allowNull: false,
        }
    },
    {
        tableName: "periodos"
    }
);

module.exports = Periodo;
