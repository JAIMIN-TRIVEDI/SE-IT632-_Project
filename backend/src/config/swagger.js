import swaggerJSDoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Hostezy API",
      version: "1.0.0",
      description: "API documentation for Hostezy Smart Hostel & Mess System"
    },
    servers: [
      {
        url: "http://localhost:5000/api/v1"
      }
    ]
  },
  apis: ["./src/routes/*.js"]
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;