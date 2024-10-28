const express = require('express');
const { body, query } = require('express-validator');
const controladorDocente = require('../controladores/controladorDocente');
const ModeloDocente = require('../modelos/docente');
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
 *               id_docente:
 *                 type: integer
 *                 description: ID del docente
 *               nombre:
 *                 type: string
 *                 description: Nombre del docente
 *               email:
 *                 type: string
 *                 description: Correo electrónico del docente
 *     responses:
 *       200:
 *         description: Docente guardado
 *       400:
 *         description: Error en los datos proporcionados
 */
rutas.post('/guardar',
    body("id_docente").isInt().withMessage('El id del docente debe ser un entero'),
    body("nombre")
        .isString().withMessage('El nombre debe ser una cadena de texto')
        .notEmpty().withMessage('El nombre no permite valores nulos'),
    body("email")
        .isEmail().withMessage('Debe ser un correo electrónico válido')
        .custom(async value => {
            const buscarDocente = await ModeloDocente.findOne({ where: { email: value } });
            if (buscarDocente) {
                throw new Error('El correo ya está registrado');
            }
        }),
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
 *         name: id_docente
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
 *               nombre:
 *                 type: string
 *                 description: Nombre del docente
 *               email:
 *                 type: string
 *                 description: Correo electrónico del docente
 *     responses:
 *       200:
 *         description: Docente editado
 *       400:
 *         description: Error en los datos proporcionados
 */
rutas.put('/editar',
    query("id_docente").isInt().withMessage('El id del docente debe ser un entero'),
    body("nombre")
        .optional()
        .isString().withMessage('El nombre debe ser una cadena de texto')
        .notEmpty().withMessage('El nombre no permite valores nulos'),
    body("email")
        .optional()
        .isEmail().withMessage('Debe ser un correo electrónico válido')
        .custom(async value => {
            const buscarDocente = await ModeloDocente.findOne({ where: { email: value } });
            if (buscarDocente) {
                throw new Error('El correo ya está registrado');
            }
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
 *         name: id_docente
 *         required: true
 *         schema:
 *           type: integer
 *           description: ID del docente a eliminar
 *     responses:
 *       200:
 *         description: Docente eliminado
 *       400:
 *         description: Error en los datos proporcionados
 */
rutas.delete('/eliminar',
    query("id_docente").isInt().withMessage('El id del docente debe ser un entero'),
    controladorDocente.eliminar
);

module.exports = rutas;