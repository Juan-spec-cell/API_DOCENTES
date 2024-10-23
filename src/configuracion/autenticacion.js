const passport = require("passport");
const ModeloUsuario = require("../modelos/usuario");
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const jwt = require("jsonwebtoken");
const moment = require("moment");
const expiracionTiempo = moment.duration(5, "minutes").asSeconds();
const miclave = "MiclaveSeguridad";

exports.getToken = (datos) => {
  return jwt.sign(datos, miclave, { expiresIn: expiracionTiempo });
};

const opciones = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: miclave,
};

passport.use(
  new JwtStrategy(opciones, async (payload, done) => {
    try {
      const usuario = await ModeloUsuario.findOne({ where: { id_usuario: payload.id } });
      if (usuario) {
        return done(null, usuario);
      } else {
        return done(null, false);
      }
    } catch (error) {
      return done(error, false);
    }
  })
);

exports.ValidarAutenticado = passport.authenticate("jwt", {
  session: false,
  failureRedirect: "/api/autenticacion/error",
});