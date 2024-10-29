const { DataTypes } = require('sequelize');
const db = require('../configuracion/db');

const Docente = db.define(
  "Docente",
  {
    id_docente: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    id_usuario: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'usuarios',
        key: 'id_usuario',
      }
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    apellido: {
      type: DataTypes.STRING(100),
      allowNull: false,
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
Docente.relaciones = (models) => {
  Docente.hasMany(models.Asignatura, { foreignKey: 'id_docente' });
};

module.exports = Docente;
