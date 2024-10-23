const { Router } = require('express');
const { body, query } = require('express-validator');
const controladorEstudiante = require('../controladores/controladorEstudiante');
const ModeloEstudiante = require('../modelos/estudiante'); // Asegúrate de que la ruta sea correcta
const rutas = Router();

/**
 * @swagger
 * tags:
 *   name: Estudiantes
 *   description: Gestion de Estudiantes
 */
/**
 * @swagger
 * /estudiantes:
 *   get:
 *     summary: Muestra un mensaje de bienvenida
 *     tags: [Estudiantes]
 *     responses:
 *       200:
 *         description: Mensaje de bienvenida de la API.
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
 *                         description: ID del Estudiante.
 *                       nombre_estudiante:
 *                         type: string
 *                         description: Nombre del Estudiante.
 *                       correo:
 *                         type: string
 *                         description: Correo del Estudiante.
 *                       id_carrera:
 *                         type: integer
 *                         description: ID de la Carrera. 
 *                 msj:
 *                   type: array
 *                   items:
 *                     type: string
 *       500:
 *         description: Error al cargar los datos del Estudiante.
 */

rutas.get('/listar', controladorEstudiante.listar);

/**
 * @swagger
 * /estudiantes/guardar:
 *   post:
 *     summary: Guarda un Nuevo Estudiante
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
 *                 description: ID del Estudiante.
 *               nombre_estudiante:
 *                 type: string
 *                 description: Nombre del Estudiante.
 *               correo:
 *                 type: string
 *                 description: Correo del Estudiante.
 *               id_carrera:
 *                 type: integer
 *                 description: ID de la Carrera. 
 *               
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
 *                       description: ID del Estudiante.
 *                 msj:
 *                   type: string
 *       400:
 *         description: Error en la validación de datos.
 *       500:
 *         description: Error en el servidor al guardar el Estudiante.
 */
rutas.post('/guardar',
    body("nombre_estudiante")
        .isLength({ min: 3, max: 100 }).withMessage('El nombre del estudiante debe tener entre 3 y 100 caracteres')
        .custom(async value => {
            if (!value) {
                throw new Error('El nombre no permite valores nulos');
            }
            const buscarEstudiante = await ModeloEstudiante.findOne({ where: { nombre_estudiante: value } });
            if (buscarEstudiante) {
                throw new Error('El nombre del estudiante ya existe');
            }
        }),
    body("correo")
        .isEmail().withMessage('El correo debe ser un email válido')
        .custom(async value => {
            const buscarEstudiante = await ModeloEstudiante.findOne({ where: { correo: value } });
            if (buscarEstudiante) {
                throw new Error('El correo ya está en uso');
            }
        }),
    body("id_carrera")
        .isInt().withMessage('El id de la carrera debe ser un entero')
        .custom(async value => {
            const carreraExistente = await ModeloEstudiante.sequelize.models.carrera.findOne({ where: { id_carrera: value } });
            if (!carreraExistente) {
                throw new Error('El id de la carrera no existe');
            }
        }),
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
 *         description: ID del estudiante a editar.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *              id_estudiante:
 *                type: integer
 *                description: ID del Estudiante.
 *              nombre_estudiante:
 *                type: string
 *                description: Nombre del Estudiante.
 *              correo:
 *                type: string
 *                description: Correo del Estudiante.
 *              id_carrera:
 *                type: integer
 *                description: ID de la Carrera. 
 *     responses:
 *       200:
 *         description: Estudiante editado correctamente.
 *       400:
 *         description: Error en la validación de datos.
 *       404:
 *         description: El ID del Estudiante no existe.
 *       500:
 *         description: Error en el servidor al editar el Estudiante.
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
        .optional()
        .isLength({ min: 3, max: 100 }).withMessage('El nombre del estudiante debe tener entre 3 y 100 caracteres'),
    body("correo")
        .optional()
        .isEmail().withMessage('El correo debe ser un email válido')
        .custom(async value => {
            const buscarEstudiante = await ModeloEstudiante.findOne({ where: { correo: value } });
            if (buscarEstudiante) {
                throw new Error('El correo ya está en uso');
            }
        }),
    body("id_carrera")
        .optional()
        .isInt().withMessage('El id de la carrera debe ser un entero')
        .custom(async value => {
            if (value) {
                const carreraExistente = await ModeloEstudiante.sequelize.models.carrera.findOne({ where: { id_carrera: value } });
                if (!carreraExistente) {
                    throw new Error('El id de la carrera no existe');
                }
            }
        }),
    controladorEstudiante.editar
);

/**
 * @swagger
 * /estudiantes/eliminar:
 *   delete:
 *     summary: Elimina un estudiante existente
 *     tags: [Estudiantes]
 *     parameters:
 *       - in: query
 *         name: id_estudiante
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del Estudiante a eliminar.
 *     responses:
 *       200:
 *         description: Estudiante eliminada correctamente.
 *       404:
 *         description: El ID del Estudiante no existe.
 *       500:
 *         description: Error en el servidor al eliminar el Estudiante.
 */
rutas.delete('/eliminar',
    query("id_estudiante")
        .isInt().withMessage("El id del estudiante debe ser un entero")
        .custom(async value => {
            const buscarEstudiante = await ModeloEstudiante.findOne({ where: { id_estudiante: value } });
            if (!buscarEstudiante) {
                throw new Error('El id del estudiante no existe');
            }
        }),
    controladorEstudiante.eliminar
);

module.exports = rutas;
