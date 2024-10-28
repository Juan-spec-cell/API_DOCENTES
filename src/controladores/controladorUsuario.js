const modelo = require("../modelos/usuario");
const { validationResult } = require("express-validator");
const fs = require("fs");
const { Op } = require("sequelize");
const path = require("path");

exports.inicio = (req, res) => {
  const rutas = [
    {
      descripcion: "Inicial de usuarios",
      url: "/api/usuarios/",
      tipo: "GET",
      parametros: "",
      requeridos: "",
    },
    {
      url: "/api/usuarios/lista",
      tipo: "GET",
      parametros: "",
      requeridos: "",
    },
  ];
  res.json(rutas);
};

exports.guardar = async (req, res) => {
  const {
    nombre_usuario,
    apellido_usuario,
    correo_electronico_usuario,
    codigo_pais_telefono_usuario,
    telefono_usuario,
    genero_usuario,
    contraseña_usuario,
    roleId,
  } = req.body;
  await modelo
    .create({
      nombre_usuario: nombre_usuario,
      apellido_usuario: apellido_usuario,
      correo_electronico_usuario: correo_electronico_usuario,
      codigo_pais_telefono_usuario: codigo_pais_telefono_usuario,
      telefono_usuario: telefono_usuario,
      genero_usuario: genero_usuario,
      contraseña_usuario: contraseña_usuario,
      roleId: roleId,
    })
    .then((data) => {
      res.json(data);
    })
    .catch((er) => {
      res.json(er);
    });
};

exports.listar = async (req, res) => {
  let contenido = {
    tipo: 0,
    datos: [],
    msj: [],
  };
  try {
    const data = await modelo.findAll();
    contenido.tipo = 1;
    contenido.datos = data;
    enviar(200, contenido, res);
  } catch (error) {
    contenido.tipo = 0;
    contenido.msj = "Error al cargar los datos de usuarios";
    enviar(500, contenido, res);
  }
};

// Asegúrate de que la función enviar esté definida en algún lugar de tu código
function enviar(status, contenido, res) {
  res.status(status).json(contenido);
}

exports.editar = async (req, res) => {
  const { id } = req.query;
  const {
    nombre_usuario,
    apellido_usuario,
    correo_electronico_usuario,
    codigo_pais_telefono_usuario,
    telefono_usuario,
    genero_usuario,
    contraseña_usuario,
    roleId,
  } = req.body;
  try {
    var buscar_usuario = await modelo.findOne({ where: { id: id } });
    console.log(buscar_usuario);
    if (!buscar_usuario) {
      res.json({ msj: "El id de usuario no existe" });
    } else {
      (buscar_usuario.nombre_usuario = nombre_usuario),
        (buscar_usuario.apellido_usuario = apellido_usuario),
        (buscar_usuario.correo_electronico_usuario =
          correo_electronico_usuario),
        (buscar_usuario.codigo_pais_telefono_usuario =
          codigo_pais_telefono_usuario),
        (buscar_usuario.telefono_usuario = telefono_usuario),
        (buscar_usuario.genero_usuario = genero_usuario),
        (buscar_usuario.contraseña_usuario = contraseña_usuario),
        (buscar_usuario.roleId = roleId),
        await buscar_usuario
          .save()
          .then((data) => {
            res.json(data);
          })
          .catch((er) => {
            res.json(er);
          });
    }
  } catch (error) {
    console.log(error);
    res.json({ msj: "Error de servidor" });
  }
};

exports.eliminar = async (req, res) => {
  const { id } = req.query;
  const validacion = validationResult(req);
  if (validacion.errors.length > 0) {
    var msjerror = "";
    validacion.errors.forEach((r) => {
      msjerror = msjerror + r.msg + ". ";
    });
    res.json({ msj: "Hay errores en la petición", error: msjerror });
  } else {
    try {
      var busqueda = await modelo.findOne({ where: { id: id } });
      console.log(busqueda);
      if (!busqueda) {
        res.json({ msj: "El id no existe" });
      } else {
        await modelo
          .destroy({ where: { id: id } })
          .then((data) => {
            res.json({ msj: "Registro eliminado", data: data });
          })
          .catch((er) => {
            res.json(er);
          });
      }
    } catch (error) {
      res.json(error);
    }
  }
};

//filtros
exports.busqueda = async (req, res) => {
  const validacion = validationResult(req);
  if (!validacion.isEmpty()) {
    const errors = validacion.array().map((error) => error.msg);
    return res.json({ msj: "Hay errores en la petición", errors });
  }

  try {
    const whereClause = {};
    if (req.query.nombre) whereClause.nombre_usuario = req.query.nombre;
    if (req.query.apellido) whereClause.apellido_usuario = req.query.apellido;
    if (req.query.correo)
      whereClause.correo_electronico_usuario = req.query.correo;
    if (req.query.telefono) whereClause.telefono_usuario = req.query.telefono;
    if (req.query.genero) whereClause.genero_usuario = req.query.genero;
    const busqueda = await modelo.findAll({ where: { [Op.or]: whereClause } });

    res.json(busqueda);
  } catch (error) {
    console.error("Error en la búsqueda:", error);
    res.json({ msj: "Hubo un error en el servidor" });
  }
};

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
      const busqueda = await modelo.findOne({ where: { id: req.query.id } });
      res.json(busqueda);
    } catch (error) {
      res.json(error);
    }
  }
};

exports.busqueda_correo = async (req, res) => {
  const validacion = validationResult(req);
  if (validacion.errors.length > 0) {
    var msjerror = "";
    validacion.errors.forEach((r) => {
      msjerror = msjerror + r.msg + ". ";
    });
    res.json({ msj: "Hay errores en la petición", error: msjerror });
  } else {
    try {
      const busqueda = await modelo.findAll({
        where: { correo_electronico_usuario: req.query.correo },
      });
      res.json(busqueda);
    } catch (error) {
      res.json(error);
    }
  }
};

exports.GuardarImagen = async (req, res) => {
  const { filename } = req.file;
  const id = req.user;
  console.log(`Filename: ${filename}, User ID: ${id}`);

  var buscarUsuario = await modelo.findOne({
    where: { id: id },
  });

  if (buscarUsuario) {
    console.log("Usuario encontrado:", buscarUsuario);
    const buscarImagen = fs.existsSync(
      path.join(__dirname, "../public/img/usuarios/" + buscarUsuario.imagen)
    );
    if (buscarImagen) {
      fs.unlinkSync(
        path.join(__dirname, "../public/img/usuarios/" + buscarUsuario.imagen)
      );
      console.log("Imagen anterior eliminada");
    } else {
      console.log("El usuario no tiene imagen asignada");
    }

    buscarUsuario.imagen = filename;
    await buscarUsuario
      .save()
      .then((data) => {
        console.log("Usuario actualizado:", data);
        res.json({
          msj: "Imagen guardada y asignada al usuario",
          imagen: data.imagen,
        });
      })
      .catch((err) => {
        console.error("Error al actualizar el usuario:", err);
        res.json({ msj: "Error al actualizar la imagen del usuario" });
      });
  } else {
    console.log("Usuario no encontrado");
    const buscarImagen = fs.existsSync(
      path.join(__dirname, "../public/img/usuarios/" + filename)
    );
    if (buscarImagen) {
      fs.unlinkSync(path.join(__dirname, "../public/img/usuarios/" + filename));
      console.log("Imagen eliminada");
    } else {
      console.log("No existe la imagen");
    }
    res.json({ msj: "El id del usuario no existe" });
  }
};

exports.recuperarContrasena = async(req, res) => {
  // Validar entrada de datos
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json(errors.array());
  }

try {
  const { correo} = req.body;

  const usuario = await modelo.findOne({
    where: {
      [Op.or]: [
        {correo: {[Op.like]: correo}}
      ]
    }
  });
  if (!usuario) {
    return res.status(404).json({ error: 'Usuario no encontrado' });
  }
  await usuario.update({ pin: '123456' });
  enviarCorreo({
    para: correo,
    asunto: 'Recuperacion de contrasena', 
    descripcion: 'Correo enviado para la recuperacion de la contrasena', 
    html: '<h1>Pin: 123456</h1><p>Hola</p>'
  })
  res.json({ message: 'Correo enviado correctamente' });
  } catch(error) {
    res.status(500).json({ error: 'Error al actualizar el usuario'});
    console.log(error);
  }
  
};