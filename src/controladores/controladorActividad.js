const ModeloActividad = require('../modelos/actividad'); 
const ModeloAsignatura = require('../modelos/asignatura'); 
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');

exports.inicio = (req, res) => {
    const objeto = {
        titulo: 'Rutas de Actividades'
    };
    res.json(objeto);
};

exports.guardar = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { nombre_asignatura, tipo_actividad, fecha } = req.body;
    try {
        // Buscar la asignatura por su nombre
        const asignatura = await ModeloAsignatura.findOne({ where: { nombre_asignatura } });
        if (!asignatura) {
            return res.status(404).json({ error: 'Asignatura no encontrada' });
        }

        // Asegúrate de que el campo de ID de asignatura sea el correcto
        const nuevaActividad = await ModeloActividad.create({
            asignaturaId: asignatura.id, // Cambia `id_asignatura` a `id` si el campo de clave primaria en Asignatura es `id`
            tipo_actividad,
            fecha
        });

        res.status(201).json({
            message: "Actividad guardada con éxito",
            data: nuevaActividad
        });
    } catch (error) {
        console.error("Error al guardar la actividad:", error);
        res.status(500).json({
            message: "Error al guardar la actividad",
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
        const data = await ModeloActividad.findAll({
            include: [
                {
                    model: ModeloAsignatura,
                    attributes: ['nombre_asignatura']
                }
            ]
        });

        contenido.tipo = 1;
        contenido.datos = data.map(actividad => ({
            id: actividad.id, // Usa 'id' en lugar de 'id_actividad' si es necesario
            nombre_actividad: actividad.tipo_actividad,
            nombre_asignatura: actividad.Asignatura ? actividad.Asignatura.nombre_asignatura : null,
            fecha: actividad.fecha,
            createdAt: actividad.createdAt,
            updatedAt: actividad.updatedAt
        }));
        res.status(200).json(contenido);
    } catch (error) {
        contenido.tipo = 0;
        contenido.msj = "Error al cargar los datos de actividades";
        res.status(500).json(contenido);
        console.error(error);
    }
};



function enviar(status, contenido, res) {
    res.status(status).json(contenido);
}

exports.editar = async (req, res) => {
    const { id } = req.query;
    const { tipo_actividad, fecha } = req.body;

    try {
        const buscarActividad = await ModeloActividad.findOne({ where: { id_actividad: id } });
        if (!buscarActividad) {
            return res.status(404).json({ error: 'Actividad no encontrada' });
        }

        buscarActividad.tipo_actividad = tipo_actividad || buscarActividad.tipo_actividad;
        buscarActividad.fecha = fecha || buscarActividad.fecha;

        await buscarActividad.save();
        res.status(200).json({ message: "Actividad actualizada", data: buscarActividad });
    } catch (error) {
        res.status(500).json({ message: "Error al editar la actividad", error: error.message });
    }
};

exports.eliminar = async (req, res) => {
    const { id } = req.query; // Obtener el ID de la consulta
    let contenido = { tipo: 0, datos: [], msj: [] };

    try {
        // Busca la actividad por ID
        const actividad = await ModeloActividad.findOne({ where: { id } });
        if (!actividad) {
            contenido.msj = "Actividad no encontrada";
            return enviar(404, contenido, res);
        }

        // Elimina la actividad
        await actividad.destroy();
        contenido.tipo = 1;
        contenido.msj = "Actividad eliminada correctamente";
        enviar(200, contenido, res);
    } catch (error) {
        contenido.tipo = 0;
        contenido.msj = "Error en el servidor al eliminar la actividad";
        console.error(error); // Imprimir el error en la consola para depuración
        enviar(500, contenido, res);
    }
};



exports.busqueda = async (req, res) => {
    const validacion = validationResult(req);
    if (validacion.errors.length > 0) {
        var msjerror = "";
        validacion.errors.forEach(r => {
            msjerror = msjerror + r.msg + ". ";
        });
        return res.json({ msj: "Hay errores en la petición", error: msjerror });
    }

    try {
        const whereClause = {};
        if (req.query.id) whereClause.id_actividad = req.query.id;
        if (req.query.tipo) whereClause.tipo_actividad = req.query.tipo;
        
        const busqueda = await ModeloActividad.findAll({ where: { [Op.or]: whereClause } });
        res.json(busqueda);
    } catch (error) {
        res.status(500).json(error);
    }
};

exports.busqueda_id = async (req, res) => {
    const validacion = validationResult(req);
    if (validacion.errors.length > 0) {
        var msjerror = "";
        validacion.errors.forEach(r => {
            msjerror = msjerror + r.msg + ". ";
        });
        return res.json({ msj: "Hay errores en la petición", error: msjerror });
    }

    try {
        const busqueda = await ModeloActividad.findOne({ where: { id_actividad: req.query.id } });
        res.json(busqueda);
    } catch (error) {
        res.status(500).json(error);
    }
};

exports.buscarPorId = async (id) => {
    return await ModeloActividad.findOne({ where: { id_actividad: id } });
};