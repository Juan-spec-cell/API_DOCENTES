const { Sequelize, DataTypes } = require('sequelize');
const db = require('../configuracion/db');

const Roles = db.define('Roles', {
  id_rol: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  nombre_rol: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
}, {
  tableName: 'roles',
  timestamps: true,
});

module.exports = Roles;