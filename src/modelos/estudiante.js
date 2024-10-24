const { DataTypes } = require('sequelize');
const db = require('../configuracion/db');
const Usuario = require('./usuario');

const Estudiante = db.define(
    "estudiante",
    {
        id_estudiante: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        nombre_estudiante: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        email: {  // Cambiando "correo" a "email"
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true,
        },
        id_carrera: {
            type: DataTypes.INTEGER,
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
    Estudiante.belongsTo(Usuario, { foreignKey: 'usuarioId', unique: true });
    Usuario.hasOne(Estudiante, { foreignKey: 'usuarioId' });
};

module.exports = Estudiante;
