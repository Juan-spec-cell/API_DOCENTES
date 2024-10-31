const ModeloAsistencia = require('../modelos/asistencia');
const ModeloEstudiante = require('../modelos/estudiante');
const ModeloAsignatura = require('../modelos/asignatura');
const { enviar, errores } = require('../configuracion/ayuda');
const { validationResult } = require('express-validator');

exports.inicio = (req, res) => {
    res.json({ msj: "Hola desde el controlador de asistencias" });
};

exports.listar = async (req, res) => {
  let contenido = {
      tipo: 0,
      datos: [],
      msj: [],
  };
  try {
      const data = await ModeloAsistencia.findAll({
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
      contenido.datos = data.map(asistencia => ({
          nombre_estudiante: `${asistencia.Estudiante.nombre} ${asistencia.Estudiante.apellido}`,
          nombre_asignatura: asistencia.Asignatura.nombre_asignatura,
          fecha: asistencia.fecha,
          estado: asistencia.estado
      }));
      enviar(200, contenido, res);
  } catch (error) {
      contenido.tipo = 0;
      contenido.msj = "Error al cargar los datos de asistencias";
      enviar(500, contenido, res);
      console.log(error);
  }
};

exports.guardar = async (req, res) => {
  const { nombre_estudiante, apellido_estudiante, nombre_asignatura, fecha, estado } = req.body;
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

      // Crear nueva asistencia
      const nuevaAsistencia = await ModeloAsistencia.create({
          id_estudiante: estudiante.id_estudiante,
          id_asignatura: asignatura.id_asignatura,
          fecha,
          estado
      });

      // Preparar la respuesta
      const response = {
          nombre_estudiante: `${estudiante.nombre} ${estudiante.apellido}`,
          nombre_asignatura: asignatura.nombre_asignatura,
          fecha: nuevaAsistencia.fecha,
          estado: nuevaAsistencia.estado
      };

      contenido.tipo = 1;
      contenido.datos = response;
      contenido.msj = "Asistencia guardada correctamente";
      enviar(200, contenido, res);
  } catch (error) {
      contenido.tipo = 0;
      contenido.msj = "Error en el servidor al guardar la asistencia";
      enviar(500, contenido, res);
      console.log(error);
  }
};

exports.editar = async (req, res) => {
  const { id_asistencia } = req.query;
  const { nombre_estudiante, apellido_estudiante, nombre_asignatura, fecha, estado } = req.body;
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
      // Buscar la asistencia por id
      const asistencia = await ModeloAsistencia.findOne({ where: { id_asistencia } });
      if (!asistencia) {
          return res.status(404).json({ error: 'Asistencia no encontrada' });
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

      // Actualizar la asistencia
      asistencia.id_estudiante = estudiante.id_estudiante;
      asistencia.id_asignatura = asignatura.id_asignatura;
      asistencia.fecha = fecha;
      asistencia.estado = estado;
      await asistencia.save();

      // Preparar la respuesta
      const response = {
          id_asistencia: asistencia.id_asistencia,
          nombre_estudiante: `${estudiante.nombre} ${estudiante.apellido}`,
          nombre_asignatura: asignatura.nombre_asignatura,
          fecha: asistencia.fecha,
          estado: asistencia.estado
      };

      contenido.tipo = 1;
      contenido.datos = response;
      contenido.msj = "Asistencia editada correctamente";
      enviar(200, contenido, res);
  } catch (error) {
      contenido.tipo = 0;
      contenido.msj = "Error en el servidor al editar la asistencia";
      enviar(500, contenido, res);
      console.log(error);
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
        const asistenciaExistente = await ModeloAsistencia.findOne({ where: { id_asistencia } });
        if (!asistenciaExistente) {
            contenido.msj = "La asistencia no existe";
            return enviar(404, contenido, res);
        }

        await ModeloAsistencia.destroy({ where: { id_asistencia } });
        contenido.tipo = 1;
        contenido.msj = "Asistencia eliminada correctamente";
        enviar(200, contenido, res);
    } catch (error) {
        contenido.tipo = 0;
        contenido.msj = "Error en el servidor al eliminar la asistencia";
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
        if (req.query.id) whereClause.id_asistencia = req.query.id;
        if (req.query.id) whereClause.id_estudiante = req.query.id;
        if (req.query.id) whereClause.id_asignatura = req.query.id;
        if (req.query.fecha) whereClause.fecha = req.query.fecha;
        if (req.query.estado) whereClause.estado = req.query.estado;

        const busqueda = await ModeloAsistencia.findAll({
          where: { [Op.or]: whereClause },
        });
        res.json(busqueda);
      } catch (error) {
        res.json(error);
      }
    }
  };

  //filtro para buscar por id de asistencia
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
        const busqueda = await ModeloAsistencia.findOne({ where: { id_asistencia: req.query.id } });
        res.json(busqueda);
      } catch (error) {
        res.json(error);
      }
    }
  };

  //filtro para buscar por fecha de asignatura
exports.busqueda_fecha = async (req, res) => {
    const validacion = validationResult(req);
    if (validacion.errors.length > 0) {
      var msjerror = "";
      validacion.errors.forEach((r) => {
        msjerror = msjerror + r.msg + ". ";
      });
      res.json({ msj: "Hay errores en la petición", error: msjerror });
    } else {
      try {
        const busqueda = await ModeloAsistencia.findOne({ where: { fecha: req.query.fecha } });
        res.json(busqueda);
      } catch (error) {
        res.json(error);
      }
    }
  };