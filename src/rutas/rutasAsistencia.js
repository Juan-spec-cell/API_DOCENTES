const { Router } = require('express');
const { body, query } = require('express-validator');
const controladorAsistencia = require('../controladores/controladorAsistencia');
const ModeloAsistencia = require('../modelos/asistencia'); 
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
 *                       id_asistencia:
 *                         type: integer
 *                         description: ID de la asistencia.
 *                       id_estudiante:
 *                         type: integer
 *                         description: ID del estudiante.
 *                       id_asignatura:
 *                         type: integer
 *                         description: ID de la asignatura.
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
 *               id_estudiante:
 *                 type: integer
 *                 description: ID del estudiante.
 *               id_asignatura:
 *                 type: integer
 *                 description: ID de la asignatura.
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
 *                       description: ID de la nueva asistencia.
 *                 msj:
 *                   type: string
 *       400:
 *         description: Error en la validación de datos.
 *       500:
 *         description: Error en el servidor al guardar la asistencia.
 */
rutas.post('/guardar',
    body("id_estudiante")
        .isInt().withMessage('El id del estudiante debe ser un entero')
        .custom(async value => {
            const estudianteExistente = await ModeloAsistencia.sequelize.models.estudiante.findOne({ where: { id_estudiante: value } });
            if (!estudianteExistente) {
                throw new Error('El id del estudiante no existe');
            }
        }),
    body("id_asignatura")
        .isInt().withMessage('El id de la asignatura debe ser un entero')
        .custom(async value => {
            const asignaturaExistente = await ModeloAsistencia.sequelize.models.asignatura.findOne({ where: { id_asignatura: value } });
            if (!asignaturaExistente) {
                throw new Error('El id de la asignatura no existe');
            }
        }),
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
 *     summary: Edita una asistencia existente
 *     tags: [Asistencias]
 *     parameters:
 *       - in: query
 *         name: id_asistencia
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la asistencia a editar.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id_estudiante:
 *                 type: integer
 *                 description: ID del estudiante.
 *               id_asignatura:
 *                 type: integer
 *                 description: ID de la asignatura.
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
 *         description: Asistencia editada correctamente.
 *       400:
 *         description: Error en la validación de datos.
 *       404:
 *         description: El ID de la asistencia no existe.
 *       500:
 *         description: Error en el servidor al editar la asistencia.
 */
rutas.put('/editar',
    query("id_asistencia")
        .isInt().withMessage("El id de la asistencia debe ser un entero")
        .custom(async value => {
            const buscarAsistencia = await ModeloAsistencia.findOne({ where: { id_asistencia: value } });
            if (!buscarAsistencia) {
                throw new Error('El id de la asistencia no existe');
            }
        }),
    body("id_estudiante")
        .optional()
        .isInt().withMessage('El id del estudiante debe ser un entero')
        .custom(async value => {
            if (value) {
                const estudianteExistente = await ModeloAsistencia.sequelize.models.estudiante.findOne({ where: { id_estudiante: value } });
                if (!estudianteExistente) {
                    throw new Error('El id del estudiante no existe');
                }
            }
        }),
    body("id_asignatura")
        .optional()
        .isInt().withMessage('El id de la asignatura debe ser un entero')
        .custom(async value => {
            if (value) {
                const asignaturaExistente = await ModeloAsistencia.sequelize.models.asignatura.findOne({ where: { id_asignatura: value } });
                if (!asignaturaExistente) {
                    throw new Error('El id de la asignatura no existe');
                }
            }
        }),
    body("fecha")
        .optional()
        .isDate().withMessage('La fecha debe ser una fecha válida'),
    body("estado")
        .optional()
        .isIn(['Presente', 'Ausente', 'Tardanza']).withMessage('El estado debe ser Presente, Ausente o Tardanza'),
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
 *         name: id_asistencia
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
    query("id_asistencia")
        .isInt().withMessage("El id de la asistencia debe ser un entero")
        .custom(async value => {
            const buscarAsistencia = await ModeloAsistencia.findOne({ where: { id_asistencia: value } });
            if (!buscarAsistencia) {
                throw new Error('El id de la asistencia no existe');
            }
        }),
    controladorAsistencia.eliminar
);

module.exports = rutas;
