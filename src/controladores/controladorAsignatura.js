const ModeloAsignatura = require('../modelos/asignatura');
const ModeloDocente = require('../modelos/Docente');
const { enviar, errores } = require('../configuracion/ayuda');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');
const moment = require('moment');

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
        const data = await ModeloAsignatura.findAll({
            include: [
                {
                    model: ModeloDocente,
                    attributes: ['primerNombre', 'segundoNombre', 'primerApellido', 'segundoApellido'] // Incluye los campos necesarios
                }
            ]
        });

        contenido.tipo = 1;
        contenido.datos = data.map(asignatura => ({
            id: asignatura.id,
            nombre_asignatura: asignatura.nombre_asignatura,
            nombre_docente: asignatura.Docente ? `${asignatura.Docente.primerNombre} ${asignatura.Docente.segundoNombre || ''} ${asignatura.Docente.primerApellido} ${asignatura.Docente.segundoApellido || ''}`.trim() : null,
            fecha_creacion: moment(asignatura.createdAt).format('DD/MM/YYYY'), // Formatea la fecha de creación
            fecha_actualizacion: moment(asignatura.updatedAt).format('DD/MM/YYYY'), // Formatea la fecha de actualización
            createdAt: moment(asignatura.createdAt).format('DD/MM/YYYY'), // Formatea la fecha de creación
            updatedAt: moment(asignatura.updatedAt).format('DD/MM/YYYY') // Formatea la fecha de actualización
        }));
        enviar(200, contenido, res);
    } catch (error) {
        contenido.tipo = 0;
        contenido.msj = "Error al cargar los datos de asignaturas";
        enviar(500, contenido, res);
        console.error(error);
    }
};

exports.guardar = async (req, res) => {
    const { nombre_asignatura, docenteId } = req.body;
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
        const data = await ModeloAsignatura.create({ nombre_asignatura, docenteId });
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
    const { id } = req.query;
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
        const asignaturaExistente = await ModeloAsignatura.findOne({ where: { id } });
        if (!asignaturaExistente) {
            contenido.msj = "La asignatura no existe";
            return enviar(404, contenido, res);
        }

        await ModeloAsignatura.update(req.body, { where: { id } });
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
    const { id } = req.query;
    let contenido = {
        tipo: 0,
        datos: [],
        msj: [],
    };
    try {
        const asignaturaExistente = await ModeloAsignatura.findOne({ where: { id } });
        if (!asignaturaExistente) {
            contenido.msj = "La asignatura no existe";
            return enviar(404, contenido, res);
        }

        await ModeloAsignatura.destroy({ where: { id } });
        contenido.tipo = 1;
        contenido.msj = "Asignatura eliminada correctamente";
        enviar(200, contenido, res);
    } catch (error) {
        contenido.tipo = 0;
        contenido.msj = "Error en el servidor al eliminar la asignatura";
        enviar(500, contenido, res);
    }
};

/******************************** Filtros ************************************/

exports.busqueda_id = async (req, res) => {
    const { id } = req.query;
    let contenido = { tipo: 0, datos: [], msj: [] };

    try {
        const asignatura = await ModeloAsignatura.findOne({ where: { id } });
        if (!asignatura) {
            contenido.msj = "Asignatura no encontrada";
            return enviar(404, contenido, res);
        }

        contenido.tipo = 1;
        contenido.datos = asignatura;
        enviar(200, contenido, res);
    } catch (error) {
        contenido.tipo = 0;
        contenido.msj = "Error en el servidor al buscar la asignatura";
        enviar(500, contenido, res);
    }
};

exports.busqueda_nombre = async (req, res) => {
    const { nombre_asignatura } = req.query;
    let contenido = { tipo: 0, datos: [], msj: [] };

    try {
        const asignaturas = await ModeloAsignatura.findAll({ where: { nombre_asignatura } });
        if (asignaturas.length === 0) {
            contenido.msj = "No se encontraron asignaturas con ese nombre";
            return enviar(404, contenido, res);
        }

        contenido.tipo = 1;
        contenido.datos = asignaturas;
        enviar(200, contenido, res);
    } catch (error) {
        contenido.tipo = 0;
        contenido.msj = "Error en el servidor al buscar las asignaturas";
        enviar(500, contenido, res);
    }
};

exports.busqueda_docente = async (req, res) => {
    const { nombre_docente } = req.query;
    let contenido = { tipo: 0, datos: [], msj: [] };

    try {
        const asignaturas = await ModeloAsignatura.findAll({
            include: [
                {
                    model: ModeloDocente,
                    where: {
                        [Op.or]: [
                            { primerNombre: { [Op.like]: `%${nombre_docente}%` } },
                            { segundoNombre: { [Op.like]: `%${nombre_docente}%` } },
                            { primerApellido: { [Op.like]: `%${nombre_docente}%` } },
                            { segundoApellido: { [Op.like]: `%${nombre_docente}%` } },
                            {
                                [Op.and]: [
                                    { primerNombre: { [Op.like]: `%${nombre_docente.split(' ')[0]}%` } },
                                    { primerApellido: { [Op.like]: `%${nombre_docente.split(' ')[1]}%` } }
                                ]
                            }
                        ]
                    }
                }
            ]
        });
        if (asignaturas.length === 0) {
            contenido.msj = "No se encontraron asignaturas para ese docente";
            return enviar(404, contenido, res);
        }

        contenido.tipo = 1;
        contenido.datos = asignaturas;
        enviar(200, contenido, res);
    } catch (error) {
        contenido.tipo = 0;
        contenido.msj = "Error en el servidor al buscar las asignaturas";
        enviar(500, contenido, res);
        console.error(error);
    }
};