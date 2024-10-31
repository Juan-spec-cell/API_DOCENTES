const { DataTypes } = require('sequelize');
const sequelize = require('../configuracion/db');

const Asignatura = sequelize.define('Asignatura', {
    id_asignatura: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre_asignatura: {
        type: DataTypes.STRING,
        allowNull: false
    },
    id_docente: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    id_carrera: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    tableName: 'asignaturas' 
});

// Definición de las relaciones
Asignatura.associate = (models) => {
    Asignatura.belongsTo(models.Docente, { foreignKey: 'id_docente' });
    Asignatura.belongsTo(models.Carrera, { foreignKey: 'id_carrera' });
    Asignatura.hasMany(models.Actividad, { foreignKey: 'id_asignatura', as: 'Actividades' });
    Asignatura.hasMany(models.Calificacion, { foreignKey: 'id_asignatura', as: 'Calificaciones' });
};

module.exports = Asignatura;