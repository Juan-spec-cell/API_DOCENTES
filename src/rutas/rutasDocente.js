const express = require('express');
const { body, query } = require('express-validator');
const controladorDocente = require('../controladores/controladorDocente');
const ModeloDocente = require('../modelos/docente');
const { Op } = require('sequelize');
const rutas = express.Router();

/**
 * @swagger
 * tags:
 *   name: Docentes
 *   description: Gestión de docentes
 */

/**
 * @swagger
 * /docentes:
 *   get:
 *     summary: Inicializa el controlador de docentes
 *     tags: [Docentes]
 *     responses:
 *       200:
 *         description: Controlador inicializado
 */
rutas.get('/', controladorDocente.inicio);

/**
 * @swagger
 * /docentes/listar:
 *   get:
 *     summary: Lista todos los docentes
 *     tags: [Docentes]
 *     responses:
 *       200:
 *         description: Lista de docentes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 tipo:
 *                   type: integer
 *                   description: Indica el tipo de respuesta (1 = éxito, 0 = error)
 *                 datos:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id_docente:
 *                         type: integer
 *                         description: ID del docente
 *                       primerNombre:
 *                         type: string
 *                         description: Primer nombre del docente
 *                       segundoNombre:
 *                         type: string
 *                         description: Segundo nombre del docente
 *                       primerApellido:
 *                         type: string
 *                         description: Primer apellido del docente
 *                       segundoApellido:
 *                         type: string
 *                         description: Segundo apellido del docente
 *                       email:
 *                         type: string
 *                         description: Correo electrónico del docente
 *                 msj:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: Mensajes relacionados con la respuesta
 */
rutas.get('/listar', controladorDocente.listar);


/**
 * @swagger
 * /docentes/guardar:
 *   post:
 *     summary: Guarda un nuevo Docente
 *     tags: [Docentes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               primerNombre:
 *                 type: string
 *                 description: Primer nombre del docente
 *               segundoNombre:
 *                 type: string
 *                 description: Segundo nombre del docente
 *               primerApellido:
 *                 type: string
 *                 description: Primer apellido del docente
 *               segundoApellido:
 *                 type: string
 *                 description: Segundo apellido del docente
 *               email:
 *                 type: string
 *                 description: Correo electrónico del docente
 *               contrasena:
 *                 type: string
 *                 description: Contraseña del docente
 *     responses:
 *       201:
 *         description: Docente guardado
 *       400:
 *         description: Error en los datos proporcionados
 */
rutas.post('/guardar',
    body('primerNombre').notEmpty().withMessage('El primer nombre es obligatorio')
        .isLength({ min: 3, max: 50 }).withMessage('La cantidad de caracteres permitida es de 3 - 50'),
    body('segundoNombre').optional().isLength({ max: 50 }).withMessage('El segundo nombre no puede exceder los 50 caracteres'),
    body('primerApellido').notEmpty().withMessage('El primer apellido es obligatorio')
        .isLength({ min: 3, max: 50 }).withMessage('La cantidad de caracteres permitida es de 3 - 50'),
    body('segundoApellido').optional().isLength({ max: 50 }).withMessage('El segundo apellido no puede exceder los 50 caracteres'),
    body("email")
        .isEmail().withMessage('El correo electrónico debe ser válido')
        .notEmpty().withMessage('El correo no puede estar vacío')
        .custom(async (value) => {
            const buscarDocente = await ModeloDocente.findOne({ where: { email: value } });
            if (buscarDocente) {
                throw new Error('El correo electrónico ya está en uso por otro docente');
            }
        }),
    body("contrasena")
        .isString().withMessage('La contraseña debe ser una cadena de texto')
        .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres')
        .notEmpty().withMessage('La contraseña no puede estar vacía'),
    controladorDocente.guardar
);

/**
 * @swagger
 * /docentes/editar:
 *   put:
 *     summary: Edita un Docente existente
 *     tags: [Docentes]
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           description: ID del docente a editar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               primerNombre:
 *                 type: string
 *                 description: Primer nombre del docente
 *               segundoNombre:
 *                 type: string
 *                 description: Segundo nombre del docente
 *               primerApellido:
 *                 type: string
 *                 description: Primer apellido del docente
 *               segundoApellido:
 *                 type: string
 *                 description: Segundo apellido del docente
 *               email:
 *                 type: string
 *                 description: Correo electrónico del docente
 *     responses:
 *       200:
 *         description: Docente editado
 *       404:
 *         description: Docente no encontrado
 *       400:
 *         description: Error en los datos proporcionados
 */
rutas.put('/editar',
    query("id").isInt().withMessage('El id del docente debe ser un entero')
        .custom(async value => {
            const buscarDocente = await ModeloDocente.findOne({ where: { id: value } });
            if (!buscarDocente) {
                throw new Error('El id del docente no existe');
            }
        }),
    body('primerNombre').notEmpty().withMessage('El primer nombre es obligatorio')
        .isLength({ min: 3, max: 50 }).withMessage('La cantidad de caracteres permitida es de 3 - 50'),
    body('segundoNombre').optional().isLength({ max: 50 }).withMessage('El segundo nombre no puede exceder los 50 caracteres'),
    body('primerApellido').notEmpty().withMessage('El primer apellido es obligatorio')
        .isLength({ min: 3, max: 50 }).withMessage('La cantidad de caracteres permitida es de 3 - 50'),
    body('segundoApellido').optional().isLength({ max: 50 }).withMessage('El segundo apellido no puede exceder los 50 caracteres'),
    body("email").optional()
        .isEmail().withMessage('Debe ser un correo electrónico válido')
        .custom(async (value, { req }) => {
            if (value) {
                const buscarDocente = await ModeloDocente.findOne({
                    where: {
                        email: value,
                        id: { [Op.ne]: req.query.id } // Excluir el docente que se está editando
                    }
                });
                if (buscarDocente) {
                    throw new Error('El correo electrónico ya está en uso por otro docente');
                }
            }
            return true;
        }),
    controladorDocente.editar
);

/**
 * @swagger
 * /docentes/eliminar:
 *   delete:
 *     summary: Elimina un Docente
 *     tags: [Docentes]
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           description: ID del docente a eliminar
 *     responses:
 *       200:
 *         description: Docente eliminado
 *       404:
 *         description: Docente no encontrado
 */
rutas.delete('/eliminar',
    query("id").isInt().withMessage('El id del docente debe ser un entero'),
    controladorDocente.eliminar
);

/**
 * @swagger
 * /docentes/busqueda/id:
 *   get:
 *     summary: Busca un docente por ID
 *     tags: [Docentes]
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           description: ID del docente a buscar
 *     responses:
 *       200:
 *         description: Docente encontrado
 *       404:
 *         description: Docente no encontrado
 */
rutas.get('/busqueda/id', controladorDocente.busqueda_id);

/**
 * @swagger
 * /docentes/busqueda/nombre:
 *   get:
 *     summary: Busca un docente por nombre
 *     tags: [Docentes]
 *     parameters:
 *       - in: query
 *         name: primerNombre
 *         required: false
 *         schema:
 *           type: string
 *           description: Primer nombre del docente a buscar
 *       - in: query
 *         name: primerApellido
 *         required: false
 *         schema:
 *           type: string
 *           description: Primer apellido del docente a buscar

 *     responses:
 *       200:
 *         description: Docente encontrado
 *       404:
 *         description: Docente no encontrado
 */
rutas.get('/busqueda/nombre', controladorDocente.busqueda_nombre);

module.exports = rutas;
