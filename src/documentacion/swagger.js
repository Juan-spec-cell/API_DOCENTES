const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express'); 
const path = require('path');


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
        url: 'http://localhost:3002/api', 
        description: "API del sistema de Docentes"
      },
      {
        url: 'http://192.168.50.31:3002/api', 
        description: "API del sistema de Docentes con"
      },
    ],
    components: {
      securitySchemes:{
        BearerAuth:{
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security:[
      {
        BearerAuth: []
      }
    ]
  },
  apis: [path.join(__dirname, '../rutas/**/*.js')], 
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};