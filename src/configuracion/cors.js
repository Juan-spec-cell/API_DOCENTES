const corsOptions = {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Permitir estos métodos
    allowedHeaders: ['Content-Type', 'Authorization'], // Permitir ciertos encabezados
};

module.exports = corsOptions;