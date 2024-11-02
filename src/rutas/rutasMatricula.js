const { Router } = require('express');
const { body, query } = require('express-validator');
const controladorMatricula = require('../controladores/controladorMatricula');
const ModeloMatricula = require('../modelos/matricula');
const rutas = Router();

/**
 * @swagger
 * tags:
 *   name: Matriculas
 *   description: Gestión de matrículas
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
 *     summary: Lista todas las matrículas
 *     tags: [Matriculas]
 *     responses:
 *       200:
 *         description: Lista de matrículas.
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
 *                       nombre_completo:
 *                         type: string
 *                         description: Nombre completo del estudiante.
 *                       nombre_periodo:
 *                         type: string
 *                         description: Nombre del periodo.
 *                 msj:
 *                   type: array
 *                   items:
 *                     type: string
 *       500:
 *         description: Error al cargar los datos de matrículas.
 */
rutas.get('/listar', controladorMatricula.listar);

/**
 * @swagger
 * /matriculas/guardar:
 *   post:
 *     summary: Guarda una nueva matrícula
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
 *         description: Matrícula guardada correctamente.
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
 *                       description: ID de la nueva matrícula.
 *                     nombre_estudiante:
 *                       type: string
 *                       description: Nombre del estudiante.
 *                     nombre_periodo:
 *                       type: string
 *                       description: Nombre del periodo.
 *                 msj:
 *                   type: string
 *       400:
 *         description: Error en la validación de datos.
 *       500:
 *         description: Error en el servidor al guardar la matrícula.
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
 *     summary: Edita una matrícula existente
 *     tags: [Matriculas]
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la matrícula a editar.
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
 *         description: Matrícula editada correctamente.
 *       400:
 *         description: Error en la validación de datos.
 *       404:
 *         description: El ID de la matrícula no existe.
 *       500:
 *         description: Error en el servidor al editar la matrícula.
 */
rutas.put('/editar',
    query("id")
        .isInt().withMessage("El id de la matrícula debe ser un entero")
        .custom(async value => {
            const buscarMatricula = await ModeloMatricula.findOne({ where: { id: value } });
            if (!buscarMatricula) {
                throw new Error('El id de la matrícula no existe');
            }
        }),
    body("nombre_estudiante")
        .optional()
        .isString().withMessage('El nombre del estudiante debe ser una cadena de texto')
        .notEmpty().withMessage('El nombre del estudiante no puede estar vacío'),
    body("apellido_estudiante")
        .optional()
        .isString().withMessage('El apellido del estudiante debe ser una cadena de texto')
        .notEmpty().withMessage('El apellido del estudiante no puede estar vacío'),
    body("nombre_periodo")
        .optional()
        .isString().withMessage('El nombre del periodo debe ser una cadena de texto')
        .notEmpty().withMessage('El nombre del periodo no puede estar vacío'),
    controladorMatricula.editar
);

/**
 * @swagger
 * /matriculas/eliminar:
 *   delete:
 *     summary: Elimina una matrícula existente
 *     tags: [Matriculas]
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la matrícula a eliminar.
 *     responses:
 *       200:
 *         description: Matrícula eliminada correctamente.
 *       404:
 *         description: El ID de la matrícula no existe.
 *       500:
 *         description: Error en el servidor al eliminar la matrícula.
 */
rutas.delete('/eliminar',
    query("id")
        .isInt().withMessage("El id de la matrícula debe ser un entero")
        .custom(async value => {
            const buscarMatricula = await ModeloMatricula.findOne({ where: { id: value } });
            if (!buscarMatricula) {
                throw new Error('El id de la matrícula no existe');
            }
        }),
    controladorMatricula.eliminar
);

/**
 * @swagger
 * /matriculas/busqueda:
 *   get:
 *     summary: Busca matrículas con filtros
 *     tags: [Matriculas]
 *     parameters:
 *       - in: query
 *         name: id
 *         schema:
 *           type: integer
 *         description: ID de la matrícula.
 *       - in: query
 *         name: nombre
 *         schema:
 *           type: string
 *         description: Nombre del estudiante.
 *       - in: query
 *         name: periodo
 *         schema:
 *           type: string
 *         description: Nombre del periodo.
 *     responses:
 *       200:
 *         description: Lista de matrículas filtradas.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: ID de la matrícula.
 *                   nombre_completo:
 *                     type: string
 *                     description: Nombre completo del estudiante.
 *                   nombre_periodo:
 *                     type: string
 *                     description: Nombre del periodo.
 *       400:
 *         description: Error en la validación de datos.
 *       500:
 *         description: Error en el servidor al buscar las matrículas.
 */
rutas.get('/busqueda', controladorMatricula.busqueda);

/**
 * @swagger
 * /matriculas/busqueda_id:
 *   get:
 *     summary: Busca una matrícula por ID
 *     tags: [Matriculas]
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la matrícula.
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
 *                 nombre_completo:
 *                   type: string
 *                   description: Nombre completo del estudiante.
 *                 nombre_periodo:
 *                   type: string
 *                   description: Nombre del periodo.
 *       400:
 *         description: Error en la validación de datos.
 *       500:
 *         description: Error en el servidor al buscar la matrícula.
 */
rutas.get('/busqueda_id', controladorMatricula.busqueda_id);

/**
 * @swagger
 * /matriculas/busqueda_nombre:
 *   get:
 *     summary: Busca una matrícula por nombre de estudiante
 *     tags: [Matriculas]
 *     parameters:
 *       - in: query
 *         name: nombre
 *         required: true
 *         schema:
 *           type: string
 *         description: Nombre del estudiante.
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
 *                 nombre_completo:
 *                   type: string
 *                   description: Nombre completo del estudiante.
 *                 nombre_periodo:
 *                   type: string
 *                   description: Nombre del periodo.
 *       400:
 *         description: Error en la validación de datos.
 *       500:
 *         description: Error en el servidor al buscar la matrícula.
 */
rutas.get('/busqueda_nombre', controladorMatricula.busqueda_nombre);

module.exports = rutas;