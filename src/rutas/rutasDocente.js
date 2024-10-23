const { Router } = require('express');
const { body, query } = require('express-validator');
const controladorDocente = require('../controladores/controladorDocente');
const ModeloDocente = require('../modelos/docente');
const rutas = Router();
/**
 * @swagger
 * tags:
 *   name: Docentes
 *   description: Gestion de Docentes
 */
/**
 * @swagger
 * /docentes:
 *   get:
 *     summary: Muestra un mensaje de bienvenida
 *     tags: [Docentes]
 *     responses:
 *       200:
 *         description: Mensaje de bienvenida de la API.
 */
rutas.get('/', controladorDocente.inicio);

/**
 * @swagger
 * /docentes/listar:
 *   get:
 *     summary: Lista todos los Docentes
 *     tags: [Docentes]
 *     responses:
 *       200:
 *         description: Lista de Docentes.
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
 *                       id_docente:
 *                         type: integer
 *                         description: ID del Docente.
 *                       nombre:
 *                         type: string
 *                         description: Nombre del Docente.
 *                       correo:
 *                         type: string
 *                         description: Correo del Docente.
 *                     
 *                 msj:
 *                   type: array
 *                   items:
 *                     type: string
 *       500:
 *         description: Error al cargar los datos del Docente.
 */
rutas.get('/listar', controladorDocente.listar);

/**
 * @swagger
 * /docentes/guardar:
 *   post:
 *     summary: Guarda un Nuevo Docente
 *     tags: [Docentes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id_docente:
 *                 type: integer
 *                 description: ID del Docente.
 *               nombre:
 *                 type: string
 *                 description: Nombre del Docente.
 *               correo:
 *                 type: string
 *                 description: Correo del Docente.
 *     responses:
 *       200:
 *         description: Docente guardado correctamente.
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
 *                     id_docente:
 *                       type: integer
 *                       description: ID del Docente.
 *                 msj:
 *                   type: string
 *       400:
 *         description: Error en la validación de datos.
 *       500:
 *         description: Error en el servidor al guardar el Docente.
 */
rutas.post('/guardar',
    body("nombre")
        .isLength({ min: 3, max: 100 })
        .withMessage('El nombre debe tener entre 3 y 100 caracteres')
        .custom(async value => {
            if (!value) {
                throw new Error('El nombre no permite valores nulos');
            }
        }),
    body("correo")
        .isEmail().withMessage('Debe ser un correo electrónico válido')
        .custom(async value => {
            const buscarDocente = await ModeloDocente.findOne({ where: { correo: value } });
            if (buscarDocente) {
                throw new Error('El correo ya está registrado');
            }
        }),
    controladorDocente.guardar
);

/**
 * @swagger
 * /docentes/editar:
 *   put:
 *     summary: Edita un Docente existente
 *     tags: [Docentes]
 *     parameters:
 *       - in: query
 *         name: id_docente
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del Docente a editar.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *             id_docente:
 *               type: integer
 *               description: ID del Docente.
 *             nombre:
 *               type: string
 *               description: Nombre del Docente.
 *             correo:
 *               type: string
 *               description: Correo del Docente.
 *     responses:
 *       200:
 *         description: Docente editado correctamente.
 *       400:
 *         description: Error en la validación de datos.
 *       404:
 *         description: El ID del Docente no existe.
 *       500:
 *         description: Error en el servidor al editar el Docente.
 */
rutas.put('/editar',
    query("id_docente")
        .isInt().withMessage("El id del docente debe ser un entero")
        .custom(async value => {
            if (!value) {
                throw new Error('El id no permite valores nulos');
            } else {
                const buscarDocente = await ModeloDocente.findOne({ where: { id_docente: value } });
                if (!buscarDocente) {
                    throw new Error('El id del docente no existe');
                }
            }
        }),
    body("nombre")
        .isLength({ min: 3, max: 100 })
        .withMessage('El nombre debe tener entre 3 y 100 caracteres'),
    body("correo")
        .isEmail().withMessage('Debe ser un correo electrónico válido'),
    controladorDocente.editar
);

/**
 * @swagger
 * /docentes/eliminar:
 *   delete:
 *     summary: Elimina un Docente existente
 *     tags: [Docentes]
 *     parameters:
 *       - in: query
 *         name: id_docente
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del Docente a eliminar.
 *     responses:
 *       200:
 *         description: Docente eliminada correctamente.
 *       404:
 *         description: El ID del Docente no existe.
 *       500:
 *         description: Error en el servidor al eliminar el Docente.
 */

rutas.delete('/eliminar',
    query("id_docente")
        .isInt().withMessage("El id del docente debe ser un entero")
        .custom(async value => {
            if (!value) {
                throw new Error('El id no permite valores nulos');
            } else {
                const buscarDocente = await ModeloDocente.findOne({ where: { id_docente: value } });
                if (!buscarDocente) {
                    throw new Error('El id del docente no existe');
                }
            }
        }),
    controladorDocente.eliminar
);

module.exports = rutas;
