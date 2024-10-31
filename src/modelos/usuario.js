const sequelize = require("sequelize");
const argon2 = require("argon2");
const db = require("../configuracion/db");
const Docente = require('./docente');
const Estudiante = require('./estudiante');
const Roles = require('./roles');

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
    nombre_rol: {
      type: sequelize.ENUM('Estudiante', 'Docente'),
      allowNull: false,
      validate: {
        isIn: {
          args: [['Estudiante', 'Docente']],
          msg: "El rol debe ser 'Estudiante' o 'Docente'",
        },
      },
    },
    rolId: {
      type: sequelize.INTEGER,
      references: {
        model: Roles,
        key: 'id_rol',
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
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
        if (usuario.nombre_rol === 'Estudiante') {
          // Crear Estudiante
          await Estudiante.create({
            id_usuario: usuario.id_usuario,
            nombre: usuario.nombre_usuario,
            apellido: usuario.apellido_usuario,
            email: usuario.email,
          });
        } else if (usuario.nombre_rol === 'Docente') {
          // Crear Docente
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
        if (usuario.nombre_rol === 'Estudiante') {
          // Eliminar Estudiante
          await Estudiante.destroy({
            where: { id_usuario: usuario.id_usuario }
          });
        } else if (usuario.nombre_rol === 'Docente') {
          // Eliminar Docente
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

// Define associations
Usuarios.belongsTo(Roles, { foreignKey: 'rolId' });

module.exports = Usuarios;