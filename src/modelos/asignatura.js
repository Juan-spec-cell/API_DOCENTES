const sequelize = require('sequelize');
const db = require('../configuracion/db');

const Asignatura = db.define(
    "asignatura",
    {
        id_asignatura: {
            type: sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        nombre_asignatura: {
            type: sequelize.STRING(100),
            allowNull: false,
        },
        id_docente: {
            type: sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'docentes',
                key: 'id_docente',
            }
        },
        id_carrera: {
            type: sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'carreras',
                key: 'id_carrera',
            }
        }
    },
    {
        tableName: "asignaturas"
    }
);

// Definimos las relaciones en este método
Asignatura.relaciones = (models) => {
    Asignatura.belongsTo(models.Docente, { foreignKey: 'id_docente' });
    Asignatura.belongsTo(models.Carrera, { foreignKey: 'id_carrera' });

    Asignatura.hasMany(models.Calificacion, { foreignKey: 'id_asignatura' });
    Asignatura.hasMany(models.Asistencia, { foreignKey: 'id_asignatura' });
    Asignatura.hasMany(models.Actividad, { foreignKey: 'id_asignatura' });
};

module.exports = Asignatura;