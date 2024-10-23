const { Router } = require('express');
const { body, query } = require('express-validator');
const controladorMatricula = require('../controladores/controladorMatricula');
const ModeloMatricula = require('../modelos/matricula'); // Asegúrate de que la ruta sea correcta
const ModeloEstudiante = require('../modelos/estudiante'); // Para validar el id_estudiante
const ModeloPeriodo = require('../modelos/periodo'); // Para validar el id_periodo
const rutas = Router();

/**
 * @swagger
 * tags:
 *   name: Matriculas
 *   description: Gestion de Matriculas
 */
/**
 * @swagger
 * /matriculas:
 *   get:
 *     summary: Muestra un mensaje de bienvenida
 *     tags: [Matriculas]
 *     responses:
 *       200:
 *         description: Mensaje de bienvenida de la API.
 */
rutas.get('/', controladorMatricula.inicio);

/**
 * @swagger
 * /matriculas/listar:
 *   get:
 *     summary: Lista todos las Matriculas
 *     tags: [Matriculas]
 *     responses:
 *       200:
 *         description: Lista de Matriculas.
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
 *                       id_matricula:
 *                         type: integer
 *                         description: ID de la Matricula.
 *                       id_estudiante:
 *                         type: integer
 *                         description: ID del Estudiante.
 *                       id_periodo:
 *                         type: integer
 *                         description: ID del Periodo. 
 *                 msj:
 *                   type: array
 *                   items:
 *                     type: string
 *       500:
 *         description: Error al cargar los datos de Matricula.
 */

rutas.get('/listar', controladorMatricula.listar);

/**
 * @swagger
 * /matriculas/guardar:
 *   post:
 *     summary: Guarda una nueva Matricula
 *     tags: [Matriculas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id_matricula:
 *                 type: integer
 *                 description: ID de la Matricula.
 *               id_estudiante:
 *                 type: integer
 *                 description: ID del Estudiante.
 *               id_periodo:
 *                 type: integer
 *                 description: ID del Periodo. 
 *               
 *     responses:
 *       200:
 *         description: Matricula guardada correctamente.
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
 *                     id_matricula:
 *                       type: integer
 *                       description: ID de la nueva Matricula.
 *                 msj:
 *                   type: string
 *       400:
 *         description: Error en la validación de datos.
 *       500:
 *         description: Error en el servidor al guardar la matricula.
 */
rutas.post('/guardar',
    body("id_estudiante")
        .isInt().withMessage('El id del estudiante debe ser un entero')
        .custom(async value => {
            const estudianteExistente = await ModeloEstudiante.findOne({ where: { id_estudiante: value } });
            if (!estudianteExistente) {
                throw new Error('El id del estudiante no existe');
            }
        }),
    body("id_periodo")
        .isInt().withMessage('El id del periodo debe ser un entero')
        .custom(async value => {
            const periodoExistente = await ModeloPeriodo.findOne({ where: { id_periodo: value } });
            if (!periodoExistente) {
                throw new Error('El id del periodo no existe');
            }
        }),
    controladorMatricula.guardar
);


/**
 * @swagger
 * /matriculas/editar:
 *   put:
 *     summary: Edita una Matricula existente
 *     tags: [Matriculas]
 *     parameters:
 *       - in: query
 *         name: id_matricula
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la Matricula a editar.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id_matricula:
 *                 type: integer
 *                 description: ID de la Matricula.
 *               id_estudiante:
 *                 type: integer
 *                 description: ID del Estudiante.
 *               id_periodo:
 *                 type: integer
 *                 description: ID del Periodo. 
 *     responses:
 *       200:
 *         description: Matricula editado correctamente.
 *       400:
 *         description: Error en la validación de datos.
 *       404:
 *         description: El ID de la Matricula no existe.
 *       500:
 *         description: Error en el servidor al editar la Matricula.
 */
rutas.put('/editar',
    query("id_matricula")
        .isInt().withMessage("El id de la matrícula debe ser un entero")
        .custom(async value => {
            const buscarMatricula = await ModeloMatricula.findOne({ where: { id_matricula: value } });
            if (!buscarMatricula) {
                throw new Error('El id de la matrícula no existe');
            }
        }),
    body("id_estudiante")
        .optional()
        .isInt().withMessage('El id del estudiante debe ser un entero')
        .custom(async value => {
            if (value) {
                const estudianteExistente = await ModeloEstudiante.findOne({ where: { id_estudiante: value } });
                if (!estudianteExistente) {
                    throw new Error('El id del estudiante no existe');
                }
            }
        }),
    body("id_periodo")
        .optional()
        .isInt().withMessage('El id del periodo debe ser un entero')
        .custom(async value => {
            if (value) {
                const periodoExistente = await ModeloPeriodo.findOne({ where: { id_periodo: value } });
                if (!periodoExistente) {
                    throw new Error('El id del periodo no existe');
                }
            }
        }),
    controladorMatricula.editar
);

/**
 * @swagger
 * /matriculas/eliminar:
 *   delete:
 *     summary: Elimina una Matricula existente
 *     tags: [Matriculas]
 *     parameters:
 *       - in: query
 *         name: id_matricula
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la Matricula a eliminar.
 *     responses:
 *       200:
 *         description: Matricula eliminada correctamente.
 *       404:
 *         description: El ID de la matricula no existe.
 *       500:
 *         description: Error en el servidor al eliminar la Matricula.
 */

rutas.delete('/eliminar',
    query("id_matricula")
        .isInt().withMessage("El id de la matrícula debe ser un entero")
        .custom(async value => {
            const buscarMatricula = await ModeloMatricula.findOne({ where: { id_matricula: value } });
            if (!buscarMatricula) {
                throw new Error('El id de la matrícula no existe');
            }
        }),
    controladorMatricula.eliminar
);

module.exports = rutas;
