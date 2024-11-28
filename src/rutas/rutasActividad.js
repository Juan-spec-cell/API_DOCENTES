const { Router } = require('express');
const { body, query } = require('express-validator');
const controladorActividad = require('../controladores/controladorActividad');
const ModeloActividad = require('../modelos/actividad'); // Asegúrate de importar ModeloActividad
const rutas = Router();

/**
 * @swagger
 * tags:
 *   name: Actividades
 *   description: Gestión de actividades
 */

/**
 * @swagger
 * /actividades:
 *   get:
 *     summary: Muestra un mensaje de bienvenida
 *     tags: [Actividades]
 *     responses:
 *       200:
 *         description: Mensaje de bienvenida de la API.
 */
rutas.get('/', controladorActividad.inicio);

/**
 * @swagger
 * /actividades/listar:
 *   get:
 *     summary: Lista todas las actividades
 *     tags: [Actividades]
 *     responses:
 *       200:
 *         description: Lista de actividades.
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
 *                         description: ID de la actividad.
 *                       nombre_actividad:
 *                         type: string
 *                         description: Nombre de la actividad.
 *                       nombre_asignatura:
 *                         type: string
 *                         description: Nombre de la asignatura.
 *                       fecha:
 *                         type: string
 *                         format: date
 *                         description: Fecha de la actividad.
 *                       valor:
 *                         type: number
 *                         description: Nota de la actividad.
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         description: Fecha de creación.
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                         description: Fecha de actualización.
 *                 msj:
 *                   type: array
 *                   items:
 *                     type: string
 *       500:
 *         description: Error al cargar los datos de actividades.
 */
rutas.get('/listar', controladorActividad.listar);

/**
 * @swagger
 * /actividades/guardar:
 *   post:
 *     summary: Guarda una nueva actividad
 *     tags: [Actividades]
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
 *               tipo_actividad:
 *                 type: string
 *                 description: Tipo de actividad.
 *               fecha:
 *                 type: string
 *                 format: date
 *                 description: Fecha de la actividad.
 *               valor:
 *                 type: number
 *                 description: Nota de la actividad.
 *     responses:
 *       201:
 *         description: Actividad guardada con éxito.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: ID de la actividad.
 *                     nombre_asignatura:
 *                       type: string
 *                       description: Nombre de la asignatura.
 *                     tipo_actividad:
 *                       type: string
 *                       description: Tipo de actividad.
 *                     fecha:
 *                       type: string
 *                       format: date
 *                       description: Fecha de la actividad.
 *                     valor:
 *                       type: number
 *                       description: Nota de la actividad.
 *       400:
 *         description: Error en la validación de datos.
 *       500:
 *         description: Error en el servidor al guardar la actividad.
 */
rutas.post('/guardar',
    body("nombre_asignatura")
        .isString().withMessage('El nombre de la asignatura debe ser una cadena de texto')
        .notEmpty().withMessage('El nombre de la asignatura no puede estar vacío'),
    body("tipo_actividad")
        .isString().withMessage('El tipo de actividad debe ser una cadena de texto')
        .notEmpty().withMessage('El tipo de actividad no puede estar vacío'),
    body("fecha")
        .isDate().withMessage('La fecha debe ser una fecha válida')
        .notEmpty().withMessage('La fecha no puede estar vacía'),
    body("valor")
        .isFloat().withMessage('El valor debe ser un número')
        .notEmpty().withMessage('El valor no puede estar vacío'),
    controladorActividad.guardar
);

/**
 * @swagger
 * /actividades/editar:
 *   put:
 *     summary: Edita una actividad existente
 *     tags: [Actividades]
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la actividad a editar.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tipo_actividad:
 *                 type: string
 *                 description: Tipo de actividad.
 *               fecha:
 *                 type: string
 *                 format: date
 *                 description: Fecha de la actividad.
 *     responses:
 *       200:
 *         description: Actividad editada correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     tipo_actividad:
 *                       type: string
 *                     fecha:
 *                       type: string
 *                       format: date
 *       400:
 *         description: Error en la validación de datos.
 *       404:
 *         description: Actividad no encontrada.
 *       500:
 *         description: Error en el servidor al editar la actividad.
 */
rutas.put('/editar',
    query("id")
        .isInt().withMessage("El id de la actividad debe ser un entero")
        .notEmpty().withMessage('El id no permite valores nulos'), // Se asegura que el ID no sea vacío
    body("tipo_actividad")
        .optional()
        .isString().withMessage('El tipo de actividad debe ser una cadena de texto'),
    body("fecha")
        .optional()
        .isDate().withMessage('La fecha debe ser una fecha válida'),
    controladorActividad.editar
);

/**
 * @swagger
 * /actividades/eliminar:
 *   delete:
 *     summary: Elimina una actividad
 *     tags: [Actividades]
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           description: ID de la actividad a eliminar
 *     responses:
 *       200:
 *         description: Actividad eliminada
 *       404:
 *         description: El id no existe
 *       500:
 *         description: Error al eliminar la actividad
 */
rutas.delete('/eliminar',
    query("id")
        .isInt().withMessage("El id de la actividad debe ser un entero")
        .notEmpty().withMessage('El id no permite valores nulos') // Se asegura que el ID no sea vacío
        .custom(async value => {
            const buscarActividad = await ModeloActividad.findOne({ where: { id: value } });
            if (!buscarActividad) {
                throw new Error('El id de la actividad no existe');
            }
        }),
    controladorActividad.eliminar
);

/**
 * @swagger
 * /actividades/busqueda_id:
 *   get:
 *     summary: Busca una actividad por ID
 *     tags: [Actividades]
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la actividad a buscar.
 *     responses:
 *       200:
 *         description: Actividad encontrada.
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
 *                     tipo_actividad:
 *                       type: string
 *                     fecha:
 *                       type: string
 *                       format: date
 *       404:
 *         description: Actividad no encontrada.
 *       500:
 *         description: Error en el servidor al buscar la actividad.
 */
rutas.get('/busqueda_id',
    query("id")
        .isInt().withMessage("El id de la actividad debe ser un entero")
        .notEmpty().withMessage('El id no permite valores nulos'), // Se asegura que el ID no sea vacío
    controladorActividad.busqueda_id
);

/**
 * @swagger
 * /actividades/busqueda_tipo:
 *   get:
 *     summary: Busca actividades por tipo
 *     tags: [Actividades]
 *     parameters:
 *       - in: query
 *         name: tipo_actividad
 *         required: true
 *         schema:
 *           type: string
 *         description: Tipo de actividad a buscar.
 *     responses:
 *       200:
 *         description: Actividades encontradas.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 tipo:
 *                   type: integer
 *                 datos:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       tipo_actividad:
 *                         type: string
 *                       fecha:
 *                         type: string
 *                         format: date
 *       404:
 *         description: No se encontraron actividades con ese tipo.
 *       500:
 *         description: Error en el servidor al buscar las actividades.
 */
rutas.get('/busqueda_tipo',
    query("tipo_actividad")
        .isString().withMessage("El tipo de actividad debe ser una cadena de texto")
        .notEmpty().withMessage('El tipo de actividad no puede estar vacío'),
    controladorActividad.busqueda_tipo
);



module.exports = rutas;
