/**
 * @file app/api/webhooks/easypaisa/route.ts
 * @description IPN webhook receiver for Easypaisa payment notifications.
 * Strict TypeScript: ZERO `any`.
 */

import { NextResponse, type NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/db/connect';
import { Order } from '@/models/Order';
import { PaymentStatus } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const payload = (await req.json().catch(() => ({}))) as Record<string, string>;
    const orderRef = payload.orderId || payload.orderRef;
    const responseCode = payload.responseCode || payload.status;

    if (!orderRef) {
      return NextResponse.json({ error: 'Missing order reference' }, { status: 400 });
    }

    await connectToDatabase();
    const isSuccess = responseCode === '0000' || responseCode === 'SUCCESS';

    const order = await Order.findOneAndUpdate(
      { orderNumber: orderRef },
      {
        paymentStatus: isSuccess ? PaymentStatus.PAID : PaymentStatus.FAILED,
        'paymentDetails.transactionId': payload.transactionId,
        'paymentDetails.gatewayResponse': payload,
      },
      { new: true }
    );

    return NextResponse.json({
      received: true,
      orderNumber: orderRef,
      status: order?.paymentStatus || 'unknown',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Webhook error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
