export interface PixChargeResult {
  externalId: string;
  pixCopyPaste: string;
  pixQrCode?: string;
  expiresAt: Date;
}

export interface PaymentProvider {
  createPixCharge(params: {
    orderId: string;
    amountCents: number;
    description: string;
    payerEmail?: string;
  }): Promise<PixChargeResult>;

  verifyWebhookSignature(
    headers: Headers,
    body: string
  ): boolean;

  parseWebhookPaymentId(body: unknown): string | null;
}
