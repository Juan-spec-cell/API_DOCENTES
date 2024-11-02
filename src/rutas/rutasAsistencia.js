const { Router } = require('express');
const { body, query } = require('express-validator');
const controladorAsistencia = require('../controladores/controladorAsistencia');
const ModeloAsistencia = require('../modelos/asistencia'); // Asegúrate de importar ModeloAsistencia
const rutas = Router();

/**
 * @swagger
 * tags:
 *   name: Asistencias
 *   description: Gestion de Asistencias
 */

/**
 * @swagger
 * /asistencias:
 *   get:
 *     summary: Muestra un mensaje de bienvenida
 *     tags: [Asistencias]
 *     responses:
 *       200:
 *         description: Mensaje de bienvenida de la API.
 */
rutas.get('/', controladorAsistencia.inicio);

/**
 * @swagger
 * /asistencias/listar:
 *   get:
 *     summary: Lista todas las asistencias
 *     tags: [Asistencias]
 *     responses:
 *       200:
 *         description: Lista de asistencias.
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
 *                       nombre_estudiante:
 *                         type: string
 *                         description: Nombre del estudiante.
 *                       nombre_asignatura:
 *                         type: string
 *                         description: Nombre de la asignatura.
 *                       fecha:
 *                         type: string
 *                         format: date
 *                         description: Fecha de la asistencia.
 *                       estado:
 *                         type: string
 *                         enum: [Presente, Ausente, Tardanza]
 *                         description: Estado de la asistencia.
 *                 msj:
 *                   type: array
 *                   items:
 *                     type: string
 *       500:
 *         description: Error al cargar los datos de asistencias.
 */
rutas.get('/listar', controladorAsistencia.listar);

/**
 * @swagger
 * /asistencias/guardar:
 *   post:
 *     summary: Guarda una nueva asistencia
 *     tags: [Asistencias]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre_estudiante:
 *                 type: string
 *                 description: Nombre del estudiante.
 *               apellido_estudiante:
 *                 type: string
 *                 description: Apellido del estudiante.
 *               nombre_asignatura:
 *                 type: string
 *                 description: Nombre de la asignatura.
 *               fecha:
 *                 type: string
 *                 format: date
 *                 description: Fecha de la asistencia.
 *               estado:
 *                 type: string
 *                 enum: [Presente, Ausente, Tardanza]
 *                 description: Estado de la asistencia.
 *     responses:
 *       200:
 *         description: Asistencia guardada correctamente.
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
 *                     id_asistencia:
 *                       type: integer
 *                       description: ID de la asistencia.
 *                     nombre_estudiante:
 *                       type: string
 *                       description: Nombre del estudiante.
 *                     nombre_asignatura:
 *                       type: string
 *                       description: Nombre de la asignatura.
 *                     fecha:
 *                       type: string
 *                       format: date
 *                       description: Fecha de la asistencia.
 *                     estado:
 *                       type: string
 *                       enum: [Presente, Ausente, Tardanza]
 *                       description: Estado de la asistencia.
 *                 msj:
 *                   type: string
 *       400:
 *         description: Error en la validación de datos.
 *       500:
 *         description: Error en el servidor al guardar la asistencia.
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
    body("fecha")
        .isDate().withMessage('La fecha debe ser una fecha válida'),
    body("estado")
        .isIn(['Presente', 'Ausente', 'Tardanza']).withMessage('El estado debe ser Presente, Ausente o Tardanza'),
    controladorAsistencia.guardar
);

/**
 * @swagger
 * /asistencias/editar:
 *   put:
 *     summary: Edita una Asistencia existente
 *     tags: [Asistencias]
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la Asistencia a editar.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre_estudiante:
 *                 type: string
 *                 description: Nombre del estudiante.
 *               apellido_estudiante:
 *                 type: string
 *                 description: Apellido del estudiante.
 *               nombre_asignatura:
 *                 type: string
 *                 description: Nombre de la asignatura.
 *               fecha:
 *                 type: string
 *                 format: date
 *                 description: Fecha de la asistencia.
 *               estado:
 *                 type: string
 *                 description: Estado de la asistencia.
 *     responses:
 *       200:
 *         description: Asistencia editada correctamente.
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
 *                       description: ID de la Asistencia.
 *                     nombre_estudiante:
 *                       type: string
 *                       description: Nombre del estudiante.
 *                     apellido_estudiante:
 *                       type: string
 *                       description: Apellido del estudiante.
 *                     nombre_asignatura:
 *                       type: string
 *                       description: Nombre de la asignatura.
 *                     fecha:
 *                       type: string
 *                       format: date
 *                       description: Fecha de la asistencia.
 *                     estado:
 *                       type: string
 *                       description: Estado de la asistencia.
 *                 msj:
 *                   type: string
 *       400:
 *         description: Error en la validación de datos.
 *       500:
 *         description: Error en el servidor al editar la asistencia.
 */
rutas.put('/editar',
    query("id")
        .isInt().withMessage("El id de la asistencia debe ser un entero")
        .custom(async value => {
            const buscarAsistencia = await ModeloAsistencia.findOne({ where: { id: value } });
            if (!buscarAsistencia) {
                throw new Error('El id de la asistencia no existe');
            }
        }),
    body("nombre_estudiante")
        .isString().withMessage('El nombre del estudiante debe ser una cadena de texto')
        .notEmpty().withMessage('El nombre del estudiante no puede estar vacío'),
    body("apellido_estudiante")
        .isString().withMessage('El apellido del estudiante debe ser una cadena de texto')
        .notEmpty().withMessage('El apellido del estudiante no puede estar vacío'),
    body("nombre_asignatura")
        .isString().withMessage('El nombre de la asignatura debe ser una cadena de texto')
        .notEmpty().withMessage('El nombre de la asignatura no puede estar vacío'),
    body("fecha")
        .isDate().withMessage('La fecha debe ser una fecha válida'),
    body("estado")
        .isString().withMessage('El estado debe ser una cadena de texto')
        .notEmpty().withMessage('El estado no puede estar vacío'),
    controladorAsistencia.editar
);

/**
 * @swagger
 * /asistencias/eliminar:
 *   delete:
 *     summary: Elimina una asistencia existente
 *     tags: [Asistencias]
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la asistencia a eliminar.
 *     responses:
 *       200:
 *         description: Asistencia eliminada correctamente.
 *       404:
 *         description: El ID de la asistencia no existe.
 *       500:
 *         description: Error en el servidor al eliminar la asistencia.
 */
rutas.delete('/eliminar',
    query("id")
        .isInt().withMessage("El id de la asistencia debe ser un entero")
        .custom(async value => {
            const buscarAsistencia = await ModeloAsistencia.findOne({ where: { id: value } });
            if (!buscarAsistencia) {
                throw new Error('El id de la asistencia no existe');
            }
        }),
    controladorAsistencia.eliminar
);

module.exports = rutas;