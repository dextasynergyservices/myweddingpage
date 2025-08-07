import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, whatsapp, planId, amount } = body;

    if (!email || !whatsapp || !planId || amount == null) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const koboAmount = Math.floor(Number(amount) * 100);

    const res = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        amount: koboAmount,
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/verify?${new URLSearchParams({
          planId: String(planId),
          whatsapp: String(whatsapp),
          email: String(email),
        }).toString()}`,
        metadata: {
          // Still include as backup
          whatsapp,
          planId,
        },
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("Paystack Error:", data);
      return NextResponse.json(
        { error: data?.message || "Payment init failed" },
        { status: res.status }
      );
    }

    return NextResponse.json({
      authorization_url: data.data.authorization_url,
      reference: data.data.reference,
    });
  } catch (error: unknown) {
    console.error("Unexpected error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
