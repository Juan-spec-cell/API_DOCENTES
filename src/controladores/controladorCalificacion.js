const ModeloCalificacion = require('../modelos/calificacion');
const ModeloEstudiante = require('../modelos/estudiante');
const ModeloAsignatura = require('../modelos/asignatura');
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
        const data = await ModeloCalificacion.findAll({
            include: [
                {
                    model: ModeloEstudiante,
                    attributes: ['id', 'primerNombre', 'segundoNombre', 'primerApellido', 'segundoApellido']
                },
                {
                    model: ModeloAsignatura,
                    attributes: ['id', 'nombre_asignatura']
                }
            ]
        });

        // Transformar los datos para cambiar la estructura de la respuesta
        const datosTransformados = data.map(calificacion => ({
            id: calificacion.id,
            nombre_completo: `${calificacion.Estudiante.primerNombre} ${calificacion.Estudiante.segundoNombre || ''} ${calificacion.Estudiante.primerApellido} ${calificacion.Estudiante.segundoApellido || ''}`.trim(),
            nombre_asignatura: calificacion.Asignatura.nombre_asignatura,
            nota: calificacion.nota
        }));

        contenido.tipo = 1;
        contenido.datos = datosTransformados;
        enviar(200, contenido, res);
    } catch (error) {
        contenido.tipo = 0;
        contenido.msj = "Error al cargar los datos de calificaciones";
        enviar(500, contenido, res);
    }
};

exports.guardar = async (req, res) => {
    const { nombre_estudiante, apellido_estudiante, nombre_asignatura, nota } = req.body;
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
        // Buscar el estudiante
        const estudiante = await ModeloEstudiante.findOne({
            where: {
                primerNombre: nombre_estudiante.split(' ')[0],
                primerApellido: apellido_estudiante.split(' ')[0]
            }
        });
        if (!estudiante) {
            contenido.msj = "Estudiante no encontrado";
            return enviar(404, contenido, res);
        }

        // Buscar la asignatura
        const asignatura = await ModeloAsignatura.findOne({ where: { nombre_asignatura } });
        if (!asignatura) {
            contenido.msj = "Asignatura no encontrada";
            return enviar(404, contenido, res);
        }

        // Crear nueva calificación
        const nuevaCalificacion = await ModeloCalificacion.create({
            estudianteId: estudiante.id,
            asignaturaId: asignatura.id,
            nota: parseFloat(nota) // Asegurarse de que la nota sea un float
        });

        contenido.tipo = 1;
        contenido.datos = nuevaCalificacion;
        contenido.msj = "Calificación guardada correctamente";
        enviar(200, contenido, res);
    } catch (error) {
        contenido.tipo = 0;
        contenido.msj = "Error en el servidor al guardar la calificación";
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
        const calificacionExistente = await ModeloCalificacion.findOne({ where: { id } });
        if (!calificacionExistente) {
            contenido.msj = "La calificación no existe";
            return enviar(404, contenido, res);
        }

        await ModeloCalificacion.update(req.body, { where: { id } });
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
    const { id } = req.query;
    let contenido = {
        tipo: 0,
        datos: [],
        msj: [],
    };
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
        contenido.tipo = 0;
        contenido.msj = "Error en el servidor al eliminar la calificación";
        enviar(500, contenido, res);
    }
};

// Filtros en general
exports.busqueda = async (req, res) => {
    const validacion = validationResult(req);
    if (validacion.errors.length > 0) {
        var msjerror = "";
        validacion.errors.forEach((r) => {
            msjerror = msjerror + r.msg + ". ";
        });
        res.json({ msj: "Hay errores en la petición", error: msjerror });
    } else {
        try {
            const whereClause = {};
            if (req.query.id) whereClause.id = req.query.id;
            if (req.query.nombre) whereClause.nombre_carrera = req.query.nombre;
            if (req.query.facultad) whereClause.facultad = req.query.facultad;

            const busqueda = await ModeloCalificacion.findAll({
                where: { [Op.or]: whereClause },
            });
            res.json(busqueda);
        } catch (error) {
            res.json(error);
        }
    }
};

// Filtro para buscar por id de Calificación
exports.busqueda_id = async (req, res) => {
    const validacion = validationResult(req);
    if (validacion.errors.length > 0) {
        var msjerror = "";
        validacion.errors.forEach((r) => {
            msjerror = msjerror + r.msg + ". ";
        });
        res.json({ msj: "Hay errores en la petición", error: msjerror });
    } else {
        try {
            const busqueda = await ModeloCalificacion.findOne({ where: { id: req.query.id } });
            res.json(busqueda);
        } catch (error) {
            res.json(error);
        }
    }
};

// Filtro para buscar por nombre de estudiante
exports.busqueda_nombre = async (req, res) => {
    const validacion = validationResult(req);
    if (validacion.errors.length > 0) {
        var msjerror = "";
        validacion.errors.forEach((r) => {
            msjerror = msjerror + r.msg + ". ";
        });
        res.json({ msj: "Hay errores en la petición", error: msjerror });
    } else {
        try {
            const busqueda = await ModeloCalificacion.findOne({ where: { nombre_carrera: req.query.nombre } });
            res.json(busqueda);
        } catch (error) {
            res.json(error);
        }
    }
};