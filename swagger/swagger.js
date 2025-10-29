import swaggerJsDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Indian Company Bazaar API",
      version: "1.0.0",
      description: "API documentation for Indian Company Bazaar project",
    },
    servers: [
      {
        url: "http://localhost:5000",
      },
    ],
  },
  apis: [
    "./routes/*.js",       // ✅ Swagger looks here for @swagger comments
    "./swagger/*.js"       // ✅ Add this line for your business swagger file
  ],
};

const specs = swaggerJsDoc(options);

export default (app) => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));
};
