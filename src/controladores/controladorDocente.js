const ModeloDocente = require('../modelos/docente');
const ModeloUsuario = require('../modelos/usuario');
const { enviar, errores } = require('../configuracion/ayuda');
const { validationResult } = require('express-validator');

exports.inicio = (req, res) => {
    res.json({ msj: "Hola desde el controlador de docentes" });
};

exports.listar = async (req, res) => {
    let contenido = {
        tipo: 0,
        datos: [],
        msj: [],
    };
    try {
        const data = await ModeloDocente.findAll();
        
        contenido.tipo = 1;
        contenido.datos = data.map(docente => ({
            id_docente: docente.id_docente,
            nombre_docente: docente.nombre,
            apellido_docente: docente.apellido,
            email: docente.email
        }));
        enviar(200, contenido, res);
    } catch (error) {
        contenido.tipo = 0;
        contenido.msj = "Error al cargar los datos de docentes";
        enviar(500, contenido, res);
        console.log(error);
    }
};

exports.guardar = async (req, res) => {
    const { nombre_docente, apellido_docente, email } = req.body;
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
        // Crear nuevo docente
        const nuevoDocente = await ModeloDocente.create({
            nombre: nombre_docente,
            apellido: apellido_docente,
            email: email
        });

        // Preparar la respuesta
        const response = {
            id_docente: nuevoDocente.id_docente,
            nombre_docente: `${nuevoDocente.nombre} ${nuevoDocente.apellido}`,
            email: nuevoDocente.email
        };

        contenido.tipo = 1;
        contenido.datos = response;
        contenido.msj = "Docente guardado correctamente";
        enviar(200, contenido, res);
    } catch (error) {
        contenido.tipo = 0;
        contenido.msj = "Error en el servidor al guardar el docente";
        enviar(500, contenido, res);
        console.log(error);
    }
};

exports.editar = async (req, res) => {
    const { id_docente } = req.query;
    const { nombre_docente, apellido_docente, email } = req.body;
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
        // Buscar el docente por id
        const docente = await ModeloDocente.findOne({ where: { id_docente } });
        if (!docente) {
            return res.status(404).json({ error: 'Docente no encontrado' });
        }

        // Actualizar el docente
        docente.nombre = nombre_docente;
        docente.apellido = apellido_docente;
        docente.email = email;
        await docente.save();

        // Preparar la respuesta
        const response = {
            id_docente: docente.id_docente,
            nombre_docente: `${docente.nombre} ${docente.apellido}`,
            email: docente.email
        };

        contenido.tipo = 1;
        contenido.datos = response;
        contenido.msj = "Docente editado correctamente";
        enviar(200, contenido, res);
    } catch (error) {
        contenido.tipo = 0;
        contenido.msj = "Error en el servidor al editar el docente";
        enviar(500, contenido, res);
        console.log(error);
    }
};

exports.eliminar = async (req, res) => {
    const { id_docente } = req.query;
    let contenido = {
        tipo: 0,
        datos: [],
        msj: [],
    };
    try {
        const docenteExistente = await ModeloDocente.findOne({ where: { id_docente } });
        if (!docenteExistente) {
            contenido.msj = "El docente no existe";
            return enviar(404, contenido, res);
        }

        await ModeloDocente.destroy({ where: { id_docente } });

        contenido.tipo = 1;
        contenido.msj = "Docente eliminado correctamente";
        enviar(200, contenido, res);
    } catch (error) {
        contenido.tipo = 0;
        contenido.msj = "Error en el servidor al eliminar el docente";
        enviar(500, contenido, res);
    }
};

// Filtro para buscar por id de Docente
exports.busqueda_id = async (req, res) => {
    const validacion = validationResult(req);
    if (validacion.errors.length > 0) {
        var msjerror = "";
        validacion.errors.forEach((r) => {
            msjerror = msjerror + r.msg + ". ";
        });
        res.json({ msj: "Hay errores en la petición", error: msjerror });
    } else {
        try {
            const busqueda = await ModeloDocente.findOne({ where: { id_docente: req.query.id } });
            res.json(busqueda);
        } catch (error) {
            res.json(error);
        }
    }
};

// Filtro para buscar por nombre del docente
exports.busqueda_nombre = async (req, res) => {
    const validacion = validationResult(req);
    if (validacion.errors.length > 0) {
        var msjerror = "";
        validacion.errors.forEach((r) => {
            msjerror = msjerror + r.msg + ". ";
        });
        res.json({ msj: "Hay errores en la petición", error: msjerror });
    } else {
        try {
            const busqueda = await ModeloDocente.findOne({ where: { nombre: req.query.nombre } });
            res.json(busqueda);
        } catch (error) {
            res.json(error);
        }
    }
};
