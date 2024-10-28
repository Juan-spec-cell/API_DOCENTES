const { Router } = require('express');
const { body, query } = require('express-validator');
const controladorRol = require('../controladores/controladorRoles'); // Asegúrate de que este controlador existe
const rutas = Router();

/**
 * @swagger
 * tags:
 *   name: Roles
 *   description: Gestión de roles
 */

/**
 * @swagger
 * /roles/listar:
 *   get:
 *     summary: Lista todos los roles
 *     tags: [Roles]
 *     responses:
 *       200:
 *         description: Lista de roles.
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
 *                       id_rol:
 *                         type: integer
 *                         description: ID del rol.
 *                       nombre_rol:
 *                         type: string
 *                         description: Nombre del rol.
 *                 msj:
 *                   type: array
 *                   items:
 *                     type: string
 *       500:
 *         description: Error al cargar los datos de roles.
 */
rutas.get('/listar', controladorRol.listar);

/**
 * @swagger
 * /roles/guardar:
 *   post:
 *     summary: Guarda un nuevo rol
 *     tags: [Roles]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre_rol:
 *                 type: string
 *                 description: Nombre del rol
 *     responses:
 *       200:
 *         description: Rol guardado
 *       400:
 *         description: Error en los datos proporcionados
 */
rutas.post('/guardar',
    body("nombre_rol").notEmpty().withMessage('Ingrese un valor en el nombre del rol'),
    controladorRol.guardar
);

/**
 * @swagger
 * /roles/editar:
 *   put:
 *     summary: Edita un rol existente
 *     tags: [Roles]
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           description: ID del rol a editar
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre_rol:
 *                 type: string
 *                 description: Nombre del rol (opcional)
 *     responses:
 *       200:
 *         description: Rol editado
 *       400:
 *         description: Error en los datos proporcionados
 */
rutas.put('/editar',
    query("id")
        .isInt().withMessage("El id del rol debe ser un entero")
        .custom(async value => {
            if (!value) {
                throw new Error('El id no permite valores nulos');
            } else {
                const buscarRol = await controladorRol.buscarPorId(value);
                if (!buscarRol) {
                    throw new Error('El id del rol no existe');
                }
            }
        }),
    body("nombre_rol").optional().isString().withMessage('El nombre del rol debe ser una cadena de texto'),
    controladorRol.editar
);

/**
 * @swagger
 * /roles/eliminar:
 *   delete:
 *     summary: Elimina un rol
 *     tags: [Roles]
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           description: ID del rol a eliminar
 *     responses:
 *       200:
 *         description: Rol eliminado
 *       400:
 *         description: Error en los datos proporcionados
 */
rutas.delete('/eliminar',
    query("id")
        .isInt().withMessage("El id del rol debe ser un entero")
        .custom(async value => {
            if (!value) {
                throw new Error('El id no permite valores nulos');
            } else {
                const buscarRol = await controladorRol.buscarPorId(value);
                if (!buscarRol) {
                    throw new Error('El id del rol no existe');
                }
            }
        }),
    controladorRol.eliminar
);

/**
 * @swagger
 * /roles/buscar:
 *   get:
 *     summary: Busca roles por ID o tipo
 *     tags: [Roles]
 *     parameters:
 *       - in: query
 *         name: id
 *         schema:
 *           type: integer
 *         required: false
 *         description: ID del rol
 *       - in: query
 *         name: tipo
 *         schema:
 *           type: string
 *         required: false
 *         description: Tipo de rol
 *     responses:
 *       200:
 *         description: Resultados de la búsqueda
 *       400:
 *         description: Error en la validación de los datos
 */
rutas.get(
  "/buscar",
  [
    query("id")
      .optional()
      .isInt()
      .withMessage("El id debe ser un numero entero"),
    query("tipo")
      .optional()
      .notEmpty()
      .withMessage("No se permiten valores vacios"),
  ],
  controladorRol.busqueda
);

/**
 * @swagger
 * /roles/buscar=id:
 *   get:
 *     summary: Busca un rol por ID
 *     tags: [Roles]
 *     parameters:
 *       - in: query
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del rol
 *     responses:
 *       200:
 *         description: Rol encontrado
 *       400:
 *         description: Error en la validación de los datos
 */
rutas.get(
  "/buscar=id",
  query("id").isInt().withMessage("El id debe ser un numero entero"),
  controladorRol.busqueda_id
);

module.exports = rutas;