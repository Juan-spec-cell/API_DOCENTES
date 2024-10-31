const ModeloCalificacion = require('../modelos/calificacion'); 
const ModeloEstudiante = require('../modelos/estudiante');
const ModeloAsignatura = require('../modelos/asignatura');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');

exports.inicio = (req, res) => {
    const objeto = {
        titulo: 'Rutas de Calificaciones'
    };
    res.json(objeto);
};

exports.guardar = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { nombre_estudiante, apellido_estudiante, nombre_asignatura, nota } = req.body;
    try {
        // Buscar el estudiante por nombre y apellido
        const estudiante = await ModeloEstudiante.findOne({ where: { nombre: nombre_estudiante, apellido: apellido_estudiante } });
        if (!estudiante) {
            return res.status(404).json({ error: 'Estudiante no encontrado' });
        }

        // Buscar la asignatura por nombre
        const asignatura = await ModeloAsignatura.findOne({ where: { nombre_asignatura } });
        if (!asignatura) {
            return res.status(404).json({ error: 'Asignatura no encontrada' });
        }

        // Crear nueva calificación
        const nuevaCalificacion = await ModeloCalificacion.create({
            id_estudiante: estudiante.id_estudiante,
            id_asignatura: asignatura.id_asignatura,
            nota
        });

        // Preparar la respuesta
        const response = {
            id_calificacion: nuevaCalificacion.id_calificacion,
            nombre_estudiante: `${estudiante.nombre} ${estudiante.apellido}`,
            nombre_asignatura: asignatura.nombre_asignatura,
            nota: nuevaCalificacion.nota
        };

        return res.status(201).json({
            message: "Calificación guardada con éxito",
            data: response
        });
    } catch (error) {
        return res.status(500).json({
            message: "Error al guardar la calificación",
            error: error.message
        });
    }
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
                    attributes: ['nombre', 'apellido']
                },
                {
                    model: ModeloAsignatura,
                    attributes: ['nombre_asignatura']
                }
            ]
        });

        contenido.tipo = 1;
        contenido.datos = data.map(calificacion => ({
            id_calificacion: calificacion.id_calificacion,
            nombre_estudiante: calificacion.Estudiante.nombre,
            apellido_estudiante: calificacion.Estudiante.apellido,
            nombre_asignatura: calificacion.Asignatura.nombre_asignatura,
            nota: calificacion.nota
        }));
        enviar(200, contenido, res);
    } catch (error) {
        contenido.tipo = 0;
        contenido.msj = "Error al cargar los datos de calificaciones";
        enviar(500, contenido, res);
        console.log(error);
    }
};

// Asegúrate de que la función enviar esté definida en algún lugar de tu código
function enviar(status, contenido, res) {
    res.status(status).json(contenido);
}

exports.editar = async (req, res) => {
    const { id_calificacion } = req.query;
    const { nombre_estudiante, apellido_estudiante, nombre_asignatura, nota } = req.body;
    let contenido = {
        tipo: 0,
        datos: [],
        msj: [],
    };
    
    // Validación de errores
    contenido.msj = errores(validationResult(req));
    if (contenido.msj.length > 0) {
        return enviar(200, contenido, res);
    }

    try {
        // Buscar la calificación por id
        const calificacion = await ModeloCalificacion.findOne({ where: { id_calificacion } });
        if (!calificacion) {
            return res.status(404).json({ error: 'Calificación no encontrada' });
        }

        // Buscar el estudiante por nombre y apellido
        const estudiante = await ModeloEstudiante.findOne({ where: { nombre: nombre_estudiante, apellido: apellido_estudiante } });
        if (!estudiante) {
            return res.status(404).json({ error: 'Estudiante no encontrado' });
        }

        // Buscar la asignatura por nombre
        const asignatura = await ModeloAsignatura.findOne({ where: { nombre_asignatura } });
        if (!asignatura) {
            return res.status(404).json({ error: 'Asignatura no encontrada' });
        }

        // Actualizar la calificación
        calificacion.id_estudiante = estudiante.id_estudiante;
        calificacion.id_asignatura = asignatura.id_asignatura;
        calificacion.nota = nota;
        await calificacion.save();

        // Preparar la respuesta
        const response = {
            id_calificacion: calificacion.id_calificacion,
            nombre_estudiante: `${estudiante.nombre} ${estudiante.apellido}`,
            nombre_asignatura: asignatura.nombre_asignatura,
            nota: calificacion.nota
        };

        contenido.tipo = 1;
        contenido.datos = response;
        contenido.msj = "Calificación editada correctamente";
        enviar(200, contenido, res);
    } catch (error) {
        contenido.tipo = 0;
        contenido.msj = "Error en el servidor al editar la calificación";
        enviar(500, contenido, res);
        console.log(error);
    }
};



exports.eliminar = async (req, res) => {
    const { id } = req.query;
    const validacion = validationResult(req);
    if (validacion.errors.length > 0) {
        var msjerror = "";
        validacion.errors.forEach(r => {
            msjerror = msjerror + r.msg + ". ";
        });
        res.json({ msj: "Hay errores en la petición", error: msjerror });
    } else {
        try {
            var busqueda = await ModeloCalificacion.findOne({ where: { id_calificacion: id } });
            console.log(busqueda);
            if (!busqueda) {
                res.json({ msj: "El id no existe" });
            } else {
                await ModeloCalificacion.destroy({ where: { id_calificacion: id } })
                    .then((data) => {
                        res.json({ msj: "Registro eliminado", data: data });
                    })
                    .catch((er) => {
                        res.json(er);
                    });
            }
        } catch (error) {
            res.json(error);
        }
    }
};

//filtros
exports.busqueda = async (req, res) => {
    const validacion = validationResult(req);
    if (validacion.errors.length > 0) {
        var msjerror = "";
        validacion.errors.forEach(r => {
            msjerror = msjerror + r.msg + ". ";
        });
        res.json({ msj: "Hay errores en la petición", error: msjerror });
    } else {
        try {
            const whereClause = {};
            if (req.query.id) whereClause.id_calificacion = req.query.id;
            if (req.query.tipo) whereClause.tipo_calificacion = req.query.tipo;
            const busqueda = await ModeloCalificacion.findAll({ where: { [Op.or]: whereClause } });
            res.json(busqueda);
        } catch (error) {
            res.json(error);
        }
    }
};

exports.busqueda_id = async (req, res) => {
    const validacion = validationResult(req);
    if (validacion.errors.length > 0) {
        var msjerror = "";
        validacion.errors.forEach(r => {
            msjerror = msjerror + r.msg + ". ";
        });
        res.json({ msj: "Hay errores en la petición", error: msjerror });
    } else {
        try {
            const busqueda = await ModeloCalificacion.findOne({ where: { id_calificacion: req.query.id } });
            res.json(busqueda);
        } catch (error) {
            res.json(error);
        }
    }
};

exports.buscarPorId = async (id) => {
    return await ModeloCalificacion.findOne({ where: { id_calificacion: id } });
};