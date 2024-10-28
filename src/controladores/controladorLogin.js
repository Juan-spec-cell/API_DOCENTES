const ModeloUsuario = require('../modelos/usuario');
const jwt = require('jsonwebtoken');

const generarToken = (payload) => {
    return jwt.sign(payload, 'claveSecreta');
};

exports.login = async (req, res) => {
    const { usuario, clave } = req.body;
    try {
        const usuarioEncontrado = await ModeloUsuario.findOne({
            where: { nombre_usuario: usuario }
        });

        if (!usuarioEncontrado) {
            console.log('Usuario no encontrado.');
            return res.json({ error: 'Nombre de usuario incorrecto' });
        }

        if (usuarioEncontrado.contraseña_usuario !== clave) {
            console.log('Contraseña incorrecta.');
            return res.json({ error: 'Contraseña de usuario incorrecta' });
        }
        
        const rolId = usuarioEncontrado.roleId;
        console.log('Rol ID:', rolId);

        const payload = {
            usuario: usuario,
            rolId: rolId
        };
        
        const token = generarToken(payload);
        return res.json({ token });
        
        
    } catch (error) {
        console.error('Error al procesar solicitud de inicio de sesión:', error);
        return res.json({ error: 'Error interno del servidor' });
    }
};

exports.refreshToken = async (req, res) => {
    const { token } = req.body;

    try {
        const payload = jwt.verify(token, 'claveSecreta');
        
        // Definir un nuevo tiempo de expiración para el nuevo token (por ejemplo, 1 hora)
        const nuevoTiempoExpiracion = Math.floor(Date.now() / 1000) + (60 * 60); // 1 hora en segundos

        // Firmar el nuevo token con el payload existente y el nuevo tiempo de expiración
        const nuevoToken = jwt.sign({...payload, exp: nuevoTiempoExpiracion}, 'claveSecreta');

        res.json({ nuevoToken });
    } catch (error) {
        console.error('Error al refrescar el token:', error);
        return res.json({ error: 'Token inválido' });
    }
};