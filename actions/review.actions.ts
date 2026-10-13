'use server';

/**
 * @file actions/review.actions.ts
 * @description Server actions for product ratings and verified reviews.
 * Strict TypeScript: ZERO `any`.
 */

import { connectToDatabase } from '@/lib/db/connect';
import { Review } from '@/models/Review';
import { createReviewSchema, type CreateReviewInput } from '@/lib/validators';
import { successResponse, errorResponse, type ActionResult } from '@/lib/response';
import { handleActionError } from '@/lib/error-handler';
import { Types } from 'mongoose';
import type { IReview } from '@/types';

export async function createReviewAction(
  userId: string,
  input: CreateReviewInput
): Promise<ActionResult<IReview>> {
  try {
    await connectToDatabase();
    const validated = createReviewSchema.parse(input);

    // Check if user already reviewed this order item
    const existing = await Review.findOne({
      userId: new Types.ObjectId(userId),
      productId: new Types.ObjectId(validated.productId),
      orderId: new Types.ObjectId(validated.orderId),
    });

    if (existing) {
      return errorResponse('You have already submitted a review for this purchase.');
    }

    const newReview = await Review.create({
      userId: new Types.ObjectId(userId),
      productId: new Types.ObjectId(validated.productId),
      orderId: new Types.ObjectId(validated.orderId),
      rating: validated.rating,
      title: validated.title,
      comment: validated.comment,
      images: validated.images,
      isVerifiedPurchase: true,
      isApproved: true,
    });

    return successResponse(JSON.parse(JSON.stringify(newReview)), 'Thank you! Your review has been published.');
  } catch (error: unknown) {
    return handleActionError(error);
  }
}

export async function getProductReviews(productId: string): Promise<ActionResult<IReview[]>> {
  try {
    await connectToDatabase();
    const reviews = await Review.find({
      productId: new Types.ObjectId(productId),
      isApproved: true,
    })
      .sort({ createdAt: -1 })
      .populate('userId', 'name image')
      .lean();

    return successResponse(JSON.parse(JSON.stringify(reviews)));
  } catch (error: unknown) {
    return handleActionError(error);
  }
}

export async function markReviewHelpful(reviewId: string): Promise<ActionResult<{ helpfulCount: number }>> {
  try {
    await connectToDatabase();
    const updated = await Review.findByIdAndUpdate(
      reviewId,
      { $inc: { helpfulCount: 1 } },
      { new: true }
    );
    return successResponse({ helpfulCount: updated?.helpfulCount || 0 });
  } catch (error: unknown) {
    return handleActionError(error);
  }
}
