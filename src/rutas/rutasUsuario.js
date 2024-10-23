const { Router } = require('express');
const { body, query } = require('express-validator');
const controladorUsuario = require('../controladores/controladorUsuario');
const { ValidarAutenticado } = require('../configuracion/autenticacion');
const rutas = Router();

/**
 * @swagger
 * tags:
 *   name: Usuarios
 *   description: Gestión de Usuarios
 */

/**
 * @swagger
 * /usuarios/registro:
 *   post:
 *     summary: Registra un nuevo usuario
 *     tags: [Usuarios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               tipo:
 *                 type: string
 *                 enum: [docente, estudiante]
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente.
 *       400:
 *         description: Error en los datos proporcionados
 */
rutas.post('/registro',
    body('nombre').notEmpty().withMessage('El nombre es obligatorio'),
    body('email').isEmail().withMessage('El email debe ser válido'),
    body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
    body('tipo').isIn(['docente', 'estudiante']).withMessage('El tipo de usuario debe ser "docente" o "estudiante"'),
    controladorUsuario.registro
);

/**
 * @swagger
 * /usuarios/login:
 *   post:
 *     summary: Inicia sesión un usuario
 *     tags: [Usuarios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               tipo:
 *                 type: string
 *                 enum: [docente, estudiante]
 *     responses:
 *       200:
 *         description: Inicio de sesión exitoso.
 *       400:
 *         description: Error en los datos proporcionados
 */
rutas.post('/login',
    body('email').isEmail().withMessage('El email debe ser válido'),
    body('password').notEmpty().withMessage('La contraseña es obligatoria'),
    body('tipo').isIn(['docente', 'estudiante']).withMessage('El tipo de usuario debe ser "docente" o "estudiante"'),
    controladorUsuario.login
);

/**
 * @swagger
 * /usuarios/listar:
 *   get:
 *     summary: Lista todos los usuarios
 *     tags: [Usuarios]
 *     responses:
 *       200:
 *         description: Lista de usuarios
 */
rutas.get('/listar', ValidarAutenticado, controladorUsuario.listar);

/**
 * @swagger
 * /usuarios/editar:
 *   put:
 *     summary: Edita un usuario existente
 *     tags: [Usuarios]
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           description: ID del usuario a editar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               tipo:
 *                 type: string
 *                 enum: [docente, estudiante]
 *     responses:
 *       200:
 *         description: Usuario editado
 *       400:
 *         description: Error en los datos proporcionados
 */
rutas.put('/editar',
    ValidarAutenticado,
    query('id').isInt().withMessage('El id debe ser un entero'),
    body('nombre').optional().notEmpty().withMessage('El nombre es obligatorio'),
    body('email').optional().isEmail().withMessage('El email debe ser válido'),
    body('password').optional().isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
    body('tipo').optional().isIn(['docente', 'estudiante']).withMessage('El tipo de usuario debe ser "docente" o "estudiante"'),
    controladorUsuario.editar
);

/**
 * @swagger
 * /usuarios/eliminar:
 *   delete:
 *     summary: Elimina un usuario
 *     tags: [Usuarios]
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           description: ID del usuario a eliminar
 *     responses:
 *       200:
 *         description: Usuario eliminado
 *       400:
 *         description: Error en los datos proporcionados
 */
rutas.delete('/eliminar',
    ValidarAutenticado,
    query('id').isInt().withMessage('El id debe ser un entero'),
    controladorUsuario.eliminar
);

module.exports = rutas;