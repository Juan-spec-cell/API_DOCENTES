const express = require('express');
const router = express.Router();
const ModeloUsuarios = require('../modelos/usuario'); // Asegúrate de importar el modelo de usuario

// Endpoint para registrar un nuevo usuario
router.post('/registrar', async (req, res) => {
    const { nombre, email, password, tipo } = req.body;

    try {
        // Verificar si el usuario ya existe
        const usuarioExistente = await ModeloUsuarios.findOne({ where: { email } });
        if (usuarioExistente) {
            return res.status(400).json({ error: 'El usuario ya existe' });
        }

        // Crear el nuevo usuario
        const nuevoUsuario = await ModeloUsuarios.create({
            nombre,
            email,
            password, // Asegúrate de cifrar la contraseña antes de almacenarla
            tipo,
        });

        res.status(201).json({ mensaje: 'Usuario registrado con éxito', usuario: nuevoUsuario });
    } catch (error) {
        console.error("Error al registrar el usuario:", error);
        res.status(500).json({ error: 'Error al registrar el usuario' });
    }
});

module.exports = router;
