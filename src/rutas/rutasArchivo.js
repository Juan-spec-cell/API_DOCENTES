const express = require('express'); 
const {body, query} = require('express-validator'); 
const router = express.Router(); 
const archivosController = require('../controladores/controladorArchivo'); 
const Docente = require('../modelos/Docente'); 
const Estudiante = require('../modelos/Estudiante'); 
const rutas = require('./rutasUsuarios');

// validaciones
const imagenValidationRules = [
    body("img").isEmpty().withMessage("La imagen es requerida")
];

const docenteIdValidation = [
    query('id').isInt().withMessage('El ID debe ser un número entero')
        .custon(async (value) => {
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
        .custon(async (value) => {
            if(value){
                const buscarEstudiante = await Estudiante.findByPk(value);
                if(!buscarEstudiante){
                    throw new Error('El estudiante no existe');
                }
            }
        }),
]; 


rutas.put('/imagen/docente', imagenValidationRules, docenteIdValidation,archivosController.validarImagenDocente, archivosController.actualizarImagenDocente);
rutas.put('/imagen/estudiante', imagenValidationRules, estudianteIdValidation,archivosController.validarImagenEstudiante, archivosController.actualizarImagenEstudiante);