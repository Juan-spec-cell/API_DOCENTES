const sequelize = require("sequelize");
const db = require("../configuracion/db");
// Definición del modelo Usuarios
const usuarios = db.define(
  "Usuarios",
  {
    nombre: {
      type: sequelize.STRING(50),
      allowNull: false,
      validate: {
        notEmpty: { msg: "El campo nombre no puede ir vacío" },
      },
    },
    email: {
      type: sequelize.STRING(250),
      allowNull: false,
      unique: {
        args: true,
        msg: "El correo electrónico ya está en uso",
      },
      validate: {
        isEmail: { msg: "Debe ser un correo electrónico válido" },
        notEmpty: { msg: "El campo correo electrónico no puede ir vacío" },
      },
    },
    contrasena: {
      type: sequelize.STRING(250),
      allowNull: false,
      validate: {
        notEmpty: { msg: "El campo contraseña no puede ir vacío" },
      },
    },
    estado: {
      type: sequelize.ENUM('Activo', 'Bloqueado', 'Inactivo', 'Logeado'),
      defaultValue: 'Activo'
    },
    pin: {
      type: sequelize.STRING,
      allowNull: true,
      defaultValue: '000000'
    },
    intentos: {
      type: sequelize.INTEGER,
      defaultValue: 0
    },
    tipoUsuario: {
      type: sequelize.ENUM('Docente', 'Estudiante'),
      allowNull: false,
      validate: {
        isIn: {
          args: [['Docente', 'Estudiante']],
          msg: "El tipo de usuario debe ser 'Docente' o 'Estudiante'",
        },
      },
    },
  },
  {
    tableName: "usuarios",
    timestamps: true,
  }
);
module.exports = usuarios;