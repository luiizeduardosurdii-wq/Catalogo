import { config } from "../config";
import { MercadoPagoProvider } from "./mercadopago";
import { MockPaymentProvider } from "./mock";
import type { PaymentProvider } from "./types";

export function getPaymentProvider(): PaymentProvider {
  if (config.mercadoPagoAccessToken) {
    return new MercadoPagoProvider();
  }
  return new MockPaymentProvider();
}

export * from "./types";
