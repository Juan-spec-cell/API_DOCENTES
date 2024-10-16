const { Router } = require('express');
const { body, query } = require('express-validator');
const controladorAsistencia = require('../controladores/controladorAsistencia');
const ModeloAsistencia = require('../modelos/asistencia'); // Asegúrate de la ruta correcta
const rutas = Router();

rutas.get('/', controladorAsistencia.inicio);

rutas.get('/listar', controladorAsistencia.listar);

rutas.post('/guardar',
    body("id_estudiante")
        .isInt().withMessage('El id del estudiante debe ser un entero')
        .custom(async value => {
            const estudianteExistente = await ModeloAsistencia.sequelize.models.estudiante.findOne({ where: { id_estudiante: value } });
            if (!estudianteExistente) {
                throw new Error('El id del estudiante no existe');
            }
        }),
    body("id_asignatura")
        .isInt().withMessage('El id de la asignatura debe ser un entero')
        .custom(async value => {
            const asignaturaExistente = await ModeloAsistencia.sequelize.models.asignatura.findOne({ where: { id_asignatura: value } });
            if (!asignaturaExistente) {
                throw new Error('El id de la asignatura no existe');
            }
        }),
    body("fecha")
        .isDate().withMessage('La fecha debe ser una fecha válida'),
    body("estado")
        .isIn(['Presente', 'Ausente', 'Tardanza']).withMessage('El estado debe ser Presente, Ausente o Tardanza'),
    controladorAsistencia.guardar
);

rutas.put('/editar',
    query("id_asistencia")
        .isInt().withMessage("El id de la asistencia debe ser un entero")
        .custom(async value => {
            const buscarAsistencia = await ModeloAsistencia.findOne({ where: { id_asistencia: value } });
            if (!buscarAsistencia) {
                throw new Error('El id de la asistencia no existe');
            }
        }),
    body("id_estudiante")
        .optional()
        .isInt().withMessage('El id del estudiante debe ser un entero')
        .custom(async value => {
            if (value) {
                const estudianteExistente = await ModeloAsistencia.sequelize.models.estudiante.findOne({ where: { id_estudiante: value } });
                if (!estudianteExistente) {
                    throw new Error('El id del estudiante no existe');
                }
            }
        }),
    body("id_asignatura")
        .optional()
        .isInt().withMessage('El id de la asignatura debe ser un entero')
        .custom(async value => {
            if (value) {
                const asignaturaExistente = await ModeloAsistencia.sequelize.models.asignatura.findOne({ where: { id_asignatura: value } });
                if (!asignaturaExistente) {
                    throw new Error('El id de la asignatura no existe');
                }
            }
        }),
    body("fecha")
        .optional()
        .isDate().withMessage('La fecha debe ser una fecha válida'),
    body("estado")
        .optional()
        .isIn(['Presente', 'Ausente', 'Tardanza']).withMessage('El estado debe ser Presente, Ausente o Tardanza'),
    controladorAsistencia.editar
);

rutas.delete('/eliminar',
    query("id_asistencia")
        .isInt().withMessage("El id de la asistencia debe ser un entero")
        .custom(async value => {
            const buscarAsistencia = await ModeloAsistencia.findOne({ where: { id_asistencia: value } });
            if (!buscarAsistencia) {
                throw new Error('El id de la asistencia no existe');
            }
        }),
    controladorAsistencia.eliminar
);

module.exports = rutas;
