const { DataTypes } = require('sequelize');
const sequelize = require('../configuracion/db');
const asignatura = require('./asignatura');

const actividad = sequelize.define('Actividad', {
    tipo_actividad: {
        type: DataTypes.STRING,
        allowNull: false
    },
    valor: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    fecha: {
        type: DataTypes.DATE,
        allowNull: false
    },
    parcial: {
        type: DataTypes.ENUM,
        values: ['primer parcial', 'segundo parcial', 'tercer parcial', 'reposicion'],
        allowNull: false
    }
}, {
    tableName: 'actividades'
});

asignatura.hasMany(actividad, { foreignKey: 'asignaturaId' });
actividad.belongsTo(asignatura, { foreignKey: 'asignaturaId' });

module.exports = actividad;