const multer = require('multer'); 
const path = require('path'); 
const sharp = require('sharp'); 

const resizeImage = async (file) => {
    const {buffer} = file; const {size} = buffer;
    const maxSize = 1 * 1024 * 1024; // 1MB
    if (size > maxSize) {
        const resizedBuffer = await sharp(buffer).resize({width: 800})
              .toBuffer(); 
        return resizedBuffer;
    }
    return buffer;
}; 

const diskStorageDocentes = multer.diskStorage({
    destination: (req, file,cb) => {
        cb(null, path.join(__dirname, "../../public/img/docentes"));
    },
    filename: (req, file, cb) =>{
        if(
            file.mimetype === "image/jpeg" ||
            file.mimetype === "image/png" ||
            file.mimetype === "image/jpg"
        ) {
            const uniqueSuffix = Math.round(Math.random() * (99998 - 10000)) + 10001;

            cb(
                null,
                "docente-" + 
                Date.now() + 
                uniqueSuffix + 
                "-" + 
                req.query.id + 
                "-" + 
                file.mimetype.replace("/",".")
            );
        }
    },
}); 

const diskStorageEstudiantes = multer.diskStorage({
    destination: (req, file,cb) => {
        cb(null, path.join(__dirname, "../../public/img/estudiantes"));
    },
    filename: (req, file, cb) =>{
        if(
            file.mimetype === "image/jpeg" ||
            file.mimetype === "image/png" ||
            file.mimetype === "image/jpg"
        ) {
            const uniqueSuffix = Math.round(Math.random() * (99998 - 10000)) + 10001;

            cb(
                null,
                "estudiante-" + 
                Date.now() + 
                uniqueSuffix + 
                "-" + 
                req.query.id + 
                "-" + 
                file.mimetype.replace("/",".")
            );
        }
    },
}); 

exports.uploadImagenDocente = multer({
    storage: diskStorageDocentes,
    fileFilter: (req, file, cb)=>{
            if(file.mimetype == "image/png" || file.mimetype == "image/jpeg" || file.mimetype == "image/jpg"){
                cb(null, true);
        } else {
            cb(null, false);
            return cb(new Error("Solo se permiten archivos png, jpeg o jpg de imagen"));
        }
    },
    limits: {
        fileSize: 1000000, // 1MB
    },
}).single("imagen"); 

exports.uploadImagenEstudiantes = multer({
    storage: diskStorageEstudiantes,
    fileFilter: (req, file, cb)=>{
            if(file.mimetype == "image/png" || file.mimetype == "image/jpeg" || file.mimetype == "image/jpg"){
                cb(null, true);
        } else {
            cb(null, false);
            return cb(new Error("Solo se permiten archivos png, jpeg o jpg de imagen"));
        }
    },
    limits: {
        fileSize: 1000000, // 1MB
    },
}).single("imagen"); 

