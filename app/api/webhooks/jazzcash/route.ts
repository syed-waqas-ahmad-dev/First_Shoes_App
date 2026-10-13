/**
 * @file app/api/webhooks/jazzcash/route.ts
 * @description IPN webhook receiver for JazzCash payment gateway responses.
 * Strict TypeScript: ZERO `any`.
 */

import { NextResponse, type NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/db/connect';
import { Order } from '@/models/Order';
import { PaymentStatus } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const payload = (await req.json().catch(() => ({}))) as Record<string, string>;
    const orderNumber = payload.pp_TxnRefNo || payload.orderNumber;
    const responseCode = payload.pp_ResponseCode;

    if (!orderNumber) {
      return NextResponse.json({ error: 'Missing transaction reference' }, { status: 400 });
    }

    await connectToDatabase();
    const isSuccess = responseCode === '000' || responseCode === '121';

    const order = await Order.findOneAndUpdate(
      { orderNumber },
      {
        paymentStatus: isSuccess ? PaymentStatus.PAID : PaymentStatus.FAILED,
        'paymentDetails.transactionId': payload.pp_TxnRefNo,
        'paymentDetails.gatewayResponse': payload,
      },
      { new: true }
    );

    return NextResponse.json({
      received: true,
      orderNumber,
      status: order?.paymentStatus || 'unknown',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Webhook error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
