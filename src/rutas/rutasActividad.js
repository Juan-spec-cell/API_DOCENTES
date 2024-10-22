const { Router } = require('express');
const { body, query } = require('express-validator');
const controladorActividad = require('../controladores/controladorActividad');
const ModeloActividad = require('../modelos/actividad');
const rutas = Router();



rutas.get('/', controladorActividad.inicio);

rutas.get('/listar', controladorActividad.listar);


rutas.post('/guardar',
    body("id_asignatura")
        .isInt().withMessage('El id de asignatura debe ser un entero')
        .custom(async value => {
            // Verifica que la asignatura exista
            const asignaturaExistente = await ModeloActividad.sequelize.models.asignaturas.findOne({ where: { id_asignatura: value } });
            if (!asignaturaExistente) {
                throw new Error('El id de asignatura no existe');
            }
        }),
    body("tipo_actividad")
        .isIn(['Acumulativo', 'Examen']).withMessage('El tipo de actividad debe ser "Acumulativo" o "Examen"'),
    body("fecha")
        .isDate().withMessage('La fecha debe ser una fecha válida'),
    controladorActividad.guardar
);

rutas.put('/editar',
    query("id_actividad")
        .isInt().withMessage("El id de la actividad debe ser un entero")
        .custom(async value => {
            if (!value) {
                throw new Error('El id no permite valores nulos');
            } else {
                const buscarActividad = await ModeloActividad.findOne({ where: { id_actividad: value } });
                if (!buscarActividad) {
                    throw new Error('El id de la actividad no existe');
                }
            }
        }),
    body("id_asignatura")
        .optional() // Puede no ser obligatorio al editar
        .isInt().withMessage('El id de asignatura debe ser un entero')
        .custom(async value => {
            if (value) {
                const asignaturaExistente = await ModeloActividad.sequelize.models.asignaturas.findOne({ where: { id_asignatura: value } });
                if (!asignaturaExistente) {
                    throw new Error('El id de asignatura no existe');
                }
            }
        }),
    body("tipo_actividad")
        .optional()
        .isIn(['Acumulativo', 'Examen']).withMessage('El tipo de actividad debe ser "Acumulativo" o "Examen"'),
    body("fecha")
        .optional()
        .isDate().withMessage('La fecha debe ser una fecha válida'),
    controladorActividad.editar
);

rutas.delete('/eliminar',
    query("id_actividad")
        .isInt().withMessage("El id de la actividad debe ser un entero")
        .custom(async value => {
            if (!value) {
                throw new Error('El id no permite valores nulos');
            } else {
                const buscarActividad = await ModeloActividad.findOne({ where: { id_actividad: value } });
                if (!buscarActividad) {
                    throw new Error('El id de la actividad no existe');
                }
            }
        }),
    controladorActividad.eliminar
);

module.exports = rutas;
