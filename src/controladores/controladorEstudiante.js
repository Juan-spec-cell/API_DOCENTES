const ModeloEstudiante = require('../modelos/estudiante');
const ModeloUsuario = require('../modelos/usuario');
const ModeloCarrera = require('../modelos/carrera');
const { enviar, errores } = require('../configuracion/ayuda');
const { validationResult } = require('express-validator');
const argon2 = require('argon2');
const db = require('../configuracion/db');
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
          model: ModeloUsuario,
          attributes: ['email'] // Solo incluir el email del usuario
        },
        {
          model: ModeloCarrera,
          attributes: ['nombre_carrera'] // Incluir el nombre de la carrera
        }
      ]
    });

    contenido.tipo = 1;
    contenido.datos = data.map(estudiante => ({
      id_estudiante: estudiante.id, // Cambia 'id_estudiante' a 'id'
      primerNombre: estudiante.primerNombre,
      primerApellido: estudiante.primerApellido,
      email: estudiante.Usuario ? estudiante.Usuario.email : 'Email no asignado', // Asegurarse de acceder al email correctamente
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
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json(errors.array());
  }

  const t = await db.transaction();
  try {
    const { primerNombre, primerApellido, email, contrasena, nombre_carrera } = req.body;
    const nombre = `${primerNombre} ${primerApellido}`;
    const hash = await argon2.hash(contrasena, {
      type: argon2.argon2id,
      memoryCost: 2 ** 16,
      timeCost: 4,
      parallelism: 2,
    });

    // Establecer tipoUsuario como 'Estudiante'
    const tipoUsuario = 'Estudiante';

    const usuario = await ModeloUsuario.create(
      { nombre, email, tipoUsuario, contrasena: hash },
      { transaction: t }
    );

    const estudiante = await ModeloEstudiante.create(
      {
        primerNombre,
        primerApellido,
        email,
        tipoUsuario, // Puedes eliminar esta línea si no necesitas guardar el tipo en ModeloEstudiante
        nombre_carrera,
        usuarioId: usuario.id,
      },
      { transaction: t }
    );

    await t.commit();
    res.status(201).json(estudiante);
  } catch (error) {
    console.error(error);
    await t.rollback();
    res.status(500).json({ error: 'Error al crear el estudiante' });
  }
};





exports.editar = async (req, res) => {
  // Validar la entrada de datos
  const errors = validationResult(req);
  let contenido = {
    tipo: 0,
    datos: [],
    msj: [],
  };
  contenido.msj = errores(errors);
  if (contenido.msj.length > 0) {
    return enviar(200, contenido, res);
  }

  const t = await db.transaction();
  try {
    const { id } = req.query;
    const { primerNombre, primerApellido, email, carreraId } = req.body;

    // Buscar el docente por id
    const estudiante = await ModeloEstudiante.findOne({ where: { id }, transaction: t });
    if (!estudiante) {
      return res.status(404).json({ error: 'Docente no encontrado' });
    }

    // Actualizar el docente
    await estudiante.update(
      { nombre: primerNombre, apellido: primerApellido, email: email, carreraId: carreraId },
      { transaction: t }
    );

    // Preparar la respuesta
    const response = {
      id: estudiante.id,
      primerNombre: estudiante.primerNombre,
      primerApellido: estudiante.primerApellido,
      email: estudiante.email,
      carreraId: estudiante.carreraId
    };

    contenido.tipo = 1;
    contenido.datos = response;
    contenido.msj = 'Estudiante editado correctamente';
    await t.commit();
    enviar(200, contenido, res);
  } catch (error) {
    await t.rollback();
    contenido.tipo = 0;
    contenido.msj = 'Error en el servidor al editar el estudiante';
    enviar(500, contenido, res);
    console.error(error);
  }
};

exports.eliminar = async (req, res) => {
  const t = await db.transaction();
  let contenido = {
    tipo: 0,
    datos: [],
    msj: [],
  };

  try {
    const { id } = req.query;

    // Buscar el docente por id
    const estudianteExistente = await ModeloEstudiante.findOne({ where: { id }, transaction: t });
    if (!estudianteExistente) {
      contenido.msj = "El estudiante no existe";
      return enviar(404, contenido, res);
    }

    // Obtener el usuarioId asociado al docente
    const usuarioId = estudianteExistente.usuarioId;

    // Eliminar el docente y el usuario relacionado
    await estudianteExistente.destroy({ transaction: t });
    await ModeloUsuario.destroy({ where: { id: usuarioId }, transaction: t });

    // Confirmar la transacción
    await t.commit();
    contenido.tipo = 1;
    contenido.msj = "Estudiante eliminado correctamente";
    enviar(200, contenido, res);
  } catch (error) {
    // Revertir la transacción en caso de error
    await t.rollback();
    contenido.tipo = 0;
    contenido.msj = "Error en el servidor al eliminar el estudiante";
    enviar(500, contenido, res);
    console.error(error);
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
