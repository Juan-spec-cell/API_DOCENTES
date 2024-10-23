const sequelize = require('sequelize');
const db = require('../configuracion/db');

const Matricula = db.define(
    "matricula",
    {
        id_matricula: {
            type: sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        id_estudiante: {
            type: sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'estudiantes',
                key: 'id_estudiante',
            }
        },
        id_periodo: {
            type: sequelize.INTEGER,
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

// Definimos las relaciones en este método
Matricula.relaciones = (models) => {
    Matricula.belongsTo(models.Estudiante, { foreignKey: 'id_estudiante' });
    Matricula.belongsTo(models.Periodo, { foreignKey: 'id_periodo' });
};

module.exports = Matricula;
