const express = require('express');
const { body, query } = require('express-validator');
const controladorMatricula = require('../controladores/controladorMatricula');
const rutas = express.Router();
const ModeloEstudiante = require('../modelos/Estudiante');
const ModeloPeriodo = require('../modelos/periodo');
const ModeloAsignatura = require('../modelos/asignatura');
const ModeloMatricula = require('../modelos/matricula');

/**
 * @swagger
 * tags:
 *   name: Matrículas
 *   description: Gestión de matrículas
 */

/**
 * @swagger
 * /matriculas:
 *   get:
 *     summary: Inicializa el controlador de matrículas
 *     tags: [Matrículas]
 *     responses:
 *       200:
 *         description: Controlador inicializado
 */
rutas.get('/', controladorMatricula.inicio);

/**
 * @swagger
 * /matriculas/listar:
 *   get:
 *     summary: Lista todas las Matrículas
 *     tags: [Matrículas]
 *     responses:
 *       200:
 *         description: Lista de Matrículas.
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
 *                         description: ID de la matrícula.
 *                       primerNombre:
 *                         type: string
 *                         description: Primer nombre del estudiante.
 *                       primerApellido:
 *                         type: string
 *                         description: Primer apellido del estudiante.
 *                       email:
 *                         type: string
 *                         description: Email del estudiante.
 *                       id_usuario:
 *                         type: integer
 *                         description: ID del usuario asociado al estudiante.
 *                       nombre_periodo:
 *                         type: string
 *                         description: Nombre del periodo.
 *                       asignaturas:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: integer
 *                               description: ID de la asignatura.
 *                             nombre_asignatura:
 *                               type: string
 *                               description: Nombre de la asignatura.
 *                 msj:
 *                   type: array
 *                   items:
 *                     type: string
 *       500:
 *         description: Error al cargar los datos de Matrículas.
 */
rutas.get('/listar', controladorMatricula.listar);

/**
 * @swagger
 * /matriculas/guardar:
 *   post:
 *     summary: Guarda nuevas matrículas para un estudiante
 *     tags: [Matrículas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               estudianteId:
 *                 type: integer
 *                 description: ID del estudiante.
 *               periodoId:
 *                 type: integer
 *                 description: ID del periodo.
 *               asignaturas:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: Arreglo de IDs de las asignaturas a matricular.
 *     responses:
 *       200:
 *         description: Matrículas guardadas correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 tipo:
 *                   type: integer
 *                   description: "Indica el resultado de la operación (1: éxito, 0: error)."
 *                 datos:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       estudianteId:
 *                         type: integer
 *                         description: ID del estudiante.
 *                       periodoId:
 *                         type: integer
 *                         description: ID del periodo.
 *                       asignaturaId:
 *                         type: integer
 *                         description: ID de la asignatura.
 *                 msj:
 *                   type: string
 *                   description: Mensaje de la operación.
 *       400:
 *         description: Error en la validación de los datos enviados.
 *       404:
 *         description: Estudiante, periodo o asignatura no encontrados.
 *       500:
 *         description: Error en el servidor al guardar las matrículas.
 */
rutas.post(
    '/guardar',
    body('estudianteId').isInt().withMessage('El id del estudiante debe ser un entero')
        .custom(async (value) => {
            const estudiante = await ModeloEstudiante.findByPk(value);
            if (!estudiante) {
                throw new Error('El id del estudiante no existe');
            }
        }),
    body('periodoId').isInt().withMessage('El id del periodo debe ser un entero')
        .custom(async (value) => {
            const periodo = await ModeloPeriodo.findByPk(value);
            if (!periodo) {
                throw new Error('El id del periodo no existe');
            }
        }),
    body('asignaturas').isArray({ min: 1 }).withMessage('El campo asignaturas debe ser un arreglo no vacío')
        .custom(async (asignaturas) => {
            for (const id of asignaturas) {
                const asignatura = await ModeloAsignatura.findByPk(id);
                if (!asignatura) {
                    throw new Error(`La asignatura con id ${id} no existe`);
                }
            }
        }),
    controladorMatricula.guardar
);


module.exports = rutas;


/**
 * @swagger
 * /matriculas/editar:
 *   put:
 *     summary: Edita una Matrícula existente
 *     tags: [Matrículas]
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la Matrícula a editar.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               estudianteId:
 *                 type: integer
 *                 description: Nombre del estudiante.
 *               periodoId:
 *                 type: integer
 *                 description: Nombre del periodo.
 *               asignaturaId:
 *                 type: integer
 *                 description: Nombre de la asignatura.
 *     responses:
 *       200:
 *         description: Matrícula editada correctamente.
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
 *         description: Matrícula no encontrada.
 *       500:
 *         description: Error en el servidor al editar la matrícula.
 */
rutas.put('/editar',
    query("id").isInt().withMessage("El id de la matrícula debe ser un entero")
        .custom(async (value) => {
            if (value) {
                const buscarMatricula = await ModeloMatricula.findOne({ where: { id: value } });
                if (!buscarMatricula) {
                    throw new Error('El id de la matricula no existe')
                }
            }
        }),
    body('estudianteId').isInt().withMessage('El id debe de ser un numero entero')
        .custom(async (value) => {
            if (value) {
                const buscarEstudiante = await ModeloEstudiante.findOne({ where: { id: value } });
                if (!buscarEstudiante) {
                    throw new Error('El id del estudiante no existe')
                }
            }
        }),
    body('periodoId').isInt().withMessage('El id debe de ser un numero entero')
        .custom(async (value) => {
            if (value) {
                const buscarPeriodo = await ModeloPeriodo.findOne({ where: { id: value } });
                if (!buscarPeriodo) {
                    throw new Error('El id del periodo no existe')
                }
            }
        }),
    body('asignaturaId').isInt().withMessage('El id debe de ser un numero entero')
        .custom(async (value) => {
            if (value) {
                const buscarAsignatura = await ModeloAsignatura.findOne({ where: { id: value } });
                if (!buscarAsignatura) {
                    throw new Error('El id de la asignatura no existe')
                }
            }
        }),
    controladorMatricula.editar
);

/**
 * @swagger
 * /matriculas/eliminar:
 *   delete:
 *     summary: Elimina una Matrícula existente
 *     tags: [Matrículas]
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la Matrícula a eliminar.
 *     responses:
 *       200:
 *         description: Matrícula eliminada correctamente.
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
 *         description: Matrícula no encontrada.
 *       500:
 *         description: Error en el servidor al eliminar la matrícula.
 */
rutas.delete('/eliminar',
    query("id").isInt().withMessage("El id de la matrícula debe ser un entero"),
    controladorMatricula.eliminar
);

/**
 * @swagger
 * /matriculas/buscar:
 *   get:
 *     summary: Busca una matrícula por ID
 *     tags: [Matrículas]
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la matrícula a buscar.
 *     responses:
 *       200:
 *         description: Matrícula encontrada.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: ID de la matrícula.
 *                 nombre_estudiante:
 *                   type: string
 *                   description: Nombre del estudiante.
 *                 nombre_periodo:
 *                   type: string
 *                   description: Nombre del periodo.
 *                 nombre_asignatura:
 *                   type: string
 *                   description: Nombre de la asignatura.
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                   description: Fecha de creación.
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *                   description: Fecha de actualización.
 *       404:
 *         description: Matrícula no encontrada.
 *       500:
 *         description: Error al buscar la matrícula.
 */
rutas.get('/buscar',
    query("id").isInt().withMessage("El id de la matrícula debe ser un entero"),
    controladorMatricula.buscarPorId
);


module.exports = rutas;