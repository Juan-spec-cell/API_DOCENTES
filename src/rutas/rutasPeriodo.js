const { Router } = require('express');
const { body, query } = require('express-validator');
const controladorPeriodo = require('../controladores/controladorPeriodo');
const ModeloPeriodo = require('../modelos/periodo'); // Asegúrate de que la ruta sea correcta
const rutas = Router();

/**
 * @swagger
 * /periodos:
 *   get:
 *     summary: Muestra un mensaje de bienvenida
 *     tags: [Periodos]
 *     responses:
 *       200:
 *         description: Mensaje de bienvenida de la API.
 */
rutas.get('/', controladorPeriodo.inicio);

rutas.get('/listar', controladorPeriodo.listar);

rutas.post('/guardar',
    body("nombre_periodo")
        .isLength({ min: 3, max: 100 }).withMessage('El nombre del periodo debe tener entre 3 y 100 caracteres')
        .custom(async value => {
            if (!value) {
                throw new Error('El nombre del periodo no permite valores nulos');
            } else {
                const buscarPeriodo = await ModeloPeriodo.findOne({ where: { nombre_periodo: value } });
                if (buscarPeriodo) {
                    throw new Error('El nombre del periodo ya existe');
                }
            }
        }),
    body("fecha_inicio")
        .isISO8601().withMessage('La fecha de inicio debe ser una fecha válida')
        .custom((value, { req }) => {
            if (new Date(value) >= new Date(req.body.fecha_fin)) {
                throw new Error('La fecha de inicio debe ser anterior a la fecha de fin');
            }
            return true;
        }),
    body("fecha_fin")
        .isISO8601().withMessage('La fecha de fin debe ser una fecha válida'),
    controladorPeriodo.guardar
);

rutas.put('/editar',
    query("id_periodo")
        .isInt().withMessage("El id del periodo debe ser un entero")
        .custom(async value => {
            const buscarPeriodo = await ModeloPeriodo.findOne({ where: { id_periodo: value } });
            if (!buscarPeriodo) {
                throw new Error('El id del periodo no existe');
            }
        }),
    body("nombre_periodo")
        .optional()
        .isLength({ min: 3, max: 100 }).withMessage('El nombre del periodo debe tener entre 3 y 100 caracteres')
        .custom(async value => {
            if (value) {
                const buscarPeriodo = await ModeloPeriodo.findOne({ where: { nombre_periodo: value } });
                if (buscarPeriodo) {
                    throw new Error('El nombre del periodo ya existe');
                }
            }
        }),
    body("fecha_inicio")
        .optional()
        .isISO8601().withMessage('La fecha de inicio debe ser una fecha válida')
        .custom((value, { req }) => {
            if (value && new Date(value) >= new Date(req.body.fecha_fin)) {
                throw new Error('La fecha de inicio debe ser anterior a la fecha de fin');
            }
            return true;
        }),
    body("fecha_fin")
        .optional()
        .isISO8601().withMessage('La fecha de fin debe ser una fecha válida'),
    controladorPeriodo.editar
);

rutas.delete('/eliminar',
    query("id_periodo")
        .isInt().withMessage("El id del periodo debe ser un entero")
        .custom(async value => {
            const buscarPeriodo = await ModeloPeriodo.findOne({ where: { id_periodo: value } });
            if (!buscarPeriodo) {
                throw new Error('El id del periodo no existe');
            }
        }),
    controladorPeriodo.eliminar
);

module.exports = rutas;
