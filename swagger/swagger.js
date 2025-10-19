const swaggerJSDoc = require('swagger-jsdoc');
const pkg = require('../package.json');
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Business Marketplace API',
      version: pkg.version,
      description: 'API for business marketplace with buyer/seller/ca/admin roles and verification flow.'
    },
    servers: [{ url: 'http://localhost:5000' }]
  },
  apis: ['./routes/*.js', './models/*.js'],
};
const swaggerSpec = swaggerJSDoc(options);
module.exports = swaggerSpec;
