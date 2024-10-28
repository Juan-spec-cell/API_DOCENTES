exports.Inicio = (req, res) => {
    const objeto = {
      atributo1: "at1",
      atributo2: "at2",
    };
    const arreglo = [
      {
        atributo1: "at1",
        atributo2: "at2",
      },
      {
        atributo1: "at1",
        atributo2: "at2",
      },
      {
        atributo1: "at1",
        atributo2: "at2",
      },
    ];
    const modulos = [
      {
        nombre: "Inicio",
        rutas: [
          {
            url: "/",
            tipo: "GET",
            parametros: "",
            requeridos: "",
          },
          {
            url: "/otra",
            tipo: "GET",
            parametros: "",
            requeridos: "",
          },
        ],
      },
      {
        nombre: "clientes",
        rutas: [
          {
            url: "/",
            tipo: "GET",
            parametros: "",
            requeridos: "",
          },
          {
            url: "/otra",
            tipo: "GET",
            parametros: "",
            requeridos: "",
          },
        ],
      },
    ];
    const datos = {
      nombre: "Carlos Flores",
      clase: "Programacion Movil II",
      seccion: 1404,
      modulos: modulos,
    };
    res.json(datos);
  };
  
  exports.Otra = (req, res) => {
    res.json({ msj: "Esta en la ruta /otra" });
  };
  
  exports.Datos = (req, res) => {
    const lista = req.body;
    console.log(lista);
    lista.forEach((element) => {
      var { usuario, contrasena } = element;
      console.log(usuario);
      console.log(contrasena);
    });
    res.json({ msj: "Esta en la ruta /datos" });
  };
  
  exports.Modificar = (req, res) => {
    const { id } = req.query;
    const { nombre } = req.body;
    console.log(id);
    console.log(nombre);
    res.json({ msj: "peticion de tipo PUT" });
  };
  
  exports.Eliminar = (req, res) => {
    const { id } = req.query;
    console.log(id);
    res.json({ msj: "Peticion de tipo delete" });
  };
  