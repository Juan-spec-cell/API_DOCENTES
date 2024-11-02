const { Router } = require('express');
const { body, query } = require('express-validator');
const controladorCarrera = require('../controladores/controladorCarrera');
const ModeloCarrera = require('../modelos/carrera');
const rutas = Router();

/**
 * @swagger
 * tags:
 *   name: Carreras
 *   description: Gestión de carreras
 */

/**
 * @swagger
 * /carreras:
 *   get:
 *     summary: Muestra un mensaje de bienvenida
 *     tags: [Carreras]
 *     responses:
 *       200:
 *         description: Mensaje de bienvenida de la API.
 */
rutas.get('/', controladorCarrera.inicio);

/**
 * @swagger
 * /carreras/listar:
 *   get:
 *     summary: Lista todas las carreras
 *     tags: [Carreras]
 *     responses:
 *       200:
 *         description: Lista de carreras.
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
 *                       id:
 *                         type: integer
 *                         description: ID de la carrera.
 *                       nombre_carrera:
 *                         type: string
 *                         description: Nombre de la carrera.
 *                       facultad:
 *                         type: string
 *                         description: Nombre de la facultad.
 *                       createdAt:
 *                         type: string
 *                         format: date
 *                         description: Fecha de creación.
 *                       updatedAt:
 *                         type: string
 *                         format: date
 *                         description: Fecha de actualización.
 *                 msj:
 *                   type: array
 *                   items:
 *                     type: string
 *       500:
 *         description: Error al cargar los datos de carreras.
 */
rutas.get('/listar', controladorCarrera.listar);

/**
 * @swagger
 * /carreras/guardar:
 *   post:
 *     summary: Guarda una nueva carrera
 *     tags: [Carreras]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre_carrera:
 *                 type: string
 *                 description: Nombre de la carrera.
 *               facultad:
 *                 type: string
 *                 description: Nombre de la facultad.
 *     responses:
 *       200:
 *         description: Carrera guardada correctamente.
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
 *                     id:
 *                       type: integer
 *                       description: ID de la nueva carrera.
 *                     nombre_carrera:
 *                       type: string
 *                       description: Nombre de la carrera.
 *                     facultad:
 *                       type: string
 *                       description: Nombre de la facultad.
 *                     createdAt:
 *                       type: string
 *                       format: date
 *                       description: Fecha de creación.
 *                     updatedAt:
 *                       type: string
 *                       format: date
 *                       description: Fecha de actualización.
 *                 msj:
 *                   type: string
 *       400:
 *         description: Error en la validación de datos.
 *       500:
 *         description: Error en el servidor al guardar la carrera.
 */
rutas.post('/guardar',
    body("nombre_carrera")
        .isString().withMessage('El nombre de la carrera debe ser una cadena de texto')
        .notEmpty().withMessage('El nombre de la carrera no puede estar vacío')
        .isLength({ min: 3, max: 100 }).withMessage('El nombre de la carrera debe tener entre 3 y 100 caracteres'),
    body("facultad")
        .isString().withMessage('El nombre de la facultad debe ser una cadena de texto')
        .notEmpty().withMessage('El nombre de la facultad no puede estar vacío')
        .isLength({ min: 3, max: 100 }).withMessage('El nombre de la facultad debe tener entre 3 y 100 caracteres'),
    controladorCarrera.guardar
);

/**
 * @swagger
 * /carreras/editar:
 *   put:
 *     summary: Edita una carrera existente
 *     tags: [Carreras]
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la carrera a editar.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre_carrera:
 *                 type: string
 *                 description: Nombre de la carrera.
 *               facultad:
 *                 type: string
 *                 description: Nombre de la facultad.
 *     responses:
 *       200:
 *         description: Carrera editada correctamente.
 *       400:
 *         description: Error en la validación de datos.
 *       404:
 *         description: El ID de la carrera no existe.
 *       500:
 *         description: Error en el servidor al editar la carrera.
 */
rutas.put('/editar',
    query("id")
        .isInt().withMessage("El id de la carrera debe ser un entero")
        .custom(async value => {
            if (!value) {
                throw new Error('El id no permite valores nulos');
            } else {
                const buscarCarrera = await ModeloCarrera.findOne({ where: { id: value } });
                if (!buscarCarrera) {
                    throw new Error('El id de la carrera no existe');
                }
            }
        }),
    body("nombre_carrera")
        .optional()
        .isLength({ min: 3, max: 100 }).withMessage('El nombre de la carrera debe tener entre 3 y 100 caracteres'),
    body("facultad")
        .optional()
        .isLength({ min: 3, max: 100 }).withMessage('La facultad debe tener entre 3 y 100 caracteres'),
    controladorCarrera.editar
);

/**
 * @swagger
 * /carreras/eliminar:
 *   delete:
 *     summary: Elimina una carrera existente
 *     tags: [Carreras]
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la carrera a eliminar.
 *     responses:
 *       200:
 *         description: Carrera eliminada correctamente.
 *       404:
 *         description: El ID de la carrera no existe.
 *       500:
 *         description: Error en el servidor al eliminar la carrera.
 */
rutas.delete('/eliminar',
    query("id")
        .isInt().withMessage("El id de la carrera debe ser un entero")
        .custom(async value => {
            if (!value) {
                throw new Error('El id no permite valores nulos');
            } else {
                const buscarCarrera = await ModeloCarrera.findOne({ where: { id: value } });
                if (!buscarCarrera) {
                    throw new Error('El id de la carrera no existe');
                }
            }
        }),
    controladorCarrera.eliminar
);

/**
 * @swagger
 * /carreras/busqueda_id:
 *   get:
 *     summary: Busca una carrera por ID
 *     tags: [Carreras]
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la carrera a buscar.
 *     responses:
 *       200:
 *         description: Carrera encontrada.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 nombre_carrera:
 *                   type: string
 *                 facultad:
 *                   type: string
 *                 createdAt:
 *                   type: string
 *                   format: date
 *                 updatedAt:
 *                   type: string
 *                   format: date
 *       404:
 *         description: Carrera no encontrada.
 *       500:
 *         description: Error en el servidor al buscar la carrera.
 */
rutas.get('/busqueda_id',
    query("id")
        .isInt().withMessage("El id de la carrera debe ser un entero")
        .notEmpty().withMessage('El id no permite valores nulos'), // Se asegura que el ID no sea vacío
    controladorCarrera.busqueda_id
);

/**
 * @swagger
 * /carreras/busqueda_nombre:
 *   get:
 *     summary: Busca carreras por nombre
 *     tags: [Carreras]
 *     parameters:
 *       - in: query
 *         name: nombre
 *         required: true
 *         schema:
 *           type: string
 *         description: Nombre de la carrera a buscar.
 *     responses:
 *       200:
 *         description: Carreras encontradas.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 nombre_carrera:
 *                   type: string
 *                 facultad:
 *                   type: string
 *                 createdAt:
 *                   type: string
 *                   format: date
 *                 updatedAt:
 *                   type: string
 *                   format: date
 *       404:
 *         description: Carrera no encontrada.
 *       500:
 *         description: Error en el servidor al buscar la carrera.
 */
rutas.get('/busqueda_nombre',
    query("nombre")
        .isString().withMessage("El nombre de la carrera debe ser una cadena de texto")
        .notEmpty().withMessage('El nombre de la carrera no puede estar vacío'),
    controladorCarrera.busqueda_nombre
);

module.exports = rutas;