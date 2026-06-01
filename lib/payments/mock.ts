import type { PaymentProvider, PixChargeResult } from "./types";

/** Provedor mock para desenvolvimento sem token Mercado Pago */
export class MockPaymentProvider implements PaymentProvider {
  async createPixCharge(params: {
    orderId: string;
    amountCents: number;
  }): Promise<PixChargeResult> {
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 30);
    return {
      externalId: `mock-${params.orderId}`,
      pixCopyPaste: `00020126580014BR.GOV.BCB.PIX0136MOCK-${params.orderId}520400005303986540${(params.amountCents / 100).toFixed(2)}5802BR5925Catalogo Demo6009SAO PAULO62070503***6304ABCD`,
      expiresAt,
    };
  }

  verifyWebhookSignature(): boolean {
    return true;
  }

  parseWebhookPaymentId(body: unknown): string | null {
    const data = body as { mockPaymentId?: string };
    return data.mockPaymentId ?? null;
  }
}
