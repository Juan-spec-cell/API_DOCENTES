const { Router } = require('express');
const { body } = require('express-validator');
const controladorAutenticacion = require('../controladores/controladorAutenticacion');
const rutas = Router();

/**
 * @swagger
 * tags:
 *   name: Autenticación
 *   description: Gestión de autenticación de usuarios
 */

/**
 * @swagger
 * /autenticaciones/registrar:
 *   post:
 *     summary: Registrar un nuevo usuario
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - email
 *               - password
 *               - tipo
 *             properties:
 *               nombre:
 *                 type: string
 *                 description: Nombre del usuario
 *               email:
 *                 type: string
 *                 description: Email del usuario
 *               password:
 *                 type: string
 *                 description: Contraseña del usuario
 *               tipo:
 *                 type: string
 *                 enum: [docente, estudiante]
 *                 description: Tipo de usuario (docente o estudiante)
 *     responses:
 *       200:
 *         description: Usuario registrado correctamente
 *       400:
 *         description: Error en la validación de los datos
 *       500:
 *         description: Error en el servidor al registrar el usuario
 */
rutas.post('/registrar', [
    body('nombre').notEmpty().withMessage('El nombre es obligatorio'),
    body('email').isEmail().withMessage('El email es obligatorio'),
    body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
    body('tipo').isIn(['docente', 'estudiante']).withMessage('El tipo debe ser docente o estudiante'),
], controladorAutenticacion.registrar);

/**
 * @swagger
 * /autenticaciones/login:
 *   post:
 *     summary: Iniciar sesión
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 description: Email del usuario
 *               password:
 *                 type: string
 *                 description: Contraseña del usuario
 *     responses:
 *       200:
 *         description: Inicio de sesión exitoso
 *       401:
 *         description: Credenciales incorrectas
 *       500:
 *         description: Error en el servidor al iniciar sesión
 */
rutas.post('/login', [
    body('email').isEmail().withMessage('El email es obligatorio'),
    body('password').notEmpty().withMessage('La contraseña es obligatoria'),
], controladorAutenticacion.login);

/**
 * @swagger
 * /autenticaciones/listar:
 *   get:
 *     summary: Listar todos los usuarios
 *     tags: [Autenticación]
 *     responses:
 *       200:
 *         description: Lista de usuarios
 *       500:
 *         description: Error en el servidor al listar los usuarios
 */
rutas.get('/listar', controladorAutenticacion.listar);

module.exports = rutas;