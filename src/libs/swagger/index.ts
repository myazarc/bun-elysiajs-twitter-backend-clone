import swagger from "@elysiajs/swagger";

export const useSwagger = () =>
  swagger({
    documentation: {
      info: {
        title: "Elysia",
        description: "Elysia API Documentation",
        version: "1.0.0",
      },
      tags: [
        { name: "App", description: "General endpoints" },
        { name: "Auth", description: "Authentication endpoints" },
      ],

      components: {
        securitySchemes: {
          BearerAuth: {
            type: "http",
            scheme: "bearer",
          },
        },
      },
    },
  });
