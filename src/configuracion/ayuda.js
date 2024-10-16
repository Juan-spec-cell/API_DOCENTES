exports.enviar = (codigo, contenido, res) =>{
    res.statusCode = codigo;
    res.setHeader("Content-Type", "application/json");
    res.json(contenido);
};
exports.errores = (er)=>{
    ListaMsj=[];
    er.errors.forEach(element => {
        ListaMsj.push({campo: element.path, msj: element.msg});
    });
    return ListaMsj;
};