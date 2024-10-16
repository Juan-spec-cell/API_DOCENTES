const { Router } = require('express');
const { body, query } = require('express-validator');
const controladorEstudiante = require('../controladores/controladorEstudiante');
const ModeloEstudiante = require('../modelos/estudiante'); // Asegúrate de que la ruta sea correcta
const rutas = Router();

rutas.get('/', controladorEstudiante.inicio);

rutas.get('/listar', controladorEstudiante.listar);

rutas.post('/guardar',
    body("nombre_estudiante")
        .isLength({ min: 3, max: 100 }).withMessage('El nombre del estudiante debe tener entre 3 y 100 caracteres')
        .custom(async value => {
            if (!value) {
                throw new Error('El nombre no permite valores nulos');
            }
            const buscarEstudiante = await ModeloEstudiante.findOne({ where: { nombre_estudiante: value } });
            if (buscarEstudiante) {
                throw new Error('El nombre del estudiante ya existe');
            }
        }),
    body("correo")
        .isEmail().withMessage('El correo debe ser un email válido')
        .custom(async value => {
            const buscarEstudiante = await ModeloEstudiante.findOne({ where: { correo: value } });
            if (buscarEstudiante) {
                throw new Error('El correo ya está en uso');
            }
        }),
    body("id_carrera")
        .isInt().withMessage('El id de la carrera debe ser un entero')
        .custom(async value => {
            const carreraExistente = await ModeloEstudiante.sequelize.models.carrera.findOne({ where: { id_carrera: value } });
            if (!carreraExistente) {
                throw new Error('El id de la carrera no existe');
            }
        }),
    controladorEstudiante.guardar
);

rutas.put('/editar',
    query("id_estudiante")
        .isInt().withMessage("El id del estudiante debe ser un entero")
        .custom(async value => {
            const buscarEstudiante = await ModeloEstudiante.findOne({ where: { id_estudiante: value } });
            if (!buscarEstudiante) {
                throw new Error('El id del estudiante no existe');
            }
        }),
    body("nombre_estudiante")
        .optional()
        .isLength({ min: 3, max: 100 }).withMessage('El nombre del estudiante debe tener entre 3 y 100 caracteres'),
    body("correo")
        .optional()
        .isEmail().withMessage('El correo debe ser un email válido')
        .custom(async value => {
            const buscarEstudiante = await ModeloEstudiante.findOne({ where: { correo: value } });
            if (buscarEstudiante) {
                throw new Error('El correo ya está en uso');
            }
        }),
    body("id_carrera")
        .optional()
        .isInt().withMessage('El id de la carrera debe ser un entero')
        .custom(async value => {
            if (value) {
                const carreraExistente = await ModeloEstudiante.sequelize.models.carrera.findOne({ where: { id_carrera: value } });
                if (!carreraExistente) {
                    throw new Error('El id de la carrera no existe');
                }
            }
        }),
    controladorEstudiante.editar
);

rutas.delete('/eliminar',
    query("id_estudiante")
        .isInt().withMessage("El id del estudiante debe ser un entero")
        .custom(async value => {
            const buscarEstudiante = await ModeloEstudiante.findOne({ where: { id_estudiante: value } });
            if (!buscarEstudiante) {
                throw new Error('El id del estudiante no existe');
            }
        }),
    controladorEstudiante.eliminar
);

module.exports = rutas;
