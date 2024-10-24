const Usuario = require('../modelos/usuario');
const Docente = require('../modelos/docente');
const Estudiante = require('../modelos/estudiante');
const argon2 = require('argon2');
const jwt = require('jsonwebtoken');
const { enviar, errores } = require('../configuracion/ayuda');
const { validationResult } = require('express-validator');

exports.registrar = async (req, res) => {
    const { nombre, email, password, tipo } = req.body;
    let contenido = {
        tipo: 0,
        datos: [],
        msj: [],
    };
    contenido.msj = errores(validationResult(req));
    if (contenido.msj.length > 0) {
        return enviar(200, contenido, res);
    }
    try {
        // Verificar si el usuario ya existe
        const usuarioExistente = await Usuario.findOne({ where: { email } });
        if (usuarioExistente) {
            contenido.msj = "El usuario ya existe";
            return enviar(400, contenido, res);
        }

        // Cifrar la contraseña
        const hashedPassword = await argon2.hash(password);

        // Crear el nuevo usuario
        const usuario = await Usuario.create({ nombre, email, password: hashedPassword });

        // Crear el perfil de docente o estudiante
        if (tipo === 'docente') {
            await Docente.create({ nombre, usuarioId: usuario.id });
        } else if (tipo === 'estudiante') {
            await Estudiante.create({ nombre, usuarioId: usuario.id });
        }

        contenido.tipo = 1;
        contenido.datos = usuario;
        contenido.msj = "Usuario registrado correctamente";
        enviar(200, contenido, res);
    } catch (error) {
        console.error('Error al registrar el usuario:', error); // Registrar el error en la consola
        contenido.tipo = 0;
        contenido.msj = "Error en el servidor al registrar el usuario";
        enviar(500, contenido, res);
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    let contenido = {
        tipo: 0,
        datos: [],
        msj: [],
    };
    contenido.msj = errores(validationResult(req));
    if (contenido.msj.length > 0) {
        return enviar(200, contenido, res);
    }
    try {
        const usuario = await Usuario.findOne({ where: { email } });
        if (!usuario || !await argon2.verify(usuario.password, password)) {
            contenido.msj = "Credenciales incorrectas";
            return enviar(401, contenido, res);
        }
        const token = jwt.sign({ id: usuario.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        contenido.tipo = 1;
        contenido.datos = { token };
        contenido.msj = "Inicio de sesión exitoso";
        enviar(200, contenido, res);
    } catch (error) {
        console.error('Error al iniciar sesión:', error); // Registrar el error en la consola
        contenido.tipo = 0;
        contenido.msj = "Error en el servidor al iniciar sesión";
        enviar(500, contenido, res);
    }
};

exports.listar = async (req, res) => {
    let contenido = {
        tipo: 0,
        datos: [],
        msj: [],
    };
    try {
        const data = await Usuario.findAll();
        contenido.tipo = 1;
        contenido.datos = data;
        enviar(200, contenido, res);
    } catch (error) {
        contenido.tipo = 0;
        contenido.msj = "Error al cargar los datos de usuarios";
        enviar(500, contenido, res);
    }
};