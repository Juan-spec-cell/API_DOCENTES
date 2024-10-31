const { DataTypes } = require('sequelize');
const db = require('../configuracion/db');

const Matricula = db.define(
    "Matricula",
    {
        id_matricula: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        id_estudiante: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'estudiantes',
                key: 'id_estudiante',
            }
        },
        id_periodo: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'periodos',
                key: 'id_periodo',
            }
        }
    },
    {
        tableName: "matriculas"
    }
);

// Definir las relaciones
Matricula.associate = (models) => {
    Matricula.belongsTo(models.Estudiante, { foreignKey: 'id_estudiante' });
    Matricula.belongsTo(models.Periodo, { foreignKey: 'id_periodo' });
};

module.exports = Matricula;