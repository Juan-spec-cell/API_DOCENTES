const sequelize = require("sequelize");
const argon2 = require("argon2");
const db = require("../configuracion/db");
const Roles = require('./roles');
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
    rolId: {
      type: sequelize.INTEGER,
      references: {
        model: Roles,
        key: 'id_rol',
      },
      validate: {
        isIn: {
          args: [[1, 2]], // Suponiendo que 1 es "Estudiante" y 2 es "Docente"
          msg: "El rol debe ser 'Estudiante' o 'Docente'",
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
        console.log("Rol ID:", usuario.rolId); // Para depuración
        try {
          if (usuario.rolId === 1) {
            // Crear Docente
            await Docente.create({
              id_usuario: usuario.id_usuario,
              nombre: usuario.nombre_usuario,
              apellido: usuario.apellido_usuario,
              email: usuario.email,
            });
            console.log("Docente creado exitosamente");
          } else if (usuario.rolId === 2) {
            // Crear Estudiante
            await Estudiante.create({
              id_usuario: usuario.id_usuario,
              nombre: usuario.nombre_usuario,
              apellido: usuario.apellido_usuario,
              email: usuario.email,
            });
            console.log("Estudiante creado exitosamente");
          }
        } catch (error) {
          console.error("Error al crear el rol relacionado:", error);
        }
      },
      beforeUpdate: async (usuario) => {
        if (usuario.changed('contraseña_usuario')) {
          usuario.contraseña_usuario = await argon2.hash(usuario.contraseña_usuario);
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

// Definición de las relaciones
Usuarios.relaciones = () => {
  Usuarios.belongsTo(Roles, { foreignKey: 'rolId', as: 'rol' });
};

module.exports = Usuarios;