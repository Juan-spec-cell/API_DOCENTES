const { Router } = require('express');
const { body, query } = require('express-validator');
const controladorMatricula = require('../controladores/controladorMatricula');
const ModeloMatricula = require('../modelos/matricula'); // Asegúrate de que la ruta sea correcta
const ModeloEstudiante = require('../modelos/estudiante'); // Para validar el id_estudiante
const ModeloPeriodo = require('../modelos/periodo'); // Para validar el id_periodo
const rutas = Router();

rutas.get('/', controladorMatricula.inicio);

rutas.get('/listar', controladorMatricula.listar);

rutas.post('/guardar',
    body("id_estudiante")
        .isInt().withMessage('El id del estudiante debe ser un entero')
        .custom(async value => {
            const estudianteExistente = await ModeloEstudiante.findOne({ where: { id_estudiante: value } });
            if (!estudianteExistente) {
                throw new Error('El id del estudiante no existe');
            }
        }),
    body("id_periodo")
        .isInt().withMessage('El id del periodo debe ser un entero')
        .custom(async value => {
            const periodoExistente = await ModeloPeriodo.findOne({ where: { id_periodo: value } });
            if (!periodoExistente) {
                throw new Error('El id del periodo no existe');
            }
        }),
    controladorMatricula.guardar
);

rutas.put('/editar',
    query("id_matricula")
        .isInt().withMessage("El id de la matrícula debe ser un entero")
        .custom(async value => {
            const buscarMatricula = await ModeloMatricula.findOne({ where: { id_matricula: value } });
            if (!buscarMatricula) {
                throw new Error('El id de la matrícula no existe');
            }
        }),
    body("id_estudiante")
        .optional()
        .isInt().withMessage('El id del estudiante debe ser un entero')
        .custom(async value => {
            if (value) {
                const estudianteExistente = await ModeloEstudiante.findOne({ where: { id_estudiante: value } });
                if (!estudianteExistente) {
                    throw new Error('El id del estudiante no existe');
                }
            }
        }),
    body("id_periodo")
        .optional()
        .isInt().withMessage('El id del periodo debe ser un entero')
        .custom(async value => {
            if (value) {
                const periodoExistente = await ModeloPeriodo.findOne({ where: { id_periodo: value } });
                if (!periodoExistente) {
                    throw new Error('El id del periodo no existe');
                }
            }
        }),
    controladorMatricula.editar
);

rutas.delete('/eliminar',
    query("id_matricula")
        .isInt().withMessage("El id de la matrícula debe ser un entero")
        .custom(async value => {
            const buscarMatricula = await ModeloMatricula.findOne({ where: { id_matricula: value } });
            if (!buscarMatricula) {
                throw new Error('El id de la matrícula no existe');
            }
        }),
    controladorMatricula.eliminar
);

module.exports = rutas;
