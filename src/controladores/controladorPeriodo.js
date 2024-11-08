// Importamos el modelo de Periodo
const ModeloPeriodo = require('../modelos/periodo');
// Importamos funciones para enviar respuestas y manejar errores
const { enviar, errores } = require('../configuracion/ayuda');
// Importamos la función de validación de express-validator
const { validationResult } = require('express-validator');
// Importamos la función Op de sequelize para hacer consultas avanzadas
const { Op } = require('sequelize');
// Importamos moment para manejar fechas
const moment = require('moment');

// Función que muestra un mensaje al acceder al controlador de periodos
exports.inicio = (req, res) => {
    res.json({ msj: "Hola desde el controlador de periodos" });
};

// Función que lista todos los periodos
exports.listar = async (req, res) => {
    // Estructura inicial para la respuesta
    let contenido = {
        tipo: 0,  // Tipo 0 indica error; se cambiará a 1 si todo sale bien
        datos: [], // Aquí se guardarán los datos de los periodos
        msj: [],   // Mensajes informativos
    };
    try {
        // Obtenemos todos los periodos de la base de datos
        const data = await ModeloPeriodo.findAll();
        contenido.tipo = 1; // Cambiamos a 1 porque la operación fue exitosa
        // Transformamos los datos para incluir fechas en un formato específico
        contenido.datos = data.map(periodo => ({
            id_periodo: periodo.id,
            nombre_periodo: periodo.nombre_periodo,
            fecha_inicio: moment(periodo.fecha_inicio).format('YYYY-MM-DD'),
            fecha_fin: moment(periodo.fecha_fin).format('YYYY-MM-DD')
        }));
        // Enviamos los datos con código de estado 200
        enviar(200, contenido, res);
    } catch (error) {
        // En caso de error, enviamos un mensaje de error
        contenido.tipo = 0;
        contenido.msj = "Error al cargar los datos de periodos";
        enviar(500, contenido, res);
    }
};

// Función que guarda un nuevo periodo en la base de datos
exports.guardar = async (req, res) => {
    // Verificamos si hay errores en los datos enviados
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return enviar(400, { tipo: 0, msj: errores(errors) }, res);
    }

    // Obtenemos los datos del cuerpo de la solicitud
    const { nombre_periodo, fecha_inicio, fecha_fin } = req.body;
    let contenido = {
        tipo: 0,
        datos: [],
        msj: [],
    };
    try {
        // Creamos un nuevo periodo en la base de datos
        const nuevoPeriodo = await ModeloPeriodo.create({
            nombre_periodo,
            fecha_inicio,
            fecha_fin
        });

        contenido.tipo = 1;
        contenido.datos = nuevoPeriodo; // Guardamos el nuevo periodo en la respuesta
        contenido.msj = "Periodo guardado correctamente";
        enviar(201, contenido, res);
    } catch (error) {
        // En caso de error, enviamos un mensaje de error
        contenido.tipo = 0;
        contenido.msj = "Error en el servidor al guardar el periodo";
        enviar(500, contenido, res);
    }
};

// Función que edita un periodo existente
exports.editar = async (req, res) => {
    // Verificamos si hay errores en los datos enviados
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return enviar(400, { tipo: 0, msj: errores(errors) }, res);
    }

    // Obtenemos el id del periodo y los nuevos datos del cuerpo de la solicitud
    const { id } = req.query;
    const { nombre_periodo, fecha_inicio, fecha_fin } = req.body;
    let contenido = {
        tipo: 0,
        datos: [],
        msj: [],
    };

    try {
        // Buscamos el periodo en la base de datos
        const periodoExistente = await ModeloPeriodo.findOne({ where: { id: id } });
        if (!periodoExistente) {
            // Si no existe, enviamos un mensaje de error
            contenido.msj = "El periodo no existe";
            return enviar(404, contenido, res);
        }

        // Actualizamos el periodo con los nuevos datos
        await ModeloPeriodo.update({
            nombre_periodo,
            fecha_inicio,
            fecha_fin
        }, { where: { id: id } });

        contenido.tipo = 1;
        contenido.msj = "Periodo editado correctamente";
        enviar(200, contenido, res);
    } catch (error) {
        // En caso de error, enviamos un mensaje de error
        contenido.tipo = 0;
        contenido.msj = "Error en el servidor al editar el periodo";
        enviar(500, contenido, res);
    }
};

// Función que elimina un periodo
exports.eliminar = async (req, res) => {
    // Obtenemos el id del periodo que queremos eliminar
    const { id } = req.query;
    let contenido = {
        tipo: 0,
        datos: [],
        msj: [],
    };

    try {
        // Buscamos el periodo en la base de datos
        const periodoExistente = await ModeloPeriodo.findOne({ where: { id: id } });
        if (!periodoExistente) {
            // Si no existe, enviamos un mensaje de error
            contenido.msj = "El periodo no existe";
            return enviar(404, contenido, res);
        }

        // Eliminamos el periodo de la base de datos
        await ModeloPeriodo.destroy({ where: { id: id } });
        contenido.tipo = 1;
        contenido.msj = "Periodo eliminado correctamente";
        enviar(200, contenido, res);
    } catch (error) {
        // En caso de error, enviamos un mensaje de error
        contenido.tipo = 0;
        contenido.msj = "Error en el servidor al eliminar el periodo";
        enviar(500, contenido, res);
    }
};

// Función que busca un periodo por su id
exports.buscarPorId = async (req, res) => {
    // Obtenemos el id del periodo que queremos buscar
    const { id } = req.query;
    let contenido = {
        tipo: 0,
        datos: [],
        msj: [],
    };

    try {
        // Buscamos el periodo en la base de datos
        const periodo = await ModeloPeriodo.findOne({ where: { id: id } });
        if (!periodo) {
            // Si no existe, enviamos un mensaje de error
            contenido.msj = "Periodo no encontrado";
            return enviar(404, contenido, res);
        }

        // Transformamos los datos y los enviamos
        contenido.tipo = 1;
        contenido.datos = {
            id: periodo.id,
            nombre_periodo: periodo.nombre_periodo,
            fecha_inicio: moment(periodo.fecha_inicio).format('YYYY-MM-DD'),
            fecha_fin: moment(periodo.fecha_fin).format('YYYY-MM-DD')
        };
        enviar(200, contenido, res);
    } catch (error) {
        // En caso de error, enviamos un mensaje de error
        contenido.tipo = 0;
        contenido.msj = "Error en el servidor al buscar el periodo";
        enviar(500, contenido, res);
    }
};

// Función que busca periodos por nombre usando un patrón de búsqueda
exports.buscarPorNombre = async (req, res) => {
    // Obtenemos el nombre que queremos buscar
    const { nombre_periodo } = req.query;
    let contenido = {
        tipo: 0,
        datos: [],
        msj: [],
    };

    try {
        // Buscamos periodos que contengan el nombre especificado
        const periodos = await ModeloPeriodo.findAll({
            where: {
                nombre_periodo: {
                    [Op.like]: `%${nombre_periodo}%` // Buscamos usando un patrón
                }
            }
        });

        if (periodos.length === 0) {
            // Si no se encuentran resultados, enviamos un mensaje
            contenido.msj = "No se encontraron periodos con el nombre especificado";
            return enviar(404, contenido, res);
        }

        // Transformamos los datos y los enviamos
        contenido.tipo = 1;
        contenido.datos = periodos.map(periodo => ({
            id_periodo: periodo.id,
            nombre_periodo: periodo.nombre_periodo,
            fecha_inicio: moment(periodo.fecha_inicio).format('YYYY-MM-DD'),
            fecha_fin: moment(periodo.fecha_fin).format('YYYY-MM-DD')
        }));
        enviar(200, contenido, res);
    } catch (error) {
        // En caso de error, enviamos un mensaje de error
        contenido.tipo = 0;
        contenido.msj = "Error en el servidor al buscar el periodo";
        enviar(500, contenido, res);
    }
};
