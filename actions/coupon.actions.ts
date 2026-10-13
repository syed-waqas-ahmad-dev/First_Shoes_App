'use server';

/**
 * @file actions/coupon.actions.ts
 * @description Server action for validating promotional coupons at checkout.
 * Strict TypeScript: ZERO `any`.
 */

import { connectToDatabase } from '@/lib/db/connect';
import { Coupon } from '@/models/Coupon';
import { validateCouponRules } from '@/lib/coupon-validator';
import { successResponse, errorResponse, type ActionResult } from '@/lib/response';
import { handleActionError } from '@/lib/error-handler';

export async function validateCouponAction(
  code: string,
  subtotal: number
): Promise<
  ActionResult<{
    code: string;
    discountAmount: number;
    type: string;
    message: string;
  }>
> {
  try {
    if (!code || code.trim().length === 0) {
      return errorResponse('Please provide a coupon code.');
    }

    await connectToDatabase();
    const coupon = await Coupon.findOne({
      code: code.trim().toUpperCase(),
      isActive: true,
    }).lean();

    if (!coupon) {
      return errorResponse('Invalid coupon code. Please check and try again.');
    }

    const result = validateCouponRules(coupon, subtotal);
    if (!result.valid) {
      return errorResponse(result.message || 'Coupon is not eligible for this order.');
    }

    return successResponse({
      code: coupon.code,
      discountAmount: result.discountAmount,
      type: coupon.type,
      message: result.message || 'Coupon applied!',
    });
  } catch (error: unknown) {
    return handleActionError(error);
  }
}
