const { Router } = require("express");
const { body, query } = require("express-validator");
const controladoAuten = require("../controladores/controladorAutenticacion");
const e = Router();
const rutas = Router();
rutas.post(
  "/iniciosesion",
  body("usuario")
    .isLength({ min: 3, max: 50 })
    .withMessage("Debe escribir un usuario de 3 a 50 caracteres"),
  body("contrasena")
    .isLength({ min: 6, max: 12 })
    .withMessage("Debe escribir una contrasena de 6 a 12 caracteres"),
  controladoAuten.IniciarSesion
);
rutas.get("/error", controladoAuten.Error);
module.exports = rutas;
