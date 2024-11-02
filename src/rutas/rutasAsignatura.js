const { Router } = require('express');
const { body, query } = require('express-validator');
const controladorAsignatura = require('../controladores/controladorAsignatura'); 
const ModeloAsignatura = require('../modelos/asignatura');
const ModeloDocente = require('../modelos/docente');
const ModeloCarrera = require('../modelos/carrera');

const rutas = Router();

/**
 * @swagger
 * tags:
 *   name: Asignaturas
 *   description: Gestión de Asignaturas
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
rutas.get('/', controladorAsignatura.inicio);

/**
 * @swagger
 * /asignaturas/listar:
 *   get:
 *     summary: Listar todas las asignaturas
 *     tags: [Asignaturas]
 *     responses:
 *       200:
 *         description: Lista de asignaturas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: ID de la asignatura
 *                   id_asignatura:
 *                     type: integer
 *                     description: Identificador de la asignatura
 *                   nombre_asignatura:
 *                     type: string
 *                   nombre_docente:
 *                     type: string
 *                   nombre_carrera:
 *                     type: string
 */
rutas.get('/listar', controladorAsignatura.listar);

/**
 * @swagger
 * /asignaturas/guardar:
 *   post:
 *     summary: Crea una nueva asignatura
 *     tags: [Asignaturas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre_asignatura:
 *                 type: string
 *                 description: Nombre de la asignatura.
 *                 example: Matemáticas
 *               primerNombre_docente:
 *                 type: string
 *                 description: Primer nombre del docente.
 *                 example: Juan
 *               primerApellido_docente:
 *                 type: string
 *                 description: Primer apellido del docente.
 *                 example: Pérez
 *               nombre_carrera:
 *                 type: string
 *                 description: Nombre de la carrera.
 *                 example: Ingeniería en Sistemas
 *     responses:
 *       201:
 *         description: Asignatura creada exitosamente.
 *       400:
 *         description: Error de validación, el docente o la carrera no existen.
 *       500:
 *         description: Error interno del servidor.
 */
rutas.post('/guardar',
    body("nombre_asignatura")
        .isLength({ min: 3, max: 100 }).withMessage('El nombre de la asignatura debe tener entre 3 y 100 caracteres')
        .notEmpty().withMessage('El nombre de la asignatura no permite valores nulos')
        .custom(async value => {
            const buscarAsignatura = await ModeloAsignatura.findOne({ where: { nombre_asignatura: value } });
            if (buscarAsignatura) {
                throw new Error('El nombre de la asignatura ya existe');
            }
        }),
    body("primerNombre_docente")
        .notEmpty().withMessage('El nombre del docente no puede estar vacío')
        .custom(async value => {
            const docenteExistente = await ModeloDocente.findOne({ where: { primerNombre: value } });
            if (!docenteExistente) {
                throw new Error('El nombre del docente no existe');
            }
        }),
    body("primerApellido_docente")
        .notEmpty().withMessage('El apellido del docente no puede estar vacío')
        .custom(async value => {
            const docenteExistente = await ModeloDocente.findOne({ where: { primerApellido: value } });
            if (!docenteExistente) {
                throw new Error('El apellido del docente no existe');
            }
        }),
    body("nombre_carrera")
        .notEmpty().withMessage('El nombre de la carrera no puede estar vacío')
        .custom(async value => {
            const carreraExistente = await ModeloCarrera.findOne({ where: { nombre_carrera: value } });
            if (!carreraExistente) {
                throw new Error('El nombre de la carrera no existe');
            }
        }),
    controladorAsignatura.guardar
);

/**
 * @swagger
 * /asignaturas/editar:
 *   put:
 *     summary: Editar una asignatura existente
 *     tags: [Asignaturas]
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         description: ID de la asignatura a editar
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre_asignatura:
 *                 type: string
 *                 description: Nuevo nombre de la asignatura.
 *                 example: Matemáticas Avanzadas
 *               primerNombre_docente:
 *                 type: string
 *                 description: Primer nombre del docente.
 *                 example: Juan
 *               primerApellido_docente:
 *                 type: string
 *                 description: Primer apellido del docente.
 *                 example: Pérez
 *               nombre_carrera:
 *                 type: string
 *                 description: Nombre de la carrera.
 *                 example: Ingeniería en Sistemas
 *     responses:
 *       200:
 *         description: Asignatura editada exitosamente
 *       400:
 *         description: Error en los datos de entrada
 *       404:
 *         description: Asignatura no encontrada
 */
rutas.put('/editar',
    query("id")
        .isInt().withMessage("El id de la asignatura debe ser un entero")
        .custom(async value => {
            const buscarAsignatura = await ModeloAsignatura.findOne({ where: { id: value } });
            if (!buscarAsignatura) {
                throw new Error('El id de la asignatura no existe');
            }
        }),
    body("nombre_asignatura")
        .optional()
        .isLength({ min: 3, max: 100 }).withMessage('El nombre de la asignatura debe tener entre 3 y 100 caracteres'),
    body("primerNombre_docente")
        .optional()
        .custom(async value => {
            if (value) {
                const docenteExistente = await ModeloDocente.findOne({ where: { primerNombre: value } });
                if (!docenteExistente) {
                    throw new Error('El nombre del docente no existe');
                }
            }
        }),
    body("primerApellido_docente")
        .optional()
        .custom(async value => {
            if (value) {
                const docenteExistente = await ModeloDocente.findOne({ where: { primerApellido: value } });
                if (!docenteExistente) {
                    throw new Error('El apellido del docente no existe');
                }
            }
        }),
    body("nombre_carrera")
        .optional()
        .custom(async value => {
            if (value) {
                const carreraExistente = await ModeloCarrera.findOne({ where: { nombre_carrera: value } });
                if (!carreraExistente) {
                    throw new Error('El nombre de la carrera no existe');
                }
            }
        }),
    controladorAsignatura.editar
);

/**
 * @swagger
 * /asignaturas/eliminar:
 *   delete:
 *     summary: Eliminar una asignatura existente
 *     tags: [Asignaturas]
 *     parameters:
 *       - in: query
 *         name: id
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
rutas.delete('/eliminar',
    query("id")
        .isInt().withMessage("El id de la asignatura debe ser un entero")
        .custom(async value => {
            const buscarAsignatura = await ModeloAsignatura.findOne({ where: { id: value } });
            if (!buscarAsignatura) {
                throw new Error('El id de la asignatura no existe');
            }
        }),
    controladorAsignatura.eliminar
);

module.exports = rutas;
/**
 * @swagger
 * /asignaturas/busqueda_id:
 *   get:
 *     summary: Buscar asignatura por ID
 *     tags: [Asignaturas]
 *     parameters:
 *       - in: query
 *         name: id_asignatura
 *         required: true
 *         description: ID de la asignatura a buscar
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Asignatura encontrada
 *       404:
 *         description: Asignatura no encontrada
 */
rutas.get('/busqueda_id', controladorAsignatura.busqueda_id);

module.exports = rutas;
