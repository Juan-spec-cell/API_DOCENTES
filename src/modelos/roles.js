const sequelize = require("sequelize");
const db = require("../configuracion/db");

const Roles = db.define(
  "Roles",
  {
    id_rol: {
      type: sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    nombre_rol: {
      type: sequelize.STRING(50),
      allowNull: false,
    },
  },
  {
    tableName: "roles",
    timestamps: true,
  }
);

// Sincronizar el modelo y agregar roles predeterminados
Roles.sync({ force: false }).then(() => {
  // Agregar roles predeterminados si no existen
  Roles.findOrCreate({ where: { nombre_rol: "Estudiante" } });
  Roles.findOrCreate({ where: { nombre_rol: "Docente" } });
});

module.exports = Roles;