const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express'); 

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API-DOCENTES',
      version: '1.0.0',
      description: 'Documentación de la API DOCENTES',
    },
    servers: [
      {
        url: 'http://localhost:3001/api_docentes', 
      },
    ],
  },
  apis: [path.join(__dirname, '../rutas/**/*.js')], 
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};
