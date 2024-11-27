const ModeloEstudiante = require('../modelos/Estudiante');
const ModeloUsuario = require('../modelos/usuario');
const ModeloCarrera = require('../modelos/carrera');
const { enviar, errores } = require('../configuracion/ayuda');
const { validationResult } = require('express-validator');
const argon2 = require('argon2');
const db = require('../configuracion/db');
const { Op } = require("sequelize");
const moment = require('moment');


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
          attributes: ['id', 'email'] // Incluir el id_usuario y el email del usuario
        },
        {
          model: ModeloCarrera,
          attributes: ['nombre_carrera'] // Incluir el nombre de la carrera
        }
      ]
    });

    contenido.tipo = 1;
    contenido.datos = data.map(estudiante => ({
      id_estudiante: estudiante.id,
      primerNombre: estudiante.primerNombre,
      primerApellido: estudiante.primerApellido,
      email: estudiante.Usuario ? estudiante.Usuario.email : 'Email no asignado',
      id_usuario: estudiante.Usuario ? estudiante.Usuario.id : null, // Agrega el id_usuario
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
  // Validar entrada de datos
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json(errors.array());
  }

  const t = await db.transaction();
  try {
    const { primerNombre, segundoNombre, primerApellido, segundoApellido, email, contrasena, carreraId } = req.body;

    // Hashear la contraseña
    const hash = await argon2.hash(contrasena, {
      type: argon2.argon2id,
      memoryCost: 2 ** 16, // 64MB
      timeCost: 4,
      parallelism: 2,
    });

    // Crear el usuario con tipoUsuario como 'Estudiante'
    const usuario = await ModeloUsuario.create(
      {
        nombre: `${primerNombre} ${segundoNombre || ''} ${primerApellido} ${segundoApellido || ''}`.trim(),
        email,
        tipoUsuario: 'Estudiante', // Asignar tipo 'Estudiante' por defecto
        contrasena: hash
      },
      { transaction: t }
    );

    // Crear el estudiante
    const estudiante = await ModeloEstudiante.create(
      {
        primerNombre,
        segundoNombre,
        primerApellido,
        segundoApellido,
        email,
        usuarioId: usuario.id,
        carreraId: carreraId
      },
      { transaction: t }
    );

    await t.commit();
    res.status(201).json(estudiante);
  } catch (error) {
    console.error(error);
    await t.rollback();
    res.status(500).json({ error: error.message || 'Error al crear el estudiante' });
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
    const estudiante = await ModeloEstudiante.findOne({ where: { id: id }, transaction: t });
    if (!estudiante) {
      return res.status(404).json({ error: 'Docente no encontrado' });
    }

    // Actualizar el docente
    await estudiante.update(
      { primerNombre: primerNombre, primerApellido: primerApellido, email: email, carreraId: carreraId },
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
    const estudianteExistente = await ModeloEstudiante.findOne({ where: { id: id }, transaction: t });
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




exports.busqueda_id = async (req, res) => {
  const validacion = validationResult(req);
  if (validacion.errors.length > 0) {
    let msjerror = validacion.errors.map((r) => r.msg).join(". ");
    return res.status(400).json({ msj: "Hay errores en la petición", error: msjerror });
  }

  const idEstudiante = req.query.id;
  console.log("Buscando estudiante con ID:", idEstudiante);

  if (!idEstudiante) {
    return res.status(400).json({ msj: "ID del estudiante no proporcionado" });
  }

  try {
    const busqueda = await ModeloEstudiante.findOne({
      where: { id: idEstudiante },
      include: [{
        model: ModeloUsuario, // Asegúrate de importar el modelo de Usuarios
        attributes: ['nombre'], // Solo traer el nombre
      }],
      attributes: ['primerNombre', 'primerApellido', 'createdAt'], // Traer los atributos requeridos
    });

    if (!busqueda) {
      return res.status(404).json({ msj: "Estudiante no encontrado" });
    }

    // Formatear la fecha
    const respuesta = {
      primerNombre: busqueda.primerNombre,
      primerApellido: busqueda.primerApellido,
      nombreUsuario: busqueda.Usuario.nombre, // Acceder al nombre del usuario
      fechaCreacion: moment(busqueda.createdAt).format('YYYY-MM-DD HH:mm:ss') // Formatear la fecha
    };

    res.json(respuesta);
  } catch (error) {
    console.error("Error en la búsqueda:", error);
    res.status(500).json({ msj: "Error en la búsqueda", error: error.message });
  }
};



//filtro para buscar por nombre del estudiante

exports.busqueda_nombre = async (req, res) => {
  const validacion = validationResult(req);
  if (validacion.errors.length > 0) {
    let msjerror = validacion.errors.map((r) => r.msg).join(". ");
    return res.status(400).json({ msj: "Hay errores en la petición", error: msjerror });
  }

  const { primerNombre, segundoNombre, primerApellido, segundoApellido } = req.query;
  const whereClause = {
    [Op.or]: [
      { primerNombre: { [Op.like]: `%${primerNombre || ''}%` } },
      { segundoNombre: { [Op.like]: `%${segundoNombre || ''}%` } },
      { primerApellido: { [Op.like]: `%${primerApellido || ''}%` } },
      { segundoApellido: { [Op.like]: `%${segundoApellido || ''}%` } },
      {
        [Op.and]: [
          { primerNombre: { [Op.like]: `%${primerNombre || ''}%` } },
          { segundoNombre: { [Op.like]: `%${segundoNombre || ''}%` } }
        ]
      },
      {
        [Op.and]: [
          { primerNombre: { [Op.like]: `%${primerNombre || ''}%` } },
          { segundoNombre: { [Op.like]: `%${segundoNombre || ''}%` } },
          { primerApellido: { [Op.like]: `%${primerApellido || ''}%` } }
        ]
      },
      {
        [Op.and]: [
          { primerNombre: { [Op.like]: `%${primerNombre || ''}%` } },
          { segundoNombre: { [Op.like]: `%${segundoNombre || ''}%` } },
          { primerApellido: { [Op.like]: `%${primerApellido || ''}%` } },
          { segundoApellido: { [Op.like]: `%${segundoApellido || ''}%` } }
        ]
      }
    ]
  };

  try {
    // Busca el estudiante incluyendo la relación con el usuario
    const busqueda = await ModeloEstudiante.findAll({
      where: whereClause,
      include: [{
        model: ModeloUsuario, // Asegúrate de que esta relación está definida
        attributes: ['nombre'] // Cambia 'nombre' si tienes otro campo que desees mostrar
      }]
    });

    // Transformar la respuesta para incluir 'nombreUsuario'
    if (busqueda.length > 0) {
      const resultados = busqueda.map(estudiante => ({
        id: estudiante.id,
        primerNombre: estudiante.primerNombre,
        segundoNombre: estudiante.segundoNombre,
        primerApellido: estudiante.primerApellido,
        segundoApellido: estudiante.segundoApellido,
        email: estudiante.email,
        fechaCreacion: estudiante.createdAt ? moment(estudiante.createdAt).format('DD/MM/YYYY') : null,
        fechaActualizacion: estudiante.updatedAt ? moment(estudiante.updatedAt).format('DD/MM/YYYY') : null,
        nombreUsuario: estudiante.Usuario.nombre // Asumiendo que la relación se llama 'Usuario'
      }));
      res.json(resultados);
    } else {
      res.json({ msj: "No se encontró ningún estudiante" });
    }
  } catch (error) {
    console.error("Error en la búsqueda:", error);
    res.status(500).json({ msj: "Error al realizar la búsqueda", error: error.message });
  }
};

