const { Router } = require('express');
const { body, query } = require('express-validator');
const controladorUsuario = require('../controladores/controladorUsuario'); // Asegúrate de que este controlador existe
const rutas = Router();

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
 *     summary: Lista todos los usuarios
 *     tags: [Usuarios]
 *     responses:
 *       200:
 *         description: Lista de usuarios.
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
 *                       nombre_usuario:
 *                         type: string
 *                         description: Nombre del usuario.
 *                       apellido_usuario:
 *                         type: string
 *                         description: Apellido del usuario.
 *                       email:
 *                         type: string
 *                         description: Correo electrónico del usuario.
 *                       contraseña_usuario:
 *                         type: string
 *                         description: Contraseña del usuario.
 *                       rolId:
 *                         type: integer
 *                         description: ID del rol.
 *                 msj:
 *                   type: array
 *                   items:
 *                     type: string
 *       500:
 *         description: Error al cargar los datos de usuarios.
 */
rutas.get('/listar', controladorUsuario.listar);

/**
 * @swagger
 * /usuarios/guardar:
 *   post:
 *     summary: Guarda un nuevo usuario
 *     tags: [Usuarios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre_usuario:
 *                 type: string
 *                 description: Nombre del usuario
 *               apellido_usuario:
 *                 type: string
 *                 description: Apellido del usuario
 *               email:
 *                 type: string
 *                 description: Correo electrónico del usuario
 *               contraseña_usuario:
 *                 type: string
 *                 description: Contraseña del usuario
 *               rolId:
 *                 type: integer
 *                 description: ID del rol
 *     responses:
 *       200:
 *         description: Usuario guardado
 *       400:
 *         description: Error en los datos proporcionados
 */
rutas.post('/guardar',
    body("nombre_usuario").isString().withMessage('El nombre del usuario debe ser una cadena de texto'),
    body("apellido_usuario").isString().withMessage('El apellido del usuario debe ser una cadena de texto'),
    body("email").isEmail().withMessage('El correo electrónico debe ser válido'),
    body("contraseña_usuario").isString().withMessage('La contraseña no puede estar vacía'),
    body("rolId").isInt().withMessage('El ID del rol debe ser un entero'),
    controladorUsuario.guardar
);

/**
 * @swagger
 * /usuarios/editar:
 *   put:
 *     summary: Edita un usuario existente
 *     tags: [Usuarios]
 *     parameters:
 *       - in: query
 *         name: id_usuario
 *         required: true
 *         schema:
 *           type: integer
 *           description: ID del usuario a editar
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre_usuario:
 *                 type: string
 *                 description: Nombre del usuario (opcional)
 *               apellido_usuario:
 *                 type: string
 *                 description: Apellido del usuario (opcional)
 *               email:
 *                 type: string
 *                 description: Correo electrónico del usuario (opcional)
 *               contraseña_usuario:
 *                 type: string
 *                 description: Contraseña del usuario (opcional)
 *               rolId:
 *                 type: integer
 *                 description: ID del rol (opcional)
 *     responses:
 *       200:
 *         description: Usuario editado
 *       400:
 *         description: Error en los datos proporcionados
 */
rutas.put('/editar',
    query("id_usuario")
        .isInt().withMessage("El id del usuario debe ser un entero")
        .custom(async value => {
            if (!value) {
                throw new Error('El id no permite valores nulos');
            } else {
                const buscarUsuario = await controladorUsuario.buscarPorId(value);
                if (!buscarUsuario) {
                    throw new Error('El id del usuario no existe');
                }
            }
        }),
    body("nombre_usuario").optional().isString().withMessage('El nombre del usuario debe ser una cadena de texto'),
    body("apellido_usuario").optional().isString().withMessage('El apellido del usuario debe ser una cadena de texto'),
    body("email").optional().isEmail().withMessage('El correo electrónico debe ser válido'),
    body("contraseña_usuario").optional().isString().withMessage('La contraseña no puede estar vacía'),
    body("rolId").optional().isInt().withMessage('El ID del rol debe ser un entero'),
    controladorUsuario.editar
);

/**
 * @swagger
 * /usuarios/eliminar:
 *   delete:
 *     summary: Elimina un usuario
 *     tags: [Usuarios]
 *     parameters:
 *       - in: query
 *         name: id_usuario
 *         required: true
 *         schema:
 *           type: integer
 *           description: ID del usuario a eliminar
 *     responses:
 *       200:
 *         description: Usuario eliminado
 *       400:
 *         description: Error en los datos proporcionados
 */
rutas.delete('/eliminar',
    query("id_usuario")
        .isInt().withMessage("El id del usuario debe ser un entero")
        .custom(async value => {
            if (!value) {
                throw new Error('El id no permite valores nulos');
            } else {
                const buscarUsuario = await controladorUsuario.buscarPorId(value);
                if (!buscarUsuario) {
                    throw new Error('El id del usuario no existe');
                }
            }
        }),
    controladorUsuario.eliminar
);

/**
 * @swagger
 * /usuarios/recuperar:
 *   post:
 *     summary: Recupera la contraseña de un usuario
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
 *                 description: Correo electrónico del usuario
 *     responses:
 *       200:
 *         description: Correo enviado correctamente
 *       400:
 *         description: Error en los datos proporcionados
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error al actualizar el usuario
 */
rutas.post('/recuperar',
    body("email").isEmail().withMessage('El correo electrónico debe ser válido'),
    controladorUsuario.recuperarContrasena
);

/**
 * @swagger
 * /usuarios/actualizarContrasena:
 *   post:
 *     summary: Actualiza la contraseña de un usuario
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
 *                 description: Correo electrónico del usuario
 *     responses:
 *       200:
 *         description: Correo enviado correctamente
 *       400:
 *         description: Error en los datos proporcionados
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error al actualizar el usuario
 */
rutas.post('/actualizar/contrasena',
    body("email").isEmail().withMessage('La contrasena ha sido actualizada'),
    controladorUsuario.actualizarContrasena
);

/**
 * @swagger
 * /usuarios/iniciarSesion:
 *   post:
 *     summary: Actualiza la contraseña de un usuario
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
 *                 description: Correo electrónico del usuario
 *     responses:
 *       200:
 *         description: Correo enviado correctamente
 *       400:
 *         description: Error en los datos proporcionados
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error al actualizar el usuario
 */
rutas.post('/iniciarSesion',
    body("email").isEmail().withMessage('Debe Iniciar Sesion'),
    controladorUsuario.iniciarSesion
);

const validarPin = [
    body('email').isEmail().withMessage('Debe enviar un correo valido')
    .custom(async (value) => {
        if (value){
            const buscarUsuario = await Usuarios.findOne({ where: { email: value}});
            if (!buscarUsuario){
                throw new Error('Usuario no encontrado');
            }
        }
    }),
];
const validarRecuperacion = [
    body('email').isEmail().withMessage('Debe enviar un correo valido'),
    body('pin').isLength({ min: 6, max: 6}).isHexadecimal().withMessage('El pin contiene un valor incorrecto'),
    body('contrasena').isLength({ min: 6, max: 12}).withMessage('La cantidad de caracteres permitida en la contrasena es de 6 -12')
];

const validacionEstado = [
    query('estado').isInt(['Activo', 'Bloqueado', 'Inactivo', 'Logeado']).withMessage('El estado seleccionado no es el correcto')
];

rutas.post('/pin', validarPin, controladorUsuario.recuperarContrasena);
rutas.post('/actualizar/contrasena', validarRecuperacion, controladorUsuario.actualizarContrasena);
module.exports = rutas;