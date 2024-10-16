const sequelize = require('sequelize');
const db = new sequelize(
    "c.e_docentes",//nombre de la base de datos
    "root", //usuario
    "Juan20022!", //contrasena
    {
        host: "localhost",
        dialect: "mysql",
        port: 3306,
    }
);

module.exports = db;