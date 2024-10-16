const ModeloAsignatura = require('../modelos/asignatura');
const { enviar, errores } = require('../configuracion/ayuda');
const { validationResult } = require('express-validator');

exports.inicio = (req, res) => {
    res.json({ msj: "Hola desde el controlador de asignaturas" });
};

exports.listar = async (req, res) => {
    let contenido = {
        tipo: 0,
        datos: [],
        msj: [],
    };
    try {
        const data = await ModeloAsignatura.findAll();
        contenido.tipo = 1;
        contenido.datos = data;
        enviar(200, contenido, res);
    } catch (error) {
        contenido.tipo = 0;
        contenido.msj = "Error al cargar los datos de asignaturas";
        enviar(500, contenido, res);
    }
};

exports.guardar = async (req, res) => {
    const { nombre_asignatura, id_docente, id_carrera } = req.body;
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
        const data = await ModeloAsignatura.create({ nombre_asignatura, id_docente, id_carrera });
        contenido.tipo = 1;
        contenido.datos = data;
        contenido.msj = "Asignatura guardada correctamente";
        enviar(200, contenido, res);
    } catch (error) {
        contenido.tipo = 0;
        contenido.msj = "Error en el servidor al guardar la asignatura";
        enviar(500, contenido, res);
    }
};

exports.editar = async (req, res) => {
    const { id_asignatura } = req.query;
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
        await ModeloAsignatura.update(req.body, { where: { id_asignatura } });
        contenido.tipo = 1;
        contenido.msj = "Asignatura editada correctamente";
        enviar(200, contenido, res);
    } catch (error) {
        contenido.tipo = 0;
        contenido.msj = "Error en el servidor al editar la asignatura";
        enviar(500, contenido, res);
    }
};

exports.eliminar = async (req, res) => {
    const { id_asignatura } = req.query;
    let contenido = {
        tipo: 0,
        datos: [],
        msj: [],
    };
    try {
        const asignaturaExistente = await ModeloAsignatura.findOne({ where: { id_asignatura } });
        if (!asignaturaExistente) {
            contenido.msj = "La asignatura no existe";
            return enviar(404, contenido, res);
        }

        await ModeloAsignatura.destroy({ where: { id_asignatura } });
        contenido.tipo = 1;
        contenido.msj = "Asignatura eliminada correctamente";
        enviar(200, contenido, res);
    } catch (error) {
        contenido.tipo = 0;
        contenido.msj = "Error en el servidor al eliminar la asignatura";
        enviar(500, contenido, res);
    }
};
