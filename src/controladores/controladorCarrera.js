const ModeloCarrera = require('../modelos/carrera');
const { enviar, errores } = require('../configuracion/ayuda');
const { validationResult } = require('express-validator');

exports.inicio = (req, res) => {
    res.json({ msj: "Hola desde el controlador de carreras" });
};

exports.listar = async (req, res) => {
    let contenido = {
        tipo: 0,
        datos: [],
        msj: [],
    };
    try {
        const data = await ModeloCarrera.findAll();
        contenido.tipo = 1;
        contenido.datos = data;
        enviar(200, contenido, res);
    } catch (error) {
        contenido.tipo = 0;
        contenido.msj = "Error al cargar los datos de carreras";
        enviar(500, contenido, res);
    }
};

exports.guardar = async (req, res) => {
    const { nombre_carrera, facultad } = req.body;
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
        const data = await ModeloCarrera.create({ nombre_carrera, facultad });
        contenido.tipo = 1;
        contenido.datos = data;
        contenido.msj = "Carrera guardada correctamente";
        enviar(200, contenido, res);
    } catch (error) {
        contenido.tipo = 0;
        contenido.msj = "Error en el servidor al guardar la carrera";
        enviar(500, contenido, res);
    }
};

exports.editar = async (req, res) => {
    const { id_carrera } = req.query;
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
        await ModeloCarrera.update(req.body, { where: { id_carrera } });
        contenido.tipo = 1;
        contenido.msj = "Carrera editada correctamente";
        enviar(200, contenido, res);
    } catch (error) {
        contenido.tipo = 0;
        contenido.msj = "Error en el servidor al editar la carrera";
        enviar(500, contenido, res);
    }
};

exports.eliminar = async (req, res) => {
    const { id_carrera } = req.query;
    let contenido = {
        tipo: 0,
        datos: [],
        msj: [],
    };
    try {
        const carreraExistente = await ModeloCarrera.findOne({ where: { id_carrera } });
        if (!carreraExistente) {
            contenido.msj = "La carrera no existe";
            return enviar(404, contenido, res);
        }

        await ModeloCarrera.destroy({ where: { id_carrera } });
        contenido.tipo = 1;
        contenido.msj = "Carrera eliminada correctamente";
        enviar(200, contenido, res);
    } catch (error) {
        contenido.tipo = 0;
        contenido.msj = "Error en el servidor al eliminar la carrera";
        enviar(500, contenido, res);
    }
};
