const { Router } = require('express');
const { body, query } = require('express-validator');
const controladorAsignatura = require('../controladores/controladorAsignatura');
const ModeloAsignatura = require('../modelos/asignatura'); // Asegúrate de la ruta correcta
const rutas = Router();


rutas.get('/', controladorAsignatura.inicio);

rutas.get('/listar', controladorAsignatura.listar);


rutas.post('/guardar',
    body("nombre_asignatura")
        .isLength({ min: 3, max: 100 }).withMessage('El nombre de la asignatura debe tener entre 3 y 100 caracteres')
        .custom(async value => {
            if (!value) {
                throw new Error('El nombre de la asignatura no permite valores nulos');
            } else {
                const buscarAsignatura = await ModeloAsignatura.findOne({ where: { nombre_asignatura: value } });
                if (buscarAsignatura) {
                    throw new Error('El nombre de la asignatura ya existe');
                }
            }
        }),
    body("id_docente")
        .isInt().withMessage('El id del docente debe ser un entero')
        .custom(async value => {
            const docenteExistente = await ModeloAsignatura.sequelize.models.docente.findOne({ where: { id_docente: value } });
            if (!docenteExistente) {
                throw new Error('El id del docente no existe');
            }
        }),
    body("id_carrera")
        .isInt().withMessage('El id de carrera debe ser un entero')
        .custom(async value => {
            const carreraExistente = await ModeloAsignatura.sequelize.models.carrera.findOne({ where: { id_carrera: value } });
            if (!carreraExistente) {
                throw new Error('El id de carrera no existe');
            }
        }),
    controladorAsignatura.guardar
);

// Editar una asignatura
rutas.put('/editar',
    query("id_asignatura")
        .isInt().withMessage("El id de la asignatura debe ser un entero")
        .custom(async value => {
            const buscarAsignatura = await ModeloAsignatura.findOne({ where: { id_asignatura: value } });
            if (!buscarAsignatura) {
                throw new Error('El id de la asignatura no existe');
            }
        }),
    body("nombre_asignatura")
        .optional()
        .isLength({ min: 3, max: 100 }).withMessage('El nombre de la asignatura debe tener entre 3 y 100 caracteres')
        .custom(async value => {
            const buscarAsignatura = await ModeloAsignatura.findOne({ where: { nombre_asignatura: value } });
            if (buscarAsignatura) {
                throw new Error('El nombre de la asignatura ya existe');
            }
        }),
    body("id_docente")
        .optional()
        .isInt().withMessage('El id del docente debe ser un entero')
        .custom(async value => {
            const docenteExistente = await ModeloAsignatura.sequelize.models.docente.findOne({ where: { id_docente: value } });
            if (!docenteExistente) {
                throw new Error('El id del docente no existe');
            }
        }),
    body("id_carrera")
        .optional()
        .isInt().withMessage('El id de carrera debe ser un entero')
        .custom(async value => {
            const carreraExistente = await ModeloAsignatura.sequelize.models.carrera.findOne({ where: { id_carrera: value } });
            if (!carreraExistente) {
                throw new Error('El id de carrera no existe');
            }
        }),
    controladorAsignatura.editar
);

// Eliminar una asignatura
rutas.delete('/eliminar',
    query("id_asignatura")
        .isInt().withMessage("El id de la asignatura debe ser un entero")
        .custom(async value => {
            const buscarAsignatura = await ModeloAsignatura.findOne({ where: { id_asignatura: value } });
            if (!buscarAsignatura) {
                throw new Error('El id de la asignatura no existe');
            }
        }),
    controladorAsignatura.eliminar
);

module.exports = rutas;

/**
 * @swagger
 * tags:
 *   name: Asignaturas
 *   description: Gestion de Asignaturas
 */

/**
 * @swagger
 * /asignaturas:
 *   get:
 *     summary: Obtener la página de inicio de asignaturas
 *     tags: [Asignaturas]
 *     responses:
 *       200:
 *         description: Página de inicio de asignaturas
 */

/**
 * @swagger
 * /asignaturas/listar:
 *   get:
 *     summary: Listar todas las asignaturas
 *     tags: [Asignaturas]
 *     responses:
 *       200:
 *         description: Lista de asignaturas
 */

/**
 * @swagger
 * /asignaturas/guardar:
 *   post:
 *     summary: Guardar una nueva asignatura
 *     tags: [Asignaturas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id_asignatura:
 *                 type: integer
 *                 description: ID de la Asignatura
 *               nombre_asignatura:
 *                 type: string
 *               id_docente:
 *                 type: integer
 *               id_carrera:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Asignatura guardada exitosamente
 *       400:
 *         description: Error en los datos de entrada
 */

/**
 * @swagger
 * /asignaturas/editar:
 *   put:
 *     summary: Editar una asignatura existente
 *     tags: [Asignaturas]
 *     parameters:
 *       - in: query
 *         name: id_asignatura
 *         required: true
 *         description: ID de la asignatura a editar
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id_asignatura:
 *                 type: integer
 *                 description: ID de la Asignatura
 *               nombre_asignatura:
 *                 type: string
 *                 example: "Matemáticas Avanzadas"
 *               id_docente:
 *                 type: integer
 *               id_carrera:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Asignatura editada exitosamente
 *       400:
 *         description: Error en los datos de entrada
 *       404:
 *         description: Asignatura no encontrada
 */

/**
 * @swagger
 * /asignaturas/eliminar:
 *   delete:
 *     summary: Eliminar una asignatura
 *     tags: [Asignaturas]
 *     parameters:
 *       - in: query
 *         name: id_asignatura
 *         required: true
 *         description: ID de la asignatura a eliminar
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Asignatura eliminada exitosamente
 *       404:
 *         description: Asignatura no encontrada
 */
