const { Router } = require("express");
const controladorLogin = require("../controladores/controladorLogin");
const { body, query } = require("express-validator");
const { Op } = require("sequelize");
const rutas = Router();
rutas.post("/login", controladorLogin.login);
module.exports = rutas;
