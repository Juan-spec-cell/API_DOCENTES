const ModeloDocente = require('../modelos/docente');
const ModeloCarrera = require('../modelos/carrera');
const ModeloAsignatura = require('../modelos/asignatura');
const { enviar, errores } = require('../configuracion/ayuda');
const { validationResult } = require('express-validator');

exports.inicio = (req, res) => {
    res.json({ msj: "Página de inicio de Asignaturas" });
};

exports.listar = async (req, res) => {
    let contenido = { tipo: 0, datos: [], msj: [] };
    try {
        const data = await ModeloAsignatura.findAll({
            include: [
                {
                    model: ModeloDocente,
                    attributes: ['primerNombre', 'primerApellido']
                },
                {
                    model: ModeloCarrera,
                    attributes: ['nombre_carrera']
                }
            ]
        });

        contenido.tipo = 1;
        contenido.datos = data.map(asignatura => ({
            id: asignatura.id,
            id_asignatura: asignatura.id_asignatura,
            nombre_asignatura: asignatura.nombre_asignatura,
            nombre_docente: `${asignatura.Docente.primerNombre} ${asignatura.Docente.primerApellido}`,
            nombre_carrera: asignatura.Carrera.nombre_carrera,
            createdAt: asignatura.createdAt,
            updatedAt: asignatura.updatedAt
        }));
        enviar(200, contenido, res);
    } catch (error) {
        contenido.tipo = 0;
        contenido.msj = "Error al cargar los datos de asignaturas";
        enviar(500, contenido, res);
        console.log(error);
    }
};

exports.guardar = async (req, res) => {
    const { nombre_asignatura, primerNombre_docente, primerApellido_docente, nombre_carrera } = req.body;
    let contenido = { tipo: 0, datos: [], msj: [] };
    contenido.msj = errores(validationResult(req));
    if (contenido.msj.length > 0) {
        return enviar(200, contenido, res);
    }

    try {
        if (!nombre_asignatura || !primerNombre_docente || !primerApellido_docente || !nombre_carrera) {
            return res.status(400).json({ error: 'Todos los campos son obligatorios' });
        }

        const docente = await ModeloDocente.findOne({ where: { primerNombre: primerNombre_docente, primerApellido: primerApellido_docente } });
        if (!docente) {
            contenido.msj = 'Docente no encontrado';
            return enviar(404, contenido, res);
        }

        const carrera = await ModeloCarrera.findOne({ where: { nombre_carrera } });
        if (!carrera) {
            contenido.msj = 'Carrera no encontrada';
            return enviar(404, contenido, res);
        }

        const nuevaAsignatura = await ModeloAsignatura.create({
            nombre_asignatura,
            docenteId: docente.id,
            carreraId: carrera.id
        });

        contenido.tipo = 1;
        contenido.datos = {
            nombre_asignatura: nuevaAsignatura.nombre_asignatura,
            nombre_docente: `${docente.primerNombre} ${docente.primerApellido}`,
            nombre_carrera: carrera.nombre_carrera
        };
        contenido.msj = "Asignatura guardada correctamente";
        enviar(201, contenido, res);
    } catch (error) {
        contenido.tipo = 0;
        contenido.msj = "Error en el servidor al guardar la asignatura";
        enviar(500, contenido, res);
    }
};

exports.editar = async (req, res) => {
    const { id } = req.query;
    const { nombre_asignatura, primerNombre_docente, primerApellido_docente, nombre_carrera } = req.body;
    let contenido = { tipo: 0, datos: [], msj: [] };
    contenido.msj = errores(validationResult(req));
    if (contenido.msj.length > 0) {
        return enviar(200, contenido, res);
    }

    try {
        const asignatura = await ModeloAsignatura.findOne({ where: { id } });
        if (!asignatura) {
            contenido.msj = "Asignatura no encontrada";
            return enviar(404, contenido, res);
        }

        let docente;
        if (primerNombre_docente && primerApellido_docente) {
            docente = await ModeloDocente.findOne({ where: { primerNombre: primerNombre_docente, primerApellido: primerApellido_docente } });
            if (!docente) {
                contenido.msj = 'Docente no encontrado';
                return enviar(404, contenido, res);
            }
        }

        let carrera;
        if (nombre_carrera) {
            carrera = await ModeloCarrera.findOne({ where: { nombre_carrera } });
            if (!carrera) {
                contenido.msj = 'Carrera no encontrada';
                return enviar(404, contenido, res);
            }
        }

        await asignatura.update({
            nombre_asignatura: nombre_asignatura || asignatura.nombre_asignatura,
            docenteId: docente ? docente.id : asignatura.docenteId,
            carreraId: carrera ? carrera.id : asignatura.carreraId
        });

        contenido.tipo = 1;
        contenido.datos = {
            id: asignatura.id,
            nombre_asignatura: asignatura.nombre_asignatura,
            nombre_docente: docente ? `${docente.primerNombre} ${docente.primerApellido}` : `${asignatura.Docente?.primerNombre || "No asignado"} ${asignatura.Docente?.primerApellido || "No asignado"}`,
            nombre_carrera: carrera ? carrera.nombre_carrera : asignatura.Carrera?.nombre_carrera || "No asignada"
        };
        contenido.msj = "Asignatura editada correctamente";
        enviar(200, contenido, res);
    } catch (error) {
        contenido.tipo = 0;
        contenido.msj = "Error en el servidor al editar la asignatura";
        enviar(500, contenido, res);
        console.log(error);
    }
};

exports.eliminar = async (req, res) => {
    const { id } = req.query;
    let contenido = { tipo: 0, datos: [], msj: [] };

    try {
        const asignatura = await ModeloAsignatura.findOne({ where: { id } });
        if (!asignatura) {
            contenido.msj = "Asignatura no encontrada";
            return enviar(404, contenido, res);
        }

        await asignatura.destroy();
        contenido.tipo = 1;
        contenido.msj = "Asignatura eliminada correctamente";
        enviar(200, contenido, res);
    } catch (error) {
        contenido.tipo = 0;
        contenido.msj = "Error en el servidor al eliminar la asignatura";
        enviar(500, contenido, res);
    }
};
// Filtros en general
exports.busqueda = async (req, res) => {
    const validacion = validationResult(req);
    if (validacion.errors.length > 0) {
        var msjerror = "";
        validacion.errors.forEach((r) => {
            msjerror = msjerror + r.msg + ". ";
        });
        res.json({ msj: "Hay errores en la petición", error: msjerror });
    } else {
        try {
            const whereClause = {};
            if (req.query.id_asignatura) whereClause.id_asignatura = req.query.id_asignatura;
            if (req.query.nombre) whereClause.nombre_asignatura = req.query.nombre;

            const busqueda = await ModeloAsignatura.findAll({
                where: whereClause,
                include: [
                    {
                        model: ModeloDocente,
                        attributes: ['primerNombre', 'primerApellido']
                    },
                    {
                        model: ModeloCarrera,
                        attributes: ['nombre_carrera']
                    }
                ]
            });
            res.json(busqueda);
        } catch (error) {
            res.json(error);
        }
    }
};

// Filtro para buscar por ID de Asignatura
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
            const busqueda = await ModeloAsignatura.findOne({
                where: { id_asignatura: req.query.id_asignatura },
                include: [
                    {
                        model: ModeloDocente,
                        attributes: ['primerNombre', 'primerApellido']
                    },
                    {
                        model: ModeloCarrera,
                        attributes: ['nombre_carrera']
                    }
                ]
            });
            res.json(busqueda);
        } catch (error) {
            res.json(error);
        }
    }
};

// Asegúrate de que la función esté exportada correctamente
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
            const busqueda = await ModeloAsignatura.findOne({
                where: { id_asignatura: req.query.id_asignatura },
                include: [
                    {
                        model: ModeloDocente,
                        attributes: ['primerNombre', 'primerApellido']
                    },
                    {
                        model: ModeloCarrera,
                        attributes: ['nombre_carrera']
                    }
                ]
            });
            res.json(busqueda);
        } catch (error) {
            res.json(error);
        }
    }
};