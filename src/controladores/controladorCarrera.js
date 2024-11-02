const ModeloCarrera = require('../modelos/carrera');
const { enviar, errores } = require('../configuracion/ayuda');
const { validationResult } = require('express-validator');

exports.inicio = (req, res) => {
    res.json({ msj: "Hola desde el controlador de carreras" });
};

exports.listar = async (req, res) => {
    let contenido = {
        tipo: 0,
        datos: [],
        msj: [],
    };
    try {
        const data = await ModeloCarrera.findAll();
        contenido.tipo = 1;
        contenido.datos = data;
        enviar(200, contenido, res);
    } catch (error) {
        contenido.tipo = 0;
        contenido.msj = "Error al cargar los datos de carreras";
        enviar(500, contenido, res);
    }
};

exports.guardar = async (req, res) => {
    const { nombre_carrera, facultad } = req.body;
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
        const data = await ModeloCarrera.create({ nombre_carrera, facultad });
        contenido.tipo = 1;
        contenido.datos = data;
        contenido.msj = "Carrera guardada correctamente";
        enviar(200, contenido, res);
    } catch (error) {
        contenido.tipo = 0;
        contenido.msj = "Error en el servidor al guardar la carrera";
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
        const carreraExistente = await ModeloCarrera.findOne({ where: { id } });
        if (!carreraExistente) {
            contenido.msj = "La carrera no existe";
            return enviar(404, contenido, res);
        }

        await ModeloCarrera.update(req.body, { where: { id } });
        contenido.tipo = 1;
        contenido.msj = "Carrera editada correctamente";
        enviar(200, contenido, res);
    } catch (error) {
        contenido.tipo = 0;
        contenido.msj = "Error en el servidor al editar la carrera";
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
        const carreraExistente = await ModeloCarrera.findOne({ where: { id } });
        if (!carreraExistente) {
            contenido.msj = "La carrera no existe";
            return enviar(404, contenido, res);
        }

        await ModeloCarrera.destroy({ where: { id } });
        contenido.tipo = 1;
        contenido.msj = "Carrera eliminada correctamente";
        enviar(200, contenido, res);
    } catch (error) {
        contenido.tipo = 0;
        contenido.msj = "Error en el servidor al eliminar la carrera";
        enviar(500, contenido, res);
    }
};

//filtros en general
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

            const busqueda = await ModeloCarrera.findAll({
                where: { [Op.or]: whereClause },
            });
            res.json(busqueda);
        } catch (error) {
            res.json(error);
        }
    }
};

//filtro para buscar por id de Carrera
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
            const busqueda = await ModeloCarrera.findOne({ where: { id: req.query.id } });
            res.json(busqueda);
        } catch (error) {
            res.json(error);
        }
    }
};

//filtro para buscar por nombre de carrera
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
            const busqueda = await ModeloCarrera.findOne({ where: { nombre_carrera: req.query.nombre } });
            res.json(busqueda);
        } catch (error) {
            res.json(error);
        }
    }
};
