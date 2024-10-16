const ModeloCalificacion = require('../modelos/calificacion');
const { enviar, errores } = require('../configuracion/ayuda');
const { validationResult } = require('express-validator');

exports.inicio = (req, res) => {
    res.json({ msj: "Hola desde el controlador de calificaciones" });
};

exports.listar = async (req, res) => {
    let contenido = {
        tipo: 0,
        datos: [],
        msj: [],
    };
    try {
        const data = await ModeloCalificacion.findAll();
        contenido.tipo = 1;
        contenido.datos = data;
        enviar(200, contenido, res);
    } catch (error) {
        contenido.tipo = 0;
        contenido.msj = "Error al cargar los datos de calificaciones";
        enviar(500, contenido, res);
    }
};

exports.guardar = async (req, res) => {
    const { id_asignatura, id_estudiante, calificacion, fecha } = req.body;
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
        const data = await ModeloCalificacion.create({ id_asignatura, id_estudiante, calificacion, fecha });
        contenido.tipo = 1;
        contenido.datos = data;
        contenido.msj = "Calificación guardada correctamente";
        enviar(200, contenido, res);
    } catch (error) {
        contenido.tipo = 0;
        contenido.msj = "Error en el servidor al guardar la calificación";
        enviar(500, contenido, res);
    }
};

exports.editar = async (req, res) => {
    const { id_calificacion } = req.query;
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
        await ModeloCalificacion.update(req.body, { where: { id_calificacion } });
        contenido.tipo = 1;
        contenido.msj = "Calificación editada correctamente";
        enviar(200, contenido, res);
    } catch (error) {
        contenido.tipo = 0;
        contenido.msj = "Error en el servidor al editar la calificación";
        enviar(500, contenido, res);
    }
};

exports.eliminar = async (req, res) => {
    const { id_calificacion } = req.query;
    let contenido = {
        tipo: 0,
        datos: [],
        msj: [],
    };
    try {
        const calificacionExistente = await ModeloCalificacion.findOne({ where: { id_calificacion } });
        if (!calificacionExistente) {
            contenido.msj = "La calificación no existe";
            return enviar(404, contenido, res);
        }

        await ModeloCalificacion.destroy({ where: { id_calificacion } });
        contenido.tipo = 1;
        contenido.msj = "Calificación eliminada correctamente";
        enviar(200, contenido, res);
    } catch (error) {
        contenido.tipo = 0;
        contenido.msj = "Error en el servidor al eliminar la calificación";
        enviar(500, contenido, res);
    }
};
