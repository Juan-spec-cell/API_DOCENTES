const { Router } = require('express');
const { body, query } = require('express-validator');
const controladorCalificacion = require('../controladores/controladorCalificacion');
const ModeloCalificacion = require('../modelos/calificacion');
const rutas = Router();

rutas.get('/', controladorCalificacion.inicio);

rutas.get('/listar', controladorCalificacion.listar);

rutas.post('/guardar',
    body("id_asignatura")
        .isInt().withMessage('El id de la asignatura debe ser un entero')
        .custom(async value => {
            const asignaturaExistente = await ModeloCalificacion.sequelize.models.asignatura.findOne({ where: { id_asignatura: value } });
            if (!asignaturaExistente) {
                throw new Error('El id de la asignatura no existe');
            }
        }),
    body("id_estudiante")
        .isInt().withMessage('El id del estudiante debe ser un entero')
        .custom(async value => {
            const estudianteExistente = await ModeloCalificacion.sequelize.models.estudiante.findOne({ where: { id_estudiante: value } });
            if (!estudianteExistente) {
                throw new Error('El id del estudiante no existe');
            }
        }),
    body("calificacion")
        .isDecimal().withMessage('La calificación debe ser un número decimal')
        .custom(value => {
            if (value < 0 || value > 100) {
                throw new Error('La calificación debe estar entre 0 y 100');
            }
            return true;
        }),
    body("fecha")
        .isDate().withMessage('La fecha debe ser una fecha válida'),
    controladorCalificacion.guardar
);

rutas.put('/editar',
    query("id_calificacion")
        .isInt().withMessage("El id de la calificación debe ser un entero")
        .custom(async value => {
            const buscarCalificacion = await ModeloCalificacion.findOne({ where: { id_calificacion: value } });
            if (!buscarCalificacion) {
                throw new Error('El id de la calificación no existe');
            }
        }),
    body("id_asignatura")
        .optional()
        .isInt().withMessage('El id de la asignatura debe ser un entero')
        .custom(async value => {
            if (value) {
                const asignaturaExistente = await ModeloCalificacion.sequelize.models.asignatura.findOne({ where: { id_asignatura: value } });
                if (!asignaturaExistente) {
                    throw new Error('El id de la asignatura no existe');
                }
            }
        }),
    body("id_estudiante")
        .optional()
        .isInt().withMessage('El id del estudiante debe ser un entero')
        .custom(async value => {
            if (value) {
                const estudianteExistente = await ModeloCalificacion.sequelize.models.estudiante.findOne({ where: { id_estudiante: value } });
                if (!estudianteExistente) {
                    throw new Error('El id del estudiante no existe');
                }
            }
        }),
    body("calificacion")
        .optional()
        .isDecimal().withMessage('La calificación debe ser un número decimal')
        .custom(value => {
            if (value < 0 || value > 100) {
                throw new Error('La calificación debe estar entre 0 y 100');
            }
            return true;
        }),
    body("fecha")
        .optional()
        .isDate().withMessage('La fecha debe ser una fecha válida'),
    controladorCalificacion.editar
);

rutas.delete('/eliminar',
    query("id_calificacion")
        .isInt().withMessage("El id de la calificación debe ser un entero")
        .custom(async value => {
            const buscarCalificacion = await ModeloCalificacion.findOne({ where: { id_calificacion: value } });
            if (!buscarCalificacion) {
                throw new Error('El id de la calificación no existe');
            }
        }),
    controladorCalificacion.eliminar
);

module.exports = rutas;
