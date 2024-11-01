const { DataTypes } = require('sequelize');
const sequelize = require('../configuracion/db');
const docente = require('./docente');
const carrera = require('./carrera');

const asignatura = sequelize.define('Asignatura', {
    nombre_asignatura: {
        type: DataTypes.STRING,
        allowNull: false
    },
}, {
    tableName: 'asignaturas'
});

// Definición de las relaciones

docente.hasMany(asignatura, { foreignKey: 'docenteId' });
asignatura.belongsTo(docente, { foreignKey: 'docenteId' });

carrera.hasMany(asignatura, { foreignKey: 'carreraId' });
asignatura.belongsTo(carrera, { foreignKey: 'carreraId' });


module.exports = asignatura;