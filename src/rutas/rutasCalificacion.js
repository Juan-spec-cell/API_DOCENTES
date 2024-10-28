const { Router } = require('express');
const { body, query } = require('express-validator');
const controladorCalificacion = require('../controladores/controladorCalificacion'); // Asegúrate de que este controlador existe
const rutas = Router();

/**
 * @swagger
 * tags:
 *   name: Calificaciones
 *   description: Gestión de calificaciones
 */

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
 *                       id_estudiante:
 *                         type: integer
 *                         description: ID del estudiante.
 *                       id_asignatura:
 *                         type: integer
 *                         description: ID de la asignatura.
 *                       nota:
 *                         type: float
 *                         description: Nota de la calificación.
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
 *               id_estudiante:
 *                 type: integer
 *                 description: ID del estudiante
 *               id_asignatura:
 *                 type: integer
 *                 description: ID de la asignatura
 *               nota:
 *                 type: float
 *                 description: Nota de la calificación
 *     responses:
 *       200:
 *         description: Calificación guardada
 *       400:
 *         description: Error en los datos proporcionados
 */
rutas.post('/guardar',
    body("id_estudiante").notEmpty().withMessage('Ingrese un valor en el ID del estudiante'),
    body("id_asignatura").notEmpty().withMessage('Ingrese un valor en el ID de la asignatura'),
    body("nota").notEmpty().withMessage('Ingrese una nota para la calificación'),
    controladorCalificacion.guardar
);

/**
 * @swagger
 * /calificaciones/editar:
 *   put:
 *     summary: Edita una calificación existente
 *     tags: [Calificaciones]
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           description: ID de la calificación a editar
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id_estudiante:
 *                 type: integer
 *                 description: ID del estudiante (opcional)
 *               id_asignatura:
 *                 type: integer
 *                 description: ID de la asignatura (opcional)
 *               nota:
 *                 type: float
 *                 description: Nota de la calificación (opcional)
 *     responses:
 *       200:
 *         description: Calificación editada
 *       400:
 *         description: Error en los datos proporcionados
 */
rutas.put('/editar',
    query("id")
        .isInt().withMessage("El id de la calificación debe ser un entero")
        .custom(async value => {
            if (!value) {
                throw new Error('El id no permite valores nulos');
            } else {
                const buscarCalificacion = await controladorCalificacion.buscarPorId(value);
                if (!buscarCalificacion) {
                    throw new Error('El id de la calificación no existe');
                }
            }
        }),
    body("id_estudiante").optional().isInt().withMessage('El ID del estudiante debe ser un entero'),
    body("id_asignatura").optional().isInt().withMessage('El ID de la asignatura debe ser un entero'),
    body("nota").optional().isFloat().withMessage('La nota debe ser un número decimal'),
    controladorCalificacion.editar
);

/**
 * @swagger
 * /calificaciones/eliminar:
 *   delete:
 *     summary: Elimina una calificación
 *     tags: [Calificaciones]
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           description: ID de la calificación a eliminar
 *     responses:
 *       200:
 *         description: Calificación eliminada
 *       400:
 *         description: Error en los datos proporcionados
 */
rutas.delete('/eliminar',
    query("id")
        .isInt().withMessage("El id de la calificación debe ser un entero")
        .custom(async value => {
            if (!value) {
                throw new Error('El id no permite valores nulos');
            } else {
                const buscarCalificacion = await controladorCalificacion.buscarPorId(value);
                if (!buscarCalificacion) {
                    throw new Error('El id de la calificación no existe');
                }
            }
        }),
    controladorCalificacion.eliminar
);

module.exports = rutas;