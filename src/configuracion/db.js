require('dotenv').config();
const { Sequelize } = require('sequelize');

// Crear una instancia de Sequelize usando las variables de entorno
const db = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT, // Agrega esta línea para el puerto
    dialect: process.env.DB_DIALECT,
    logging: false,// Utiliza el dialecto desde el .env //// Deshabilita el registro de consultas
});

module.exports = db;
