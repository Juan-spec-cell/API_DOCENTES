const ModeloPeriodo = require('../modelos/periodo');
const { enviar, errores } = require('../configuracion/ayuda');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');
const moment = require('moment');

exports.inicio = (req, res) => {
    res.json({ msj: "Hola desde el controlador de periodos" });
};

exports.listar = async (req, res) => {
    let contenido = {
        tipo: 0,
        datos: [],
        msj: [],
    };
    try {
        const data = await ModeloPeriodo.findAll();
        contenido.tipo = 1;
        contenido.datos = data.map(periodo => ({
            id_periodo: periodo.id,
            nombre_periodo: periodo.nombre_periodo,
            fecha_inicio: moment(periodo.fecha_inicio).format('YYYY-MM-DD'),
            fecha_fin: moment(periodo.fecha_fin).format('YYYY-MM-DD')
        }));
        enviar(200, contenido, res);
    } catch (error) {
        contenido.tipo = 0;
        contenido.msj = "Error al cargar los datos de periodos";
        enviar(500, contenido, res);
    }
};

exports.guardar = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return enviar(400, { tipo: 0, msj: errores(errors) }, res);
    }

    const { nombre_periodo, fecha_inicio, fecha_fin } = req.body;
    let contenido = {
        tipo: 0,
        datos: [],
        msj: [],
    };

    try {
        const nuevoPeriodo = await ModeloPeriodo.create({
            nombre_periodo,
            fecha_inicio,
            fecha_fin
        });

        contenido.tipo = 1;
        contenido.datos = nuevoPeriodo;
        contenido.msj = "Periodo guardado correctamente";
        enviar(201, contenido, res);
    } catch (error) {
        contenido.tipo = 0;
        contenido.msj = "Error en el servidor al guardar el periodo";
        enviar(500, contenido, res);
    }
};

exports.editar = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return enviar(400, { tipo: 0, msj: errores(errors) }, res);
    }

    const { id_periodo } = req.query;
    const { nombre_periodo, fecha_inicio, fecha_fin } = req.body;
    let contenido = {
        tipo: 0,
        datos: [],
        msj: [],
    };

    try {
        const periodoExistente = await ModeloPeriodo.findOne({ where: { id: id_periodo } });
        if (!periodoExistente) {
            contenido.msj = "El periodo no existe";
            return enviar(404, contenido, res);
        }

        await ModeloPeriodo.update({
            nombre_periodo,
            fecha_inicio,
            fecha_fin
        }, { where: { id: id_periodo } });

        contenido.tipo = 1;
        contenido.msj = "Periodo editado correctamente";
        enviar(200, contenido, res);
    } catch (error) {
        contenido.tipo = 0;
        contenido.msj = "Error en el servidor al editar el periodo";
        enviar(500, contenido, res);
    }
};

exports.eliminar = async (req, res) => {
    const { id_periodo } = req.query;
    let contenido = {
        tipo: 0,
        datos: [],
        msj: [],
    };

    try {
        const periodoExistente = await ModeloPeriodo.findOne({ where: { id: id_periodo } });
        if (!periodoExistente) {
            contenido.msj = "El periodo no existe";
            return enviar(404, contenido, res);
        }

        await ModeloPeriodo.destroy({ where: { id: id_periodo } });
        contenido.tipo = 1;
        contenido.msj = "Periodo eliminado correctamente";
        enviar(200, contenido, res);
    } catch (error) {
        contenido.tipo = 0;
        contenido.msj = "Error en el servidor al eliminar el periodo";
        enviar(500, contenido, res);
    }
};

exports.buscarPorId = async (req, res) => {
    const { id_periodo } = req.query;
    let contenido = {
        tipo: 0,
        datos: [],
        msj: [],
    };

    try {
        const periodo = await ModeloPeriodo.findOne({ where: { id: id_periodo } });
        if (!periodo) {
            contenido.msj = "Periodo no encontrado";
            return enviar(404, contenido, res);
        }

        contenido.tipo = 1;
        contenido.datos = {
            id_periodo: periodo.id,
            nombre_periodo: periodo.nombre_periodo,
            fecha_inicio: moment(periodo.fecha_inicio).format('YYYY-MM-DD'),
            fecha_fin: moment(periodo.fecha_fin).format('YYYY-MM-DD')
        };
        enviar(200, contenido, res);
    } catch (error) {
        contenido.tipo = 0;
        contenido.msj = "Error en el servidor al buscar el periodo";
        enviar(500, contenido, res);
    }
};

exports.buscarPorNombre = async (req, res) => {
    const { nombre_periodo } = req.query;
    let contenido = {
        tipo: 0,
        datos: [],
        msj: [],
    };

    try {
        const periodos = await ModeloPeriodo.findAll({
            where: {
                nombre_periodo: {
                    [Op.like]: `%${nombre_periodo}%`
                }
            }
        });

        if (periodos.length === 0) {
            contenido.msj = "No se encontraron periodos con el nombre especificado";
            return enviar(404, contenido, res);
        }

        contenido.tipo = 1;
        contenido.datos = periodos.map(periodo => ({
            id_periodo: periodo.id,
            nombre_periodo: periodo.nombre_periodo,
            fecha_inicio: moment(periodo.fecha_inicio).format('YYYY-MM-DD'),
            fecha_fin: moment(periodo.fecha_fin).format('YYYY-MM-DD')
        }));
        enviar(200, contenido, res);
    } catch (error) {
        contenido.tipo = 0;
        contenido.msj = "Error en el servidor al buscar el periodo";
        enviar(500, contenido, res);
    }
};