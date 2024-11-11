const ModeloCalificacion = require('../modelos/calificacion');
const ModeloEstudiante = require('../modelos/estudiante');
const ModeloAsignatura = require('../modelos/asignatura');
const ModeloActividad = require('../modelos/actividad');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');
const moment = require('moment'); // Importa la biblioteca moment

// Define la función enviar
const enviar = (status, contenido, res) => {
    res.status(status).json(contenido);
};

exports.inicio = (req, res) => {
    res.json({ msj: "Hola desde el controlador de calificaciones" });
};

// Función para listar todas las calificaciones
exports.listar = async (req, res) => {
    try {
        const data = await ModeloCalificacion.findAll({
            include: [
                {
                    model: ModeloEstudiante,
                    attributes: ['primerNombre', 'segundoNombre', 'primerApellido', 'segundoApellido']
                },
                {
                    model: ModeloAsignatura,
                    attributes: ['nombre_asignatura']
                },
                {
                    model: ModeloActividad,
                    attributes: ['nombre_actividad']
                }
            ]
        });

        const contenido = {
            tipo: 1,
            datos: data.map(calificacion => ({
                id: calificacion.id,
                nombre_estudiante: calificacion.Estudiante ? `${calificacion.Estudiante.primerNombre} ${calificacion.Estudiante.segundoNombre || ''}`.trim() : null,
                apellido_estudiante: calificacion.Estudiante ? `${calificacion.Estudiante.primerApellido} ${calificacion.Estudiante.segundoApellido || ''}`.trim() : null,
                nombre_asignatura: calificacion.Asignatura ? calificacion.Asignatura.nombre_asignatura : null,
                nota: calificacion.nota,
                nombre_actividad: calificacion.actividadId,
                createdAt: calificacion.createdAt ? moment(calificacion.createdAt).format('DD/MM/YYYY') : null,
                updatedAt: calificacion.updatedAt ? moment(calificacion.updatedAt).format('DD/MM/YYYY') : null
            })),
            msj: []
        };

        res.json(contenido);
    } catch (error) {
        res.json({ tipo: 0, msj: ["Error al cargar los datos de calificaciones"] });
    }
};

// Función para guardar una nueva calificación
exports.guardar = async (req, res) => {
    const validacion = validationResult(req);
    if (validacion.errors.length > 0) {
        var msjerror = "";
        validacion.errors.forEach((r) => {
            msjerror = msjerror + r.msg + ". ";
        });
        res.json({ msj: "Hay errores en la petición", error: msjerror });
    } else {
        try {
            const { nombre_estudiante, apellido_estudiante, nombre_asignatura, nota, actividadId } = req.body;

            // Buscar el estudiante por nombre y apellido
            const estudiante = await ModeloEstudiante.findOne({
                where: {
                    primerNombre: nombre_estudiante.split(' ')[0],
                    primerApellido: apellido_estudiante.split(' ')[0]
                }
            });
            if (!estudiante) {
                console.log('Error: Estudiante no encontrado'); // Puedes poner el mensaje de error o el objeto 'estudiante' si lo necesitas
                return res.status(404).json({ error: 'Estudiante no encontrado' });
            }


            // Buscar la asignatura por nombre
            const asignatura = await ModeloAsignatura.findOne({ where: { nombre_asignatura } });
            if (!asignatura) return res.status(404).json({ error: 'Asignatura no encontrada' });

            // Crear nueva calificación
            const nuevaCalificacion = await ModeloCalificacion.create({
                estudianteId: estudiante.id,
                asignaturaId: asignatura.id,
                nota,
                actividadId
            });

            res.json({
                tipo: 1,
                datos: {
                    id: nuevaCalificacion.id,
                    nombre_estudiante: `${estudiante.primerNombre} ${estudiante.segundoNombre || ''}`.trim(),
                    apellido_estudiante: `${estudiante.primerApellido} ${estudiante.segundoApellido || ''}`.trim(),
                    nombre_asignatura: asignatura.nombre_asignatura,
                    nota: nuevaCalificacion.nota,
                    actividadId: nuevaCalificacion.actividadId,
                },
                msj: "Calificación guardada correctamente"
            });
        } catch (error) {
            res.json({ tipo: 0, msj: "Error en el servidor al guardar la calificación" });
        }
    }
};

// Función para editar una calificación existente
exports.editar = async (req, res) => {
    const { id } = req.query;  // Obtiene el id de la consulta
    const validacion = validationResult(req);
    if (validacion.errors.length > 0) {
        var msjerror = "";
        validacion.errors.forEach((r) => {
            msjerror = msjerror + r.msg + ". ";
        });
        res.json({ msj: "Hay errores en la petición", error: msjerror });
    } else {
        try {
            const { nombre_estudiante, apellido_estudiante, nombre_asignatura, nota } = req.body;

            // Buscar la calificación existente por id
            const calificacionExistente = await ModeloCalificacion.findOne({ where: { id } });
            if (!calificacionExistente) {
                return res.status(404).json({ msj: "La calificación no existe" });
            }

            // Buscar el estudiante por nombre y apellido
            const estudiante = await ModeloEstudiante.findOne({
                where: {
                    primerNombre: nombre_estudiante.split(' ')[0],
                    primerApellido: apellido_estudiante.split(' ')[0]
                }
            });
            if (!estudiante) return res.status(404).json({ error: 'Estudiante no encontrado' });

            // Buscar la asignatura por nombre
            const asignatura = await ModeloAsignatura.findOne({ where: { nombre_asignatura } });
            if (!asignatura) return res.status(404).json({ error: 'Asignatura no encontrada' });

            // Actualizar la calificación
            await ModeloCalificacion.update({
                estudianteId: estudiante.id,
                asignaturaId: asignatura.id,
                nota
            }, { where: { id } });

            res.json({
                tipo: 1,
                datos: {
                    id: id,
                    nombre_estudiante: `${estudiante.primerNombre} ${estudiante.segundoNombre || ''}`.trim(),
                    apellido_estudiante: `${estudiante.primerApellido} ${estudiante.segundoApellido || ''}`.trim(),
                    nombre_asignatura: asignatura.nombre_asignatura,
                    nota
                },
                msj: "Calificación editada correctamente"
            });
        } catch (error) {
            res.json({ tipo: 0, msj: "Error en el servidor al editar la calificación" });
        }
    }
};

// Función para eliminar una calificación existente
exports.eliminar = async (req, res) => {
    const { id } = req.query;
    let contenido = { tipo: 0, datos: [], msj: [] };

    try {
        const calificacionExistente = await ModeloCalificacion.findOne({ where: { id } });
        if (!calificacionExistente) {
            contenido.msj = "La calificación no existe";
            return enviar(404, contenido, res);
        }

        await ModeloCalificacion.destroy({ where: { id } });
        contenido.tipo = 1;
        contenido.msj = "Calificación eliminada correctamente";
        enviar(200, contenido, res);
    } catch (error) {
        console.error(error);
        contenido.tipo = 0;
        contenido.msj = "Error en el servidor al eliminar la calificación";
        enviar(500, contenido, res);
    }
};

/******************************** Filtros ************************************/

// Función para buscar una calificación por ID
exports.busqueda_id = async (req, res) => {
    const { id } = req.query;
    let contenido = { tipo: 0, datos: [], msj: [] };

    try {
        const calificacion = await ModeloCalificacion.findOne({
            where: { id },
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
        if (!calificacion) {
            contenido.msj = "Calificación no encontrada";
            return enviar(404, contenido, res);
        }

        contenido.tipo = 1;
        contenido.datos = {
            id: calificacion.id,
            nombre_estudiante: calificacion.Estudiante ? `${calificacion.Estudiante.primerNombre} ${calificacion.Estudiante.segundoNombre || ''}`.trim() : null,
            apellido_estudiante: calificacion.Estudiante ? `${calificacion.Estudiante.primerApellido} ${calificacion.Estudiante.segundoApellido || ''}`.trim() : null,
            nombre_asignatura: calificacion.Asignatura ? calificacion.Asignatura.nombre_asignatura : null,
            nota: calificacion.nota,
            createdAt: calificacion.createdAt ? moment(calificacion.createdAt).format('DD/MM/YYYY') : null,
            updatedAt: calificacion.updatedAt ? moment(calificacion.updatedAt).format('DD/MM/YYYY') : null
        };
        enviar(200, contenido, res);
    } catch (error) {
        contenido.tipo = 0;
        contenido.msj = "Error en el servidor al buscar la calificación";
        enviar(500, contenido, res);
    }
};

// Función para buscar calificaciones por nombre de asignatura
exports.busqueda_nombre = async (req, res) => {
    const { nombre } = req.query;
    let contenido = { tipo: 0, datos: [], msj: [] };

    try {
        const calificaciones = await ModeloCalificacion.findAll({
            include: [
                {
                    model: ModeloEstudiante,
                    attributes: ['primerNombre', 'segundoNombre', 'primerApellido', 'segundoApellido']
                },
                {
                    model: ModeloAsignatura,
                    where: { nombre_asignatura: { [Op.like]: `%${nombre}%` } },
                    attributes: ['nombre_asignatura']
                }
            ]
        });

        if (calificaciones.length === 0) {
            contenido.msj = "No se encontraron calificaciones para esa asignatura";
            return enviar(404, contenido, res);
        }

        contenido.tipo = 1;
        contenido.datos = calificaciones.map(calificacion => ({
            id: calificacion.id,
            nombre_estudiante: calificacion.Estudiante ? `${calificacion.Estudiante.primerNombre} ${calificacion.Estudiante.segundoNombre || ''}`.trim() : null,
            apellido_estudiante: calificacion.Estudiante ? `${calificacion.Estudiante.primerApellido} ${calificacion.Estudiante.segundoApellido || ''}`.trim() : null,
            nombre_asignatura: calificacion.Asignatura ? calificacion.Asignatura.nombre_asignatura : null,
            nota: calificacion.nota,
            createdAt: calificacion.createdAt ? moment(calificacion.createdAt).format('DD/MM/YYYY') : null,
            updatedAt: calificacion.updatedAt ? moment(calificacion.updatedAt).format('DD/MM/YYYY') : null
        }));
        enviar(200, contenido, res);
    } catch (error) {
        contenido.tipo = 0;
        contenido.msj = "Error en el servidor al buscar las calificaciones";
        enviar(500, contenido, res);
    }
};

