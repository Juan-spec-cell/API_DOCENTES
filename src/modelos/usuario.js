const sequelize = require("sequelize");
const bcrypt = require("bcrypt");
const db = require("../configuracion/db");
const Roles = require('./roles');

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
    correo_electronico_usuario: {
      type: sequelize.STRING(250),
      allowNull: true,
    },
    codigo_pais_telefono_usuario: {
      type: sequelize.STRING(5),
      allowNull: true,
    },
    telefono_usuario: {
      type: sequelize.STRING(20),
      allowNull: true,
    },
    genero_usuario: {
      type: sequelize.ENUM("M", "F"),
      allowNull: false,
      validate: {
        notEmpty: { msg: "El campo genero no puede ir vacío." },
      },
    },
    contraseña_usuario: {
      type: sequelize.STRING(250),
      allowNull: false,
      validate: {
        notEmpty: { msg: "El campo contraseña no puede ir vacío." },
      },
    },
    imagen: {
      type: sequelize.STRING(250),
      allowNull: true,
    },
    rolId: {
      type: sequelize.INTEGER,
      references: {
        model: Roles,
        key: 'id_rol',
      },
    },
  },
  {
    tableName: "usuarios",
    timestamps: true,
    hooks: {
      beforeCreate(usuarios) {
        usuarios.contraseña_usuario = bcrypt.hashSync(
          usuarios.contraseña_usuario,
          bcrypt.genSaltSync(10)
        );
      },
      beforeUpdate(usuarios) {
        usuarios.contraseña_usuario = bcrypt.hashSync(
          usuarios.contraseña_usuario,
          bcrypt.genSaltSync(10)
        );
      },
    },
  }
);

Usuarios.prototype.VerificarContrasena = (con, com) => {
  console.log(con);
  console.log(com);
  return bcrypt.compareSync(con, com);
};

Usuarios.prototype.CifrarContrasena = (con) => {
  console.log(con);
  const hash = bcrypt.hashSync(con, 10);
  return hash;
};

// Definición de las relaciones
Usuarios.relaciones = () => {
  Usuarios.belongsTo(Roles, { foreignKey: 'rolId', as: 'rol' });
};

module.exports = Usuarios;