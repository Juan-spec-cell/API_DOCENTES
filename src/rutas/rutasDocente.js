const { Router } = require('express');
const { body, query } = require('express-validator');
const controladorDocente = require('../controladores/controladorDocente');
const ModeloDocente = require('../modelos/docente');
const rutas = Router();

rutas.get('/', controladorDocente.inicio);

rutas.get('/listar', controladorDocente.listar);

rutas.post('/guardar',
    body("nombre")
        .isLength({ min: 3, max: 100 })
        .withMessage('El nombre debe tener entre 3 y 100 caracteres')
        .custom(async value => {
            if (!value) {
                throw new Error('El nombre no permite valores nulos');
            }
        }),
    body("correo")
        .isEmail().withMessage('Debe ser un correo electrónico válido')
        .custom(async value => {
            const buscarDocente = await ModeloDocente.findOne({ where: { correo: value } });
            if (buscarDocente) {
                throw new Error('El correo ya está registrado');
            }
        }),
    controladorDocente.guardar
);

rutas.put('/editar',
    query("id_docente")
        .isInt().withMessage("El id del docente debe ser un entero")
        .custom(async value => {
            if (!value) {
                throw new Error('El id no permite valores nulos');
            } else {
                const buscarDocente = await ModeloDocente.findOne({ where: { id_docente: value } });
                if (!buscarDocente) {
                    throw new Error('El id del docente no existe');
                }
            }
        }),
    body("nombre")
        .isLength({ min: 3, max: 100 })
        .withMessage('El nombre debe tener entre 3 y 100 caracteres'),
    body("correo")
        .isEmail().withMessage('Debe ser un correo electrónico válido'),
    controladorDocente.editar
);

rutas.delete('/eliminar',
    query("id_docente")
        .isInt().withMessage("El id del docente debe ser un entero")
        .custom(async value => {
            if (!value) {
                throw new Error('El id no permite valores nulos');
            } else {
                const buscarDocente = await ModeloDocente.findOne({ where: { id_docente: value } });
                if (!buscarDocente) {
                    throw new Error('El id del docente no existe');
                }
            }
        }),
    controladorDocente.eliminar
);

module.exports = rutas;
