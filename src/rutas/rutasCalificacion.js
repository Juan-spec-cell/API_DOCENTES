const { Router } = require('express');
const { body, query } = require('express-validator');
const controladorCalificacion = require('../controladores/controladorCalificacion');
const ModeloCalificacion = require('../modelos/calificacion');
const rutas = Router();

rutas.get('/', controladorCalificacion.inicio);

rutas.get('/listar', controladorCalificacion.listar);

rutas.post('/guardar',
    body("id_asignatura")
        .isInt().withMessage('El id de la asignatura debe ser un entero')
        .custom(async value => {
            const asignaturaExistente = await ModeloCalificacion.sequelize.models.asignatura.findOne({ where: { id_asignatura: value } });
            if (!asignaturaExistente) {
                throw new Error('El id de la asignatura no existe');
            }
        }),
    body("id_estudiante")
        .isInt().withMessage('El id del estudiante debe ser un entero')
        .custom(async value => {
            const estudianteExistente = await ModeloCalificacion.sequelize.models.estudiante.findOne({ where: { id_estudiante: value } });
            if (!estudianteExistente) {
                throw new Error('El id del estudiante no existe');
            }
        }),
    body("calificacion")
        .isDecimal().withMessage('La calificación debe ser un número decimal')
        .custom(value => {
            if (value < 0 || value > 100) {
                throw new Error('La calificación debe estar entre 0 y 100');
            }
            return true;
        }),
    body("fecha")
        .isDate().withMessage('La fecha debe ser una fecha válida'),
    controladorCalificacion.guardar
);

rutas.put('/editar',
    query("id_calificacion")
        .isInt().withMessage("El id de la calificación debe ser un entero")
        .custom(async value => {
            const buscarCalificacion = await ModeloCalificacion.findOne({ where: { id_calificacion: value } });
            if (!buscarCalificacion) {
                throw new Error('El id de la calificación no existe');
            }
        }),
    body("id_asignatura")
        .optional()
        .isInt().withMessage('El id de la asignatura debe ser un entero')
        .custom(async value => {
            if (value) {
                const asignaturaExistente = await ModeloCalificacion.sequelize.models.asignatura.findOne({ where: { id_asignatura: value } });
                if (!asignaturaExistente) {
                    throw new Error('El id de la asignatura no existe');
                }
            }
        }),
    body("id_estudiante")
        .optional()
        .isInt().withMessage('El id del estudiante debe ser un entero')
        .custom(async value => {
            if (value) {
                const estudianteExistente = await ModeloCalificacion.sequelize.models.estudiante.findOne({ where: { id_estudiante: value } });
                if (!estudianteExistente) {
                    throw new Error('El id del estudiante no existe');
                }
            }
        }),
    body("calificacion")
        .optional()
        .isDecimal().withMessage('La calificación debe ser un número decimal')
        .custom(value => {
            if (value < 0 || value > 100) {
                throw new Error('La calificación debe estar entre 0 y 100');
            }
            return true;
        }),
    body("fecha")
        .optional()
        .isDate().withMessage('La fecha debe ser una fecha válida'),
    controladorCalificacion.editar
);

rutas.delete('/eliminar',
    query("id_calificacion")
        .isInt().withMessage("El id de la calificación debe ser un entero")
        .custom(async value => {
            const buscarCalificacion = await ModeloCalificacion.findOne({ where: { id_calificacion: value } });
            if (!buscarCalificacion) {
                throw new Error('El id de la calificación no existe');
            }
        }),
    controladorCalificacion.eliminar
);

module.exports = rutas;

/**
 * @swagger
 * /calificaciones:
 *   get:
 *     summary: Muestra un mensaje de bienvenida para calificaciones
 *     tags: [Calificaciones]
 *     responses:
 *       200:
 *         description: Mensaje de bienvenida de la API.
 */
rutas.get('/', controladorCalificacion.inicio);

/**
 * @swagger
 * /calificaciones/listar:
 *   get:
 *     summary: Lista todas las calificaciones
 *     tags: [Calificaciones]
 *     responses:
 *       200:
 *         description: Lista de calificaciones.
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
 *                       id_calificacion:
 *                         type: integer
 *                         description: ID de la calificación.
 *                       id_asignatura:
 *                         type: integer
 *                         description: ID de la asignatura asociada.
 *                       id_estudiante:
 *                         type: integer
 *                         description: ID del estudiante.
 *                       calificacion:
 *                         type: number
 *                         format: decimal
 *                         description: Calificación obtenida.
 *                       fecha:
 *                         type: string
 *                         format: date
 *                         description: Fecha de la calificación.
 *                 msj:
 *                   type: array
 *                   items:
 *                     type: string
 *       500:
 *         description: Error al cargar los datos de calificaciones.
 */
rutas.get('/listar', controladorCalificacion.listar);

/**
 * @swagger
 * /calificaciones/guardar:
 *   post:
 *     summary: Guarda una nueva calificación
 *     tags: [Calificaciones]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id_asignatura:
 *                 type: integer
 *                 description: ID de la asignatura.
 *               id_estudiante:
 *                 type: integer
 *                 description: ID del estudiante.
 *               calificacion:
 *                 type: number
 *                 format: decimal
 *                 description: Calificación obtenida (0 a 100).
 *               fecha:
 *                 type: string
 *                 format: date
 *                 description: Fecha de la calificación.
 *     responses:
 *       200:
 *         description: Calificación guardada correctamente.
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
 *                     id_calificacion:
 *                       type: integer
 *                       description: ID de la nueva calificación.
 *                 msj:
 *                   type: string
 *       400:
 *         description: Error en la validación de datos.
 *       500:
 *         description: Error en el servidor al guardar la calificación.
 */
rutas.post('/guardar', /* middlewares y controlador */);

/**
 * @swagger
 * /calificaciones/editar:
 *   put:
 *     summary: Edita una calificación existente
 *     tags: [Calificaciones]
 *     parameters:
 *       - in: query
 *         name: id_calificacion
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la calificación a editar.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id_asignatura:
 *                 type: integer
 *                 description: ID de la asignatura (opcional).
 *               id_estudiante:
 *                 type: integer
 *                 description: ID del estudiante (opcional).
 *               calificacion:
 *                 type: number
 *                 format: decimal
 *                 description: Calificación (opcional).
 *               fecha:
 *                 type: string
 *                 format: date
 *                 description: Fecha de la calificación (opcional).
 *     responses:
 *       200:
 *         description: Calificación editada correctamente.
 *       400:
 *         description: Error en la validación de datos.
 *       404:
 *         description: El ID de la calificación no existe.
 *       500:
 *         description: Error en el servidor al editar la calificación.
 */
rutas.put('/editar', /* middlewares y controlador */);

/**
 * @swagger
 * /calificaciones/eliminar:
 *   delete:
 *     summary: Elimina una calificación existente
 *     tags: [Calificaciones]
 *     parameters:
 *       - in: query
 *         name: id_calificacion
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la calificación a eliminar.
 *     responses:
 *       200:
 *         description: Calificación eliminada correctamente.
 *       404:
 *         description: El ID de la calificación no existe.
 *       500:
 *         description: Error en el servidor al eliminar la calificación.
 */
rutas.delete('/eliminar', /* middlewares y controlador */);
