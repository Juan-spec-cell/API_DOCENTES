const { DataTypes } = require('sequelize');
const db = require('../configuracion/db');
const Usuario = require('./usuario');

const Docente = db.define(
    "docente",
    {
        id_docente: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        nombre: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        email: {  // Cambiando "correo" a "email"
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true,
        },
        usuarioId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: Usuario,
                key: 'id'
            }
        }
    },
    {
        tableName: "docentes"
    }
);

// Definir las relaciones
Docente.relaciones = (models) => {
    Docente.hasMany(models.Asignatura, { foreignKey: 'id_docente' });
    Docente.belongsTo(Usuario, { foreignKey: 'usuarioId', unique: true });
    Usuario.hasOne(Docente, { foreignKey: 'usuarioId' });
};

module.exports = Docente;
