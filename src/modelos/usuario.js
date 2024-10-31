const sequelize = require("sequelize");
const argon2 = require("argon2");
const db = require("../configuracion/db");
const Docente = require('./docente');
const Estudiante = require('./estudiante');

// Definición del modelo Usuarios
const Usuarios = db.define(
  "Usuarios",
  {
    id_usuario: {
      type: sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    nombre_usuario: {
      type: sequelize.STRING(50),
      allowNull: false,
      validate: {
        notEmpty: { msg: "El campo nombre no puede ir vacío" },
      },
    },
    apellido_usuario: {
      type: sequelize.STRING(50),
      allowNull: false,
      validate: {
        notEmpty: { msg: "El campo apellido no puede estar vacío" },
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
    contraseña_usuario: {
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
    hooks: {
      beforeCreate: async (usuario) => {
        usuario.contraseña_usuario = await argon2.hash(usuario.contraseña_usuario);
      },
      afterCreate: async (usuario) => {
        if (usuario.tipoUsuario === 'Estudiante') {
          await Estudiante.create({
            id_usuario: usuario.id_usuario,
            nombre: usuario.nombre_usuario,
            apellido: usuario.apellido_usuario,
            email: usuario.email,
            id_carrera: usuario.id_carrera // Ensure id_carrera is passed correctly
          });
        } else if (usuario.tipoUsuario === 'Docente') {
          await Docente.create({
            id_usuario: usuario.id_usuario,
            nombre: usuario.nombre_usuario,
            apellido: usuario.apellido_usuario,
            email: usuario.email,
          });
        }
      },
      beforeUpdate: async (usuario) => {
        if (usuario.changed('contraseña_usuario')) {
          usuario.contraseña_usuario = await argon2.hash(usuario.contraseña_usuario);
        }
      },
      beforeDestroy: async (usuario) => {
        if (usuario.tipoUsuario === 'Estudiante') {
          await Estudiante.destroy({
            where: { id_usuario: usuario.id_usuario }
          });
        } else if (usuario.tipoUsuario === 'Docente') {
          await Docente.destroy({
            where: { id_usuario: usuario.id_usuario }
          });
        }
      },
    },
  }
);

// Método de instancia para verificar la contraseña
Usuarios.prototype.VerificarContrasena = async function (con) {
  return await argon2.verify(this.contraseña_usuario, con);
};

// Método de instancia para cifrar la contraseña
Usuarios.prototype.CifrarContrasena = async function (con) {
  return await argon2.hash(con);
};

module.exports = Usuarios;