const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const jwt = require('jsonwebtoken');
const { CLAVE_TOKEN } = process.env;
const moment = require("moment");
const expirationTime = moment.duration(10, "days").asSeconds();
const Usuario = require('../modelos/usuario');

exports.getToken = (data) => {
  return jwt.sign(data, CLAVE_TOKEN, { expiresIn: expirationTime });
};

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: CLAVE_TOKEN,
};

exports.validarAutenticacion = passport.use(new JwtStrategy(opts, async (jwt_payload, done) => {
  await Usuario.findById(jwt_payload.id, (err, user) => {
    if (err) {
      return done(err, false);
    }
    if (user) {
      return done(null, user);
    } else {
      return done(null, false);
    }
  });
}));
