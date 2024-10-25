const ModeloPeriodo = require('../modelos/periodo');
const { enviar, errores } = require('../configuracion/ayuda');
const { validationResult } = require('express-validator');

exports.inicio = (req, res) => {
    res.json({ msj: "Hola desde el controlador de periodos" });
};

exports.listar = async (req, res) => {
    let contenido = {
        tipo: 0,
        datos: [],
        msj: [],
    };
    try {
        const data = await ModeloPeriodo.findAll();
        contenido.tipo = 1;
        contenido.datos = data;
        enviar(200, contenido, res);
    } catch (error) {
        contenido.tipo = 0;
        contenido.msj = "Error al cargar los datos de periodos";
        enviar(500, contenido, res);
    }
};

exports.guardar = async (req, res) => {
    const { nombre_periodo, fecha_inicio, fecha_fin } = req.body;
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
        const data = await ModeloPeriodo.create({ nombre_periodo, fecha_inicio, fecha_fin });
        contenido.tipo = 1;
        contenido.datos = data;
        contenido.msj = "Periodo guardado correctamente";
        enviar(200, contenido, res);
    } catch (error) {
        contenido.tipo = 0;
        contenido.msj = "Error en el servidor al guardar el periodo";
        enviar(500, contenido, res);
    }
};

exports.editar = async (req, res) => {
    const { id_periodo } = req.query;
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
        await ModeloPeriodo.update(req.body, { where: { id_periodo } });
        contenido.tipo = 1;
        contenido.msj = "Periodo editado correctamente";
        enviar(200, contenido, res);
    } catch (error) {
        contenido.tipo = 0;
        contenido.msj = "Error en el servidor al editar el periodo";
        enviar(500, contenido, res);
    }
};

exports.eliminar = async (req, res) => {
    const { id_periodo } = req.query;
    let contenido = {
        tipo: 0,
        datos: [],
        msj: [],
    };
    try {
        const periodoExistente = await ModeloPeriodo.findOne({ where: { id_periodo } });
        if (!periodoExistente) {
            contenido.msj = "El periodo no existe";
            return enviar(404, contenido, res);
        }

        await ModeloPeriodo.destroy({ where: { id_periodo } });
        contenido.tipo = 1;
        contenido.msj = "Periodo eliminado correctamente";
        enviar(200, contenido, res);
    } catch (error) {
        contenido.tipo = 0;
        contenido.msj = "Error en el servidor al eliminar el periodo";
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
        if (req.query.id) whereClause.id_periodo = req.query.id;
        if (req.query.nombre) whereClause.nombre_periodo = req.query.nombre;
        if (req.query.fecha) whereClause.fecha_inicio = req.query.fecha;
        if (req.query.fecha) whereClause.fecha_fin = req.query.fecha;
       
    
        const busqueda = await ModeloPeriodo.findAll({
          where: { [Op.or]: whereClause },
        });
        res.json(busqueda);
      } catch (error) {
        res.json(error);
      }
    }
  };

  //filtro para buscar por id de Periodo
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
        const busqueda = await ModeloPeriodo.findOne({ where: { id_periodo: req.query.id } });
        res.json(busqueda);
      } catch (error) {
        res.json(error);
      }
    }
  };

  //filtro para buscar por nombre de Periodo
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
        const busqueda = await ModeloPeriodo.findOne({ where: { nombre_periodo: req.query.nombre } });
        res.json(busqueda);
      } catch (error) {
        res.json(error);
      }
    }
  };