const { Router } = require('express');
const { body, query } = require('express-validator');
const controladorPeriodo = require('../controladores/controladorPeriodo');
const ModeloPeriodo = require('../modelos/periodo'); 
const rutas = Router();


/**
 * @swagger
 * tags:
 *   name: Periodos
 *   description: Gestión de periodos
 */

/**
 * @swagger
 * /periodos:
 *   get:
 *     summary: Muestra un mensaje de bienvenida
 *     tags: [Periodos]
 *     responses:
 *       200:
 *         description: Mensaje de bienvenida de la API.
 */

rutas.get('/', controladorPeriodo.inicio);

/**
 * @swagger
 * /periodos/listar:
 *   get:
 *     summary: Lista todos los periodos
 *     tags: [Periodos]
 *     responses:
 *       200:
 *         description: Lista de periodos.
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
 *                       id_periodo:
 *                         type: integer
 *                         description: ID del periodo.
 *                       nombre_periodo:
 *                         type: string
 *                         description: Nombre del periodo.
 *                       fecha_inicio:
 *                         type: string
 *                         format: date
 *                         description: Fecha de inicio del periodo.
 *                       fecha_fin:
 *                         type: string
 *                         format: date
 *                         description: Fecha de fin del periodo.
 *                 msj:
 *                   type: array
 *                   items:
 *                     type: string
 *       500:
 *         description: Error al cargar los datos de periodos.
 */


rutas.get('/listar', controladorPeriodo.listar);

/**
 * @swagger
 * /periodos/guardar:
 *   post:
 *     summary: Guarda un nuevo periodo
 *     tags: [Periodos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre_periodo:
 *                 type: string
 *                 description: Nombre del periodo.
 *               fecha_inicio:
 *                 type: string
 *                 format: date
 *                 description: Fecha de inicio del periodo.
 *               fecha_fin:
 *                 type: string
 *                 format: date
 *                 description: Fecha de fin del periodo.
 *     responses:
 *       200:
 *         description: Periodo guardado correctamente.
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
 *                     id_periodo:
 *                       type: integer
 *                       description: ID del nuevo periodo.
 *                 msj:
 *                   type: string
 *       400:
 *         description: Error en la validación de datos.
 *       500:
 *         description: Error en el servidor al guardar el periodo.
 */
rutas.post('/guardar',
    body("nombre_periodo")
        .isLength({ min: 3, max: 100 }).withMessage('El nombre del periodo debe tener entre 3 y 100 caracteres')
        .custom(async value => {
            if (!value) {
                throw new Error('El nombre del periodo no permite valores nulos');
            } else {
                const buscarPeriodo = await ModeloPeriodo.findOne({ where: { nombre_periodo: value } });
                if (buscarPeriodo) {
                    throw new Error('El nombre del periodo ya existe');
                }
            }
        }),
    body("fecha_inicio")
        .isISO8601().withMessage('La fecha de inicio debe ser una fecha válida')
        .custom((value, { req }) => {
            if (new Date(value) >= new Date(req.body.fecha_fin)) {
                throw new Error('La fecha de inicio debe ser anterior a la fecha de fin');
            }
            return true;
        }),
    body("fecha_fin")
        .isISO8601().withMessage('La fecha de fin debe ser una fecha válida'),
    controladorPeriodo.guardar
);

/**
 * @swagger
 * /periodos/editar:
 *   put:
 *     summary: Edita un periodo existente
 *     tags: [Periodos]
 *     parameters:
 *       - in: query
 *         name: id_periodo
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del periodo a editar.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre_periodo:
 *                 type: string
 *                 description: Nombre del periodo.
 *               fecha_inicio:
 *                 type: string
 *                 format: date
 *                 description: Fecha de inicio del periodo.
 *               fecha_fin:
 *                 type: string
 *                 format: date
 *                 description: Fecha de fin del periodo.
 *     responses:
 *       200:
 *         description: Periodo editado correctamente.
 *       400:
 *         description: Error en la validación de datos.
 *       404:
 *         description: El ID del periodo no existe.
 *       500:
 *         description: Error en el servidor al editar el periodo.
 */
rutas.put('/editar',
    query("id_periodo")
        .isInt().withMessage("El id del periodo debe ser un entero")
        .custom(async value => {
            const buscarPeriodo = await ModeloPeriodo.findOne({ where: { id_periodo: value } });
            if (!buscarPeriodo) {
                throw new Error('El id del periodo no existe');
            }
        }),
    body("nombre_periodo")
        .optional()
        .isLength({ min: 3, max: 100 }).withMessage('El nombre del periodo debe tener entre 3 y 100 caracteres')
        .custom(async value => {
            if (value) {
                const buscarPeriodo = await ModeloPeriodo.findOne({ where: { nombre_periodo: value } });
                if (buscarPeriodo) {
                    throw new Error('El nombre del periodo ya existe');
                }
            }
        }),
    body("fecha_inicio")
        .optional()
        .isISO8601().withMessage('La fecha de inicio debe ser una fecha válida')
        .custom((value, { req }) => {
            if (value && new Date(value) >= new Date(req.body.fecha_fin)) {
                throw new Error('La fecha de inicio debe ser anterior a la fecha de fin');
            }
            return true;
        }),
    body("fecha_fin")
        .optional()
        .isISO8601().withMessage('La fecha de fin debe ser una fecha válida'),
    controladorPeriodo.editar
);

/**
 * @swagger
 * /periodos/eliminar:
 *   delete:
 *     summary: Elimina un periodo existente
 *     tags: [Periodos]
 *     parameters:
 *       - in: query
 *         name: id_periodo
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del periodo a eliminar.
 *     responses:
 *       200:
 *         description: Periodo eliminado correctamente.
 *       404:
 *         description: El ID del periodo no existe.
 *       500:
 *         description: Error en el servidor al eliminar el periodo.
 */
rutas.delete('/eliminar',
    query("id_periodo")
        .isInt().withMessage("El id del periodo debe ser un entero")
        .custom(async value => {
            const buscarPeriodo = await ModeloPeriodo.findOne({ where: { id_periodo: value } });
            if (!buscarPeriodo) {
                throw new Error('El id del periodo no existe');
            }
        }),
    controladorPeriodo.eliminar
);

module.exports = rutas;
