const ModeloMatricula = require('../modelos/matricula');
const ModeloEstudiante = require('../modelos/Estudiante');
const ModeloPeriodo = require('../modelos/periodo');
const ModeloAsignatura = require('../modelos/asignatura');
const { enviar, errores } = require('../configuracion/ayuda');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');
const moment = require('moment');

exports.inicio = (req, res) => {
    res.json({ msj: "Hola desde el controlador de matrículas" });
};

exports.listar = async (req, res) => {
    let contenido = {
        tipo: 0,
        datos: [],
        msj: [],
    };
    try {
        const data = await ModeloMatricula.findAll({
            include: [
                {
                    model: ModeloEstudiante,
                    attributes: ['primerNombre', 'primerApellido', 'email']
                },
                {
                    model: ModeloPeriodo,
                    attributes: ['nombre_periodo']
                },
                {
                    model: ModeloAsignatura,
                    attributes: ['id', 'nombre_asignatura']
                }
            ]
        });

        const matriculasMap = new Map();

        data.forEach(matricula => {
            const estudianteId = matricula.estudianteId;
            if (!matriculasMap.has(estudianteId)) {
                matriculasMap.set(estudianteId, {
                    id: matricula.id,
                    primerNombre: matricula.Estudiante.primerNombre,
                    primerApellido: matricula.Estudiante.primerApellido,
                    email: matricula.Estudiante.email,
                    nombre_periodo: matricula.Periodo.nombre_periodo,
                    asignaturas: []
                });
            }
            matriculasMap.get(estudianteId).asignaturas.push({
                id: matricula.Asignatura.id,
                nombre_asignatura: matricula.Asignatura.nombre_asignatura
            });
        });

        contenido.tipo = 1;
        contenido.datos = Array.from(matriculasMap.values());
        enviar(200, contenido, res);
    } catch (error) {
        contenido.tipo = 0;
        contenido.msj = "Error al cargar los datos de matrículas";
        enviar(500, contenido, res);
        console.log(error);
    }
};

exports.guardar = async (req, res) => {
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
        const { estudianteId, periodoId, asignaturas } = req.body;

        // Verificar si el estudiante ya está matriculado en el periodo
        let matriculaExistente = await ModeloMatricula.findOne({
            where: {
                estudianteId,
                periodoId
            }
        });

        if (!matriculaExistente) {
            // Crear nueva matrícula
            matriculaExistente = await ModeloMatricula.create({
                estudianteId,
                periodoId
            });
        }

        // Agregar las nuevas asignaturas a la matrícula existente
        for (const asignaturaId of asignaturas) {
            const asignaturaExistente = await ModeloMatricula.findOne({
                where: {
                    estudianteId,
                    periodoId,
                    asignaturaId
                }
            });
            if (!asignaturaExistente) {
                await ModeloMatricula.create({
                    estudianteId,
                    periodoId,
                    asignaturaId
                });
            }
        }

        // Obtener todas las asignaturas de la matrícula
        const matriculasConAsignaturas = await ModeloMatricula.findAll({
            where: {
                estudianteId,
                periodoId
            },
            include: [
                {
                    model: ModeloEstudiante,
                    attributes: ['primerNombre', 'primerApellido', 'email']
                },
                {
                    model: ModeloAsignatura,
                    attributes: ['id', 'nombre_asignatura']
                }
            ]
        });

        if (matriculasConAsignaturas.length > 0) {
            contenido.tipo = 1;
            contenido.datos = {
                id: matriculaExistente.id,
                primerNombre: matriculasConAsignaturas[0].Estudiante.primerNombre,
                primerApellido: matriculasConAsignaturas[0].Estudiante.primerApellido,
                email: matriculasConAsignaturas[0].Estudiante.email,
                asignaturas: matriculasConAsignaturas.map(matricula => ({
                    id: matricula.Asignatura ? matricula.Asignatura.id : null,
                    nombre_asignatura: matricula.Asignatura ? matricula.Asignatura.nombre_asignatura : null
                }))
            };
            contenido.msj = "Matrícula guardada correctamente";
        } else {
            contenido.tipo = 0;
            contenido.msj = "No se encontraron asignaturas para la matrícula";
        }

        enviar(200, contenido, res);
    } catch (error) {
        contenido.tipo = 0;
        contenido.msj = "Error en el servidor al guardar la matrícula";
        enviar(500, contenido, res);
        console.log(error);
    }
};

exports.editar = async (req, res) => {
    const { id } = req.query;
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
        const { estudianteId, periodoId, asignaturaId } = req.body;
        const matriculaExistente = await ModeloMatricula.findOne({ where: { id } });
        if (!matriculaExistente) {
            contenido.msj = "La matrícula no existe";
            return enviar(404, contenido, res);
        }

        // Actualizar la matrícula
        await ModeloMatricula.update({
            estudianteId,
            periodoId,
            asignaturaId
        }, { where: { id } });

        contenido.tipo = 1;
        contenido.msj = "Matrícula editada correctamente";
        enviar(200, contenido, res);
    } catch (error) {
        contenido.tipo = 0;
        contenido.msj = "Error en el servidor al editar la matrícula";
        enviar(500, contenido, res);
    }
};

exports.eliminar = async (req, res) => {
    const { id } = req.query;
    let contenido = {
        tipo: 0,
        datos: [],
        msj: [],
    };
    try {
        const matriculaExistente = await ModeloMatricula.findOne({ where: { id } });
        if (!matriculaExistente) {
            contenido.msj = "La matrícula no existe";
            return enviar(404, contenido, res);
        }

        await ModeloMatricula.destroy({ where: { id } });
        contenido.tipo = 1;
        contenido.msj = "Matrícula eliminada correctamente";
        enviar(200, contenido, res);
    } catch (error) {
        contenido.tipo = 0;
        contenido.msj = "Error en el servidor al eliminar la matrícula";
        enviar(500, contenido, res);
    }
};

exports.buscarPorId = async (req, res) => {
    let contenido = {
        tipo: 0,
        datos: [],
        msj: [],
    };
    try {
        const { id } = req.query;
        const matricula = await ModeloMatricula.findOne({
            where: { id },
            include: [
                {
                    model: ModeloEstudiante,
                    attributes: ['primerNombre', 'primerApellido']
                },
                {
                    model: ModeloPeriodo,
                    attributes: ['nombre_periodo']
                },
                {
                    model: ModeloAsignatura,
                    attributes: ['nombre_asignatura']
                }
            ]
        });

        if (!matricula) {
            contenido.msj = "Matrícula no encontrada";
            return enviar(404, contenido, res);
        }

        contenido.tipo = 1;
        contenido.datos = {
            id: matricula.id,
            nombre_estudiante: `${matricula.Estudiante.primerNombre} ${matricula.Estudiante.primerApellido}`,
            nombre_periodo: matricula.Periodo.nombre_periodo,
            nombre_asignatura: matricula.Asignatura.nombre_asignatura,
            createdAt: matricula.createdAt,
            updatedAt: matricula.updatedAt
        };
        enviar(200, contenido, res);
    } catch (error) {
        contenido.tipo = 0;
        contenido.msj = "Error al buscar la matrícula";
        enviar(500, contenido, res);
        console.log(error);
    }
};
