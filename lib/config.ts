export const config = {
  paymentsEnabled:
    process.env.PAYMENTS_ENABLED === "true" ||
    process.env.NEXT_PUBLIC_PAYMENTS_ENABLED === "true",
  mercadoPagoAccessToken: process.env.MERCADOPAGO_ACCESS_TOKEN ?? "",
  mercadoPagoWebhookSecret: process.env.MERCADOPAGO_WEBHOOK_SECRET ?? "",
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  authSecret: process.env.AUTH_SECRET ?? "dev-secret-change-in-production",
  pixOrderExpiryMinutes: Number(process.env.PIX_ORDER_EXPIRY_MINUTES ?? "30"),
};
