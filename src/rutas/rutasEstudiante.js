const express = require('express');
const { body, query } = require('express-validator');
const controladorEstudiante = require('../controladores/controladorEstudiante');
const rutas = express.Router();
const ModeloCarrera = require('../modelos/carrera');
const ModeloEstudiante = require('../modelos/estudiante');
/**
 * @swagger
 * tags:
 *   name: Estudiantes
 *   description: Gestión de estudiantes
 */

/**
 * @swagger
 * /estudiantes:
 *   get:
 *     summary: Inicializa el controlador de estudiantes
 *     tags: [Estudiantes]
 *     responses:
 *       200:
 *         description: Controlador inicializado
 */
rutas.get('/', controladorEstudiante.inicio);

/**
 * @swagger
 * /estudiantes/listar:
 *   get:
 *     summary: Lista todos los Estudiantes
 *     tags: [Estudiantes]
 *     responses:
 *       200:
 *         description: Lista de Estudiantes.
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
 *                       id_estudiante:
 *                         type: integer
 *                         description: ID del estudiante.
 *                       primerNombre:
 *                         type: string
 *                         description: Primer nombre del estudiante.
 *                       primerApellido:
 *                         type: string
 *                         description: Primer apellido del estudiante.
 *                       email:
 *                         type: string
 *                         description: Email del estudiante.
 *                       nombre_carrera:
 *                         type: string
 *                         description: Nombre de la carrera.
 *                 msj:
 *                   type: array
 *                   items:
 *                     type: string
 *       500:
 *         description: Error al cargar los datos de Estudiantes.
 */
rutas.get('/listar', controladorEstudiante.listar);

/**
 * @swagger
 * /estudiantes/guardar:
 *   post:
 *     summary: Guarda un nuevo Estudiante
 *     tags: [Estudiantes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               primerNombre:
 *                 type: string
 *                 description: Primer nombre del estudiante.
 *               segundoNombre:
 *                 type: string
 *                 description: Segundo nombre del estudiante.
 *               primerApellido:
 *                 type: string
 *                 description: Primer apellido del estudiante.
 *               segundoApellido:
 *                 type: string
 *                 description: Segundo apellido del estudiante.
 *               email:
 *                 type: string
 *                 description: Email del estudiante.
 *               contrasena:
 *                 type: string
 *                 description: Contraseña del estudiante.
 *               carreraId:
 *                 type: integer
 *                 description: Carrera del estudiante.
 *     responses:
 *       201:
 *         description: Estudiante guardado correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 tipo:
 *                   type: integer
 *                 datos:
 *                   type: object
 *                   properties:
 *                     id_estudiante:
 *                       type: integer
 *                       description: ID del estudiante.
 *                     nombre_estudiante:
 *                       type: string
 *                       description: Nombre completo del estudiante.
 *                     apellido_estudiante:
 *                       type: string
 *                       description: Apellido completo del estudiante.
 *                     email:
 *                       type: string
 *                       description: Email del estudiante.
 *                     carreraId:
 *                      type: integer
 *                      description: Carrera del estudiante.
 *                 msj:
 *                   type: string
 *       400:
 *         description: Error en la validación de datos.
 *       500:
 *         description: Error en el servidor al guardar el estudiante.
 */
rutas.post(
    '/guardar',
    body('primerNombre').notEmpty().withMessage('El primer nombre es obligatorio')
        .isLength({ min: 3, max: 50 }).withMessage('La cantidad de caracteres permitida es de 3 - 50'),
    body('segundoNombre').optional().isLength({ max: 50 }).withMessage('El segundo nombre no puede exceder los 50 caracteres'),
    body('primerApellido').notEmpty().withMessage('El primer apellido es obligatorio')
        .isLength({ min: 3, max: 50 }).withMessage('La cantidad de caracteres permitida es de 3 - 50'),
    body('segundoApellido').optional().isLength({ max: 50 }).withMessage('El segundo apellido no puede exceder los 50 caracteres'),
    body("email")
        .isEmail().withMessage('El correo electrónico debe ser válido')
        .notEmpty().withMessage('El correo no puede estar vacío'),
    body("contrasena")
        .isString().withMessage('La contraseña debe ser una cadena de texto')
        .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres')
        .notEmpty().withMessage('La contraseña no puede estar vacía'),
    body("carreraId").isInt({ min: 1 }).withMessage('El carreraId debe ser un número entero positivo'),
    controladorEstudiante.guardar
);

/**
 * @swagger
 * /estudiantes/editar:
 *   put:
 *     summary: Edita un Estudiante existente
 *     tags: [Estudiantes]
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del Estudiante a editar.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               primerNombre:
 *                 type: string
 *                 description: Primer nombre del estudiante.
 *               primerApellido:
 *                 type: string
 *                 description: Primer apellido del estudiante.
 *               email:
 *                 type: string
 *                 description: Email del estudiante.
 *               carreraId:
 *                 type: integer
 *                 description: Nombre de la carrera.
 *     responses:
 *       200:
 *         description: Estudiante editado correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 tipo:
 *                   type: integer
 *                 datos:
 *                   type: object
 *                   properties:
 *                     id_estudiante:
 *                       type: integer
 *                       description: ID del estudiante.
 *                     nombre_estudiante:
 *                       type: string
 *                       description: Nombre del estudiante.
 *                     apellido_estudiante:
 *                       type: string
 *                       description: Apellido del estudiante.
 *                     email:
 *                       type: string
 *                       description: Email del estudiante.
 *                     carreraId:
 *                       type: integer
 *                       description: Nombre de la carrera.
 *                 msj:
 *                   type: string
 *       400:
 *         description: Error en la validación de datos.
 *       500:
 *         description: Error en el servidor al editar el estudiante.
 */
rutas.put('/editar',
    query('id').isInt().withMessage('El ID debe ser un número entero')
        .custom(async (value) => {
            if (value) {
                const buscarCliente = await ModeloEstudiante.findByPk(value);
                if (!buscarCliente) {
                    throw new Error('Estudiante no encontrado');
                }
            }
        }),
    body('primerNombre').notEmpty().withMessage('El primer nombre es obligatorio')
        .isLength({ min: 3, max: 50 }).withMessage('La cantidad de caracteres permitida es de 3 - 50'),
    body('primerApellido').notEmpty().withMessage('El primer apellido es obligatorio')
        .isLength({ min: 3, max: 50 }).withMessage('La cantidad de caracteres permitida es de 3 - 50'),
    body("email")
        .isEmail().withMessage('El email debe ser una dirección de correo válida')
        .notEmpty().withMessage('El email no puede estar vacío'),
    body("carreraId").isInt({ min: 1 }).withMessage('El carreraId debe ser un número entero positivo'),
    controladorEstudiante.editar
);

/**
 * @swagger
 * /estudiantes/eliminar:
 *   delete:
 *     summary: Elimina un Estudiante existente
 *     tags: [Estudiantes]
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del Estudiante a eliminar.
 *     responses:
 *       200:
 *         description: Estudiante eliminado correctamente.
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
 *         description: Estudiante no encontrado.
 *       500:
 *         description: Error en el servidor al eliminar el estudiante.
 */
rutas.delete('/eliminar',
    query("id_estudiante").isInt().withMessage("El id del estudiante debe ser un entero"),
    controladorEstudiante.eliminar
);

/**
 * @swagger
 * /estudiantes/busqueda_id:
 *   get:
 *     summary: Busca un Estudiante por ID
 *     tags: [Estudiantes]
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del Estudiante a buscar.
 *     responses:
 *       200:
 *         description: Estudiante encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: ID del estudiante.
 *                 primerNombre:
 *                   type: string
 *                   description: Primer nombre del estudiante.
 *                 segundoNombre:
 *                   type: string
 *                   description: Segundo nombre del estudiante (opcional).
 *                 primerApellido:
 *                   type: string
 *                   description: Primer apellido del estudiante.
 *                 segundoApellido:
 *                   type: string
 *                   description: Segundo apellido del estudiante (opcional).
 *                 email:
 *                   type: string
 *                   description: Email del estudiante.
 *                 carreraId:
 *                   type: integer
 *                   description: ID de la carrera.
 *                 nombre_carrera:
 *                   type: string
 *                   description: Nombre de la carrera.
 *       404:
 *         description: Estudiante no encontrado.
 *       500:
 *         description: Error en el servidor al buscar el estudiante.
 */
rutas.get('/busqueda_id',
    query("id").isInt().withMessage("El id del estudiante debe ser un entero"),
    controladorEstudiante.busqueda_id
);


/**
 * @swagger
 * /estudiantes/busqueda/nombre:
 *   get:
 *     summary: Busca un estudiante por nombre
 *     tags: [Estudiantes]
 *     parameters:
 *       - in: query
 *         name: primerNombre
 *         required: false
 *         schema:
 *           type: string
 *           description: Primer nombre del estudiante a buscar
 *       - in: query
 *         name: segundoNombre
 *         required: false
 *         schema:
 *           type: string
 *           description: Segundo nombre del estudiante a buscar
 *       - in: query
 *         name: primerApellido
 *         required: false
 *         schema:
 *           type: string
 *           description: Primer apellido del estudiante a buscar
 *       - in: query
 *         name: segundoApellido
 *         required: false
 *         schema:
 *           type: string
 *           description: Segundo apellido del estudiante a buscar
 *     responses:
 *       200:
 *         description: Estudiantes encontrados
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: ID del estudiante.
 *                   primerNombre:
 *                     type: string
 *                     description: Primer nombre del estudiante.
 *                   segundoNombre:
 *                     type: string
 *                     description: Segundo nombre del estudiante.
 *                   primerApellido:
 *                     type: string
 *                     description: Primer apellido del estudiante.
 *                   segundoApellido:
 *                     type: string
 *                     description: Segundo apellido del estudiante.
 *                   email:
 *                     type: string
 *                     description: Email del estudiante.
 *                   nombreUsuario:
 *                     type: string
 *                     description: Nombre de usuario asociado al estudiante.
 *       404:
 *         description: No se encontraron estudiantes
 *       500:
 *         description: Error en el servidor al buscar estudiantes
 */
rutas.get('/busqueda/nombre',
    query("primerNombre").optional().isString().withMessage("El primer nombre del estudiante debe ser una cadena de texto"),
    query("segundoNombre").optional().isString().withMessage("El segundo nombre del estudiante debe ser una cadena de texto"),
    query("primerApellido").optional().isString().withMessage("El primer apellido del estudiante debe ser una cadena de texto"),
    query("segundoApellido").optional().isString().withMessage("El segundo apellido del estudiante debe ser una cadena de texto"),
    controladorEstudiante.busqueda_nombre
);

module.exports = rutas;