const { DataTypes } = require('sequelize');
const sequelize = require('../configuracion/db');

const Actividad = sequelize.define('Actividad', {
    id_actividad: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    tipo_actividad: {
        type: DataTypes.STRING,
        allowNull: false
    },
    fecha: {
        type: DataTypes.DATE,
        allowNull: false
    },
    id_asignatura: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    tableName: 'actividades'
});

// Definición de las relaciones
Actividad.associate = (models) => {
    Actividad.belongsTo(models.Asignatura, { foreignKey: 'id_asignatura' });
};

module.exports = Actividad;