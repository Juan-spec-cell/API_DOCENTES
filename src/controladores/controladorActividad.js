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
        // Buscar la asignatura por nombre
        const asignatura = await ModeloAsignatura.findOne({ where: { nombre_asignatura } });
        if (!asignatura) {
            return res.status(404).json({ error: 'Asignatura no encontrada' });
        }

        const nuevaActividad = await ModeloActividad.create({
            id_asignatura: asignatura.id_asignatura,
            tipo_actividad: tipo_actividad,
            fecha: fecha
        });
        res.status(201).json({
            message: "Actividad guardada con éxito",
            data: nuevaActividad
        });
    } catch (error) {
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
            nombre_actividad: actividad.tipo_actividad,
            nombre_asignatura: actividad.Asignatura ? actividad.Asignatura.nombre_asignatura : null,
            fecha: actividad.fecha,
            createdAt: actividad.createdAt,
            updatedAt: actividad.updatedAt
        }));
        enviar(200, contenido, res);
    } catch (error) {
        contenido.tipo = 0;
        contenido.msj = "Error al cargar los datos de actividades";
        enviar(500, contenido, res);
        console.log(error);
    }
};

function enviar(status, contenido, res) {
    res.status(status).json(contenido);
}

exports.editar = async (req, res) => {
    const { id } = req.query;
    const { tipo_actividad, fecha } = req.body; // Solo se actualizan estos campos

    try {
        const buscarActividad = await ModeloActividad.findOne({ where: { id_actividad: id } });
        if (!buscarActividad) {
            return res.status(404).json({ error: 'Actividad no encontrada' });
        }

        // Actualiza solo los campos permitidos
        if (tipo_actividad) {
            buscarActividad.tipo_actividad = tipo_actividad;
        }
        if (fecha) {
            buscarActividad.fecha = fecha;
        }

        await buscarActividad.save();
        res.status(200).json({ message: "Actividad actualizada", data: buscarActividad });
    } catch (error) {
        res.status(500).json({ message: "Error al editar la actividad", error: error.message });
    }
};


exports.eliminar = async (req, res) => {
    const { id } = req.query;
    
    try {
        const busqueda = await ModeloActividad.findOne({ where: { id_actividad: id } });
        if (!busqueda) {
            return res.status(404).json({ error: "El id no existe" });
        }

        await ModeloActividad.destroy({ where: { id_actividad: id } });
        res.status(200).json({ message: "Registro eliminado" });
    } catch (error) {
        res.status(500).json({ message: "Error al eliminar la actividad", error: error.message });
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
