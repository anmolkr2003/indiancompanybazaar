// swagger.js
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
  definition: {
    openapi: "3.0.0", // ✅ must be 'openapi', not 'swagger'
    info: {
      title: "Indian Company Bazaar API",
      version: "1.0.0",
      description: "API documentation for Indian Company Bazaar project",
    },
    servers: [
  {
    url: "https://indiancompanybazaar.onrender.com", // ✅ use your Render base URL
    description: "Production server"
  },
  {
    url: "http://localhost:5000",
    description: "Local server"
  }
]
,
  },
  apis: ["./routes/*.js"], // 👈 Make sure this path matches your route folder
};

const swaggerSpec = swaggerJsDoc(options);

function swaggerDocs(app) {
  // Serve Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));



  // 👇 Serve raw Swagger JSON for debugging
  app.get("/swagger.json", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });
}

module.exports = swaggerDocs;
