const ModeloEstudiante = require('../modelos/estudiante');
const { enviar, errores } = require('../configuracion/ayuda');
const { validationResult } = require('express-validator');

exports.inicio = (req, res) => {
    res.json({ msj: "Hola desde el controlador de estudiantes" });
};

exports.listar = async (req, res) => {
    let contenido = {
        tipo: 0,
        datos: [],
        msj: [],
    };
    try {
        const data = await ModeloEstudiante.findAll();
        contenido.tipo = 1;
        contenido.datos = data;
        enviar(200, contenido, res);
    } catch (error) {
        contenido.tipo = 0;
        contenido.msj = "Error al cargar los datos de estudiantes";
        enviar(500, contenido, res);
    }
};

exports.guardar = async (req, res) => {
    const { nombre_estudiante, correo, id_carrera } = req.body;
    let contenido = {
        tipo: 0,
        datos: [],
        msj: [],
    };
    contenido.msj = errores(validationResult(req));
    if (contenido.msj.length > 0) {
        return enviar(200, contenido, res);
    }
    try {
        const data = await ModeloEstudiante.create({ nombre_estudiante, correo, id_carrera });
        contenido.tipo = 1;
        contenido.datos = data;
        contenido.msj = "Estudiante guardado correctamente";
        enviar(200, contenido, res);
    } catch (error) {
        contenido.tipo = 0;
        contenido.msj = "Error en el servidor al guardar el estudiante";
        enviar(500, contenido, res);
    }
};

exports.editar = async (req, res) => {
    const { id_estudiante } = req.query;
    let contenido = {
        tipo: 0,
        datos: [],
        msj: [],
    };
    contenido.msj = errores(validationResult(req));
    if (contenido.msj.length > 0) {
        return enviar(200, contenido, res);
    }
    try {
        await ModeloEstudiante.update(req.body, { where: { id_estudiante } });
        contenido.tipo = 1;
        contenido.msj = "Estudiante editado correctamente";
        enviar(200, contenido, res);
    } catch (error) {
        contenido.tipo = 0;
        contenido.msj = "Error en el servidor al editar el estudiante";
        enviar(500, contenido, res);
    }
};

exports.eliminar = async (req, res) => {
    const { id_estudiante } = req.query;
    let contenido = {
        tipo: 0,
        datos: [],
        msj: [],
    };
    try {
        const estudianteExistente = await ModeloEstudiante.findOne({ where: { id_estudiante } });
        if (!estudianteExistente) {
            contenido.msj = "El estudiante no existe";
            return enviar(404, contenido, res);
        }

        await ModeloEstudiante.destroy({ where: { id_estudiante } });
        contenido.tipo = 1;
        contenido.msj = "Estudiante eliminado correctamente";
        enviar(200, contenido, res);
    } catch (error) {
        contenido.tipo = 0;
        contenido.msj = "Error en el servidor al eliminar el estudiante";
        enviar(500, contenido, res);
    }
};
