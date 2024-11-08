const ModeloAsistencia = require('../modelos/asistencia');
const ModeloEstudiante = require('../modelos/estudiante');
const ModeloDocente = require('../modelos/docente');
const ModeloCarrera = require('../modelos/carrera');
const ModeloAsignatura = require('../modelos/asignatura');
const { enviar, errores } = require('../configuracion/ayuda');
const { validationResult } = require('express-validator');
const moment = require('moment');
const { Op } = require('sequelize');    

exports.inicio = (req, res) => {
    res.json({ msj: "Hola desde el controlador de asistencias" });
};

exports.listar = async (req, res) => {
    try {
        const data = await ModeloAsistencia.findAll({
            include: [
                {
                    model: ModeloEstudiante,
                    attributes: ['primerNombre', 'segundoNombre', 'primerApellido', 'segundoApellido']
                },
                {
                    model: ModeloAsignatura,
                    attributes: ['nombre_asignatura']
                }
            ]
        });

        const contenido = {
            tipo: 1,
            datos: data.map(asistencia => ({
                id: asistencia.id,  // Agrega el id aquí
                nombre_estudiante: `${asistencia.Estudiante.primerNombre} ${asistencia.Estudiante.segundoNombre || ''} ${asistencia.Estudiante.primerApellido} ${asistencia.Estudiante.segundoApellido || ''}`.trim(),
                nombre_asignatura: asistencia.Asignatura ? asistencia.Asignatura.nombre_asignatura : null,
                fecha: moment(asistencia.fecha).format('DD/MM/YYYY'), // Formatea la fecha
                estado: asistencia.estado,
                createdAt: moment(asistencia.createdAt).format('DD/MM/YYYY'), // Formatea la fecha de creación
                updatedAt: moment(asistencia.updatedAt).format('DD/MM/YYYY') // Formatea la fecha de actualización
            })),
            msj: []
        };

        res.status(200).json(contenido);
    } catch (error) {
        const contenido = {
            tipo: 0,
            datos: [],
            msj: ["Error al cargar los datos de asistencias"]
        };
        console.error(error);
        res.status(500).json(contenido);
    }
};

exports.guardar = async (req, res) => {
    const { nombre_estudiante, apellido_estudiante, nombre_asignatura, fecha, estado } = req.body;
    let contenido = {
        tipo: 0,
        datos: [],
        msj: [],
    };

    // Validación
    contenido.msj = errores(validationResult(req));
    if (contenido.msj.length > 0) {
        return enviar(200, contenido, res);
    }

    try {
        // Buscar el estudiante
        const estudiante = await ModeloEstudiante.findOne({
            where: {
                primerNombre: nombre_estudiante.split(' ')[0],
                primerApellido: apellido_estudiante.split(' ')[0]
            }
        });
        if (!estudiante) return res.status(404).json({ error: 'Estudiante no encontrado' });

        // Buscar la asignatura
        const asignatura = await ModeloAsignatura.findOne({ where: { nombre_asignatura } });
        if (!asignatura) return res.status(404).json({ error: 'Asignatura no encontrada' });

        // Crear nueva asistencia
        const nuevaAsistencia = await ModeloAsistencia.create({
            estudianteId: estudiante.id,
            asignaturaId: asignatura.id,
            fecha,
            estado
        });

        contenido.tipo = 1;
        contenido.datos = {
            id_asistencia: nuevaAsistencia.id,
            nombre_estudiante: `${estudiante.primerNombre} ${estudiante.primerApellido}`,
            nombre_asignatura: asignatura.nombre_asignatura,
            fecha: nuevaAsistencia.fecha,
            estado: nuevaAsistencia.estado
        };
        contenido.msj = "Asistencia guardada correctamente";
        enviar(200, contenido, res);
    } catch (error) {
        console.error(error);
        contenido.tipo = 0;
        contenido.msj = "Error en el servidor al guardar la asistencia";
        enviar(500, contenido, res);
    }
};

exports.editar = async (req, res) => {
    const { id } = req.query;  // Obtiene el id de la consulta
    let contenido = {
        tipo: 0,
        datos: [],
        msj: [],
    };

    // Validación
    contenido.msj = errores(validationResult(req));
    if (contenido.msj.length > 0) {
        return enviar(200, contenido, res);  // Si hay errores de validación, devuelve el mensaje
    }

    try {
        // Busca la asistencia existente por id
        const asistenciaExistente = await ModeloAsistencia.findOne({ where: { id } });
        if (!asistenciaExistente) {
            contenido.msj = "La asistencia no existe";  // Mensaje si la asistencia no se encuentra
            return enviar(404, contenido, res);
        }

        // Actualiza la asistencia con los datos proporcionados en el cuerpo de la solicitud
        await ModeloAsistencia.update(req.body, { where: { id } });
        contenido.tipo = 1;  // Tipo de respuesta positiva
        contenido.msj = "Asistencia editada correctamente";  // Mensaje de éxito
        enviar(200, contenido, res);
    } catch (error) {
        console.error(error);  // Muestra el error en la consola
        contenido.tipo = 0;  // Tipo de respuesta negativa
        contenido.msj = "Error en el servidor al editar la asistencia";  // Mensaje de error
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
        const asistenciaExistente = await ModeloAsistencia.findOne({ where: { id: id } });
        if (!asistenciaExistente) {
            contenido.msj = "La asistencia no existe";
            return enviar(404, contenido, res);
        }

        await ModeloAsistencia.destroy({ where: { id: id } });
        contenido.tipo = 1;
        contenido.msj = "Asistencia eliminada correctamente";
        enviar(200, contenido, res);
    } catch (error) {
        console.error(error);
        contenido.tipo = 0;
        contenido.msj = "Error en el servidor al eliminar la asistencia";
        enviar(500, contenido, res);
        console.log(error);
    }
};
/******************************** Filtros ************************************/

exports.busqueda_id = async (req, res) => {
    const { id } = req.query;
    let contenido = { tipo: 0, datos: [], msj: [] };

    try {
        const asistencia = await ModeloAsistencia.findOne({
            where: { id },
            include: [
                {
                    model: ModeloEstudiante,
                    attributes: ['primerNombre', 'segundoNombre', 'primerApellido', 'segundoApellido']
                },
                {
                    model: ModeloAsignatura,
                    attributes: ['nombre_asignatura'],
                    include: [
                        {
                            model: ModeloDocente,
                            attributes: ['primerNombre', 'segundoNombre']
                        },
                        {
                            model: ModeloCarrera,
                            attributes: ['nombre_carrera']
                        }
                    ]
                }
            ]
        });
        if (!asistencia) {
            contenido.msj = "Asistencia no encontrada";
            return enviar(404, contenido, res);
        }

        contenido.tipo = 1;
        contenido.datos = {
            id: asistencia.id,
            nombre_estudiante: `${asistencia.Estudiante.primerNombre} ${asistencia.Estudiante.segundoNombre || ''} ${asistencia.Estudiante.primerApellido} ${asistencia.Estudiante.segundoApellido || ''}`.trim(),
            nombre_asignatura: asistencia.Asignatura ? asistencia.Asignatura.nombre_asignatura : null,
            primerNombre_docente: asistencia.Asignatura && asistencia.Asignatura.Docente ? asistencia.Asignatura.Docente.primerNombre : null,
            segundoNombre_docente: asistencia.Asignatura && asistencia.Asignatura.Docente ? asistencia.Asignatura.Docente.segundoNombre : null,
            nombre_carrera: asistencia.Asignatura && asistencia.Asignatura.Carrera ? asistencia.Asignatura.Carrera.nombre_carrera : null,
            fecha: moment(asistencia.fecha).format('DD/MM/YYYY'), // Formatea la fecha
            estado: asistencia.estado,
            createdAt: moment(asistencia.createdAt).format('DD/MM/YYYY'), // Formatea la fecha de creación
            updatedAt: moment(asistencia.updatedAt).format('DD/MM/YYYY') // Formatea la fecha de actualización
        };
        enviar(200, contenido, res);
    } catch (error) {
        contenido.tipo = 0;
        contenido.msj = "Error en el servidor al buscar la asistencia";
        enviar(500, contenido, res);
        console.error(error);
    }
};

exports.busqueda_estudiante = async (req, res) => {
    const { nombre_estudiante } = req.query;
    let contenido = { tipo: 0, datos: [], msj: [] };

    try {
        const nombrePartes = nombre_estudiante.split(' ');

        const condiciones = nombrePartes.map(parte => ({
            [Op.or]: [
                { primerNombre: { [Op.like]: `%${parte}%` } },
                { segundoNombre: { [Op.like]: `%${parte}%` } },
                { primerApellido: { [Op.like]: `%${parte}%` } },
                { segundoApellido: { [Op.like]: `%${parte}%` } }
            ]
        }));

        const asistencias = await ModeloAsistencia.findAll({
            include: [
                {
                    model: ModeloEstudiante,
                    where: {
                        [Op.and]: condiciones
                    },
                    attributes: ['primerNombre', 'segundoNombre', 'primerApellido', 'segundoApellido']
                },
                {
                    model: ModeloAsignatura,
                    attributes: ['nombre_asignatura'],
                    include: [
                        {
                            model: ModeloDocente,
                            attributes: ['primerNombre', 'segundoNombre']
                        },
                        {
                            model: ModeloCarrera,
                            attributes: ['nombre_carrera']
                        }
                    ]
                }
            ]
        });

        if (asistencias.length === 0) {
            contenido.msj = "No se encontraron asistencias para ese estudiante";
            return enviar(404, contenido, res);
        }

        contenido.tipo = 1;
        contenido.datos = asistencias.map(asistencia => ({
            id: asistencia.id,
            nombre_estudiante: `${asistencia.Estudiante.primerNombre} ${asistencia.Estudiante.segundoNombre || ''} ${asistencia.Estudiante.primerApellido} ${asistencia.Estudiante.segundoApellido || ''}`.trim(),
            nombre_asignatura: asistencia.Asignatura ? asistencia.Asignatura.nombre_asignatura : null,
            primerNombre_docente: asistencia.Asignatura && asistencia.Asignatura.Docente ? asistencia.Asignatura.Docente.primerNombre : null,
            segundoNombre_docente: asistencia.Asignatura && asistencia.Asignatura.Docente ? asistencia.Asignatura.Docente.segundoNombre : null,
            nombre_carrera: asistencia.Asignatura && asistencia.Asignatura.Carrera ? asistencia.Asignatura.Carrera.nombre_carrera : null,
            fecha: moment(asistencia.fecha).format('DD/MM/YYYY'), // Formatea la fecha
            estado: asistencia.estado,
            createdAt: moment(asistencia.createdAt).format('DD/MM/YYYY'), // Formatea la fecha de creación
            updatedAt: moment(asistencia.updatedAt).format('DD/MM/YYYY') // Formatea la fecha de actualización
        }));
        enviar(200, contenido, res);
    } catch (error) {
        contenido.tipo = 0;
        contenido.msj = "Error en el servidor al buscar las asistencias";
        enviar(500, contenido, res);
    }
};

exports.busqueda_asignatura = async (req, res) => {
    const { nombre_asignatura } = req.query;
    let contenido = { tipo: 0, datos: [], msj: [] };

    try {
        const asistencias = await ModeloAsistencia.findAll({
            include: [
                {
                    model: ModeloEstudiante,
                    attributes: ['primerNombre', 'segundoNombre', 'primerApellido', 'segundoApellido']
                },
                {
                    model: ModeloAsignatura,
                    where: { nombre_asignatura: { [Op.like]: `%${nombre_asignatura}%` } },
                    attributes: ['nombre_asignatura'],
                    include: [
                        {
                            model: ModeloDocente,
                            attributes: ['primerNombre', 'segundoNombre']
                        },
                        {
                            model: ModeloCarrera,
                            attributes: ['nombre_carrera']
                        }
                    ]
                }
            ]
        });
        if (asistencias.length === 0) {
            contenido.msj = "No se encontraron asistencias para esa asignatura";
            return enviar(404, contenido, res);
        }

        contenido.tipo = 1;
        contenido.datos = asistencias.map(asistencia => ({
            id: asistencia.id,
            nombre_estudiante: `${asistencia.Estudiante.primerNombre} ${asistencia.Estudiante.segundoNombre || ''} ${asistencia.Estudiante.primerApellido} ${asistencia.Estudiante.segundoApellido || ''}`.trim(),
            nombre_asignatura: asistencia.Asignatura ? asistencia.Asignatura.nombre_asignatura : null,
            primerNombre_docente: asistencia.Asignatura && asistencia.Asignatura.Docente ? asistencia.Asignatura.Docente.primerNombre : null,
            segundoNombre_docente: asistencia.Asignatura && asistencia.Asignatura.Docente ? asistencia.Asignatura.Docente.segundoNombre : null,
            nombre_carrera: asistencia.Asignatura && asistencia.Asignatura.Carrera ? asistencia.Asignatura.Carrera.nombre_carrera : null,
            fecha: moment(asistencia.fecha).format('DD/MM/YYYY'), // Formatea la fecha
            estado: asistencia.estado,
            createdAt: moment(asistencia.createdAt).format('DD/MM/YYYY'), // Formatea la fecha de creación
            updatedAt: moment(asistencia.updatedAt).format('DD/MM/YYYY') // Formatea la fecha de actualización
        }));
        enviar(200, contenido, res);
    } catch (error) {
        contenido.tipo = 0;
        contenido.msj = "Error en el servidor al buscar las asistencias";
        enviar(500, contenido, res);
    }
};