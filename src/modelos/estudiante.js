const { DataTypes } = require('sequelize');
const db = require('../configuracion/db');

const Estudiante = db.define(
  "Estudiante",
  {
    id_estudiante: {
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
    id_carrera: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'carreras',
        key: 'id_carrera',
      }
    }
  },
  {
    tableName: "estudiantes"
  }
);

// Definimos las relaciones en este método
Estudiante.associate = (models) => {
    Estudiante.belongsTo(models.Carrera, { foreignKey: 'id_carrera' });
    Estudiante.hasMany(models.Matricula, { foreignKey: 'id_estudiante' });
};

module.exports = Estudiante;