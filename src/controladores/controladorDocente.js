const ModeloDocente = require('../modelos/docente');
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
    const { nombre, correo } = req.body;
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
        const data = await ModeloDocente.create({ nombre, correo });
        contenido.tipo = 1;
        contenido.datos = data;
        contenido.msj = "Docente guardado correctamente";
        enviar(200, contenido, res);
    } catch (error) {
        contenido.tipo = 0;
        contenido.msj = "Error en el servidor al guardar el docente";
        enviar(500, contenido, res);
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

        await ModeloDocente.destroy({ where: { id_docente } });
        contenido.tipo = 1;
        contenido.msj = "Docente eliminado correctamente";
        enviar(200, contenido, res);
    } catch (error) {
        contenido.tipo = 0;
        contenido.msj = "Error en el servidor al eliminar el docente";
        enviar(500, contenido, res);
    }
};
