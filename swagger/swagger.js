const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
  definition: {
    openapi: "3.0.0", // ✅ Must be exactly this key (not "swagger")
    info: {
      title: "Indian Company Bazaar API",
      version: "1.0.0",
      description: "API documentation for Indian Company Bazaar project",
    },
    servers: [
      {
        url: "http://localhost:5000",
        description: "Local server",
      },
      {
        url: "https://indiancompanybazaar.onrender.com",
        description: "Deployed server",
      },
    ],
  },
  apis: ["./routes/*.js"], // ✅ all route files with @swagger docs
};

const swaggerSpec = swaggerJsDoc(options);

module.exports = function (app) {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};
