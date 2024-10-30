const { Strategy, ExtractJwt } = require('passport-jwt');
const Usuario = require('../modelos/usuario');


const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET,
};

module.exports = (passport) => {
    passport.use(new Strategy(opts, async (jwt_payload, done) => {
        try {
            const usuario = await Usuario.findByPk(jwt_payload.id);
            if (usuario) {
                return done(null, usuario);
            }
            return done(null, false);
        } catch (error) {
            return done(error, false);
        }
    }));
};