const Usuarios = require("../modelos/usuario");
const Estudiante = require("../modelos/estudiante");
const Docente = require("../modelos/docente");
const { validationResult } = require("express-validator");
const { Op } = require("sequelize");
const { enviarCorreo } = require("../configuracion/correo");
const crypto = require("crypto");
const { getToken } = require('../configuracion/passport');
const argon2 = require('argon2');

exports.inicio = (req, res) => {
    const rutas = [
        { descripcion: "Inicial de usuarios", url: "/api/usuarios/", tipo: "GET", parametros: "", requeridos: "" },
        { url: "/api/usuarios/listar", tipo: "GET", parametros: "", requeridos: "" }
    ];
    res.json(rutas);
};

exports.listar = async (req, res) => {
    let contenido = {
        tipo: 0,
        datos: [],
        msj: [],
    };
    try {
        const data = await Usuarios.findAll();
        contenido.tipo = 1;
        contenido.datos = data.map(usuario => ({
            id_usuario: usuario.id,
            nombre: usuario.nombre,
            email: usuario.email,
            tipoUsuario: usuario.tipoUsuario
        }));
        res.status(200).json(contenido);
    } catch (error) {
        contenido.tipo = 0;
        contenido.msj = "Error al cargar los datos de usuarios";
        res.status(500).json(contenido);
    }
};

exports.guardar = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    let { nombre, email, contrasena, tipoUsuario } = req.body;
    tipoUsuario = tipoUsuario.trim().toLowerCase();
    if (tipoUsuario === "docente" || tipoUsuario === "estudiante") {
        tipoUsuario = tipoUsuario.charAt(0).toUpperCase() + tipoUsuario.slice(1);
    } else {
        return res.status(400).json({ message: "El tipo de usuario debe ser 'Docente' o 'Estudiante'." });
    }

    try {
        const hash = await argon2.hash(contrasena, {
            type: argon2.argon2id,
            memoryCost: 2 ** 16,
            timeCost: 4,
            parallelism: 2,
        });

        const nuevoUsuario = await Usuarios.create({
            nombre,
            email,
            contrasena: hash,
            tipoUsuario
        });

        res.status(201).json(nuevoUsuario);
    } catch (error) {
        res.status(500).json({ message: "Error en el servidor al guardar el usuario" });
    }
};

exports.editar = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { id_usuario } = req.query;
    const { nombre, email, tipoUsuario } = req.body;

    try {
        const usuarioExistente = await Usuarios.findOne({ where: { id: id_usuario } });
        if (!usuarioExistente) {
            return res.status(404).json({ message: "El usuario no existe" });
        }

        await Usuarios.update({
            nombre,
            email,
            tipoUsuario
        }, { where: { id: id_usuario } });

        res.status(200).json({ message: "Usuario editado correctamente" });
    } catch (error) {
        res.status(500).json({ message: "Error en el servidor al editar el usuario" });
    }
};

exports.eliminar = async (req, res) => {
    const { id_usuario } = req.query;

    try {
        const usuarioExistente = await Usuarios.findOne({ where: { id: id_usuario } });
        if (!usuarioExistente) {
            return res.status(404).json({ message: "El usuario no existe" });
        }

        await Usuarios.destroy({ where: { id: id_usuario } });
        res.status(200).json({ message: "Usuario eliminado correctamente" });
    } catch (error) {
        res.status(500).json({ message: "Error en el servidor al eliminar el usuario" });
    }
};

exports.buscarPorId = async (req, res) => {
    const { id_usuario } = req.query;

    try {
        const usuario = await Usuarios.findOne({ where: { id: id_usuario } });
        if (!usuario) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        res.status(200).json({
            id_usuario: usuario.id,
            nombre: usuario.nombre,
            email: usuario.email,
            tipoUsuario: usuario.tipoUsuario
        });
    } catch (error) {
        res.status(500).json({ message: "Error en el servidor al buscar el usuario" });
    }
};

exports.buscarPorNombre = async (req, res) => {
    const { nombre } = req.query;

    try {
        const usuarios = await Usuarios.findAll({
            where: {
                nombre: {
                    [Op.like]: `%${nombre}%`
                }
            }
        });

        if (usuarios.length === 0) {
            return res.status(404).json({ message: "No se encontraron usuarios con el nombre especificado" });
        }

        res.status(200).json(usuarios.map(usuario => ({
            id_usuario: usuario.id,
            nombre: usuario.nombre,
            email: usuario.email,
            tipoUsuario: usuario.tipoUsuario
        })));
    } catch (error) {
        res.status(500).json({ message: "Error en el servidor al buscar el usuario" });
    }
};