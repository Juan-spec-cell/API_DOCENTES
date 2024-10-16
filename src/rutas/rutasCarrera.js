const { Router } = require('express');
const { body, query } = require('express-validator');
const controladorCarrera = require('../controladores/controladorCarrera');
const ModeloCarrera = require('../modelos/carrera');
const rutas = Router();

rutas.get('/', controladorCarrera.inicio);
rutas.get('/listar', controladorCarrera.listar);
rutas.post('/guardar',
    body("nombre_carrera").isLength({ min: 3, max: 100 }).withMessage('El nombre de la carrera debe tener entre 3 y 100 caracteres')
    .custom(async value => {
        if (!value) {
            throw new Error('El nombre de la carrera no permite valores nulos');
        } else {
            const buscarCarrera = await ModeloCarrera.findOne({ where: { nombre_carrera: value } });
            if (buscarCarrera) {
                throw new Error('El nombre de la carrera ya existe');
            }
        }
    }),
    body("facultad").isLength({ min: 3, max: 100 }).withMessage('La facultad debe tener entre 3 y 100 caracteres')
    .custom(async value => {
        if (!value) {
            throw new Error('La facultad no permite valores nulos');
        }
    }),
    controladorCarrera.guardar);
    
rutas.put('/editar',
    query("id_carrera").isInt().withMessage("El id de la carrera debe ser un entero")
    .custom(async value => {
        if (!value) {
            throw new Error('El id no permite valores nulos');
        } else {
            const buscarCarrera = await ModeloCarrera.findOne({ where: { id_carrera: value } });
            if (!buscarCarrera) {
                throw new Error('El id de la carrera no existe');
            }
        }
    }),
    body("nombre_carrera").isLength({ min: 3, max: 100 }).withMessage('El nombre de la carrera debe tener entre 3 y 100 caracteres'),
    body("facultad").isLength({ min: 3, max: 100 }).withMessage('La facultad debe tener entre 3 y 100 caracteres'),
    controladorCarrera.editar);

rutas.delete('/eliminar',
    query("id_carrera").isInt().withMessage("El id de la carrera debe ser un entero")
    .custom(async value => {
        if (!value) {
            throw new Error('El id no permite valores nulos');
        } else {
            const buscarCarrera = await ModeloCarrera.findOne({ where: { id_carrera: value } });
            if (!buscarCarrera) {
                throw new Error('El id de la carrera no existe');
            }
        }
    }),
    controladorCarrera.eliminar);

module.exports = rutas;
