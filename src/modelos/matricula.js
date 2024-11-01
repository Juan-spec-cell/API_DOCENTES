const { DataTypes } = require('sequelize');
const db = require('../configuracion/db');
const estudiante = require('./estudiante');
const periodo = require('./periodo');

const matricula = db.define(
    "Matricula",
    {

    },
    {
        tableName: "matriculas",
        timestamps: true
    }
);

estudiante.hasMany(matricula, { foreignKey: 'estudianteId' });
matricula.belongsTo(estudiante, { foreignKey: 'estudianteId' });

periodo.hasMany(matricula, { foreignKey: 'periodoId' });
matricula.belongsTo(periodo, { foreignKey: 'periodoId' });

module.exports = matricula;