const ModeloEstudiante = require('../modelos/estudiante');
const ModeloUsuario = require('../modelos/usuario');
const ModeloCarrera = require('../modelos/carrera');
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
      const data = await ModeloEstudiante.findAll({
          include: [
              {
                  model: ModeloCarrera,
                  attributes: ['nombre_carrera']
              }
          ]
      });

      contenido.tipo = 1;
      contenido.datos = data.map(estudiante => ({
          id_estudiante: estudiante.id_estudiante,
          nombre_estudiante: estudiante.nombre,
          apellido_estudiante: estudiante.apellido,
          email: estudiante.email,
          nombre_carrera: estudiante.Carrera ? estudiante.Carrera.nombre_carrera : 'Carrera no asignada'
      }));
      enviar(200, contenido, res);
  } catch (error) {
      contenido.tipo = 0;
      contenido.msj = "Error al cargar los datos de estudiantes";
      enviar(500, contenido, res);
      console.log(error);
  }
};
exports.guardar = async (req, res) => {
  const { nombre_estudiante, apellido_estudiante, email, nombre_carrera } = req.body;
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
      // Buscar la carrera por nombre
      const carrera = await ModeloCarrera.findOne({ where: { nombre_carrera } });
      if (!carrera) {
          return res.status(404).json({ error: 'Carrera no encontrada' });
      }

      // Crear nuevo estudiante
      const nuevoEstudiante = await ModeloEstudiante.create({
          nombre: nombre_estudiante,
          apellido: apellido_estudiante,
          email: email,
          id_carrera: carrera.id_carrera
      });

      // Preparar la respuesta
      const response = {
          id_estudiante: nuevoEstudiante.id_estudiante,
          nombre_estudiante: `${nuevoEstudiante.nombre} ${nuevoEstudiante.apellido}`,
          email: nuevoEstudiante.email,
          nombre_carrera: carrera.nombre_carrera
      };

      contenido.tipo = 1;
      contenido.datos = response;
      contenido.msj = "Estudiante guardado correctamente";
      enviar(200, contenido, res);
  } catch (error) {
      contenido.tipo = 0;
      contenido.msj = "Error en el servidor al guardar el estudiante";
      enviar(500, contenido, res);
      console.log(error);
  }
};

exports.editar = async (req, res) => {
  const { id_estudiante } = req.query;
  const { nombre_estudiante, apellido_estudiante, email, nombre_carrera } = req.body;
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
      // Buscar el estudiante por id
      const estudiante = await ModeloEstudiante.findOne({ where: { id_estudiante } });
      if (!estudiante) {
          return res.status(404).json({ error: 'Estudiante no encontrado' });
      }

      // Buscar la carrera por nombre
      const carrera = await ModeloCarrera.findOne({ where: { nombre_carrera } });
      if (!carrera) {
          return res.status(404).json({ error: 'Carrera no encontrada' });
      }

      // Actualizar el estudiante
      estudiante.nombre = nombre_estudiante;
      estudiante.apellido = apellido_estudiante;
      estudiante.email = email;
      estudiante.id_carrera = carrera.id_carrera;
      await estudiante.save();

      // Preparar la respuesta
      const response = {
          id_estudiante: estudiante.id_estudiante,
          nombre_estudiante: `${estudiante.nombre} ${estudiante.apellido}`,
          email: estudiante.email,
          nombre_carrera: carrera.nombre_carrera
      };

      contenido.tipo = 1;
      contenido.datos = response;
      contenido.msj = "Estudiante editado correctamente";
      enviar(200, contenido, res);
  } catch (error) {
      contenido.tipo = 0;
      contenido.msj = "Error en el servidor al editar el estudiante";
      enviar(500, contenido, res);
      console.log(error);
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

      const { id_usuario } = estudianteExistente;

      await ModeloEstudiante.destroy({ where: { id_estudiante } });
      await ModeloUsuario.destroy({ where: { id_usuario } });

      contenido.tipo = 1;
      contenido.msj = "Estudiante y usuario eliminados correctamente";
      enviar(200, contenido, res);
  } catch (error) {
      contenido.tipo = 0;
      contenido.msj = "Error en el servidor al eliminar el estudiante y usuario";
      enviar(500, contenido, res);
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
  