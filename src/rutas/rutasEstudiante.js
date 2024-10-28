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
 *     summary: Lista todos los estudiantes
 *     tags: [Estudiantes]
 *     responses:
 *       200:
 *         description: Lista de estudiantes
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
 *               id_estudiante:
 *                 type: integer
 *                 description: ID del Estudiante
 *               nombre_estudiante:
 *                 type: string
 *                 description: Nombre del Estudiante
 *               email:
 *                 type: string
 *                 description: Correo del Estudiante
 *               id_carrera:
 *                 type: integer
 *                 description: ID de la Carrera
 *     responses:
 *       200:
 *         description: Estudiante guardado
 *       400:
 *         description: Error en los datos proporcionados
 */
rutas.post('/guardar',
    body("id_estudiante").isInt().withMessage('El id del estudiante debe ser un entero'),
    body("nombre_estudiante")
        .isString().withMessage('El nombre debe ser una cadena de texto')
        .notEmpty().withMessage('El nombre no permite valores nulos'),
    body("email")
        .isEmail().withMessage('Debe ser un correo electrónico válido')
        .custom(async value => {
            const buscarEstudiante = await ModeloEstudiante.findOne({ where: { email: value } });
            if (buscarEstudiante) {
                throw new Error('El correo ya está registrado');
            }
        }),
    body("id_carrera").isInt().withMessage('El id de la carrera debe ser un entero'),
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
 *           description: ID del estudiante a editar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre_estudiante:
 *                 type: string
 *                 description: Nombre del Estudiante
 *               email:
 *                 type: string
 *                 description: Correo del Estudiante
 *               id_carrera:
 *                 type: integer
 *                 description: ID de la Carrera
 *     responses:
 *       200:
 *         description: Estudiante editado
 *       400:
 *         description: Error en los datos proporcionados
 */
rutas.put('/editar',
    query("id_estudiante").isInt().withMessage('El id del estudiante debe ser un entero'),
    body("nombre_estudiante")
        .optional()
        .isString().withMessage('El nombre debe ser una cadena de texto')
        .notEmpty().withMessage('El nombre no permite valores nulos'),
    body("email")
        .optional()
        .isEmail().withMessage('Debe ser un correo electrónico válido')
        .custom(async value => {
            const buscarEstudiante = await ModeloEstudiante.findOne({ where: { email: value } });
            if (buscarEstudiante) {
                throw new Error('El correo ya está registrado');
            }
        }),
    body("id_carrera").optional().isInt().withMessage('El id de la carrera debe ser un entero'),
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