const modelo = require('../modelos/actividad'); // Asegúrate de que esta ruta sea correcta
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

    const { id_asignatura, tipo_actividad, fecha } = req.body;
    try {
        const nuevaActividad = await modelo.create({
            id_asignatura: id_asignatura,
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
        const data = await modelo.findAll();
        contenido.tipo = 1;
        contenido.datos = data;
        enviar(200, contenido, res);
    } catch (error) {
        contenido.tipo = 0;
        contenido.msj = "Error al cargar los datos de actividades";
        enviar(500, contenido, res);
    }
};

// Asegúrate de que la función enviar esté definida en algún lugar de tu código
function enviar(status, contenido, res) {
    res.status(status).json(contenido);
}

exports.editar = async (req, res) => {
    const { id } = req.query;
    const { id_asignatura, tipo_actividad, fecha } = req.body;
    try {
        var buscar_actividad = await modelo.findOne({ where: { id_actividad: id } });
        if (!buscar_actividad) {
            res.json({ msj: "El id no existe" });
        } else {
            buscar_actividad.id_asignatura = id_asignatura;
            buscar_actividad.tipo_actividad = tipo_actividad;
            buscar_actividad.fecha = fecha;
            await buscar_actividad.save()
                .then((data) => {
                    res.json(data);
                }).catch((er) => {
                    res.json(er);
                });
        }
    } catch (error) {
        console.log(error);
        res.json({ msj: "Error en el servidor" });
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
            var busqueda = await modelo.findOne({ where: { id_actividad: id } });
            console.log(busqueda);
            if (!busqueda) {
                res.json({ msj: "El id no existe" });
            } else {
                await modelo.destroy({ where: { id_actividad: id } })
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
            if (req.query.id) whereClause.id_actividad = req.query.id;
            if (req.query.tipo) whereClause.tipo_actividad = req.query.tipo;
            const busqueda = await modelo.findAll({ where: { [Op.or]: whereClause } });
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
            const busqueda = await modelo.findOne({ where: { id_actividad: req.query.id } });
            res.json(busqueda);
        } catch (error) {
            res.json(error);
        }
    }
};

exports.buscarPorId = async (id) => {
    return await modelo.findOne({ where: { id_actividad: id } });
};