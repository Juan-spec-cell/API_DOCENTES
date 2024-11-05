const Usuarios = require("../modelos/usuario"); // Importa el modelo de Usuarios
const ModeloDocente = require("../modelos/docente"); // Importa el modelo de Docente
const ModeloEstudiante = require("../modelos/estudiante"); // Importa el modelo de Estudiante
const { validationResult } = require("express-validator"); // Importa el validador de express
const { Op } = require("sequelize"); // Importa operadores de Sequelize
const { enviarCorreo } = require("../configuracion/correo"); // Importa la función para enviar correos
const crypto = require("crypto"); // Importa el módulo de criptografía
const { getToken } = require('../configuracion/passport'); // Importa la función para obtener tokens
const argon2 = require('argon2'); // Importa el módulo de hashing Argon2

// Muestra las rutas disponibles
exports.inicio = (req, res) => {
    const rutas = [
        { descripcion: "Inicial de usuarios", url: "/api/usuarios/", tipo: "GET", parametros: "", requeridos: "" },
        { url: "/api/usuarios/listar", tipo: "GET", parametros: "", requeridos: "" }
    ];
    res.json(rutas); // Responde con las rutas en formato JSON
};

// Lista todos los usuarios
exports.listar = async (req, res) => {
    let contenido = {
        tipo: 0,
        datos: [],
        msj: [],
    };
    try {
        const data = await Usuarios.findAll(); // Obtiene todos los usuarios
        contenido.tipo = 1;
        contenido.datos = data.map(usuario => ({
            id_usuario: usuario.id,
            nombre: usuario.nombre,
            email: usuario.email,
            tipoUsuario: usuario.tipoUsuario
        }));
        res.status(200).json(contenido); // Responde con los datos de los usuarios
    } catch (error) {
        contenido.tipo = 0;
        contenido.msj = "Error al cargar los datos de usuarios";
        res.status(500).json(contenido); // Responde con un error
    }
};
// Edita un usuario existente
exports.editar = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() }); // Valida los datos de entrada

    const { id_usuario } = req.query;
    const { nombre, email, tipoUsuario } = req.body;

    try {
        const usuarioExistente = await Usuarios.findOne({ where: { id: id_usuario } });
        if (!usuarioExistente) {
            return res.status(404).json({ message: "El usuario no existe" }); // Verifica si el usuario existe
        }

        await Usuarios.update({
            nombre,
            email,
            tipoUsuario
        }, { where: { id: id_usuario } }); // Actualiza el usuario

        res.status(200).json({ message: "Usuario editado correctamente" }); // Responde con éxito
    } catch (error) {
        res.status(500).json({ message: "Error en el servidor al editar el usuario" }); // Responde con un error
    }
};

// Elimina un usuario
exports.eliminar = async (req, res) => {
    const { id_usuario } = req.query;

    try {
        const usuarioExistente = await Usuarios.findOne({ where: { id: id_usuario } });
        if (!usuarioExistente) {
            return res.status(404).json({ message: "El usuario no existe" }); // Verifica si el usuario existe
        }

        // Elimina registros relacionados en Docente y Estudiante
        await ModeloDocente.destroy({ where: { usuarioId: id_usuario } });
        await ModeloEstudiante.destroy({ where: { usuarioId: id_usuario } });

        // Elimina el usuario
        await Usuarios.destroy({ where: { id: id_usuario } });
        res.status(200).json({ message: "Usuario eliminado correctamente" }); // Responde con éxito
    } catch (error) {
        res.status(500).json({ message: "Error en el servidor al eliminar el usuario" }); // Responde con un error
        console.log(error); 
    }
};

// Busca un usuario por ID
exports.buscarPorId = async (req, res) => {
    const { id_usuario } = req.query;

    try {
        const usuario = await Usuarios.findOne({ where: { id: id_usuario } });
        if (!usuario) {
            return res.status(404).json({ message: "Usuario no encontrado" }); // Verifica si el usuario existe
        }

        res.status(200).json({
            id_usuario: usuario.id,
            nombre: usuario.nombre,
            email: usuario.email,
            tipoUsuario: usuario.tipoUsuario
        }); // Responde con los datos del usuario
    } catch (error) {
        res.status(500).json({ message: "Error en el servidor al buscar el usuario" }); // Responde con un error
    }
};

// Busca usuarios por nombre
exports.buscarPorNombre = async (req, res) => {
    const { nombre } = req.query;

    try {
        const usuarios = await Usuarios.findAll({
            where: {
                nombre: {
                    [Op.like]: `%${nombre}%`
                }
            }
        }); // Busca usuarios por nombre

        if (usuarios.length === 0) {
            return res.status(404).json({ message: "No se encontraron usuarios con el nombre especificado" }); // Verifica si hay usuarios
        }

        res.status(200).json(usuarios.map(usuario => ({
            id_usuario: usuario.id,
            nombre: usuario.nombre,
            email: usuario.email,
            tipoUsuario: usuario.tipoUsuario
        }))); // Responde con los datos de los usuarios
    } catch (error) {
        res.status(500).json({ message: "Error en el servidor al buscar el usuario" }); // Responde con un error
    }
};

// Genera un PIN aleatorio
function generarPin() {
    return crypto.randomBytes(3).toString('hex');
}

// Recupera la contraseña de un usuario
exports.recuperarContrasena = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() }); // Valida los datos de entrada

    try {
        const { email } = req.body;
        const usuario = await Usuarios.findOne({ where: { email } });
        if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' }); // Verifica si el usuario existe

        const pinGenerado = generarPin();
        await usuario.update({ pin: pinGenerado }); // Actualiza el PIN del usuario

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
        }); // Envía un correo con el PIN
        res.json({ message: 'Correo enviado correctamente' }); // Responde con éxito
    } catch (error) {
        res.status(500).json({ error: 'Error al enviar el correo' }); // Responde con un error
        console.log(error);
    }
};

// Actualiza la contraseña de un usuario
exports.actualizarContrasena = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json(errors.array()); // Valida los datos de entrada
    }

    try {
        const { email, contrasena, pin } = req.body;
        const usuario = await Usuarios.findOne({ where: { email: email } });
        if (!usuario) {
            return res.status(404).json({ error: 'Usuario no encontrado' }); // Verifica si el usuario existe
        }
        else if (usuario.pin != pin) {
            return res.status(404).json({ error: 'El pin no responde' }); // Verifica si el PIN es correcto
        }
        const hash = await argon2.hash(contrasena, {
            type: argon2.argon2id,
            memoryCost: 2 ** 16,
            timeCost: 4,
            parallelism: 2
        }); // Hashea la nueva contraseña
        await usuario.update({ contrasena: hash }); // Actualiza la contraseña del usuario
        res.json({ message: 'Usuario actualizado correctamente' }); // Responde con éxito
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar el usuario' }); // Responde con un error
    }
};

// Inicia sesión de un usuario
exports.iniciarSesion = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json(errors.array()); // Valida los datos de entrada

    try {
        const { login, contrasena } = req.body;
        const usuario = await Usuarios.findOne({
            attributes: ['nombre', 'tipoUsuario', 'email', 'contrasena'],
            where: {
                [Op.or]: [{ email: { [Op.like]: login } }, { nombre: { [Op.like]: login } }],
                estado: 'Activo'
            }
        }); // Busca el usuario por email o nombre
        if (!usuario) return res.status(404).json({ error: 'Usuario o contraseña es incorrecto' }); // Verifica si el usuario existe

        if (await argon2.verify(usuario.contrasena, contrasena)) {
            const Usuario = {
                login: usuario.nombre,
                tipo: usuario.tipoUsuario,
                correo: usuario.email,
                datoPersonales: usuario.tipoUsuario === 'Docente' ? usuario.docente : usuario.estudiante
            }; // Crea el objeto de usuario
            const Token = getToken({ id: usuario.id_usuario }); // Genera el token
            return res.json({ Token, Usuario }); // Responde con el token y los datos del usuario
        } else {
            return res.status(404).json({ error: 'Usuario o contraseña incorrecta' }); // Verifica si la contraseña es correcta
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Error al iniciar sesión' }); // Responde con un error
        console.log(error);
    }
};