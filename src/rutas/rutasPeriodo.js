const express = require('express');
const { body, query } = require('express-validator');
const controladorPeriodo = require('../controladores/controladorPeriodo');
const rutas = express.Router();

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
 *     summary: Inicializa el controlador de periodos
 *     tags: [Periodos]
 *     responses:
 *       200:
 *         description: Controlador inicializado
 */
rutas.get('/', controladorPeriodo.inicio);

/**
 * @swagger
 * /periodos/listar:
 *   get:
 *     summary: Lista todos los Periodos
 *     tags: [Periodos]
 *     responses:
 *       200:
 *         description: Lista de Periodos.
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
 *         description: Error al cargar los datos de Periodos.
 */
rutas.get('/listar', controladorPeriodo.listar);

/**
 * @swagger
 * /periodos/guardar:
 *   post:
 *     summary: Guarda un nuevo Periodo
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
 *       201:
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
 *                       description: ID del periodo.
 *                     nombre_periodo:
 *                       type: string
 *                       description: Nombre del periodo.
 *                     fecha_inicio:
 *                       type: string
 *                       format: date
 *                       description: Fecha de inicio del periodo.
 *                     fecha_fin:
 *                       type: string
 *                       format: date
 *                       description: Fecha de fin del periodo.
 *                 msj:
 *                   type: string
 *       400:
 *         description: Error en la validación de datos.
 *       500:
 *         description: Error en el servidor al guardar el periodo.
 */
rutas.post('/guardar',
    body('nombre_periodo')
        .notEmpty().withMessage('El nombre del periodo es obligatorio')
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
        .notEmpty().withMessage('La fecha de inicio es obligatoria')
        .isISO8601().withMessage('La fecha de inicio debe ser una fecha válida')
        .custom((value, { req }) => {
            if (value && new Date(value) >= new Date(req.body.fecha_fin)) {
                throw new Error('La fecha de inicio debe ser anterior a la fecha de fin');
            }
            return true;
        }),
    body("fecha_fin")
        .notEmpty().withMessage('La fecha de fin es obligatoria')
        .isISO8601().withMessage('La fecha de fin debe ser una fecha válida'),
    controladorPeriodo.guardar
);

/**
 * @swagger
 * /periodos/editar:
 *   put:
 *     summary: Edita un Periodo existente
 *     tags: [Periodos]
 *     parameters:
 *       - in: query
 *         name: id_periodo
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del Periodo a editar.
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 tipo:
 *                   type: integer
 *                 msj:
 *                   type: string
 *       400:
 *         description: Error en la validación de datos.
 *       404:
 *         description: Periodo no encontrado.
 *       500:
 *         description: Error en el servidor al editar el periodo.
 */
rutas.put('/editar',
    query('id_periodo').isInt().withMessage('El id del periodo debe ser un entero'),
    body('nombre_periodo')
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
 *     summary: Elimina un Periodo existente
 *     tags: [Periodos]
 *     parameters:
 *       - in: query
 *         name: id_periodo
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del Periodo a eliminar.
 *     responses:
 *       200:
 *         description: Periodo eliminado correctamente.
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
 *         description: Periodo no encontrado.
 *       500:
 *         description: Error en el servidor al eliminar el periodo.
 */
rutas.delete('/eliminar',
    query('id_periodo').isInt().withMessage('El id del periodo debe ser un entero'),
    controladorPeriodo.eliminar
);

/**
 * @swagger
 * /periodos/buscar:
 *   get:
 *     summary: Busca un Periodo por ID
 *     tags: [Periodos]
 *     parameters:
 *       - in: query
 *         name: id_periodo
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del Periodo a buscar.
 *     responses:
 *       200:
 *         description: Periodo encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id_periodo:
 *                   type: integer
 *                   description: ID del periodo.
 *                 nombre_periodo:
 *                   type: string
 *                   description: Nombre del periodo.
 *                 fecha_inicio:
 *                   type: string
 *                   format: date
 *                   description: Fecha de inicio del periodo.
 *                 fecha_fin:
 *                   type: string
 *                   format: date
 *                   description: Fecha de fin del periodo.
 *       404:
 *         description: Periodo no encontrado.
 *       500:
 *         description: Error en el servidor al buscar el periodo.
 */
rutas.get('/buscar',
    query('id_periodo').isInt().withMessage('El id del periodo debe ser un entero'),
    controladorPeriodo.buscarPorId
);

/**
 * @swagger
 * /periodos/buscar_nombre:
 *   get:
 *     summary: Busca un Periodo por nombre
 *     tags: [Periodos]
 *     parameters:
 *       - in: query
 *         name: nombre_periodo
 *         required: true
 *         schema:
 *           type: string
 *         description: Nombre del Periodo a buscar.
 *     responses:
 *       200:
 *         description: Periodo encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id_periodo:
 *                   type: integer
 *                   description: ID del periodo.
 *                 nombre_periodo:
 *                   type: string
 *                   description: Nombre del periodo.
 *                 fecha_inicio:
 *                   type: string
 *                   format: date
 *                   description: Fecha de inicio del periodo.
 *                 fecha_fin:
 *                   type: string
 *                   format: date
 *                   description: Fecha de fin del periodo.
 *       404:
 *         description: Periodo no encontrado.
 *       500:
 *         description: Error en el servidor al buscar el periodo.
 */
rutas.get('/buscar_nombre',
    query('nombre_periodo').isString().withMessage('El nombre del periodo debe ser una cadena de texto'),
    controladorPeriodo.buscarPorNombre
);

module.exports = rutas;