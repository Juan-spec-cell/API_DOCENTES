const express = require('express');
const { body, query } = require('express-validator');
const controladorUsuario = require('../controladores/controladorUsuario');
const Usuarios = require('../modelos/usuario');
const rutas = express.Router();
const {Op} = require('sequelize');

/**
 * @swagger
 * tags:
 *   name: Usuarios
 *   description: Gestión de usuarios
 */

/**
 * @swagger
 * /usuarios:
 *   get:
 *     summary: Inicializa el controlador de usuarios
 *     tags: [Usuarios]
 *     responses:
 *       200:
 *         description: Controlador inicializado
 */
rutas.get('/', controladorUsuario.inicio);

/**
 * @swagger
 * /usuarios/listar:
 *   get:
 *     summary: Lista todos los Usuarios
 *     tags: [Usuarios]
 *     responses:
 *       200:
 *         description: Lista de Usuarios.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 tipo:
 *                   type: integer
 *                   description: Tipo de respuesta, donde 0 indica error y 1 indica éxito.
 *                 datos:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id_usuario:
 *                         type: integer
 *                         description: ID del usuario.
 *                       nombre:
 *                         type: string
 *                         description: Nombre del usuario.
 *                       email:
 *                         type: string
 *                         description: Email del usuario.
 *                       tipoUsuario:
 *                         type: string
 *                         description: Tipo de usuario.
 *                 msj:
 *                   type: array
 *                   items:
 *                     type: string
 *       500:
 *         description: Error al cargar los datos de Usuarios.
 */
rutas.get('/listar', controladorUsuario.listar);

/**
 * @swagger
 * /usuarios/editar:
 *   put:
 *     summary: Edita un Usuario existente
 *     tags: [Usuarios]
 *     parameters:
 *       - in: query
 *         name: id_usuario
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del Usuario a editar.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 description: Nombre del usuario.
 *               email:
 *                 type: string
 *                 description: Email del usuario.
 *               tipoUsuario:
 *                 type: string
 *                 description: Tipo de usuario (Docente o Estudiante).
 *     responses:
 *       200:
 *         description: Usuario editado correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 tipo:
 *                   type: integer
 *                 msj:
 *                   type: string
 *       400:
 *         description: Error en la validación de datos.
 *       404:
 *         description: Usuario no encontrado.
 *       500:
 *         description: Error en el servidor al editar el usuario.
 */
rutas.put('/editar',
    query('id_usuario').isInt().withMessage('El id del usuario debe ser un entero'),
    body('nombre')
        .optional()
        .isLength({ min: 3, max: 100 }).withMessage('El nombre del usuario debe tener entre 3 y 100 caracteres'),
    body('email')
        .optional()
        .isEmail().withMessage('El email debe ser válido')
        .custom(async (value, { req }) => {
            const buscarUsuario = await Usuarios.findOne({ where: { email: value, id: { [Op.ne]: req.query.id_usuario } } });
            if (buscarUsuario) {
                throw new Error('El email ya está registrado');
            }
        }),
    body('tipoUsuario')
        .optional()
        .isIn(['Docente', 'Estudiante']).withMessage('El tipo de usuario debe ser "Docente" o "Estudiante"'),
    controladorUsuario.editar
);

/**
 * @swagger
 * /usuarios/eliminar:
 *   delete:
 *     summary: Elimina un Usuario existente
 *     tags: [Usuarios]
 *     parameters:
 *       - in: query
 *         name: id_usuario
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del Usuario a eliminar.
 *     responses:
 *       200:
 *         description: Usuario eliminado correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 tipo:
 *                   type: integer
 *                 msj:
 *                   type: string
 *       404:
 *         description: Usuario no encontrado.
 *       500:
 *         description: Error en el servidor al eliminar el usuario.
 */
rutas.delete('/eliminar',
    query('id_usuario').isInt().withMessage('El id del usuario debe ser un entero'),
    controladorUsuario.eliminar
);

/**
 * @swagger
 * /usuarios/buscar:
 *   get:
 *     summary: Busca un Usuario por ID
 *     tags: [Usuarios]
 *     parameters:
 *       - in: query
 *         name: id_usuario
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del Usuario a buscar.
 *     responses:
 *       200:
 *         description: Usuario encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id_usuario:
 *                   type: integer
 *                   description: ID del usuario.
 *                 nombre:
 *                   type: string
 *                   description: Nombre del usuario.
 *                 email:
 *                   type: string
 *                   description: Email del usuario.
 *                 tipoUsuario:
 *                   type: string
 *                   description: Tipo de usuario.
 *       404:
 *         description: Usuario no encontrado.
 *       500:
 *         description: Error en el servidor al buscar el usuario.
 */
rutas.get('/buscar',
    query('id_usuario').isInt().withMessage('El id del usuario debe ser un entero'),
    controladorUsuario.buscarPorId
);

/**
 * @swagger
 * /usuarios/buscar_nombre:
 *   get:
 *     summary: Busca un Usuario por nombre
 *     tags: [Usuarios]
 *     parameters:
 *       - in: query
 *         name: nombre
 *         required: true
 *         schema:
 *           type: string
 *         description: Nombre del Usuario a buscar.
 *     responses:
 *       200:
 *         description: Usuario encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id_usuario:
 *                   type: integer
 *                   description: ID del usuario.
 *                 nombre:
 *                   type: string
 *                   description: Nombre del usuario.
 *                 email:
 *                   type: string
 *                   description: Email del usuario.
 *                 tipoUsuario:
 *                   type: string
 *                   description: Tipo de usuario.
 *       404:
 *         description: Usuario no encontrado.
 *       500:
 *         description: Error en el servidor al buscar el usuario.
 */
rutas.get('/buscar_nombre',
    query('nombre').isString().withMessage('El nombre del usuario debe ser una cadena de texto'),
    controladorUsuario.buscarPorNombre
);

/**
 * @swagger
 * /usuarios/recuperar_contrasena:
 *   post:
 *     summary: Recupera la contraseña de un Usuario
 *     tags: [Usuarios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: Email del usuario.
 *     responses:
 *       200:
 *         description: Correo enviado correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Mensaje de éxito.
 *       400:
 *         description: Error en la validación de datos.
 *       404:
 *         description: Usuario no encontrado.
 *       500:
 *         description: Error en el servidor al enviar el correo.
 */
rutas.post('/recuperar_contrasena',
    body('email')
        .notEmpty().withMessage('El email del usuario es obligatorio')
        .isEmail().withMessage('El email debe ser válido'),
    controladorUsuario.recuperarContrasena
);

/**
 * @swagger
 * /usuarios/actualizar_contrasena:
 *   post:
 *     summary: Actualiza la contraseña de un Usuario
 *     tags: [Usuarios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: Email del usuario.
 *               contrasena:
 *                 type: string
 *                 description: Nueva contraseña del usuario.
 *               pin:
 *                 type: string
 *                 description: PIN de recuperación.
 *     responses:
 *       200:
 *         description: Contraseña actualizada correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Mensaje de éxito.
 *       400:
 *         description: Error en la validación de datos.
 *       404:
 *         description: Usuario no encontrado o PIN incorrecto.
 *       500:
 *         description: Error en el servidor al actualizar la contraseña.
 */
rutas.post('/actualizar_contrasena',
    body('email')
        .notEmpty().withMessage('El email del usuario es obligatorio')
        .isEmail().withMessage('El email debe ser válido'),
    body('contrasena')
        .notEmpty().withMessage('La contraseña es obligatoria')
        .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
    body('pin')
        .notEmpty().withMessage('El PIN es obligatorio'),
    controladorUsuario.actualizarContrasena
);

/**
 * @swagger
 * /usuarios/iniciar_sesion:
 *   post:
 *     summary: Inicia sesión de un Usuario
 *     tags: [Usuarios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               login:
 *                 type: string
 *                 description: Email o nombre del usuario.
 *               contrasena:
 *                 type: string
 *                 description: Contraseña del usuario.
 *     responses:
 *       200:
 *         description: Sesión iniciada correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 Token:
 *                   type: string
 *                   description: Token de autenticación.
 *                 Usuario:
 *                   type: object
 *                   properties:
 *                     login:
 *                       type: string
 *                       description: Nombre del usuario.
 *                     tipo:
 *                       type: string
 *                       description: Tipo de usuario.
 *                     correo:
 *                       type: string
 *                       description: Email del usuario.
 *                     datoPersonales:
 *                       type: object
 *                       description: Datos personales del usuario.
 *       400:
 *         description: Error en la validación de datos.
 *       404:
 *         description: Usuario o contraseña incorrectos.
 *       500:
 *         description: Error en el servidor al iniciar sesión.
 */
rutas.post('/iniciar_sesion',
    body('login')
        .notEmpty().withMessage('El login es obligatorio'),
    body('contrasena')
        .notEmpty().withMessage('La contraseña es obligatoria'),
    controladorUsuario.iniciarSesion
);

module.exports = rutas;