const { Router } = require('express');
const { body, query } = require('express-validator');
const controladorUsuario = require('../controladores/controladorUsuario');
const ModeloUsuario = require('../modelos/usuario'); 
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
 *     summary: Muestra un mensaje de bienvenida
 *     tags: [Usuarios]
 *     responses:
 *       200:
 *         description: Mensaje de bienvenida de la API.
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
 *                       nombre:
 *                         type: string
 *                         description: Nombre del usuario.
 *                       email:
 *                         type: string
 *                         description: Email del usuario.
 *                       tipoUsuario:
 *                         type: string
 *                         description: Tipo de usuario (Docente o Estudiante).
 *                 msj:
 *                   type: array
 *                   items:
 *                     type: string
 *       500:
 *         description: Error al cargar los datos de usuarios.
 */
rutas.get('/listar', controladorUsuario.listar);


/*rutas.post('/guardar',
    body("nombre")
        .notEmpty().withMessage('El nombre es obligatorio'),
    body("email")
        .isEmail().withMessage('El email debe ser válido'),
    body("contrasena")
        .notEmpty().withMessage('La contraseña es obligatoria'),
    body("tipoUsuario")
        .notEmpty().withMessage('El tipo de usuario es obligatorio'),
    controladorUsuario.guardar
);*/


/*rutas.put('/editar',
    query("id_usuario")
        .isInt().withMessage("El id del usuario debe ser un entero")
        .custom(async value => {
            const buscarUsuario = await ModeloUsuario.findOne({ where: { id_usuario: value } });
            if (!buscarUsuario) {
                throw new Error('El id del usuario no existe');
            }
        }),
    body("nombre")
        .optional()
        .notEmpty().withMessage('El nombre no puede estar vacío'),
    body("email")
        .optional()
        .isEmail().withMessage('El email debe ser válido'),
    body("contrasena")
        .optional()
        .notEmpty().withMessage('La contraseña no puede estar vacía'),
    body("tipoUsuario")
        .optional()
        .notEmpty().withMessage('El tipo de usuario no puede estar vacío'),
    controladorUsuario.editar
);*/

/**
 * @swagger
 * /usuarios/eliminar:
 *   delete:
 *     summary: Elimina un usuario existente
 *     tags: [Usuarios]
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario a eliminar.
 *     responses:
 *       200:
 *         description: Usuario eliminado correctamente.
 *       404:
 *         description: El ID del usuario no existe.
 *       500:
 *         description: Error en el servidor al eliminar el usuario.
 */
rutas.delete('/eliminar',
    query("id")
        .isInt().withMessage("El id del usuario debe ser un entero")
        .custom(async value => {
            const buscarUsuario = await ModeloUsuario.findOne({ where: { id: value } }); // Asegúrate de que el campo sea 'id'
            if (!buscarUsuario) {
                throw new Error('El id del usuario no existe');
            }
        }),
    controladorUsuario.eliminar
);

/**
 * @swagger
 * /usuarios/iniciar-sesion:
 *   post:
 *     summary: Iniciar sesión
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
 *         description: Inicio de sesión exitoso.
 *       404:
 *         description: Usuario o contraseña incorrectos.
 *       500:
 *         description: Error al iniciar sesión.
 */
rutas.post('/iniciar-sesion',
    body("login")
        .notEmpty().withMessage('El login es obligatorio'),
    body("contrasena")
        .notEmpty().withMessage('La contraseña es obligatoria'),
    controladorUsuario.iniciarSesion
);

/**
 * @swagger
 * /usuarios/recuperar-contrasena:
 *   post:
 *     summary: Recuperar contraseña
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
 *       404:
 *         description: Usuario no encontrado.
 *       500:
 *         description: Error al enviar el correo.
 */
rutas.post('/recuperar-contrasena',
    body("email")
        .isEmail().withMessage('El email debe ser válido'),
    controladorUsuario.recuperarContrasena
);

/**
 * @swagger
 * /usuarios/actualizar-contrasena:
 *   put:
 *     summary: Actualizar contraseña
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
 *                 description: Nueva contraseña.
 *               pin:
 *                 type: string
 *                 description: PIN recibido por correo.
 *     responses:
 *       200:
 *         description: Contraseña actualizada correctamente.
 *       404:
 *         description: Usuario no encontrado o PIN incorrecto.
 *       500:
 *         description: Error al actualizar la contraseña.
 */
rutas.put('/actualizar-contrasena',
    body("email")
        .isEmail().withMessage('El email debe ser válido'),
    body("contrasena")
        .notEmpty().withMessage('La nueva contraseña es obligatoria'),
    body("pin")
        .notEmpty().withMessage('El PIN es obligatorio'),
    controladorUsuario.actualizarContrasena
);

module.exports = rutas;
