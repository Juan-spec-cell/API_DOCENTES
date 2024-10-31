const Usuarios = require("../modelos/usuario");
const Estudiante = require("../modelos/estudiante");
const Docente = require("../modelos/docente");
const { validationResult } = require("express-validator");
const { Op } = require("sequelize");
const { enviarCorreo } = require("../configuracion/correo");
const crypto = require("crypto"); 

exports.inicio = (req, res) => {
    const rutas = [
        {
            descripcion: "Inicial de usuarios",
            url: "/api/usuarios/",
            tipo: "GET",
            parametros: "",
            requeridos: "",
        },
        {
            url: "/api/usuarios/lista",
            tipo: "GET",
            parametros: "",
            requeridos: "",
        },
    ];
    res.json(rutas);
};

exports.guardar = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    let { nombre_usuario, apellido_usuario, email, contraseña_usuario, nombre_rol } = req.body;

    // Validación y normalización del nombre de rol
    nombre_rol = nombre_rol.trim().toLowerCase();
    if (nombre_rol === "docente" || nombre_rol === "estudiante") {
        nombre_rol = nombre_rol.charAt(0).toUpperCase() + nombre_rol.slice(1);
    } else {
        return res.status(400).json({ message: "El rol debe ser 'Docente' o 'Estudiante'." });
    }

    try {
        const nuevoUsuario = await Usuarios.create({
            nombre_usuario,
            apellido_usuario,
            email,
            contraseña_usuario,
            nombre_rol
        });
        res.status(201).json({ message: "Usuario guardado con éxito", data: nuevoUsuario });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error al guardar el usuario", error: error.message });
    }
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
        contenido.datos = data;
        enviar(200, contenido, res);
    } catch (error) {
        contenido.tipo = 0;
        contenido.msj = "Error al cargar los datos de usuarios";
        enviar(500, contenido, res);
    }
};

// Asegúrate de que la función enviar esté definida en algún lugar de tu código
function enviar(status, contenido, res) {
    res.status(status).json(contenido);
}

exports.editar = async (req, res) => {
    const { id_usuario } = req.query; // Obtener el ID del usuario de la consulta
    const { nombre_usuario, apellido_usuario, email, contraseña_usuario, nombre_rol } = req.body;

    try {
        // Buscar el usuario existente
        const usuarioExistente = await Usuarios.findOne({ where: { id_usuario } });
        
        if (!usuarioExistente) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        // Actualizar solo los campos que se envían en el cuerpo de la solicitud
        await Usuarios.update({
            nombre_usuario: nombre_usuario || usuarioExistente.nombre_usuario,
            apellido_usuario: apellido_usuario || usuarioExistente.apellido_usuario,
            email: email || usuarioExistente.email,
            contraseña_usuario: contraseña_usuario || usuarioExistente.contraseña_usuario,
            nombre_rol: nombre_rol || usuarioExistente.nombre_rol
        }, {
            where: { id_usuario }
        });

        res.json({ message: "Usuario actualizado con éxito" });
    } catch (error) {
        res.status(500).json({ message: "Error al actualizar el usuario", error: error.message });
    }
};

exports.eliminar = async (req, res) => {
    try {
        const { id_usuario } = req.query;
        const usuario = await Usuarios.findOne({ where: { id_usuario } });

        if (!usuario) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        // Eliminar dependencias
        if (usuario.nombre_rol === 'Docente') {
            // Eliminar dependencias de Docente
            await Docente.destroy({ where: { id_usuario: usuario.id_usuario } });
        } else if (usuario.nombre_rol === 'Estudiante') {
            // Eliminar dependencias de Estudiante
            await Estudiante.destroy({ where: { id_usuario: usuario.id_usuario } });
        }

        // Eliminar el usuario
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

// Función para generar un PIN hexadecimal de 4 dígitos utilizando crypto
function generarPin() {
    return crypto.randomBytes(3).toString('hex'); // 2 bytes = 4 hex digits
}

// Recuperar contraseña
exports.recuperarContrasena = async (req, res) => {
    // Validar entrada de datos
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { email } = req.body;

        const usuario = await Usuarios.findOne({ where: { email } });
        if (!usuario) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        // Generar un nuevo PIN y actualizar el usuario
        const pinGenerado = generarPin();
        await usuario.update({ pin: pinGenerado });

        // Enviar el correo
        try {
            await enviarCorreo({
                para: email,
                asunto: 'Recuperación de contraseña',
                descripcion: 'Correo enviado para la recuperación de la contraseña',
                html: `
    <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; border-radius: 8px; width: 80%; margin: auto;">
        <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);">
            <h1 style="color: #333;">¡Hola, ${usuario.nombre_usuario}!</h1>
            <p style="color: #555;">Hemos recibido una solicitud para recuperar tu contraseña. Utiliza el siguiente PIN para continuar:</p>
            <h2 style="background-color: #e7f3fe; color: #31708f; padding: 10px; text-align: center; border-radius: 4px;">Pin: ${pinGenerado}</h2>
            <p style="color: #555;">Si no solicitaste esta recuperación, puedes ignorar este correo.</p>
            <p style="color: #777;">Gracias,<br>El equipo de soporte</p>
        </div>
    </div>
`
            });
            res.json({ message: 'Correo enviado correctamente' });
        } catch (correoError) {
            res.status(500).json({ error: 'Error al enviar el correo', details: correoError.message });
        }
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar el usuario' });
        console.log(error);
    }
};