const Usuario = require('../modelos/usuario');
const Docente = require('../modelos/docente');
const Estudiante = require('../modelos/estudiante');
const argon2 = require('argon2'); // Librería para cifrar contraseñas
const jwt = require('jsonwebtoken'); // Librería para crear y verificar tokens JWT
const { enviar, errores } = require('../configuracion/ayuda'); // Funciones de ayuda para enviar respuestas y manejar errores
const { validationResult } = require('express-validator'); // Para validar entradas en las solicitudes

// Controlador para registrar un nuevo usuario
exports.registrar = async (req, res) => {
    const { nombre, email, password, tipo } = req.body; // Desestructuramos el cuerpo de la solicitud
    let contenido = {
        tipo: 0,
        datos: [],
        msj: [],
    };
    
    // Validar entradas y manejar errores
    contenido.msj = errores(validationResult(req));
    if (contenido.msj.length > 0) {
        return enviar(200, contenido, res); // Enviar errores si existen
    }

    try {
        // Verificar si el usuario ya existe en la base de datos
        const usuarioExistente = await Usuario.findOne({ where: { email } });
        if (usuarioExistente) {
            contenido.msj = "El usuario ya existe"; // Mensaje de error si el usuario ya existe
            return enviar(400, contenido, res);
        }

        // Cifrar la contraseña antes de guardar
        const hashedPassword = await argon2.hash(password);

        // Crear el nuevo usuario en la base de datos
        const usuario = await Usuario.create({ nombre, email, password: hashedPassword });

        // Crear el perfil de docente o estudiante basado en el tipo
        if (tipo === 'docente') {
            await Docente.create({ nombre, usuarioId: usuario.id });
        } else if (tipo === 'estudiante') {
            await Estudiante.create({ nombre, usuarioId: usuario.id });
        }

        // Preparar la respuesta exitosa
        contenido.tipo = 1;
        contenido.datos = usuario;
        contenido.msj = "Usuario registrado correctamente";
        enviar(200, contenido, res);
    } catch (error) {
        console.error('Error al registrar el usuario:', error); // Registrar el error en la consola
        contenido.tipo = 0;
        contenido.msj = "Error en el servidor al registrar el usuario";
        enviar(500, contenido, res); // Enviar error de servidor
    }
};

// Controlador para iniciar sesión
exports.login = async (req, res) => {
    const { email, password } = req.body; // Obtener credenciales de la solicitud
    let contenido = {
        tipo: 0,
        datos: [],
        msj: [],
    };
    
    // Validar entradas y manejar errores
    contenido.msj = errores(validationResult(req));
    if (contenido.msj.length > 0) {
        return enviar(200, contenido, res); // Enviar errores si existen
    }

    try {
        // Buscar el usuario por el email proporcionado
        const usuario = await Usuario.findOne({ where: { email } });
        // Verificar que el usuario exista y que la contraseña sea correcta
        if (!usuario || !await argon2.verify(usuario.password, password)) {
            contenido.msj = "Credenciales incorrectas"; // Mensaje de error si las credenciales son inválidas
            return enviar(401, contenido, res);
        }

        // Generar un token JWT para el usuario autenticado
        const token = jwt.sign({ id: usuario.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        contenido.tipo = 1;
        contenido.datos = { token };
        contenido.msj = "Inicio de sesión exitoso";
        enviar(200, contenido, res); // Enviar respuesta exitosa con el token
    } catch (error) {
        console.error('Error al iniciar sesión:', error); // Registrar el error en la consola
        contenido.tipo = 0;
        contenido.msj = "Error en el servidor al iniciar sesión";
        enviar(500, contenido, res); // Enviar error de servidor
    }
};

// Controlador para listar todos los usuarios
exports.listar = async (req, res) => {
    let contenido = {
        tipo: 0,
        datos: [],
        msj: [],
    };

    try {
        // Obtener todos los usuarios de la base de datos
        const data = await Usuario.findAll();
        contenido.tipo = 1;
        contenido.datos = data; // Asignar los datos obtenidos
        enviar(200, contenido, res); // Enviar respuesta exitosa con los datos
    } catch (error) {
        contenido.tipo = 0;
        contenido.msj = "Error al cargar los datos de usuarios"; // Mensaje de error si falla la consulta
        enviar(500, contenido, res); // Enviar error de servidor
    }
};
