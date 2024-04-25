import swagger from "@elysiajs/swagger";

export const useSwagger = () =>
  swagger({
    documentation: {
      info: {
        title: "X(Twitter) Clone API Documentation with ElysiaJS",
        description: "API Documentation for X(Twitter) Clone with ElysiaJS",
        version: "1.0.0",
      },
      tags: [
        { name: "App", description: "General endpoints" },
        { name: "Auth", description: "Authentication endpoints" },
        { name: "Account", description: "Account endpoints" },
        { name: "User", description: "User endpoints" },
        { name: "Tweet", description: "Tweet endpoints" },
        { name: "Follow", description: "Follow endpoints" },
        { name: "Timeline", description: "Timeline endpoints" },
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
