import swaggerJsDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options = {
  definition: {
    openapi: "3.0.0", // ✅ REQUIRED field for Swagger to work
    info: {
      title: "Indian Company Bazaar API",
      version: "1.0.0", // ✅ REQUIRED field for info section
      description: "API documentation for Indian Company Bazaar project",
    },
    servers: [
  {
    url: "http://localhost:5000",
    description: "Local server",
  },
  {
    url: "https://indiancompanybazaar.onrender.com",
    description: "Production server",
  }
],

  },

  // 👇 Point to all route and swagger files where you defined @swagger tags
  apis: [
    "./routes/*.js",
    "./swagger/*.js",
  ],
};

const swaggerSpec = swaggerJsDoc(options);

export default function swaggerDocs(app) {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}
