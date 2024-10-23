const sequelize = require('sequelize');
const db = require('../configuracion/db');

const Estudiante = db.define(
    "estudiante",
    {
        id_estudiante: {
            type: sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        nombre_estudiante: {
            type: sequelize.STRING(100),
            allowNull: false,
        },
        correo: {
            type: sequelize.STRING(100),
            allowNull: false,
            unique: true,
        },
        id_carrera: {
            type: sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'carreras', // Nombre de la tabla a la que se refiere
                key: 'id_carrera',
            }
        }
    },
    {
        tableName: "estudiantes"
    }
);

// Definimos las relaciones en este método
Estudiante.relaciones = (models) => {
    Estudiante.belongsTo(models.Carrera, { foreignKey: 'id_carrera' });
    Estudiante.hasMany(models.Calificacion, { foreignKey: 'id_estudiante' });
    Estudiante.hasMany(models.Asistencia, { foreignKey: 'id_estudiante' });
};

module.exports = Estudiante;
