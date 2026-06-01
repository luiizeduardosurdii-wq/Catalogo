import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { confirmOrderPayment } from "@/lib/orders";
import { getPaymentProvider } from "@/lib/payments";

export async function POST(req: Request) {
  const bodyText = await req.text();
  const provider = getPaymentProvider();

  if (!provider.verifyWebhookSignature(req.headers, bodyText)) {
    return NextResponse.json({ error: "Assinatura inválida" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = JSON.parse(bodyText);
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const paymentId = provider.parseWebhookPaymentId(body);
  if (!paymentId) {
    return NextResponse.json({ received: true });
  }

  const providerName = process.env.MERCADOPAGO_ACCESS_TOKEN
    ? "mercadopago"
    : "mock";

  const eventId = `${providerName}-${paymentId}`;

  try {
    await prisma.processedWebhookEvent.create({
      data: { provider: providerName, eventId },
    });
  } catch {
    return NextResponse.json({ received: true, duplicate: true });
  }

  if (providerName === "mercadopago") {
    const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
    const res = await fetch(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (res.ok) {
      const payment = (await res.json()) as { status?: string };
      if (payment.status !== "approved") {
        return NextResponse.json({ received: true, status: payment.status });
      }
    }
  }

  await confirmOrderPayment(paymentId, providerName);

  return NextResponse.json({ received: true, processed: true });
}
