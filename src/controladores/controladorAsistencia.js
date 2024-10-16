const ModeloAsistencia = require('../modelos/asistencia');
const { enviar, errores } = require('../configuracion/ayuda');
const { validationResult } = require('express-validator');

exports.inicio = (req, res) => {
    res.json({ msj: "Hola desde el controlador de asistencias" });
};

exports.listar = async (req, res) => {
    let contenido = {
        tipo: 0,
        datos: [],
        msj: [],
    };
    try {
        const data = await ModeloAsistencia.findAll();
        contenido.tipo = 1;
        contenido.datos = data;
        enviar(200, contenido, res);
    } catch (error) {
        contenido.tipo = 0;
        contenido.msj = "Error al cargar los datos de asistencias";
        enviar(500, contenido, res);
    }
};

exports.guardar = async (req, res) => {
    const { id_estudiante, id_asignatura, fecha, estado } = req.body;
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
        const data = await ModeloAsistencia.create({ id_estudiante, id_asignatura, fecha, estado });
        contenido.tipo = 1;
        contenido.datos = data;
        contenido.msj = "Asistencia guardada correctamente";
        enviar(200, contenido, res);
    } catch (error) {
        contenido.tipo = 0;
        contenido.msj = "Error en el servidor al guardar la asistencia";
        enviar(500, contenido, res);
    }
};

exports.editar = async (req, res) => {
    const { id_asistencia } = req.query;
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
        await ModeloAsistencia.update(req.body, { where: { id_asistencia } });
        contenido.tipo = 1;
        contenido.msj = "Asistencia editada correctamente";
        enviar(200, contenido, res);
    } catch (error) {
        contenido.tipo = 0;
        contenido.msj = "Error en el servidor al editar la asistencia";
        enviar(500, contenido, res);
    }
};

exports.eliminar = async (req, res) => {
    const { id_asistencia } = req.query;
    let contenido = {
        tipo: 0,
        datos: [],
        msj: [],
    };
    try {
        const asistenciaExistente = await ModeloAsistencia.findOne({ where: { id_asistencia } });
        if (!asistenciaExistente) {
            contenido.msj = "La asistencia no existe";
            return enviar(404, contenido, res);
        }

        await ModeloAsistencia.destroy({ where: { id_asistencia } });
        contenido.tipo = 1;
        contenido.msj = "Asistencia eliminada correctamente";
        enviar(200, contenido, res);
    } catch (error) {
        contenido.tipo = 0;
        contenido.msj = "Error en el servidor al eliminar la asistencia";
        enviar(500, contenido, res);
    }
};
