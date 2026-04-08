const { defineConfig } = require("@medusajs/framework/utils");

const getRequiredSecret = (envVar, devFallback) => {
  const value = process.env[envVar];
  if (!value && process.env.NODE_ENV === "production") {
    throw new Error(`${envVar} is required in production. Set it via environment variables.`);
  }
  return value || devFallback;
};

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL || "postgres://medusa:medusa@localhost:5432/medusa",
    redisUrl: process.env.REDIS_URL || "redis://localhost:6379",
    http: {
      storeCors: process.env.STORE_CORS || "http://localhost:8000,https://riedu.kubexa.tech",
      adminCors: process.env.ADMIN_CORS || "http://localhost:5173,https://admin.riedu.kubexa.tech",
      authCors: process.env.AUTH_CORS || "http://localhost:5173,https://admin.riedu.kubexa.tech",
      jwtSecret: getRequiredSecret("JWT_SECRET", "dev-only-jwt-secret-change-me"),
      cookieSecret: getRequiredSecret("COOKIE_SECRET", "dev-only-cookie-secret-change-me"),
    },
  },
  modules: [
    {
      resolve: "@medusajs/medusa/payment",
      options: {
        providers: [
          {
            resolve: "./src/modules/noda-payment",
            id: "noda",
            options: {
              apiKey: process.env.NODA_API_KEY,
              baseUrl: process.env.NODA_BASE_URL || "https://api-sandbox.noda.live",
              webhookSecret: process.env.NODA_WEBHOOK_SECRET,
            },
          },
        ],
      },
    },
  ],
  admin: {
    path: process.env.ADMIN_PATH || `/app`,
    backendUrl: process.env.BACKEND_URL || "http://localhost:9000",
  },
});
