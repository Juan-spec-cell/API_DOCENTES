const { DataTypes } = require('sequelize');
const db = require('../configuracion/db');
const usuario = require('./usuario');

const docente = db.define(
  "Docente",
  {
    primerNombre: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    segundoNombre: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    primerApellido: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    segundoApellido: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
  },
  {
    tableName: "docentes"
  }
);

// Definir las relaciones

usuario.hasMany(docente, { foreignKey: 'usuarioId' });
docente.belongsTo(usuario, { foreignKey: 'usuarioId' });

module.exports = docente;