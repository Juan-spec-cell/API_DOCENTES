const { DataTypes } = require('sequelize');
const db = require('../configuracion/db');
const usuario = require('./usuario');
const carrera = require('./carrera');


const estudiante = db.define(
  "Estudiante",
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
    tableName: "estudiantes"
  }
);
usuario.hasMany(estudiante, { foreignKey: 'usuarioId' });
estudiante.belongsTo(usuario, { foreignKey: 'usuarioId' });

carrera.hasMany(estudiante, { foreignKey: 'carreraId' });
estudiante.belongsTo(carrera, { foreignKey: 'carreraId' });

module.exports = estudiante;