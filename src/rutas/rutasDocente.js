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
 *               nombre_docente:
 *                 type: string
 *                 description: Nombre del docente
 *               apellido_docente:
 *                 type: string
 *                 description: Apellido del docente
 *               email:
 *                 type: string
 *                 description: Correo electrónico del docente
 *     responses:
 *       200:
 *         description: Docente guardado
 *       404:
 *         description: Usuario no encontrado
 *       400:
 *         description: Error en los datos proporcionados
 */
rutas.post('/guardar',
    body("nombre_docente")
        .isString().withMessage('El nombre debe ser una cadena de texto')
        .notEmpty().withMessage('El nombre no permite valores nulos'),
    body("apellido_docente")
        .isString().withMessage('El apellido debe ser una cadena de texto')
        .notEmpty().withMessage('El apellido no permite valores nulos'),
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
 *               nombre_docente:
 *                 type: string
 *                 description: Nombre del docente
 *               apellido_docente:
 *                 type: string
 *                 description: Apellido del docente
 *               email:
 *                 type: string
 *                 description: Correo electrónico del docente
 *     responses:
 *       200:
 *         description: Docente editado
 *       404:
 *         description: Docente o usuario no encontrado
 *       400:
 *         description: Error en los datos proporcionados
 */
rutas.put('/editar',
    query("id_docente").isInt().withMessage('El id del docente debe ser un entero'),
    body("nombre_docente")
        .optional()
        .isString().withMessage('El nombre debe ser una cadena de texto')
        .notEmpty().withMessage('El nombre no permite valores nulos'),
    body("apellido_docente")
        .optional()
        .isString().withMessage('El apellido debe ser una cadena de texto')
        .notEmpty().withMessage('El apellido no permite valores nulos'),
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
 *       404:
 *         description: Docente no encontrado
 */
rutas.delete('/eliminar',
    query("id_docente").isInt().withMessage('El id del docente debe ser un entero'),
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
 *         name: nombre
 *         required: true
 *         schema:
 *           type: string
 *           description: Nombre del docente a buscar
 *     responses:
 *       200:
 *         description: Docente encontrado
 *       404:
 *         description: Docente no encontrado
 */
rutas.get('/busqueda/nombre', controladorDocente.busqueda_nombre);

module.exports = rutas;
