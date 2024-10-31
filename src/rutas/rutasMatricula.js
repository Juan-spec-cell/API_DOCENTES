const { Router } = require('express');
const { body, query } = require('express-validator');
const controladorMatricula = require('../controladores/controladorMatricula');
const ModeloMatricula = require('../modelos/matricula'); 
const ModeloEstudiante = require('../modelos/estudiante'); 
const ModeloPeriodo = require('../modelos/periodo'); 
const rutas = Router();

/**
 * @swagger
 * tags:
 *   name: Matriculas
 *   description: Gestión de matriculas
 */

/**
 * @swagger
 * /matriculas:
 *   get:
 *     summary: Inicializa el controlador de Matriculas
 *     tags: [Matriculas]
 *     responses:
 *       200:
 *         description: Controlador inicializado
 */
rutas.get('/', controladorMatricula.inicio);
/**
 * @swagger
 * /matriculas/listar:
 *   get:
 *     summary: Lista todas las Matriculas
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
 *                       nombre_estudiante:
 *                         type: string
 *                         description: Nombre del estudiante.
 *                       apellido_estudiante:
 *                         type: string
 *                         description: Apellido del estudiante.
 *                       nombre_periodo:
 *                         type: string
 *                         description: Nombre del periodo.
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
 *               nombre_estudiante:
 *                 type: string
 *                 description: Nombre del estudiante.
 *               apellido_estudiante:
 *                 type: string
 *                 description: Apellido del estudiante.
 *               nombre_periodo:
 *                 type: string
 *                 description: Nombre del periodo.
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
 *                     nombre_estudiante:
 *                       type: string
 *                       description: Nombre del estudiante.
 *                     apellido_estudiante:
 *                       type: string
 *                       description: Apellido del estudiante.
 *                     nombre_periodo:
 *                       type: string
 *                       description: Nombre del periodo.
 *                 msj:
 *                   type: string
 *       400:
 *         description: Error en la validación de datos.
 *       500:
 *         description: Error en el servidor al guardar la matricula.
 */
rutas.post('/guardar',
    body("nombre_estudiante")
        .isString().withMessage('El nombre del estudiante debe ser una cadena de texto')
        .notEmpty().withMessage('El nombre del estudiante no puede estar vacío'),
    body("apellido_estudiante")
        .isString().withMessage('El apellido del estudiante debe ser una cadena de texto')
        .notEmpty().withMessage('El apellido del estudiante no puede estar vacío'),
    body("nombre_periodo")
        .isString().withMessage('El nombre del periodo debe ser una cadena de texto')
        .notEmpty().withMessage('El nombre del periodo no puede estar vacío'),
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
 *               nombre_estudiante:
 *                 type: string
 *                 description: Nombre del estudiante.
 *               apellido_estudiante:
 *                 type: string
 *                 description: Apellido del estudiante.
 *               nombre_periodo:
 *                 type: string
 *                 description: Nombre del periodo.
 *     responses:
 *       200:
 *         description: Matricula editada correctamente.
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
 *                       description: ID de la Matricula.
 *                     nombre_estudiante:
 *                       type: string
 *                       description: Nombre del estudiante.
 *                     apellido_estudiante:
 *                       type: string
 *                       description: Apellido del estudiante.
 *                     nombre_periodo:
 *                       type: string
 *                       description: Nombre del periodo.
 *                 msj:
 *                   type: string
 *       400:
 *         description: Error en la validación de datos.
 *       500:
 *         description: Error en el servidor al editar la matricula.
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
    body("nombre_estudiante")
        .isString().withMessage('El nombre del estudiante debe ser una cadena de texto')
        .notEmpty().withMessage('El nombre del estudiante no puede estar vacío'),
    body("apellido_estudiante")
        .isString().withMessage('El apellido del estudiante debe ser una cadena de texto')
        .notEmpty().withMessage('El apellido del estudiante no puede estar vacío'),
    body("nombre_periodo")
        .isString().withMessage('El nombre del periodo debe ser una cadena de texto')
        .notEmpty().withMessage('El nombre del periodo no puede estar vacío'),
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