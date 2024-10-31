const express = require('express');
const { body, query } = require('express-validator');
const controladorEstudiante = require('../controladores/controladorEstudiante');
const ModeloEstudiante = require('../modelos/estudiante');
const rutas = express.Router();

/**
 * @swagger
 * tags:
 *   name: Estudiantes
 *   description: Gestión de estudiantes
 */

/**
 * @swagger
 * /estudiantes:
 *   get:
 *     summary: Inicializa el controlador de estudiantes
 *     tags: [Estudiantes]
 *     responses:
 *       200:
 *         description: Controlador inicializado
 */
rutas.get('/', controladorEstudiante.inicio);

/**
 * @swagger
 * /estudiantes/listar:
 *   get:
 *     summary: Lista todos los Estudiantes
 *     tags: [Estudiantes]
 *     responses:
 *       200:
 *         description: Lista de Estudiantes.
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
 *                       id_estudiante:
 *                         type: integer
 *                         description: ID del estudiante.
 *                       nombre_estudiante:
 *                         type: string
 *                         description: Nombre del estudiante.
 *                       apellido_estudiante:
 *                         type: string
 *                         description: Apellido del estudiante.
 *                       email:
 *                         type: string
 *                         description: Email del estudiante.
 *                       nombre_carrera:
 *                         type: string
 *                         description: Nombre de la carrera.
 *                 msj:
 *                   type: array
 *                   items:
 *                     type: string
 *       500:
 *         description: Error al cargar los datos de Estudiantes.
 */
rutas.get('/listar', controladorEstudiante.listar);

/**
 * @swagger
 * /estudiantes/guardar:
 *   post:
 *     summary: Guarda un nuevo Estudiante
 *     tags: [Estudiantes]
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
 *               email:
 *                 type: string
 *                 description: Email del estudiante.
 *               nombre_carrera:
 *                 type: string
 *                 description: Nombre de la carrera.
 *     responses:
 *       200:
 *         description: Estudiante guardado correctamente.
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
 *                     id_estudiante:
 *                       type: integer
 *                       description: ID del estudiante.
 *                     nombre_estudiante:
 *                       type: string
 *                       description: Nombre del estudiante.
 *                     apellido_estudiante:
 *                       type: string
 *                       description: Apellido del estudiante.
 *                     email:
 *                       type: string
 *                       description: Email del estudiante.
 *                     nombre_carrera:
 *                       type: string
 *                       description: Nombre de la carrera.
 *                 msj:
 *                   type: string
 *       400:
 *         description: Error en la validación de datos.
 *       500:
 *         description: Error en el servidor al guardar el estudiante.
 */
rutas.post('/guardar',
    body("nombre_estudiante")
        .isString().withMessage('El nombre del estudiante debe ser una cadena de texto')
        .notEmpty().withMessage('El nombre del estudiante no puede estar vacío'),
    body("apellido_estudiante")
        .isString().withMessage('El apellido del estudiante debe ser una cadena de texto')
        .notEmpty().withMessage('El apellido del estudiante no puede estar vacío'),
    body("email")
        .isEmail().withMessage('El email debe ser una dirección de correo válida')
        .notEmpty().withMessage('El email no puede estar vacío'),
    body("nombre_carrera")
        .isString().withMessage('El nombre de la carrera debe ser una cadena de texto')
        .notEmpty().withMessage('El nombre de la carrera no puede estar vacío'),
    controladorEstudiante.guardar
);

/**
 * @swagger
 * /estudiantes/editar:
 *   put:
 *     summary: Edita un Estudiante existente
 *     tags: [Estudiantes]
 *     parameters:
 *       - in: query
 *         name: id_estudiante
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del Estudiante a editar.
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
 *               email:
 *                 type: string
 *                 description: Email del estudiante.
 *               nombre_carrera:
 *                 type: string
 *                 description: Nombre de la carrera.
 *     responses:
 *       200:
 *         description: Estudiante editado correctamente.
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
 *                     id_estudiante:
 *                       type: integer
 *                       description: ID del estudiante.
 *                     nombre_estudiante:
 *                       type: string
 *                       description: Nombre del estudiante.
 *                     apellido_estudiante:
 *                       type: string
 *                       description: Apellido del estudiante.
 *                     email:
 *                       type: string
 *                       description: Email del estudiante.
 *                     nombre_carrera:
 *                       type: string
 *                       description: Nombre de la carrera.
 *                 msj:
 *                   type: string
 *       400:
 *         description: Error en la validación de datos.
 *       500:
 *         description: Error en el servidor al editar el estudiante.
 */
rutas.put('/editar',
    query("id_estudiante")
        .isInt().withMessage("El id del estudiante debe ser un entero")
        .custom(async value => {
            const buscarEstudiante = await ModeloEstudiante.findOne({ where: { id_estudiante: value } });
            if (!buscarEstudiante) {
                throw new Error('El id del estudiante no existe');
            }
        }),
    body("nombre_estudiante")
        .isString().withMessage('El nombre del estudiante debe ser una cadena de texto')
        .notEmpty().withMessage('El nombre del estudiante no puede estar vacío'),
    body("apellido_estudiante")
        .isString().withMessage('El apellido del estudiante debe ser una cadena de texto')
        .notEmpty().withMessage('El apellido del estudiante no puede estar vacío'),
    body("email")
        .isEmail().withMessage('El email debe ser una dirección de correo válida')
        .notEmpty().withMessage('El email no puede estar vacío'),
    body("nombre_carrera")
        .isString().withMessage('El nombre de la carrera debe ser una cadena de texto')
        .notEmpty().withMessage('El nombre de la carrera no puede estar vacío'),
    controladorEstudiante.editar
);

/**
 * @swagger
 * /estudiantes/eliminar:
 *   delete:
 *     summary: Elimina un Estudiante
 *     tags: [Estudiantes]
 *     parameters:
 *       - in: query
 *         name: id_estudiante
 *         required: true
 *         schema:
 *           type: integer
 *           description: ID del estudiante a eliminar
 *     responses:
 *       200:
 *         description: Estudiante eliminado
 *       400:
 *         description: Error en los datos proporcionados
 */
rutas.delete('/eliminar',
    query("id_estudiante").isInt().withMessage('El id del estudiante debe ser un entero'),
    controladorEstudiante.eliminar
);

module.exports = rutas;