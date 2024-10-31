const { DataTypes } = require('sequelize');
const db = require('../configuracion/db');

const Periodo = db.define(
    "Periodo",
    {
        id_periodo: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
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
        tableName: "periodos"
    }
);

// Definimos las relaciones en este método
Periodo.associate = (models) => {
    Periodo.hasMany(models.Matricula, { foreignKey: 'id_periodo' });
};

module.exports = Periodo;