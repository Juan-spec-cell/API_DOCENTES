const multer = require("multer");
const fs = require("fs"); 
const path = require("path"); 
const {uploadImagenDocente} = require("../configuracion/archivos");
const {uploadImagenEstudiante} = require("../configuracion/archivos"); 
const Docente = require("../modelos/Docente"); 
const Estudiante = require("../modelos/Estudiante");
const {validationResult} = require("express-validator");
const {resizeImagen} = require("../utilidades/resizeImagen"); 

exports.validarImagenDocente = (req,res,next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json(errors.array());
    }
    else {
        uploadImagenDocente(req,res, (err)=> {
            if (err instanceof multer.MulterError){
                res.status(400).json({msj: "Error al cargar la imagen", error: err});
            }
            else if(err){
                res.status(400).json({msj: "Error al cargar la imagen", error: err});
            }
            else {
                next();
            }
        });
    }
}

exports.validarImagenEstudiante = (req,res,next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json(errors.array());
    }
    else {
        uploadImagenEstudiante(req,res, (err)=> {
            if (err instanceof multer.MulterError){
                res.status(400).json({msj: "Error al cargar la imagen", error: err});
            }
            else if(err){
                res.status(400).json({msj: "Error al cargar la imagen", error: err});
            }
            else {
                next();
            }
        });
    }
}

exports.actualizarImagenDocente = async (req,res) => {
    const validacion = validationResult(req);
    if (validacion.errors.lenght >0){
        var msjerror = "";
        validacion.errors.forEach(r =>{
            msjerror = msjerror + r.msg + ". ";
        })
        res.status(400).json({msj: "Hay error en la peticion", error: msjerror});
    }
    else{
        const {id} = req.query;
        if(!req.file){
            return res.status(400).json({msj: "No se pudo enviar la imagen"});
        }
        const nombreImagen = req.file.filename;
        var buscarDocente = await ClientRequest.finOne({where: {id: id}});
        if (!buscarDocente){
            res.json({msj: "El id del docente no existe"});
        }
        else {
            const imagenAnterior = fs.existsSync(path.join(__dirname, "../../../public/img/docentes/" + buscarDocente.imagen));
            if(imagenAnterior){
                fs.unlinkSync(path.join(__dirname, "../../../public/img/docentes/" + buscarDocente.imagen));
                console.log("Imagen eliminada");
            }
            const imagenNueva = fs.existsSync(path.join(__dirname, "../../../public/img/docentes/"+ nombreImagen));
            if (imagenNueva){
                buscarDocente.imagen = nombreImagen;
                buscarDocente.save().
                    then((data)=> {
                        res.status(200).json({id: data.id, imagen: data.imagen});
                    }).catch((er)=>{
                        res.status(500).json(er);
                    });
                    console.log("Imagen actualizada");
            }
            else {
                res.status(400).json({msj: "No se pudo actualizar la imagen"});
            }
        }
    }
}

//***************************** */ 

exports.actualizarImagenEstudiante = async (req,res) => {
    const validacion = validationResult(req);
    if (validacion.errors.lenght >0){
        var msjerror = "";
        validacion.errors.forEach(r =>{
            msjerror = msjerror + r.msg + ". ";
        })
        res.status(400).json({msj: "Hay error en la peticion", error: msjerror});
    }
    else{
        const {id} = req.query;
        if(!req.file){
            return res.status(400).json({msj: "No se pudo enviar la imagen"});
        }
        const nombreImagen = req.file.filename;
        var buscarEstudiante = await ClientRequest.finOne({where: {id: id}});
        if (!buscarEstudiante){
            res.json({msj: "El id del estudiante no existe"});
        }
        else {
            const imagenAnterior = fs.existsSync(path.join(__dirname, "../../../public/img/estudiantes/" + buscarEstudiante.imagen));
            if(imagenAnterior){
                fs.unlinkSync(path.join(__dirname, "../../../public/img/estudiantes/" + buscarEstudiante.imagen));
                console.log("Imagen eliminada");
            }
            const imagenNueva = fs.existsSync(path.join(__dirname, "../../../public/img/estudiantes/"+ nombreImagen));
            if (imagenNueva){
                buscarEstudiante.imagen = nombreImagen;
                buscarEstudiante.save().
                    then((data)=> {
                        res.status(200).json({id: data.id, imagen: data.imagen});
                    }).catch((er)=>{
                        res.status(500).json(er);
                    });
                    console.log("Imagen actualizada");
            }
            else {
                res.status(400).json({msj: "No se pudo actualizar la imagen"});
            }
        }
    }
}