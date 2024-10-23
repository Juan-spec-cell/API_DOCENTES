const { Router } = require('express');
const { body, query } = require('express-validator');
const controladorActividad = require('../controladores/controladorActividad');
const ModeloActividad = require('../modelos/actividad');
const rutas = Router();

/**
 * @swagger
 * tags:
 *   name: Actividades
 *   description: Gestión de actividades
 */

/**
 * @swagger
 * /:
 *   get:
 *     summary: Inicializa el controlador de actividades
 *     tags: [Actividades]
 *     responses:
 *       200:
 *         description: Controlador inicializado
 */
rutas.get('/', controladorActividad.inicio);

/**
 * @swagger
 * /listar:
 *   get:
 *     summary: Lista todas las actividades
 *     tags: [Actividades]
 *     responses:
 *       200:
 *         description: Lista de actividades
 */
rutas.get('/listar', controladorActividad.listar);

/**
 * @swagger
 * /guardar:
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
 *               id_asignatura:
 *                 type: integer
 *                 description: ID de la asignatura asociada
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
    body("id_asignatura")
        .isInt().withMessage('El id de asignatura debe ser un entero')
        .custom(async value => {
            const asignaturaExistente = await ModeloActividad.sequelize.models.asignatura.findOne({ where: { id_asignatura: value } });
            if (!asignaturaExistente) {
                throw new Error('El id de asignatura no existe');
            }
        }),
    body("tipo_actividad")
        .isIn(['Acumulativo', 'Examen']).withMessage('El tipo de actividad debe ser "Acumulativo" o "Examen"'),
    body("fecha")
        .isDate().withMessage('La fecha debe ser una fecha válida'),
    controladorActividad.guardar
);

/**
 * @swagger
 * /editar:
 *   put:
 *     summary: Edita una actividad existente
 *     tags: [Actividades]
 *     parameters:
 *       - in: query
 *         name: id_actividad
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
 *               id_asignatura:
 *                 type: integer
 *                 description: ID de la asignatura asociada (opcional)
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
    query("id_actividad")
        .isInt().withMessage("El id de la actividad debe ser un entero")
        .custom(async value => {
            if (!value) {
                throw new Error('El id no permite valores nulos');
            } else {
                const buscarActividad = await ModeloActividad.findOne({ where: { id_actividad: value } });
                if (!buscarActividad) {
                    throw new Error('El id de la actividad no existe');
                }
            }
        }),
    body("id_asignatura")
        .optional()
        .isInt().withMessage('El id de asignatura debe ser un entero')
        .custom(async value => {
            if (value) {
                const asignaturaExistente = await ModeloActividad.sequelize.models.asignatura.findOne({ where: { id_asignatura: value } });
                if (!asignaturaExistente) {
                    throw new Error('El id de asignatura no existe');
                }
            }
        }),
    body("tipo_actividad")
        .optional()
        .isIn(['Acumulativo', 'Examen']).withMessage('El tipo de actividad debe ser "Acumulativo" o "Examen"'),
    body("fecha")
        .optional()
        .isDate().withMessage('La fecha debe ser una fecha válida'),
    controladorActividad.editar
);

/**
 * @swagger
 * /eliminar:
 *   delete:
 *     summary: Elimina una actividad
 *     tags: [Actividades]
 *     parameters:
 *       - in: query
 *         name: id_actividad
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
    query("id_actividad")
        .isInt().withMessage("El id de la actividad debe ser un entero")
        .custom(async value => {
            if (!value) {
                throw new Error('El id no permite valores nulos');
            } else {
                const buscarActividad = await ModeloActividad.findOne({ where: { id_actividad: value } });
                if (!buscarActividad) {
                    throw new Error('El id de la actividad no existe');
                }
            }
        }),
    controladorActividad.eliminar
);

module.exports = rutas;
