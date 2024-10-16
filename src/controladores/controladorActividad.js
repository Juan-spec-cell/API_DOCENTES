const ModeloActividad = require('../modelos/actividad');
const { enviar, errores } = require('../configuracion/ayuda');
const { validationResult } = require('express-validator');

exports.inicio = (req, res) => {
    res.json({ msj: "Hola desde el controlador de actividades" });
};

exports.listar = async (req, res) => {
    let contenido = {
        tipo: 0,
        datos: [],
        msj: [],
    };
    try {
        const data = await ModeloActividad.findAll();
        contenido.tipo = 1;
        contenido.datos = data;
        enviar(200, contenido, res);
    } catch (error) {
        contenido.tipo = 0;
        contenido.msj = "Error al cargar los datos de actividades";
        enviar(500, contenido, res);
    }
};

exports.guardar = async (req, res) => {
    const { id_asignatura, tipo_actividad, fecha } = req.body;
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
        const data = await ModeloActividad.create({ id_asignatura, tipo_actividad, fecha });
        contenido.tipo = 1;
        contenido.datos = data;
        contenido.msj = "Actividad guardada correctamente";
        enviar(200, contenido, res);
    } catch (error) {
        contenido.tipo = 0;
        contenido.msj = "Error en el servidor al guardar la actividad";
        enviar(500, contenido, res);
    }
};

exports.editar = async (req, res) => {
    const { id_actividad } = req.query;
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
        await ModeloActividad.update(req.body, { where: { id_actividad } });
        contenido.tipo = 1;
        contenido.msj = "Actividad editada correctamente";
        enviar(200, contenido, res);
    } catch (error) {
        contenido.tipo = 0;
        contenido.msj = "Error en el servidor al editar la actividad";
        enviar(500, contenido, res);
    }
};

exports.eliminar = async (req, res) => {
    const { id_actividad } = req.query;
    let contenido = {
        tipo: 0,
        datos: [],
        msj: [],
    };
    try {
        const actividadExistente = await ModeloActividad.findOne({ where: { id_actividad } });
        if (!actividadExistente) {
            contenido.msj = "La actividad no existe";
            return enviar(404, contenido, res);
        }

        await ModeloActividad.destroy({ where: { id_actividad } });
        contenido.tipo = 1;
        contenido.msj = "Actividad eliminada correctamente";
        enviar(200, contenido, res);
    } catch (error) {
        contenido.tipo = 0;
        contenido.msj = "Error en el servidor al eliminar la actividad";
        enviar(500, contenido, res);
    }
};
