const ModeloDocente = require('../modelos/docente');
const ModeloUsuario = require('../modelos/usuario');
const { enviar, errores } = require('../configuracion/ayuda');
const { validationResult } = require('express-validator');
const argon2 = require('argon2');
const db = require('../configuracion/db');
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
            id_docente: docente.id, 
            primerNombre: docente.primerNombre,
            primerApellido: docente.primerApellido,
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
    // Validar entrada de datos
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json(errors.array());
    }
    
    const t = await db.transaction();
    try {
        const { primerNombre, segundoNombre, primerApellido, segundoApellido, email, contrasena } = req.body;
        
        // Hashear la contraseña
        const hash = await argon2.hash(contrasena, {
            type: argon2.argon2id,
            memoryCost: 2 ** 16, // 64MB
            timeCost: 4,
            parallelism: 2,
        });

        // Crear el usuario con tipoUsuario como 'docente'
        const usuario = await ModeloUsuario.create(
            { 
                nombre: `${primerNombre} ${segundoNombre || ''} ${primerApellido} ${segundoApellido || ''}`, 
                email, 
                tipoUsuario: 'Docente', // Asignar tipo 'docente' por defecto
                contrasena: hash 
            },
            { transaction: t }
        );

        // Crear el docente
        const docente = await ModeloDocente.create(
            { primerNombre, segundoNombre, primerApellido, segundoApellido, email, usuarioId: usuario.id },
            { transaction: t }
        );

        await t.commit();
        res.status(201).json(docente);
    } catch (error) {
        console.error(error);
        await t.rollback();
        res.status(500).json({ error: error.message || 'Error al crear el docente' });
    }
};



exports.editar = async (req, res) => {
    // Validar la entrada de datos
    const errors = validationResult(req);
    let contenido = {
        tipo: 0,
        datos: [],
        msj: [],
    };
    contenido.msj = errores(errors);
    if (contenido.msj.length > 0) {
        return enviar(200, contenido, res);
    }

    const t = await db.transaction();
    try {
        const { id } = req.query;
        const { primerNombre, primerApellido, email } = req.body;

        // Buscar el docente por id
        const docente = await ModeloDocente.findOne({ where: { id }, transaction: t });
        if (!docente) {
            return res.status(404).json({ error: 'Docente no encontrado' });
        }

        // Actualizar el docente
        await docente.update(
            { nombre: primerNombre, apellido: primerApellido, email },
            { transaction: t }
        );

        // Preparar la respuesta
        const response = {
            id: docente.id,
            primerNombre: docente.primerNombre,
            primerApellido: docente.primerApellido,
            email: docente.email,
        };

        contenido.tipo = 1;
        contenido.datos = response;
        contenido.msj = 'Docente editado correctamente';
        await t.commit();
        enviar(200, contenido, res);
    } catch (error) {
        await t.rollback();
        contenido.tipo = 0;
        contenido.msj = 'Error en el servidor al editar el docente';
        enviar(500, contenido, res);
        console.error(error);
    }
};

exports.eliminar = async (req, res) => {
    const t = await db.transaction();
    let contenido = {
        tipo: 0,
        datos: [],
        msj: [],
    };

    try {
        const { id } = req.query;

        // Buscar el docente por id
        const docenteExistente = await ModeloDocente.findOne({ where: { id }, transaction: t });
        if (!docenteExistente) {
            contenido.msj = "El docente no existe";
            return enviar(404, contenido, res);
        }

        // Obtener el usuarioId asociado al docente
        const usuarioId = docenteExistente.usuarioId;

        // Eliminar el docente y el usuario relacionado
        await docenteExistente.destroy({ transaction: t });
        await ModeloUsuario.destroy({ where: { id: usuarioId }, transaction: t });

        // Confirmar la transacción
        await t.commit();
        contenido.tipo = 1;
        contenido.msj = "Docente eliminado correctamente";
        enviar(200, contenido, res);
    } catch (error) {
        // Revertir la transacción en caso de error
        await t.rollback();
        contenido.tipo = 0;
        contenido.msj = "Error en el servidor al eliminar el docente";
        enviar(500, contenido, res);
        console.error(error);
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
            const busqueda = await ModeloDocente.findOne({ where: { id: req.query.id } });
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
            const busqueda = await ModeloDocente.findOne({ where: { nombre: req.query.primerNombre } });
            res.json(busqueda);
        } catch (error) {
            res.json(error);
        }
    }
};
