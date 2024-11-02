const { Router } = require('express');
const { body, query } = require('express-validator');
const controladorCalificacion = require('../controladores/controladorCalificacion');
const ModeloCalificacion = require('../modelos/calificacion');
const rutas = Router();

/**
 * @swagger
 * tags:
 *   name: Calificaciones
 *   description: Gestión de calificaciones
 */

/**
 * @swagger
 * /calificaciones:
 *   get:
 *     summary: Muestra un mensaje de bienvenida
 *     tags: [Calificaciones]
 *     responses:
 *       200:
 *         description: Mensaje de bienvenida de la API.
 */
rutas.get('/', controladorCalificacion.inicio);

/**
 * @swagger
 * /calificaciones/listar:
 *   get:
 *     summary: Lista todas las calificaciones
 *     tags: [Calificaciones]
 *     responses:
 *       200:
 *         description: Lista de calificaciones.
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
 *                         description: ID de la calificación.
 *                       nombre_completo:
 *                         type: string
 *                         description: Nombre completo del estudiante.
 *                       nombre_asignatura:
 *                         type: string
 *                         description: Nombre de la asignatura.
 *                       nota:
 *                         type: number
 *                         description: Nota del estudiante.
 *                 msj:
 *                   type: array
 *                   items:
 *                     type: string
 *       500:
 *         description: Error al cargar los datos de calificaciones.
 */
rutas.get('/listar', controladorCalificacion.listar);

/**
 * @swagger
 * /calificaciones/guardar:
 *   post:
 *     summary: Guarda una nueva calificación
 *     tags: [Calificaciones]
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
 *               nota:
 *                 type: number
 *                 description: Nota del estudiante.
 *     responses:
 *       200:
 *         description: Calificación guardada correctamente.
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
 *                     id_calificacion:
 *                       type: integer
 *                       description: ID de la nueva calificación.
 *                     nombre_estudiante:
 *                       type: string
 *                       description: Nombre del estudiante.
 *                     nombre_asignatura:
 *                       type: string
 *                       description: Nombre de la asignatura.
 *                     nota:
 *                       type: number
 *                       description: Nota del estudiante.
 *                 msj:
 *                   type: string
 *       400:
 *         description: Error en la validación de datos.
 *       500:
 *         description: Error en el servidor al guardar la calificación.
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
    body("nota")
        .custom(value => {
            if (isNaN(value)) {
                throw new Error('La nota debe ser un número');
            }
            return true;
        })
        .notEmpty().withMessage('Ingrese una nota para el estudiante')
        .toFloat(), // Convertir a float
    controladorCalificacion.guardar
);

/**
 * @swagger
 * /calificaciones/editar:
 *   put:
 *     summary: Edita una calificación existente
 *     tags: [Calificaciones]
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la calificación a editar.
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
 *               nota:
 *                 type: number
 *                 description: Nota del estudiante.
 *     responses:
 *       200:
 *         description: Calificación editada correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id_calificacion:
 *                   type: integer
 *                 nombre_estudiante:
 *                   type: string
 *                 nombre_asignatura:
 *                   type: string
 *                 nota:
 *                   type: number
 *       400:
 *         description: Error en la validación de datos.
 *       404:
 *         description: Calificación, estudiante o asignatura no encontrados.
 *       500:
 *         description: Error en el servidor.
 */
rutas.put('/editar',
    query("id")
        .isInt().withMessage("El id de la calificación debe ser un entero")
        .custom(async value => {
            const buscarCalificacion = await ModeloCalificacion.findOne({ where: { id: value } });
            if (!buscarCalificacion) {
                throw new Error('El id de la calificación no existe');
            }
        }),
    body("nombre_estudiante")
        .notEmpty().withMessage('El nombre del estudiante es obligatorio')
        .isString().withMessage('El nombre del estudiante debe ser un texto'),
    body("apellido_estudiante")
        .notEmpty().withMessage('El apellido del estudiante es obligatorio')
        .isString().withMessage('El apellido del estudiante debe ser un texto'),
    body("nombre_asignatura")
        .notEmpty().withMessage('El nombre de la asignatura es obligatorio')
        .isString().withMessage('El nombre de la asignatura debe ser un texto'),
    body("nota")
        .custom(value => {
            if (isNaN(value)) {
                throw new Error('La nota debe ser un número');
            }
            return true;
        })
        .notEmpty().withMessage('La nota es obligatoria')
        .toFloat(), // Convertir a float
    controladorCalificacion.editar
);

/**
 * @swagger
 * /calificaciones/eliminar:
 *   delete:
 *     summary: Elimina una calificación
 *     tags: [Calificaciones]
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la calificación a eliminar.
 *     responses:
 *       200:
 *         description: Calificación eliminada correctamente.
 *       404:
 *         description: El ID de la calificación no existe.
 *       500:
 *         description: Error en el servidor al eliminar la calificación.
 */
rutas.delete('/eliminar',
    query("id")
        .isInt().withMessage("El id de la calificación debe ser un entero")
        .custom(async value => {
            const buscarCalificacion = await ModeloCalificacion.findOne({ where: { id: value } });
            if (!buscarCalificacion) {
                throw new Error('El id de la calificación no existe');
            }
        }),
    controladorCalificacion.eliminar
);

/**
 * @swagger
 * /calificaciones/busqueda_id:
 *   get:
 *     summary: Busca una calificación por ID
 *     tags: [Calificaciones]
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la calificación a buscar.
 *     responses:
 *       200:
 *         description: Calificación encontrada.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 nombre_carrera:
 *                   type: string
 *                 facultad:
 *                   type: string
 *                 createdAt:
 *                   type: string
 *                   format: date
 *                 updatedAt:
 *                   type: string
 *                   format: date
 *       404:
 *         description: Calificación no encontrada.
 *       500:
 *         description: Error en el servidor al buscar la calificación.
 */
rutas.get('/busqueda_id',
    query("id")
        .isInt().withMessage("El id de la calificación debe ser un entero")
        .notEmpty().withMessage('El id no permite valores nulos'), // Se asegura que el ID no sea vacío
    controladorCalificacion.busqueda_id
);

/**
 * @swagger
 * /calificaciones/busqueda_nombre:
 *   get:
 *     summary: Busca calificaciones por nombre de carrera
 *     tags: [Calificaciones]
 *     parameters:
 *       - in: query
 *         name: nombre
 *         required: true
 *         schema:
 *           type: string
 *         description: Nombre de la asignatura a buscar.
 *     responses:
 *       200:
 *         description: Calificaciones encontradas.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 nombre_carrera:
 *                   type: string
 *                 facultad:
 *                   type: string
 *                 createdAt:
 *                   type: string
 *                   format: date
 *                 updatedAt:
 *                   type: string
 *                   format: date
 *       404:
 *         description: Calificación no encontrada.
 *       500:
 *         description: Error en el servidor al buscar la calificación.
 */
rutas.get('/busqueda_nombre',
    query("nombre")
        .isString().withMessage("El nombre de la carrera debe ser una cadena de texto")
        .notEmpty().withMessage('El nombre de la carrera no puede estar vacío'),
    controladorCalificacion.busqueda_nombre
);

module.exports = rutas;