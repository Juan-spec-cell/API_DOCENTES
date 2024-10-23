const ModeloUsuario = require('../modelos/usuario');
const { enviar, errores } = require('../configuracion/ayuda');
const { validationResult } = require('express-validator');
const argon2 = require('argon2');
const jwt = require('jsonwebtoken');
const { getToken } = require('../configuracion/autenticacion');

exports.registro = async (req, res) => {
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
        const hashedPassword = await argon2.hash(password);
        const usuario = await ModeloUsuario.create({ nombre, email, password: hashedPassword, tipo });
        contenido.tipo = 1;
        contenido.datos = usuario;
        contenido.msj = "Usuario registrado exitosamente";
        enviar(201, contenido, res);
    } catch (error) {
        contenido.tipo = 0;
        contenido.msj = "Error al registrar usuario";
        enviar(500, contenido, res);
    }
};

exports.login = async (req, res) => {
    const { email, password, tipo } = req.body;
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
        const usuario = await ModeloUsuario.findOne({ where: { email, tipo } });
        if (!usuario) {
            contenido.msj = "Usuario no encontrado";
            return enviar(400, contenido, res);
        }
        const isMatch = await argon2.verify(usuario.password, password);
        if (!isMatch) {
            contenido.msj = "Contraseña incorrecta";
            return enviar(400, contenido, res);
        }
        const token = getToken({ id: usuario.id_usuario });
        contenido.tipo = 1;
        contenido.datos = { token };
        contenido.msj = "Inicio de sesión exitoso";
        enviar(200, contenido, res);
    } catch (error) {
        contenido.tipo = 0;
        contenido.msj = "Error al iniciar sesión";
        enviar(500, contenido, res);
    }
};

exports.listar = async (req, res) => {
    const lista = await ModeloUsuario.findAll();
    res.json(lista);
};

exports.editar = async (req, res) => {
    const { id } = req.query;
    const {
        nombre,
        email,
        password,
        tipo,
        imagen
    } = req.body;
    try {
        var buscar_usuario = await ModeloUsuario.findOne({ where: { id_usuario: id } });
        if (!buscar_usuario) {
            res.json({ msj: "El id de usuario no existe" });
        } else {
            buscar_usuario.nombre = nombre;
            buscar_usuario.email = email;
            buscar_usuario.password = password;
            buscar_usuario.tipo = tipo;
            buscar_usuario.imagen = imagen;
            await buscar_usuario.save()
            .then((data) => {
                res.json(data);
            })
            .catch((er) => {
                res.json(er);
            });
        }
    } catch (error) {
        res.json({ msj: "Error de servidor" });
    }
};

exports.eliminar = async (req, res) => {
    const { id } = req.query;
    const validacion = validationResult(req);
    if (validacion.errors.length > 0) {
        var msjerror = "";
        validacion.errors.forEach((r) => {
            msjerror = msjerror + r.msg + ". ";
        });
        res.json({ msj: "Hay errores en la petición", error: msjerror });
    } else {
        try {
            var busqueda = await ModeloUsuario.findOne({ where: { id_usuario: id } });
            if (!busqueda) {
                res.json({ msj: "El id no existe" });
            } else {
                await ModeloUsuario.destroy({ where: { id_usuario: id } })
                .then((data) => {
                    res.json({ msj: "Registro eliminado", data: data });
                })
                .catch((er) => {
                    res.json(er);
                });
            }
        } catch (error) {
            res.json(error);
        }
    }
};