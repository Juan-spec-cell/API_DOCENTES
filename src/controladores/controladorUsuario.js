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
        { url: "/api/usuarios/lista", tipo: "GET", parametros: "", requeridos: "" }
    ];
    res.json(rutas);
};

exports.guardar = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    let { nombre_usuario, apellido_usuario, email, contraseña_usuario, tipoUsuario } = req.body;
    tipoUsuario = tipoUsuario.trim().toLowerCase();
    if (tipoUsuario === "docente" || tipoUsuario === "estudiante") {
        tipoUsuario = tipoUsuario.charAt(0).toUpperCase() + tipoUsuario.slice(1);
    } else {
        return res.status(400).json({ message: "El tipo de usuario debe ser 'Docente' o 'Estudiante'." });
    }

    try {
        const nuevoUsuario = await Usuarios.create({ nombre_usuario, apellido_usuario, email, contraseña_usuario, tipoUsuario });
        res.status(201).json({ message: "Usuario guardado con éxito", data: nuevoUsuario });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error al guardar el usuario", error: error.message });
    }
};

exports.listar = async (req, res) => {
    let contenido = { tipo: 0, datos: [], msj: [] };
    try {
        const data = await Usuarios.findAll();
        contenido.tipo = 1;
        contenido.datos = data;
        enviar(200, contenido, res);
    } catch (error) {
        contenido.tipo = 0;
        contenido.msj = "Error al cargar los datos de usuarios";
        enviar(500, contenido, res);
        console.log(error);
    }
};

function enviar(status, contenido, res) {
    res.status(status).json(contenido);
}

exports.editar = async (req, res) => {
    const { id_usuario } = req.query;
    const { nombre_usuario, apellido_usuario, email, contraseña_usuario, tipoUsuario } = req.body;

    try {
        const usuarioExistente = await Usuarios.findOne({ where: { id_usuario } });
        if (!usuarioExistente) return res.status(404).json({ message: "Usuario no encontrado" });

        await Usuarios.update({
            nombre_usuario: nombre_usuario || usuarioExistente.nombre_usuario,
            apellido_usuario: apellido_usuario || usuarioExistente.apellido_usuario,
            email: email || usuarioExistente.email,
            contraseña_usuario: contraseña_usuario || usuarioExistente.contraseña_usuario,
            tipoUsuario: tipoUsuario || usuarioExistente.tipoUsuario
        }, { where: { id_usuario } });

        res.json({ message: "Usuario actualizado con éxito" });
    } catch (error) {
        res.status(500).json({ message: "Error al actualizar el usuario", error: error.message });
    }
};

exports.eliminar = async (req, res) => {
    try {
        const { id_usuario } = req.query;
        const usuario = await Usuarios.findOne({ where: { id_usuario } });

        if (!usuario) return res.status(404).json({ message: "Usuario no encontrado" });

        if (usuario.tipoUsuario === 'Docente') {
            await Docente.destroy({ where: { id_usuario: usuario.id_usuario } });
        } else if (usuario.tipoUsuario === 'Estudiante') {
            await Estudiante.destroy({ where: { id_usuario: usuario.id_usuario } });
        }

        await usuario.destroy();
        res.json({ message: "Usuario eliminado con éxito" });
    } catch (error) {
        res.status(500).json({ message: "Error al eliminar el usuario", error: error.message });
        console.log(error);
    }
};

exports.buscarPorId = async (id) => {
    return await Usuarios.findOne({ where: { id_usuario: id } });
};

function generarPin() {
    return crypto.randomBytes(3).toString('hex');
}

exports.recuperarContrasena = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
        const { email } = req.body;
        const usuario = await Usuarios.findOne({ where: { email } });
        if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });

        const pinGenerado = generarPin();
        await usuario.update({ pin: pinGenerado });

        await enviarCorreo({
            para: email,
            asunto: 'Recuperación de contraseña',
            descripcion: 'Correo enviado para la recuperación de la contraseña',
            html: `
                <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; border-radius: 8px; width: 80%; margin: auto;">
                    <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);">
                        <h1 style="color: #333;">¡Hola, ${usuario.nombre}!</h1>
                        <p style="color: #555;">Hemos recibido una solicitud para recuperar tu contraseña. Utiliza el siguiente PIN para continuar:</p>
                        <h2 style="background-color: #e7f3fe; color: #31708f; padding: 10px; text-align: center; border-radius: 4px;">Pin: ${pinGenerado}</h2>
                        <p style="color: #555;">Si no solicitaste esta recuperación, puedes ignorar este correo.</p>
                        <p style="color: #777;">Gracias,<br>El equipo de soporte</p>
                    </div>
                </div>`
        });
        res.json({ message: 'Correo enviado correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar el usuario' });
        console.log(error);
    }
};

exports.actualizarContrasena = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json(errors.array());
    }

    try {
        const { email, contrasena, pin } = req.body;
        const usuario = await Usuarios.findOne({ where: { email: email } });
        if (!usuario) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        else if (usuario.pin != pin) {
            return res.status(404).json({ error: 'El pin no responde'});
        }
        const hash = await argon2.hash(contrasena, {
            type: argon2.argon2id,
            memoryCost: 2 ** 16,
            timeCost: 4,
            parallelism: 2
        });
        await usuario.update({ contrasena: hash });
        res.json({ message: 'Usuario actualizado correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar el usuario' });
    }
};

exports.iniciarSesion = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json(errors.array());

    try {
        const { login, contrasena } = req.body;
        const usuario = await Usuarios.findOne({
            attributes: ['nombre', 'tipoUsuario', 'email', 'contrasena'],
            where: {
                [Op.or]: [{ email: { [Op.like]: login } }, { nombre: { [Op.like]: login } }],
                estado: 'Activo'
            }
        });
        if (!usuario) return res.status(404).json({ error: 'Usuario o contraseña es incorrecto' });

        if (await argon2.verify(usuario.contrasena, contrasena)) {
            const Usuario = {
                login: usuario.nombre,
                tipo: usuario.tipoUsuario,
                correo: usuario.email,
                datoPersonales: usuario.tipoUsuario === 'Docente' ? usuario.docente : usuario.estudiante
            };
            const Token = getToken({ id: usuario.id_usuario });
            return res.json({ Token, Usuario });
        } else {
            return res.status(404).json({ error: 'Usuario o contraseña incorrecta' });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Error al iniciar sesión' });
        console.log(error);
    }
};