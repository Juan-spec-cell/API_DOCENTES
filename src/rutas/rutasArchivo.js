const express = require('express'); 
const {body, query} = require('express-validator'); 
const rutas = express.Router(); 
const archivosController = require('../controladores/controladorArchivo'); 
const Docente = require('../modelos/Docente'); 
const Estudiante = require('../modelos/Estudiante'); 
const usuario = require('./rutasUsuarios');

// validaciones
const imagenValidationRules = [
    body("img").isEmpty().withMessage("La imagen es requerida")
];

const docenteIdValidation = [
    query('id').isInt().withMessage('El ID debe ser un número entero')
        .custom(async (value) => {
            if(value){
                const buscarDocente = await Docente.findByPk(value);
                if(!buscarDocente){
                    throw new Error('El docente no existe');
                }
            }
        }),
]; 

const estudianteIdValidation = [
    query('id').isInt().withMessage('El ID debe ser un número entero')
        .custom(async (value) => {
            if(value){
                const buscarEstudiante = await Estudiante.findByPk(value);
                if(!buscarEstudiante){
                    throw new Error('El estudiante no existe');
                }
            }
        }),
]; 

/**
 * @swagger
 * tags:
 *   name: Archivos
 *   description: Operaciones relacionadas con los archivos
 */

/**
 * @swagger
 * /archivos/imagen/docente:
 *   put:
 *     summary: Actualiza la imagen del Docente
 *     tags: [Archivos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema: 
 *             type: object
 *             properties:
 *               imagen:         # Asegúrate de que este nombre coincida con el campo que espera Multer
 *                 type: string
 *                 format: binary
 *                 description: La nueva imagen del docente
 *               note:
 *                 type: string
 *                 description: Nota adicional sobre la imagen
 *     parameters:
 *       - in: query
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: El ID del docente a actualizar
 *     responses:
 *       200:
 *         description: Imagen actualizada correctamente
 *       400:
 *         description: Error al actualizar la imagen
 */
rutas.put('/imagen/docente', imagenValidationRules, docenteIdValidation,archivosController.validarImagenDocente, archivosController.actualizarImagenDocente);


/**
 * @swagger
 * /archivos/imagen/estudiante:
 *   put:
 *     summary: Actualiza la imagen del Estudiante
 *     tags: [Archivos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema: 
 *             type: object
 *             properties:
 *               imagen:         # Asegúrate de que este nombre coincida con el campo que espera Multer
 *                 type: string
 *                 format: binary
 *                 description: La nueva imagen del docente
 *               note:
 *                 type: string
 *                 description: Nota adicional sobre la imagen
 *     parameters:
 *       - in: query
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: El ID del estudiante a actualizar
 *     responses:
 *       200:
 *         description: Imagen actualizada correctamente
 *       400:
 *         description: Error al actualizar la imagen
 */
rutas.put('/imagen/estudiante', imagenValidationRules, estudianteIdValidation,archivosController.validarImagenEstudiante, archivosController.actualizarImagenEstudiante);
module.exports = rutas;