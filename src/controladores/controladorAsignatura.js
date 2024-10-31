const ModeloDocente = require('../modelos/docente');
const ModeloCarrera = require('../modelos/carrera');
const ModeloAsignatura = require('../modelos/asignatura');

exports.inicio = (req, res) => {
    res.json({ msj: "Pagina de inicio de Asignaturas" });
};

exports.listar = async (req, res) => {
    let contenido = { tipo: 0, datos: [], msj: [] };
    try {
        const data = await ModeloAsignatura.findAll({
            include: [
                {
                    model: ModeloDocente,
                    attributes: ['nombre', 'apellido']
                },
                {
                    model: ModeloCarrera,
                    attributes: ['nombre_carrera']
                }
            ]
        });

        contenido.tipo = 1;
        contenido.datos = data.map(asignatura => ({
            id_asignatura: asignatura.id_asignatura,
            nombre_asignatura: asignatura.nombre_asignatura,
            nombre_docente: `${asignatura.Docente.nombre} ${asignatura.Docente.apellido}`,
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
    const { nombre_asignatura, nombre_docente, apellido_docente, nombre_carrera } = req.body;

    try {
        // Verificar que los campos requeridos no estén vacíos
        if (!nombre_asignatura || !nombre_docente || !apellido_docente || !nombre_carrera) {
            return res.status(400).json({ error: 'Todos los campos son obligatorios' });
        }

        // Buscar el docente por nombre y apellido
        const docente = await ModeloDocente.findOne({ where: { nombre: nombre_docente, apellido: apellido_docente } });
        if (!docente) {
            return res.status(404).json({ error: 'Docente no encontrado' });
        }

        // Buscar la carrera por nombre
        const carrera = await ModeloCarrera.findOne({ where: { nombre_carrera } });
        if (!carrera) {
            return res.status(404).json({ error: 'Carrera no encontrada' });
        }

        // Crear nueva asignatura
        const nuevaAsignatura = await ModeloAsignatura.create({
            nombre_asignatura,
            id_docente: docente.id_docente,
            id_carrera: carrera.id_carrera
        });

        // Preparar la respuesta
        const response = {
            nombre_asignatura: nuevaAsignatura.nombre_asignatura,
            nombre_docente: `${docente.nombre} ${docente.apellido}`,
            nombre_carrera: carrera.nombre_carrera
        };

        return res.status(201).json(response);
    } catch (error) {
        console.log(error);
        return res.status(400).json({ error: error.message });
    }
};

exports.editar = async (req, res) => {
    const { id_asignatura } = req.query;
    const { nombre_asignatura, nombre_docente, apellido_docente, nombre_carrera } = req.body;

    try {
        const asignatura = await ModeloAsignatura.findOne({ where: { id_asignatura } });
        if (!asignatura) {
            return res.status(404).json({ error: 'Asignatura no encontrada' });
        }

        // Buscar el docente por nombre y apellido si se proporcionan
        let docente;
        if (nombre_docente && apellido_docente) {
            docente = await ModeloDocente.findOne({ where: { nombre: nombre_docente, apellido: apellido_docente } });
            if (!docente) {
                return res.status(404).json({ error: 'Docente no encontrado' });
            }
        }

        // Buscar la carrera por nombre si se proporciona
        let carrera;
        if (nombre_carrera) {
            carrera = await ModeloCarrera.findOne({ where: { nombre_carrera } });
            if (!carrera) {
                return res.status(404).json({ error: 'Carrera no encontrada' });
            }
        }

        // Actualizar la asignatura
        await asignatura.update({
            nombre_asignatura: nombre_asignatura || asignatura.nombre_asignatura,
            id_docente: docente ? docente.id_docente : asignatura.id_docente,
            id_carrera: carrera ? carrera.id_carrera : asignatura.id_carrera
        });

        // Preparar la respuesta
        const response = {
            id_asignatura: asignatura.id_asignatura,
            nombre_asignatura: asignatura.nombre_asignatura,
            nombre_docente: docente ? `${docente.nombre} ${docente.apellido}` : `${asignatura.Docente?.nombre || "No asignado"} ${asignatura.Docente?.apellido || "No asignado"}`,
            nombre_carrera: carrera ? carrera.nombre_carrera : asignatura.Carrera?.nombre_carrera || "No asignada"
        };

        return res.status(200).json(response);
    } catch (error) {
        console.log(error);
        return res.status(400).json({ error: error.message });
    }
};

exports.eliminar = async (req, res) => {
    const { id_asignatura } = req.query;

    try {
        const asignatura = await ModeloAsignatura.findOne({ where: { id_asignatura } });
        if (!asignatura) {
            return res.status(404).json({ error: 'Asignatura no encontrada' });
        }

        await asignatura.destroy();
        return res.status(200).json({ message: 'Asignatura eliminada exitosamente' });
    } catch (error) {
        console.log(error);
        return res.status(400).json({ error: error.message });
    }
};

function enviar(status, contenido, res) {
    res.status(status).json(contenido);
}
