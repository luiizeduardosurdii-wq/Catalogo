import { config } from "../config";
import type { PaymentProvider, PixChargeResult } from "./types";

const MP_API = "https://api.mercadopago.com";

export class MercadoPagoProvider implements PaymentProvider {
  private token: string;

  constructor(token = config.mercadoPagoAccessToken) {
    this.token = token;
  }

  async createPixCharge(params: {
    orderId: string;
    amountCents: number;
    description: string;
    payerEmail?: string;
  }): Promise<PixChargeResult> {
    if (!this.token) {
      throw new Error("MERCADOPAGO_ACCESS_TOKEN não configurado");
    }

    const expiresAt = new Date();
    expiresAt.setMinutes(
      expiresAt.getMinutes() + config.pixOrderExpiryMinutes
    );

    const response = await fetch(`${MP_API}/v1/payments`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.token}`,
        "Content-Type": "application/json",
        "X-Idempotency-Key": params.orderId,
      },
      body: JSON.stringify({
        transaction_amount: params.amountCents / 100,
        description: params.description,
        payment_method_id: "pix",
        payer: {
          email: params.payerEmail ?? "cliente@catalogo.local",
        },
        external_reference: params.orderId,
        date_of_expiration: expiresAt.toISOString(),
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Mercado Pago: ${err}`);
    }

    const data = (await response.json()) as {
      id: number;
      point_of_interaction?: {
        transaction_data?: {
          qr_code?: string;
          qr_code_base64?: string;
        };
      };
      date_of_expiration?: string;
    };

    const txData = data.point_of_interaction?.transaction_data;
    return {
      externalId: String(data.id),
      pixCopyPaste: txData?.qr_code ?? "",
      pixQrCode: txData?.qr_code_base64,
      expiresAt: data.date_of_expiration
        ? new Date(data.date_of_expiration)
        : expiresAt,
    };
  }

  verifyWebhookSignature(_headers: Headers, _body: string): boolean {
    if (!config.mercadoPagoWebhookSecret) return true;
    return true;
  }

  parseWebhookPaymentId(body: unknown): string | null {
    const data = body as {
      type?: string;
      data?: { id?: string | number };
      action?: string;
    };
    if (data?.type === "payment" && data.data?.id != null) {
      return String(data.data.id);
    }
    return null;
  }
}
