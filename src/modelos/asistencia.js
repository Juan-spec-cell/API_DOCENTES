const { DataTypes } = require('sequelize');
const db = require('../configuracion/db');

const Asistencia = db.define(
    "Asistencia",
    {
        id_asistencia: {
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
        id_asignatura: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'asignaturas',
                key: 'id_asignatura',
            }
        },
        fecha: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        estado: {
            type: DataTypes.ENUM('Presente', 'Ausente', 'Tardanza'),
            allowNull: false,
        }
    },
    {
        tableName: "asistencias"
    }
);

// Definimos las relaciones en este método
Asistencia.associate = (models) => {
    Asistencia.belongsTo(models.Estudiante, { foreignKey: 'id_estudiante' });
    Asistencia.belongsTo(models.Asignatura, { foreignKey: 'id_asignatura' });
};

module.exports = Asistencia;