const { Router } = require('express');
const { body, query } = require('express-validator');
const controladorAsignatura = require('../controladores/controladorAsignatura');
const ModeloAsignatura = require('../modelos/asignatura');
const ModeloDocente = require('../modelos/docente'); // Asegúrate de la ruta correcta
const ModeloCarrera = require('../modelos/carrera'); // Asegúrate de la ruta correcta
const rutas = Router();

// Obtener la página de inicio de asignaturas
rutas.get('/', controladorAsignatura.inicio);

// Listar todas las asignaturas
rutas.get('/listar', controladorAsignatura.listar);

// Guardar una nueva asignatura
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
    body("nombre_docente")
        .notEmpty().withMessage('El nombre del docente no puede estar vacío')
        .custom(async value => {
            const docenteExistente = await ModeloDocente.findOne({ where: { nombre: value } }); // Asumiendo que el modelo de docente tiene una propiedad 'nombre'
            if (!docenteExistente) {
                throw new Error('El nombre del docente no existe');
            }
        }),
    body("nombre_carrera")
        .notEmpty().withMessage('El nombre de la carrera no puede estar vacío')
        .custom(async value => {
            const carreraExistente = await ModeloCarrera.findOne({ where: { nombre: value } }); // Asumiendo que el modelo de carrera tiene una propiedad 'nombre'
            if (!carreraExistente) {
                throw new Error('El nombre de la carrera no existe');
            }
        }),
    controladorAsignatura.guardar
);

// Editar una asignatura
rutas.put('/editar',
    query("id_asignatura")
        .isInt().withMessage("El id de la asignatura debe ser un entero")
        .custom(async value => {
            const buscarAsignatura = await ModeloAsignatura.findOne({ where: { id_asignatura: value } });
            if (!buscarAsignatura) {
                throw new Error('El id de la asignatura no existe');
            }
        }),
    body("nombre_asignatura")
        .optional()
        .isLength({ min: 3, max: 100 }).withMessage('El nombre de la asignatura debe tener entre 3 y 100 caracteres')
        .custom(async (value, { req }) => {
            if (value) {
                const buscarAsignatura = await ModeloAsignatura.findOne({ where: { nombre_asignatura: value } });
                if (buscarAsignatura) {
                    throw new Error('El nombre de la asignatura ya existe');
                }
            }
        }),
    body("nombre_docente")
        .optional()
        .notEmpty().withMessage('El nombre del docente no puede estar vacío')
        .custom(async value => {
            const docenteExistente = await ModeloDocente.findOne({ where: { nombre: value } });
            if (!docenteExistente) {
                throw new Error('El nombre del docente no existe');
            }
        }),
    body("nombre_carrera")
        .optional()
        .notEmpty().withMessage('El nombre de la carrera no puede estar vacío')
        .custom(async value => {
            const carreraExistente = await ModeloCarrera.findOne({ where: { nombre: value } });
            if (!carreraExistente) {
                throw new Error('El nombre de la carrera no existe');
            }
        }),
    controladorAsignatura.editar
);

// Eliminar una asignatura
rutas.delete('/eliminar',
    query("id_asignatura")
        .isInt().withMessage("El id de la asignatura debe ser un entero")
        .custom(async value => {
            const buscarAsignatura = await ModeloAsignatura.findOne({ where: { id_asignatura: value } });
            if (!buscarAsignatura) {
                throw new Error('El id de la asignatura no existe');
            }
        }),
    controladorAsignatura.eliminar
);

module.exports = rutas;



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

/**
 * @swagger
 * /asignaturas/listar:
 *   get:
 *     summary: Listar todas las asignaturas
 *     tags: [Asignaturas]
 *     responses:
 *       200:
 *         description: Lista de asignaturas
 */

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
 *               nombre_docente:
 *                 type: string
 *                 description: Nombre del docente que imparte la asignatura.
 *                 example: Juan Pérez
 *               nombre_carrera:
 *                 type: string
 *                 description: Nombre de la carrera a la que pertenece la asignatura.
 *                 example: Ingeniería en Sistemas
 *     responses:
 *       201:
 *         description: Asignatura creada exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 nombre_asignatura:
 *                   type: string
 *                   description: Nombre de la asignatura creada.
 *                   example: Matemáticas
 *                 nombre_docente:
 *                   type: string
 *                   description: Nombre del docente asignado.
 *                   example: Juan Pérez
 *                 nombre_carrera:
 *                   type: string
 *                   description: Nombre de la carrera asignada.
 *                   example: Ingeniería en Sistemas
 *       400:
 *         description: Error de validación, el nombre del docente o la carrera no existe.
 *       500:
 *         description: Error interno del servidor.
 */


/**
 * @swagger
 * /asignaturas/editar:
 *   put:
 *     summary: Editar una asignatura existente
 *     tags: [Asignaturas]
 *     parameters:
 *       - in: query
 *         name: id_asignatura
 *         required: true
 *         description: ID de la asignatura a editar
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre_asignatura:
 *                 type: string
 *                 example: "Matemáticas Avanzadas"
 *               id_docente:
 *                 type: integer
 *               id_carrera:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Asignatura editada exitosamente
 *       400:
 *         description: Error en los datos de entrada
 *       404:
 *         description: Asignatura no encontrada
 */

/**
 * @swagger
 * /asignaturas/eliminar:
 *   delete:
 *     summary: Eliminar una asignatura
 *     tags: [Asignaturas]
 *     parameters:
 *       - in: query
 *         name: id_asignatura
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
