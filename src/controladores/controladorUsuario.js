const modelo = require("../modelos/usuario");
const { validationResult } = require("express-validator");
const { Op } = require("sequelize");
const { enviarCorreo } = require("../configuracion/correo");
const crypto = require("crypto"); // Asegúrate de importar crypto

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

    const { nombre_usuario, apellido_usuario, email, contraseña_usuario, rolId } = req.body;
    try {
        const nuevoUsuario = await modelo.create({
            nombre_usuario,
            apellido_usuario,
            email,
            contraseña_usuario,
            rolId
        });
        res.status(201).json({ message: "Usuario guardado con éxito", data: nuevoUsuario });
    } catch (error) {
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
        const data = await modelo.findAll();
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
    const { id_usuario } = req.query;
    const { nombre_usuario, apellido_usuario, email, contraseña_usuario, rolId } = req.body;
    try {
        const usuario = await modelo.findOne({ where: { id_usuario } });
        if (!usuario) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }
        usuario.nombre_usuario = nombre_usuario;
        usuario.apellido_usuario = apellido_usuario;
        usuario.email = email;
        usuario.contraseña_usuario = contraseña_usuario;
        usuario.rolId = rolId;
        await usuario.save();
        res.json({ message: "Usuario actualizado con éxito", data: usuario });
    } catch (error) {
        res.status(500).json({ message: "Error al actualizar el usuario", error: error.message });
    }
};

exports.eliminar = async (req, res) => {
    const { id_usuario } = req.query;
    try {
        const usuario = await modelo.findOne({ where: { id_usuario } });
        if (!usuario) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }
        await usuario.destroy();
        res.json({ message: "Usuario eliminado con éxito" });
    } catch (error) {
        res.status(500).json({ message: "Error al eliminar el usuario", error: error.message });
    }
};

exports.buscarPorId = async (id) => {
    return await modelo.findOne({ where: { id_usuario: id } });
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

        const usuario = await modelo.findOne({ where: { email } });
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
