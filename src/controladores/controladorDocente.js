const ModeloDocente = require('../modelos/docente');
const ModeloUsuario = require('../modelos/usuario');
const { enviar, errores } = require('../configuracion/ayuda');
const { validationResult } = require('express-validator');

exports.inicio = (req, res) => {
    res.json({ msj: "Hola desde el controlador de docentes" });
};

exports.listar = async (req, res) => {
    let contenido = {
        tipo: 0,
        datos: [],
        msj: [],
    };
    try {
        const data = await ModeloDocente.findAll();
        contenido.tipo = 1;
        contenido.datos = data;
        enviar(200, contenido, res);
    } catch (error) {
        contenido.tipo = 0;
        contenido.msj = "Error al cargar los datos de docentes";
        enviar(500, contenido, res);
    }
};

exports.guardar = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ tipo: 0, datos: [], msj: errors.array() });
    }

    try {
        const nuevoDocente = await ModeloDocente.create(req.body);
        res.status(200).json({ tipo: 1, datos: nuevoDocente, msj: 'Docente guardado con éxito' });
    } catch (error) {
        console.error('Error al guardar el docente:', error); // Log the error for debugging
        res.status(500).json({ tipo: 0, datos: [], msj: 'Error en el servidor al guardar el docente' });
    }
};

exports.editar = async (req, res) => {
    const { id_docente } = req.query;
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
        await ModeloDocente.update(req.body, { where: { id_docente } });
        contenido.tipo = 1;
        contenido.msj = "Docente editado correctamente";
        enviar(200, contenido, res);
    } catch (error) {
        contenido.tipo = 0;
        contenido.msj = "Error en el servidor al editar el docente";
        enviar(500, contenido, res);
    }
};

exports.eliminar = async (req, res) => {
    const { id_docente } = req.query;
let contenido = {
    tipo: 0,
    datos: [],
    msj: [],
};
try {
    const docenteExistente = await ModeloDocente.findOne({ where: { id_docente } });
    if (!docenteExistente) {
        contenido.msj = "El docente no existe";
        return enviar(404, contenido, res);
    }

    // Buscar el usuario asociado al docente
    const usuarioExistente = await ModeloUsuario.findOne({ where: { id_usuario: docenteExistente.id_usuario } });
    if (!usuarioExistente) {
        contenido.msj = "Usuario asociado no encontrado";
        return enviar(404, contenido, res);
    }

    // Eliminar el docente
    await ModeloDocente.destroy({ where: { id_docente } });

    // Eliminar el usuario asociado
    await ModeloUsuario.destroy({ where: { id_usuario: docenteExistente.id_usuario } });

    contenido.tipo = 1;
    contenido.msj = "Docente y usuario asociado eliminados correctamente";
    enviar(200, contenido, res);
    } catch (error) {
    contenido.tipo = 0;
    contenido.msj = "Error en el servidor al eliminar el docente";
    enviar(500, contenido, res);
    }
};