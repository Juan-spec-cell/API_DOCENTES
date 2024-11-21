const { DataTypes } = require('sequelize');
const db = require('../configuracion/db');
const estudiante = require('./Estudiante');
const periodo = require('./periodo');
const asignatura = require('./asignatura');

const matricula = db.define(
    "Matricula",
    {

    },
    {
        tableName: "matriculas",
        timestamps: true
    }
);

estudiante.hasMany(matricula, { foreignKey: 'estudianteId', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
matricula.belongsTo(estudiante, { foreignKey: 'estudianteId', onDelete: 'CASCADE', onUpdate: 'CASCADE' });

periodo.hasMany(matricula, { foreignKey: 'periodoId', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
matricula.belongsTo(periodo, { foreignKey: 'periodoId', onDelete: 'CASCADE', onUpdate: 'CASCADE' });

asignatura.hasMany(matricula, { foreignKey: 'asignaturaId', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
matricula.belongsTo(asignatura, { foreignKey: 'asignaturaId', onDelete: 'CASCADE', onUpdate: 'CASCADE' });

module.exports = matricula;