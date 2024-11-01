const { DataTypes } = require('sequelize');
const db = require('../configuracion/db');

const periodo = db.define(
    "Periodo",
    {
        nombre_periodo: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        fecha_inicio: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        fecha_fin: {
            type: DataTypes.DATE,
            allowNull: false,
        }
    },
    {
        tableName: "periodos",
        timestamps: true
    }
);

module.exports = periodo;