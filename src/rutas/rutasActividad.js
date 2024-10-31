const { Router } = require('express');
const { body, query } = require('express-validator');
const controladorActividad = require('../controladores/controladorActividad'); 
const rutas = Router();

/**
 * @swagger
 * tags:
 *   name: Actividades
 *   description: Gestión de actividades
 */

/**
 * @swagger
 * /actividades/listar:
 *   get:
 *     summary: Lista todas las actividades
 *     tags: [Actividades]
 *     responses:
 *       200:
 *         description: Lista de actividades.
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
 *                       nombre_actividad:
 *                         type: string
 *                         description: Nombre de la actividad.
 *                       nombre_asignatura:
 *                         type: string
 *                         description: Nombre de la asignatura.
 *                       tipo_actividad:
 *                         type: string
 *                         enum: [Acumulativo, Examen]
 *                         description: Tipo de actividad.
 *                       fecha:
 *                         type: string
 *                         format: date
 *                         description: Fecha de la actividad.
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         description: Fecha de creación de la actividad.
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                         description: Fecha de última actualización de la actividad.
 *                 msj:
 *                   type: array
 *                   items:
 *                     type: string
 *       500:
 *         description: Error al cargar los datos de actividades.
 */
rutas.get('/listar', controladorActividad.listar);

/**
 * @swagger
 * /actividades/guardar:
 *   post:
 *     summary: Guarda una nueva actividad
 *     tags: [Actividades]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre_asignatura:
 *                 type: string
 *                 description: Nombre de la asignatura
 *               tipo_actividad:
 *                 type: string
 *                 enum: [Acumulativo, Examen]
 *                 description: Tipo de actividad
 *               fecha:
 *                 type: string
 *                 format: date
 *                 description: Fecha de la actividad
 *     responses:
 *       200:
 *         description: Actividad guardada
 *       400:
 *         description: Error en los datos proporcionados
 */
rutas.post('/guardar',
    body("nombre_asignatura").notEmpty().withMessage('Ingrese un valor en el nombre de la asignatura'),
    body("tipo_actividad").notEmpty().withMessage('Ingrese un valor en el tipo de actividad'),
    body("fecha").notEmpty().withMessage('Ingrese una fecha para la actividad'),
    controladorActividad.guardar
);

/**
 * @swagger
 * /actividades/editar:
 *   put:
 *     summary: Edita una actividad existente
 *     tags: [Actividades]
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           description: ID de la actividad a editar
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre_asignatura:
 *                 type: string
 *                 description: Nombre de la asignatura (opcional)
 *               tipo_actividad:
 *                 type: string
 *                 enum: [Acumulativo, Examen]
 *                 description: Tipo de actividad (opcional)
 *               fecha:
 *                 type: string
 *                 format: date
 *                 description: Fecha de la actividad (opcional)
 *     responses:
 *       200:
 *         description: Actividad editada
 *       400:
 *         description: Error en los datos proporcionados
 */
rutas.put('/editar',
    query("id")
        .isInt().withMessage("El id de la actividad debe ser un entero")
        .custom(async value => {
            if (!value) {
                throw new Error('El id no permite valores nulos');
            } else {
                const buscarActividad = await controladorActividad.buscarPorId(value);
                if (!buscarActividad) {
                    throw new Error('El id de la actividad no existe');
                }
            }
        }),
    body("nombre_asignatura").optional().isString().withMessage('El nombre de la asignatura debe ser una cadena de texto'),
    body("tipo_actividad").optional().isString().withMessage('El tipo de actividad debe ser una cadena de texto'),
    body("fecha").optional().isString().withMessage('La fecha debe ser una cadena de texto'),
    controladorActividad.editar
);

/**
 * @swagger
 * /actividades/eliminar:
 *   delete:
 *     summary: Elimina una actividad
 *     tags: [Actividades]
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           description: ID de la actividad a eliminar
 *     responses:
 *       200:
 *         description: Actividad eliminada
 *       400:
 *         description: Error en los datos proporcionados
 */
rutas.delete('/eliminar',
    query("id")
        .isInt().withMessage("El id de la actividad debe ser un entero")
        .custom(async value => {
            if (!value) {
                throw new Error('El id no permite valores nulos');
            } else {
                const buscarActividad = await controladorActividad.buscarPorId(value);
                if (!buscarActividad) {
                    throw new Error('El id de la actividad no existe');
                }
            }
        }),
    controladorActividad.eliminar
);

module.exports = rutas;
