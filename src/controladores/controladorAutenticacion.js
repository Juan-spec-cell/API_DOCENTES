const ModeloUsuario = require("../modelos/usuario");
const ModeloRol = require("../modelos/roles");
const { getToken } = require("../configuraciones/passport");
const { validationResult } = require("express-validator");

exports.IniciarSesion = async (req, res) => {
  const validation = validationResult(req);
  if (!validation.isEmpty()) {
    var msj = [];
    console.log(validation);
    validation.errors.forEach((element) => {
      console.log(element.msg);
      console.log(element.param);
      msj.push({ msj: element.msg, parametro: element.param });
    });
    res.json(msj);
  } else {
    try {
      const { usuario, contrasena } = req.body;
      console.log(
        `nombre_usuario: ${usuario}, contraseña_usuario: ${contrasena}`
      );
      const buscarUsuario = await ModeloUsuario.findOne({
        attributes: [
          "id",
          "nombre_usuario",
          "correo_electronico_usuario",
          "apellido_usuario",
          "contraseña_usuario",
          "roleId",
          "imagen",
        ],
        include: {
          model: ModeloRol,
          attributes: ["tipo_rol", "descripcion_rol"],
        },
        where: { nombre_usuario: usuario },
      });
      console.log(`Usuario encontrado: ${JSON.stringify(buscarUsuario)}`);
      if (!buscarUsuario) {
        res.json({ msj: "El usuario no existe" });
      } else {
        if (
          buscarUsuario.VerificarContrasena(
            contrasena,
            buscarUsuario.contraseña_usuario
          )
        ) {
          const token = getToken({
            id: buscarUsuario.id,
            roleId: buscarUsuario.roleId,
          });

          res.json({
            token,
            usu: {
              id: buscarUsuario.id,
              nombre: buscarUsuario.nombre_usuario,
              apellido: buscarUsuario.apellido_usuario,
              correo: buscarUsuario.correo_electronico_usuario,
              rolId: buscarUsuario.roleId,
              imagen: buscarUsuario.imagen,
            },
          });
        } else {
          res.json({ msj: "El usuario o contrasena son incorrectas" });
        }
      }
    } catch (error) {
      console.error(error);
      res.json({ msj: "No esta permitido acceder a esta ruta" });
    }
  }
};

exports.Error = async (req, res) => {
  res.json({ mjs: "Debe enviar las credenciales correctas" });
};
exports.ActualizarContrasena = async (req, res) => {
  const validacion = validationResult(req);
  if (!validacion.isEmpty()) {
    var msj = "";
    console.log(validacion);
    validacion.errors.forEach((element) => {
      console.log(element.msg);
      console.log(element.param);
      msj += element.msg;
    });
    res.json(msj);
  } else {
    const { usuario, contrasena } = req.body;
    var buscarUsuario = await Usuario.findOne({
      attributes: [
        "id",
        "nombre_usuario",
        "correo_electronico_usuario",
        "apellido_usuario",
        "contraseña_usuario",
        "roleId",
        "imagen",
      ],
      include: {
        model: ModeloRol,
        attributes: ["tipo_rol", "descripcion_rol"],
      },
      where: {
        nombre_usuario: usuario,
      },
    });
    if (!buscarUsuario) {
      res.json({ msj: "El usuario no existe" });
    } else {
      buscarUsuario.contrasena = buscarUsuario.CifrarContrasena;
      await buscarUsuario
        .save()
        .then((data) => {
          console.log(data);
          res.json({ msj: "Contrasena Actualizada" });
        })
        .catch((er) => {
          console.log(er);
          res.json({ msj: "Error al actualizar la Contrasena" });
        });
    }
  }
};
