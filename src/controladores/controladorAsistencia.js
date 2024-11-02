const ModeloAsistencia = require('../modelos/asistencia');
const ModeloEstudiante = require('../modelos/estudiante');
const ModeloAsignatura = require('../modelos/asignatura');
const { enviar, errores } = require('../configuracion/ayuda');
const { validationResult } = require('express-validator');

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
                fecha: asistencia.fecha,
                estado: asistencia.estado,
                createdAt: asistencia.createdAt,
                updatedAt: asistencia.updatedAt
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
    const { id_asistencia } = req.query;
    let contenido = {
        tipo: 0,
        datos: [],
        msj: [],
    };

    try {
        const asistenciaExistente = await ModeloAsistencia.findOne({ where: { id: id_asistencia } });
        if (!asistenciaExistente) {
            contenido.msj = "La asistencia no existe";
            return enviar(404, contenido, res);
        }

        await ModeloAsistencia.destroy({ where: { id: id_asistencia } });
        contenido.tipo = 1;
        contenido.msj = "Asistencia eliminada correctamente";
        enviar(200, contenido, res);
    } catch (error) {
        console.error(error);
        contenido.tipo = 0;
        contenido.msj = "Error en el servidor al eliminar la asistencia";
        enviar(500, contenido, res);
    }
};
