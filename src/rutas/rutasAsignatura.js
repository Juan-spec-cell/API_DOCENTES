const { Router } = require('express');
const { body, query } = require('express-validator');
const controladorAsignatura = require('../controladores/controladorAsignatura');
const ModeloAsignatura = require('../modelos/asignatura'); // Asegúrate de la ruta correcta
const rutas = Router();

// Ruta de inicio
rutas.get('/', controladorAsignatura.inicio);

// Listar asignaturas
rutas.get('/listar', controladorAsignatura.listar);

// Guardar una nueva asignatura
rutas.post('/guardar',
    body("nombre_asignatura")
        .isLength({ min: 3, max: 100 }).withMessage('El nombre de la asignatura debe tener entre 3 y 100 caracteres')
        .custom(async value => {
            if (!value) {
                throw new Error('El nombre de la asignatura no permite valores nulos');
            } else {
                const buscarAsignatura = await ModeloAsignatura.findOne({ where: { nombre_asignatura: value } });
                if (buscarAsignatura) {
                    throw new Error('El nombre de la asignatura ya existe');
                }
            }
        }),
    body("id_docente")
        .isInt().withMessage('El id del docente debe ser un entero')
        .custom(async value => {
            const docenteExistente = await ModeloAsignatura.sequelize.models.docente.findOne({ where: { id_docente: value } });
            if (!docenteExistente) {
                throw new Error('El id del docente no existe');
            }
        }),
    body("id_carrera")
        .isInt().withMessage('El id de carrera debe ser un entero')
        .custom(async value => {
            const carreraExistente = await ModeloAsignatura.sequelize.models.carrera.findOne({ where: { id_carrera: value } });
            if (!carreraExistente) {
                throw new Error('El id de carrera no existe');
            }
        }),
    controladorAsignatura.guardar
);

// Editar una asignatura
rutas.put('/editar',
    query("id_asignatura")
        .isInt().withMessage("El id de la asignatura debe ser un entero")
        .custom(async value => {
            const buscarAsignatura = await ModeloAsignatura.findOne({ where: { id_asignatura: value } });
            if (!buscarAsignatura) {
                throw new Error('El id de la asignatura no existe');
            }
        }),
    body("nombre_asignatura")
        .optional()
        .isLength({ min: 3, max: 100 }).withMessage('El nombre de la asignatura debe tener entre 3 y 100 caracteres')
        .custom(async value => {
            const buscarAsignatura = await ModeloAsignatura.findOne({ where: { nombre_asignatura: value } });
            if (buscarAsignatura) {
                throw new Error('El nombre de la asignatura ya existe');
            }
        }),
    body("id_docente")
        .optional()
        .isInt().withMessage('El id del docente debe ser un entero')
        .custom(async value => {
            const docenteExistente = await ModeloAsignatura.sequelize.models.docente.findOne({ where: { id_docente: value } });
            if (!docenteExistente) {
                throw new Error('El id del docente no existe');
            }
        }),
    body("id_carrera")
        .optional()
        .isInt().withMessage('El id de carrera debe ser un entero')
        .custom(async value => {
            const carreraExistente = await ModeloAsignatura.sequelize.models.carrera.findOne({ where: { id_carrera: value } });
            if (!carreraExistente) {
                throw new Error('El id de carrera no existe');
            }
        }),
    controladorAsignatura.editar
);

// Eliminar una asignatura
rutas.delete('/eliminar',
    query("id_asignatura")
        .isInt().withMessage("El id de la asignatura debe ser un entero")
        .custom(async value => {
            const buscarAsignatura = await ModeloAsignatura.findOne({ where: { id_asignatura: value } });
            if (!buscarAsignatura) {
                throw new Error('El id de la asignatura no existe');
            }
        }),
    controladorAsignatura.eliminar
);

module.exports = rutas;
