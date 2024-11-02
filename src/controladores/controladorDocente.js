const ModeloDocente = require('../modelos/docente');
const ModeloUsuario = require('../modelos/usuario');
const { enviar, errores } = require('../configuracion/ayuda');
const { validationResult } = require('express-validator');
const argon2 = require('argon2');
const db = require('../configuracion/db');
const { Op } = require('sequelize');
const moment = require('moment');


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



exports.busqueda_id = async (req, res) => {
    const validacion = validationResult(req);
    if (validacion.errors.length > 0) {
      let msjerror = validacion.errors.map((r) => r.msg).join(". ");
      return res.status(400).json({ msj: "Hay errores en la petición", error: msjerror });
    }
  
    const idDocente = req.query.id; // Cambia 'id' si tienes un nombre diferente
    console.log("Buscando docente con ID:", idDocente);
  
    if (!idDocente) {
      return res.status(400).json({ msj: "ID del docente no proporcionado" });
    }
  
    try {
      const busqueda = await ModeloDocente.findOne({
        where: { id: idDocente },
        include: [{
          model: ModeloUsuario, // Asegúrate de importar el modelo de Usuarios
          attributes: ['nombre'], // Solo traer el nombre
        }],
        attributes: ['primerNombre', 'primerApellido', 'createdAt'], // Traer los atributos requeridos
      });
  
      if (!busqueda) {
        return res.status(404).json({ msj: "Docente no encontrado" });
      }
  
      // Formatear la fecha
      const respuesta = {
        primerNombre: busqueda.primerNombre,
        primerApellido: busqueda.primerApellido,
        nombreUsuario: busqueda.Usuario.nombre, // Acceder al nombre del usuario
        fechaCreacion: moment(busqueda.createdAt).format('YYYY-MM-DD HH:mm:ss') // Formatear la fecha
      };
      
      res.json(respuesta);
    } catch (error) {
      console.error("Error en la búsqueda:", error);
      res.status(500).json({ msj: "Error en la búsqueda", error: error.message });
    }
  };




exports.busqueda_nombre = async (req, res) => {
    const validacion = validationResult(req);
    if (validacion.errors.length > 0) {
        let msjerror = "";
        validacion.errors.forEach((r) => {
            msjerror += r.msg + ". ";
        });
        res.json({ msj: "Hay errores en la petición", error: msjerror });
    } else {
        try {
            const { primerNombre, segundoNombre, primerApellido, segundoApellido } = req.query;
            const whereClause = {
                [Op.or]: [
                    { primerNombre: { [Op.like]: `%${primerNombre}%` } },
                    { segundoNombre: { [Op.like]: `%${segundoNombre}%` } },
                    { primerApellido: { [Op.like]: `%${primerApellido}%` } },
                    { segundoApellido: { [Op.like]: `%${segundoApellido}%` } },
                    { 
                        [Op.and]: [
                            { primerNombre: { [Op.like]: `%${primerNombre}%` } },
                            { segundoNombre: { [Op.like]: `%${segundoNombre}%` } }
                        ]
                    },
                    { 
                        [Op.and]: [
                            { primerNombre: { [Op.like]: `%${primerNombre}%` } },
                            { segundoNombre: { [Op.like]: `%${segundoNombre}%` } },
                            { primerApellido: { [Op.like]: `%${primerApellido}%` } }
                        ]
                    },
                    { 
                        [Op.and]: [
                            { primerNombre: { [Op.like]: `%${primerNombre}%` } },
                            { segundoNombre: { [Op.like]: `%${segundoNombre}%` } },
                            { primerApellido: { [Op.like]: `%${primerApellido}%` } },
                            { segundoApellido: { [Op.like]: `%${segundoApellido}%` } }
                        ]
                    }
                ]
            };
            
            // Busca el docente incluyendo la relación con el usuario
            const busqueda = await ModeloDocente.findOne({
                where: whereClause,
                include: [{
                    model: ModeloUsuario, // Asegúrate de que esta relación está definida
                    attributes: ['nombre'] // Cambia 'nombre' si tienes otro campo que desees mostrar
                }]
            });

            // Transformar la respuesta para incluir 'nombreUsuario'
            if (busqueda) {
                const resultado = {
                    id: busqueda.id,
                    primerNombre: busqueda.primerNombre,
                    segundoNombre: busqueda.segundoNombre,
                    primerApellido: busqueda.primerApellido,
                    segundoApellido: busqueda.segundoApellido,
                    email: busqueda.email,
                    nombreUsuario: busqueda.Usuario.nombre // Asumiendo que la relación se llama 'Usuario'
                };
                res.json(resultado);
            } else {
                res.json({ msj: "No se encontró el docente" });
            }
        } catch (error) {
            res.json(error);
        }
    }
};

