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
 *   description: Gestión de asignaturas
 */

/**
 * @swagger
 * /asignaturas:
 *   get:
 *     summary: Muestra un mensaje de bienvenida
 *     tags: [Asignaturas]
 *     responses:
 *       200:
 *         description: Mensaje de bienvenida de la API.
 */
rutas.get('/', controladorAsignatura.inicio);

/**
 * @swagger
 * /asignaturas/listar:
 *   get:
 *     summary: Lista todas las asignaturas
 *     tags: [Asignaturas]
 *     responses:
 *       200:
 *         description: Lista de asignaturas.
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
 *                       id:
 *                         type: integer
 *                         description: ID de la asignatura.
 *                       nombre_asignatura:
 *                         type: string
 *                         description: Nombre de la asignatura.
 *                       nombre_docente:
 *                         type: string
 *                         description: Nombre del docente.
 *                 msj:
 *                   type: array
 *                   items:
 *                     type: string
 *       500:
 *         description: Error al cargar los datos de asignaturas.
 */
rutas.get('/listar', controladorAsignatura.listar);

/**
 * @swagger
 * /asignaturas/guardar:
 *   post:
 *     summary: Guarda una nueva asignatura
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
 *               docenteId:
 *                 type: integer
 *                 description: ID del docente.
 *               carreraId:
 *                 type: integer
 *                 description: ID de la carrera.
 *     responses:
 *       200:
 *         description: Asignatura guardada correctamente.
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
 *                     id_asignatura:
 *                       type: integer
 *                       description: ID de la nueva asignatura.
 *                     nombre_asignatura:
 *                       type: string
 *                       description: Nombre de la asignatura.
 *                     docenteId:
 *                       type: integer
 *                       description: ID del docente.
 *                     carreraId:
 *                       type: integer
 *                       description: ID de la carrera.
 *       400:
 *         description: Error en la validación de datos.
 *       500:
 *         description: Error en el servidor al guardar la asignatura.
 */

rutas.post('/guardar',
    body("nombre_asignatura")
        .isString().withMessage('El nombre de la asignatura debe ser una cadena de texto')
        .notEmpty().withMessage('El nombre de la asignatura no puede estar vacío'),
    body("docenteId")
        .isInt().withMessage('El ID del docente debe ser un entero')
        .notEmpty().withMessage('El ID del docente no puede estar vacío')
        .custom(async (value) => {
            if (value) {
                const buscarDocente = await ModeloDocente.findOne({ where: { id: value } });
                if (!buscarDocente) {
                    throw new Error('El id del docente no existe')
                }
            }
        }),
    body("carreraId")
        .isInt().withMessage('El ID de la carrera debe ser un entero')
        .custom(async (value) => {
            if (value) {
                const buscarCarrera = await ModeloCarrera.findOne({ where: { id: value } });
                if (!buscarCarrera) {
                    throw new Error('El id de la carrera no existe')
                }
            }
        }),
    controladorAsignatura.guardar
);

/**
 * @swagger
 * /asignaturas/editar:
 *   put:
 *     summary: Edita una asignatura existente
 *     tags: [Asignaturas]
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la asignatura a editar.
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
 *               docenteId:
 *                 type: integer
 *                 description: ID del docente.
 *               carreraId:
 *                 type: integer
 *                 description: ID del carrera.
 *     responses:
 *       200:
 *         description: Asignatura editada correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id_asignatura:
 *                   type: integer
 *                 nombre_asignatura:
 *                   type: string
 *                 docenteId:
 *                   type: integer
 *                 carreraId:
 *                   type: integer
 *       400:
 *         description: Error en la validación de datos.
 *       404:
 *         description: Asignatura no encontrada.
 *       500:
 *         description: Error en el servidor al editar la asignatura.
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
        .isString().withMessage('El nombre de la asignatura debe ser una cadena de texto'),
    body("docenteId")
        .isInt().withMessage('El ID del docente debe ser un entero')
        .custom(async (value) => {
            if (value) {
                const buscarDocente = await ModeloDocente.findOne({ where: { id: value } });
                if (!buscarDocente) {
                    throw new Error('El id del docente no existe')
                }
            }
        }),
    body("carreraId")
        .isInt().withMessage('El ID de la arrera debe ser un entero')
        .custom(async (value) => {
            if (value) {
                const buscarCarrera = await ModeloCarrera.findOne({ where: { id: value } });
                if (!buscarCarrera) {
                    throw new Error('El id de la carrera no existe')
                }
            }
        }),
    controladorAsignatura.editar
);

/**
 * @swagger
 * /asignaturas/eliminar:
 *   delete:
 *     summary: Elimina una asignatura
 *     tags: [Asignaturas]
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la asignatura a eliminar.
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

/**
 * @swagger
 * /asignaturas/busqueda_id:
 *   get:
 *     summary: Busca una asignatura por ID
 *     tags: [Asignaturas]
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la asignatura a buscar.
 *     responses:
 *       200:
 *         description: Asignatura encontrada.
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
 *                     id:
 *                       type: integer
 *                     nombre_asignatura:
 *                       type: string
 *                     docenteId:
 *                       type: integer
 *       404:
 *         description: Asignatura no encontrada.
 *       500:
 *         description: Error en el servidor al buscar la asignatura.
 */
rutas.get('/busqueda_id',
    query("id")
        .isInt().withMessage("El id de la asignatura debe ser un entero")
        .notEmpty().withMessage('El id no permite valores nulos'), // Se asegura que el ID no sea vacío
    controladorAsignatura.busqueda_id
);

/**
 * @swagger
 * /asignaturas/busqueda_nombre:
 *   get:
 *     summary: Busca asignaturas por nombre
 *     tags: [Asignaturas]
 *     parameters:
 *       - in: query
 *         name: nombre_asignatura
 *         required: true
 *         schema:
 *           type: string
 *         description: Nombre de la asignatura a buscar.
 *     responses:
 *       200:
 *         description: Asignaturas encontradas.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 tipo:
 *                   type: integer
 *                 datos:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       nombre_asignatura:
 *                         type: string
 *                       docenteId:
 *                         type: integer
 *       404:
 *         description: No se encontraron asignaturas con ese nombre.
 *       500:
 *         description: Error en el servidor al buscar las asignaturas.
 */
rutas.get('/busqueda_nombre',
    query("nombre_asignatura")
        .isString().withMessage("El nombre de la asignatura debe ser una cadena de texto")
        .notEmpty().withMessage('El nombre de la asignatura no puede estar vacío'),
    controladorAsignatura.busqueda_nombre
);

/**
 * @swagger
 * /asignaturas/busqueda_docente:
 *   get:
 *     summary: Busca asignaturas por nombre del docente
 *     tags: [Asignaturas]
 *     parameters:
 *       - in: query
 *         name: nombre_docente
 *         required: true
 *         schema:
 *           type: string
 *         description: Nombre del docente a buscar.
 *     responses:
 *       200:
 *         description: Asignaturas encontradas.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 tipo:
 *                   type: integer
 *                 datos:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       nombre_asignatura:
 *                         type: string
 *                       nombre_docente:
 *                         type: string
 *       404:
 *         description: No se encontraron asignaturas para ese docente.
 *       500:
 *         description: Error en el servidor al buscar las asignaturas.
 */
rutas.get('/busqueda_docente',
    query("nombre_docente")
        .isString().withMessage("El nombre del docente debe ser una cadena de texto")
        .notEmpty().withMessage('El nombre del docente no puede estar vacío'),
    controladorAsignatura.busqueda_docente
);

module.exports = rutas;