const sequelize = require('sequelize');
const argon2 = require('argon2');
const db = require('../configuracion/db');

const Usuario = db.define(
    "usuario",
    {
        id_usuario: {
            type: sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        nombre: {
            type: sequelize.STRING(100),
            allowNull: false,
        },
        email: {
            type: sequelize.STRING(100),
            allowNull: false,
            unique: true,
        },
        password: {
            type: sequelize.STRING(100),
            allowNull: false,
            validate: {
                notEmpty: { msg: "El campo contraseña no puede ir vacío." },
            },
        },
        tipo: {
            type: sequelize.STRING(50),
            allowNull: false,
            validate: {
                isIn: [['docente', 'estudiante']],
                notEmpty: { msg: "El campo tipo no puede ir vacío." },
            }
        },
        imagen: {
            type: sequelize.STRING(250),
            allowNull: true,
        },
    },
    {
        tableName: "usuarios",
        timestamps: true,
        hooks: {
            beforeCreate: async (usuario) => {
                usuario.password = await argon2.hash(usuario.password);
            },
            beforeUpdate: async (usuario) => {
                if (usuario.changed('password')) {
                    usuario.password = await argon2.hash(usuario.password);
                }
            },
        },
    }
);

Usuario.prototype.VerificarContrasena = async function(con, com) {
    return await argon2.verify(com, con);
};

Usuario.prototype.CifrarContrasena = async function(con) {
    return await argon2.hash(con);
};

module.exports = Usuario;