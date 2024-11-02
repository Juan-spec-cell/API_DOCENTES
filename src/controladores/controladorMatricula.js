const ModeloMatricula = require('../modelos/matricula');
const ModeloEstudiante = require('../modelos/estudiante');
const ModeloPeriodo = require('../modelos/periodo');
const { enviar, errores } = require('../configuracion/ayuda');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');
const moment = require('moment');

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
                    attributes: ['primerNombre', 'primerApellido']
                },
                {
                    model: ModeloPeriodo,
                    attributes: ['nombre_periodo']
                }
            ]
        });

        contenido.tipo = 1;
        contenido.datos = data.map(matricula => ({
            id_matricula: matricula.id,
            primerNombre: matricula.Estudiante.primerNombre,
            primerApellido: matricula.Estudiante.primerApellido,
            nombre_periodo: matricula.Periodo.nombre_periodo,
            createdAt: moment(matricula.createdAt).format('YYYY-MM-DD HH:mm:ss'),
            updatedAt: moment(matricula.updatedAt).format('YYYY-MM-DD HH:mm:ss')
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

// Filtro para buscar por id de Matrícula
exports.buscarPorId = async (req, res) => {
    let contenido = {
        tipo: 0,
        datos: [],
        msj: [],
    };
    try {
        const { id } = req.query;
        const matricula = await ModeloMatricula.findOne({
            where: { id },
            include: [
                {
                    model: ModeloEstudiante,
                    attributes: ['primerNombre', 'primerApellido']
                },
                {
                    model: ModeloPeriodo,
                    attributes: ['nombre_periodo']
                }
            ]
        });

        if (!matricula) {
            contenido.msj = "Matrícula no encontrada";
            return enviar(404, contenido, res);
        }

        contenido.tipo = 1;
        contenido.datos = {
            id: matricula.id,
            nombre_estudiante: `${matricula.Estudiante.primerNombre} ${matricula.Estudiante.primerApellido}`,
            nombre_periodo: matricula.Periodo.nombre_periodo,
            createdAt: matricula.createdAt,
            updatedAt: matricula.updatedAt
        };
        enviar(200, contenido, res);
    } catch (error) {
        contenido.tipo = 0;
        contenido.msj = "Error al buscar la matrícula";
        enviar(500, contenido, res);
        console.log(error);
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
        return res.json({ msj: "Hay errores en la petición", error: msjerror });
    }

    try {
        const { nombre } = req.query;
        const [primerNombre, primerApellido] = nombre.split(' ');

        const whereClause = {
            primerNombre: {
                [Op.like]: `%${primerNombre}%`  // Permitir coincidencias parciales
            },
            primerApellido: {
                [Op.like]: `%${primerApellido}%`  // Permitir coincidencias parciales
            }
        };

        const busqueda = await ModeloMatricula.findAll({
            include: [
                {
                    model: ModeloEstudiante,
                    where: whereClause,
                    attributes: ['primerNombre', 'segundoNombre', 'primerApellido']
                },
                {
                    model: ModeloPeriodo,
                    attributes: ['nombre_periodo']
                }
            ]
        });

        if (busqueda.length === 0) {
            return res.status(404).json({ msj: "No se encontraron matrículas para el estudiante especificado" });
        }

        const resultado = busqueda.map(matricula => ({
            id_matricula: matricula.id,
            nombre_estudiante: `${matricula.Estudiante.primerNombre} ${matricula.Estudiante.segundoNombre || ''} ${matricula.Estudiante.primerApellido}`.trim(),
            nombre_periodo: matricula.Periodo.nombre_periodo,
            createdAt: moment(matricula.createdAt).format('YYYY-MM-DD HH:mm:ss'),
            updatedAt: moment(matricula.updatedAt).format('YYYY-MM-DD HH:mm:ss')
        }));

        res.json(resultado);
    } catch (error) {
        res.status(500).json({ error: 'Error en el servidor al buscar la matrícula' });
        console.log(error);
    }
};