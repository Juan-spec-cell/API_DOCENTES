const ModeloEstudiante = require('../modelos/estudiante');
const { enviar, errores } = require('../configuracion/ayuda');
const { validationResult } = require('express-validator');

exports.inicio = (req, res) => {
    res.json({ msj: "Hola desde el controlador de estudiantes" });
};

exports.listar = async (req, res) => {
    let contenido = {
        tipo: 0,
        datos: [],
        msj: [],
    };
    try {
        const data = await ModeloEstudiante.findAll();
        contenido.tipo = 1;
        contenido.datos = data;
        enviar(200, contenido, res);
    } catch (error) {
        contenido.tipo = 0;
        contenido.msj = "Error al cargar los datos de estudiantes";
        enviar(500, contenido, res);
    }
};

exports.guardar = async (req, res) => {
    const { nombre_estudiante, correo, id_carrera } = req.body;
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
        const data = await ModeloEstudiante.create({ nombre_estudiante, correo, id_carrera });
        contenido.tipo = 1;
        contenido.datos = data;
        contenido.msj = "Estudiante guardado correctamente";
        enviar(200, contenido, res);
    } catch (error) {
        contenido.tipo = 0;
        contenido.msj = "Error en el servidor al guardar el estudiante";
        enviar(500, contenido, res);
    }
};

exports.editar = async (req, res) => {
    const { id_estudiante } = req.query;
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
        await ModeloEstudiante.update(req.body, { where: { id_estudiante } });
        contenido.tipo = 1;
        contenido.msj = "Estudiante editado correctamente";
        enviar(200, contenido, res);
    } catch (error) {
        contenido.tipo = 0;
        contenido.msj = "Error en el servidor al editar el estudiante";
        enviar(500, contenido, res);
    }
};

exports.eliminar = async (req, res) => {
    const { id_estudiante } = req.query;
    let contenido = {
        tipo: 0,
        datos: [],
        msj: [],
    };
    try {
        const estudianteExistente = await ModeloEstudiante.findOne({ where: { id_estudiante } });
        if (!estudianteExistente) {
            contenido.msj = "El estudiante no existe";
            return enviar(404, contenido, res);
        }

        await ModeloEstudiante.destroy({ where: { id_estudiante } });
        contenido.tipo = 1;
        contenido.msj = "Estudiante eliminado correctamente";
        enviar(200, contenido, res);
    } catch (error) {
        contenido.tipo = 0;
        contenido.msj = "Error en el servidor al eliminar el estudiante";
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
        if (req.query.id) whereClause.id_estudiante = req.query.id;
        if (req.query.nombre) whereClause.nombre_estudiante = req.query.nombre;
        if (req.query.correo) whereClause.correo = req.query.correo;
        if (req.query.id) whereClause.id_carrera = req.query.id;
    
        const busqueda = await ModeloEstudiante.findAll({
          where: { [Op.or]: whereClause },
        });
        res.json(busqueda);
      } catch (error) {
        res.json(error);
      }
    }
  };

//filtro para buscar por id de Estudiante
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
        const busqueda = await ModeloEstudiante.findOne({ where: { id_estudiante: req.query.id } });
        res.json(busqueda);
      } catch (error) {
        res.json(error);
      }
    }
  };

  //filtro para buscar por nombre del estudiante
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
        const busqueda = await ModeloEstudiante.findOne({ where: { nombre_estudiante: req.query.nombre } });
        res.json(busqueda);
      } catch (error) {
        res.json(error);
      }
    }
  };
  