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
                  attributes: ['id', 'primerNombre', 'segundoNombre', 'primerApellido', 'segundoApellido']
              },
              {
                  model: ModeloPeriodo,
                  attributes: ['id', 'nombre_periodo']
              }
          ]
      });

      // Transformar los datos para cambiar la estructura de la respuesta
      const datosTransformados = data.map(matricula => ({
          id: matricula.id,
          nombre_completo: `${matricula.Estudiante.primerNombre} ${matricula.Estudiante.segundoNombre || ''} ${matricula.Estudiante.primerApellido} ${matricula.Estudiante.segundoApellido || ''}`.trim(),
          nombre_periodo: matricula.Periodo.nombre_periodo
      }));

      contenido.tipo = 1;
      contenido.datos = datosTransformados;
      enviar(200, contenido, res);
  } catch (error) {
      contenido.tipo = 0;
      contenido.msj = "Error al cargar los datos de matrículas";
      console.error(error);
      enviar(500, contenido, res);
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
        // Buscar el estudiante
        const estudiante = await ModeloEstudiante.findOne({
            where: {
                primerNombre: nombre_estudiante.split(' ')[0],
                primerApellido: apellido_estudiante.split(' ')[0]
            }
        });
        if (!estudiante) {
            contenido.msj = "Estudiante no encontrado";
            return enviar(404, contenido, res);
        }

        // Buscar el periodo
        const periodo = await ModeloPeriodo.findOne({ where: { nombre_periodo } });
        if (!periodo) {
            contenido.msj = "Periodo no encontrado";
            return enviar(404, contenido, res);
        }

        // Crear nueva matrícula
        const nuevaMatricula = await ModeloMatricula.create({
            estudianteId: estudiante.id,
            periodoId: periodo.id
        });

        contenido.tipo = 1;
        contenido.datos = nuevaMatricula;
        contenido.msj = "Matrícula guardada correctamente";
        enviar(200, contenido, res);
    } catch (error) {
        contenido.tipo = 0;
        contenido.msj = "Error en el servidor al guardar la matrícula";
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
      const matriculaExistente = await ModeloMatricula.findOne({ where: { id } });
      if (!matriculaExistente) {
          contenido.msj = "La matrícula no existe";
          return enviar(404, contenido, res);
      }

      // Buscar el estudiante
      const estudiante = await ModeloEstudiante.findOne({
          where: {
              primerNombre: req.body.nombre_estudiante.split(' ')[0],
              primerApellido: req.body.apellido_estudiante.split(' ')[0]
          }
      });
      if (!estudiante) {
          contenido.msj = "Estudiante no encontrado";
          return enviar(404, contenido, res);
      }

      // Buscar el periodo
      const periodo = await ModeloPeriodo.findOne({ where: { nombre_periodo: req.body.nombre_periodo } });
      if (!periodo) {
          contenido.msj = "Periodo no encontrado";
          return enviar(404, contenido, res);
      }

      // Actualizar la matrícula
      await ModeloMatricula.update({
          estudianteId: estudiante.id,
          periodoId: periodo.id
      }, { where: { id } });

      contenido.tipo = 1;
      contenido.msj = "Matrícula editada correctamente";
      enviar(200, contenido, res);
  } catch (error) {
      contenido.tipo = 0;
      contenido.msj = "Error en el servidor al editar la matrícula";
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
        const matriculaExistente = await ModeloMatricula.findOne({ where: { id } });
        if (!matriculaExistente) {
            contenido.msj = "La matrícula no existe";
            return enviar(404, contenido, res);
        }

        await ModeloMatricula.destroy({ where: { id } });
        contenido.tipo = 1;
        contenido.msj = "Matrícula eliminada correctamente";
        enviar(200, contenido, res);
    } catch (error) {
        contenido.tipo = 0;
        contenido.msj = "Error en el servidor al eliminar la matrícula";
        enviar(500, contenido, res);
    }
};

// Filtros en general
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

            const busqueda = await ModeloMatricula.findAll({
                where: { [Op.or]: whereClause },
            });
            res.json(busqueda);
        } catch (error) {
            res.json(error);
        }
    }
};

// Filtro para buscar por id de Matrícula
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
            const busqueda = await ModeloMatricula.findOne({ where: { id: req.query.id } });
            res.json(busqueda);
        } catch (error) {
            res.json(error);
        }
    }
};

// Filtro para buscar por nombre de estudiante
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
            const busqueda = await ModeloMatricula.findOne({ where: { nombre_carrera: req.query.nombre } });
            res.json(busqueda);
        } catch (error) {
            res.json(error);
        }
    }
};