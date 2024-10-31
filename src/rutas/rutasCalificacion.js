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
 *                       nombre_estudiante:
 *                         type: string
 *                         description: Nombre del estudiante.
 *                       apellido_estudiante:
 *                         type: string
 *                         description: Apellido del estudiante.
 *                       nombre_asignatura:
 *                         type: string
 *                         description: Nombre de la asignatura.
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
 *               nombre_estudiante:
 *                 type: string
 *                 description: Nombre del estudiante
 *               apellido_estudiante:
 *                 type: string
 *                 description: Apellido del estudiante
 *               nombre_asignatura:
 *                 type: string
 *                 description: Nombre de la asignatura
 *               nota:
 *                 type: number
 *                 format: float
 *                 description: Nota de la calificación
 *     responses:
 *       200:
 *         description: Calificación guardada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     id_calificacion:
 *                       type: integer
 *                       description: ID de la calificación.
 *                     nombre_estudiante:
 *                       type: string
 *                       description: Nombre del estudiante.
 *                     apellido_estudiante:
 *                       type: string
 *                       description: Apellido del estudiante.
 *                     nombre_asignatura:
 *                       type: string
 *                       description: Nombre de la asignatura.
 *                     nota:
 *                       type: float
 *                       description: Nota de la calificación.
 *       400:
 *         description: Error en los datos proporcionados
 *       500:
 *         description: Error en el servidor al guardar la calificación
 */
rutas.post('/guardar',
    body("nombre_estudiante")
        .isString().withMessage('El nombre del estudiante debe ser una cadena de texto')
        .notEmpty().withMessage('El nombre del estudiante no puede estar vacío'),
    body("apellido_estudiante")
        .isString().withMessage('El apellido del estudiante debe ser una cadena de texto')
        .notEmpty().withMessage('El apellido del estudiante no puede estar vacío'),
    body("nombre_asignatura")
        .isString().withMessage('El nombre de la asignatura debe ser una cadena de texto')
        .notEmpty().withMessage('El nombre de la asignatura no puede estar vacío'),
    body("nota")
        .isFloat().withMessage('La nota debe ser un número flotante')
        .notEmpty().withMessage('Ingrese una nota para la calificación'),
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
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre_estudiante:
 *                 type: string
 *                 description: Nombre del estudiante (requerido)
 *               apellido_estudiante:
 *                 type: string
 *                 description: Apellido del estudiante (requerido)
 *               nombre_asignatura:
 *                 type: string
 *                 description: Nombre de la asignatura (requerido)
 *               nota:
 *                 type: float
 *                 description: Nota de la calificación (requerido)
 *     responses:
 *       200:
 *         description: Calificación editada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id_calificacion:
 *                   type: integer
 *                 nombre_estudiante:
 *                   type: string
 *                 nombre_asignatura:
 *                   type: string
 *                 nota:
 *                   type: Float
 *       400:
 *         description: Error en los datos proporcionados
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       404:
 *         description: Calificación, estudiante o asignatura no encontrados
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       500:
 *         description: Error en el servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
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
    body("nombre_estudiante")
        .notEmpty().withMessage('El nombre del estudiante es obligatorio')
        .isString().withMessage('El nombre del estudiante debe ser un texto'),
    body("apellido_estudiante")
        .notEmpty().withMessage('El apellido del estudiante es obligatorio')
        .isString().withMessage('El apellido del estudiante debe ser un texto'),
    body("nombre_asignatura")
        .notEmpty().withMessage('El nombre de la asignatura es obligatorio')
        .isString().withMessage('El nombre de la asignatura debe ser un texto'),
    body("nota")
        .notEmpty().withMessage('La nota es obligatoria')
        .isFloat().withMessage('La nota debe ser un número decimal'),
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