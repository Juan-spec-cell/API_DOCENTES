const ModeloMatricula = require('../modelos/matricula');
const ModeloEstudiante = require('../modelos/estudiante');
const ModeloPeriodo = require('../modelos/periodo');
const { enviar, errores } = require('../configuracion/ayuda');
const { validationResult } = require('express-validator');

exports.inicio = (req, res) => {
    res.json({ msj: "Hola desde el controlador de matrículas" });
};

exports.listar = async (req, res) => {
  let contenido = {
      tipo: 0,
      datos: [],
      msj: [],
  };
  try {
      const data = await ModeloMatricula.findAll({
          include: [
              {
                  model: ModeloEstudiante,
                  attributes: ['nombre', 'apellido']
              },
              {
                  model: ModeloPeriodo,
                  attributes: ['nombre_periodo']
              }
          ]
      });

      contenido.tipo = 1;
      contenido.datos = data.map(matricula => ({
          nombre_estudiante: `${matricula.Estudiante.nombre} ${matricula.Estudiante.apellido}`,
          nombre_periodo: matricula.Periodo ? matricula.Periodo.nombre_periodo : null
      }));
      enviar(200, contenido, res);
  } catch (error) {
      contenido.tipo = 0;
      contenido.msj = "Error al cargar los datos de matrículas";
      enviar(500, contenido, res);
      console.log(error);
  }
};

exports.guardar = async (req, res) => {
  const { nombre_estudiante, apellido_estudiante, nombre_periodo } = req.body;
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

      // Buscar el periodo por nombre
      const periodo = await ModeloPeriodo.findOne({ where: { nombre_periodo } });
      if (!periodo) {
          return res.status(404).json({ error: 'Periodo no encontrado' });
      }

      // Crear nueva matricula
      const nuevaMatricula = await ModeloMatricula.create({
          id_estudiante: estudiante.id_estudiante,
          id_periodo: periodo.id_periodo
      });

      // Preparar la respuesta
      const response = {
          nombre_estudiante: `${estudiante.nombre} ${estudiante.apellido}`,
          nombre_periodo: periodo.nombre_periodo
      };

      contenido.tipo = 1;
      contenido.datos = response;
      contenido.msj = "Matrícula guardada correctamente";
      enviar(200, contenido, res);
  } catch (error) {
      contenido.tipo = 0;
      contenido.msj = "Error en el servidor al guardar la matrícula";
      enviar(500, contenido, res);
      console.log(error);
  }
};

exports.editar = async (req, res) => {
  const { id_matricula } = req.query;
  const { nombre_estudiante, apellido_estudiante, nombre_periodo } = req.body;
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
      // Buscar la matrícula por id
      const matricula = await ModeloMatricula.findOne({ where: { id_matricula } });
      if (!matricula) {
          return res.status(404).json({ error: 'Matrícula no encontrada' });
      }

      // Buscar el estudiante por nombre y apellido
      const estudiante = await ModeloEstudiante.findOne({ where: { nombre: nombre_estudiante, apellido: apellido_estudiante } });
      if (!estudiante) {
          return res.status(404).json({ error: 'Estudiante no encontrado' });
      }

      // Buscar el periodo por nombre
      const periodo = await ModeloPeriodo.findOne({ where: { nombre_periodo } });
      if (!periodo) {
          return res.status(404).json({ error: 'Periodo no encontrado' });
      }

      // Actualizar la matrícula
      matricula.id_estudiante = estudiante.id_estudiante;
      matricula.id_periodo = periodo.id_periodo;
      await matricula.save();

      // Preparar la respuesta
      const response = {
          id_matricula: matricula.id_matricula,
          nombre_estudiante: `${estudiante.nombre} ${estudiante.apellido}`,
          nombre_periodo: periodo.nombre_periodo
      };

      contenido.tipo = 1;
      contenido.datos = response;
      contenido.msj = "Matrícula editada correctamente";
      enviar(200, contenido, res);
  } catch (error) {
      contenido.tipo = 0;
      contenido.msj = "Error en el servidor al editar la matrícula";
      enviar(500, contenido, res);
      console.log(error);
  }
};

exports.eliminar = async (req, res) => {
    const { id_matricula } = req.query;
    let contenido = {
        tipo: 0,
        datos: [],
        msj: [],
    };
    try {
        const matriculaExistente = await ModeloMatricula.findOne({ where: { id_matricula } });
        if (!matriculaExistente) {
            contenido.msj = "La matrícula no existe";
            return enviar(404, contenido, res);
        }

        await ModeloMatricula.destroy({ where: { id_matricula } });
        contenido.tipo = 1;
        contenido.msj = "Matrícula eliminada correctamente";
        enviar(200, contenido, res);
    } catch (error) {
        contenido.tipo = 0;
        contenido.msj = "Error en el servidor al eliminar la matrícula";
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
        if (req.query.id) whereClause.id_matricula = req.query.id;
        if (req.query.id) whereClause.id_estudiante = req.query.id;
        if (req.query.id) whereClause.id_periodo = req.query.id;
       
    
        const busqueda = await ModeloMatricula.findAll({
          where: { [Op.or]: whereClause },
        });
        res.json(busqueda);
      } catch (error) {
        res.json(error);
      }
    }
  };

//filtro para buscar por id de Matricula
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
        const busqueda = await ModeloMatricula.findOne({ where: { id_matricula: req.query.id } });
        res.json(busqueda);
      } catch (error) {
        res.json(error);
      }
    }
  };

//filtro para buscar por id de periodo de matricula
exports.busqueda_id_periodo = async (req, res) => {
    const validacion = validationResult(req);
    if (validacion.errors.length > 0) {
      var msjerror = "";
      validacion.errors.forEach((r) => {
        msjerror = msjerror + r.msg + ". ";
      });
      res.json({ msj: "Hay errores en la petición", error: msjerror });
    } else {
      try {
        const busqueda = await ModeloMatricula.findOne({ where: { id_periodo: req.query.busqueda_id_periodo } });
        res.json(busqueda);
      } catch (error) {
        res.json(error);
      }
    }
  };
