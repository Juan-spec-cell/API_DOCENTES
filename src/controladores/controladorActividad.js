const ModeloActividad = require('../modelos/actividad'); 
const ModeloAsignatura = require('../modelos/asignatura'); 
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');
const moment = require('moment');

exports.inicio = (req, res) => {
    const objeto = {
        titulo: 'Rutas de Actividades'
    };
    res.json(objeto);
};

exports.guardar = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log("Errores de validación:", errors.array());
        return res.status(400).json({ errors: errors.array() });
    }

    const { nombre_asignatura, tipo_actividad, fecha, valor, parcial } = req.body;
    console.log("Datos recibidos:", { nombre_asignatura, tipo_actividad, fecha, valor, parcial });

    try {
        // Buscar la asignatura por su nombre
        const asignatura = await ModeloAsignatura.findOne({ where: { nombre_asignatura } });
        if (!asignatura) {
            console.log("Asignatura no encontrada:", nombre_asignatura);
            return res.status(404).json({ error: 'Asignatura no encontrada' });
        }

        // Asegúrate de que el campo de ID de asignatura sea el correcto
        const nuevaActividad = await ModeloActividad.create({
            asignaturaId: asignatura.id, 
            tipo_actividad,
            fecha,
            valor,
            parcial 
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
    try {
        const actividades = await ModeloActividad.findAll({
            include: [{
                model: ModeloAsignatura,
                attributes: ['nombre_asignatura']
            }]
        });

        res.status(200).json({
            tipo: 1,
            datos: actividades.map(actividad => ({
                id: actividad.id,
                nombre_actividad: actividad.tipo_actividad,
                nombre_asignatura: actividad.Asignatura.nombre_asignatura,
                fecha: actividad.fecha,
                valor: actividad.valor,
                parcial: actividad.parcial, // Añadir el campo parcial
                createdAt: actividad.createdAt,
                updatedAt: actividad.updatedAt
            })),
            msj: []
        });
    } catch (error) {
        console.error("Error al listar las actividades:", error);
        res.status(500).json({
            tipo: 0,
            msj: ["Error al cargar los datos de actividades"]
        });
    }
};

function enviar(status, contenido, res) {
    res.status(status).json(contenido);
}

exports.editar = async (req, res) => {
    const { id } = req.query;
    const { tipo_actividad, fecha } = req.body;

    try {
        const buscarActividad = await ModeloActividad.findOne({ where: { id } });
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

/******************************** Filtros ************************************/

exports.busqueda_id = async (req, res) => {
    const { id } = req.query;
    let contenido = { tipo: 0, datos: [], msj: [] };

    try {
        const actividad = await ModeloActividad.findOne({ where: { id } });
        if (!actividad) {
            contenido.msj = "Actividad no encontrada";
            return enviar(404, contenido, res);
        }

        contenido.tipo = 1;
        contenido.datos = actividad;
        enviar(200, contenido, res);
    } catch (error) {
        contenido.tipo = 0;
        contenido.msj = "Error en el servidor al buscar la actividad";
        enviar(500, contenido, res);
    }
};

exports.busqueda_tipo = async (req, res) => {
    const { tipo_actividad } = req.query;
    let contenido = { tipo: 0, datos: [], msj: [] };

    try {
        const actividades = await ModeloActividad.findAll({ where: { tipo_actividad } });
        if (actividades.length === 0) {
            contenido.msj = "No se encontraron actividades con ese tipo";
            return enviar(404, contenido, res);
        }

        contenido.tipo = 1;
        contenido.datos = actividades;
        enviar(200, contenido, res);
    } catch (error) {
        contenido.tipo = 0;
        contenido.msj = "Error en el servidor al buscar las actividades";
        enviar(500, contenido, res);
    }
};

