import { defineMiddlewares } from "@medusajs/framework/http";

export default defineMiddlewares({
  routes: [
    {
      matcher: "/hooks/payment/noda",
      bodyParser: { preserveRawBody: true },
      method: ["POST"],
    },
  ],
});
