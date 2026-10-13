/**
 * @file models/Wishlist.ts
 * @description Mongoose schema & model for customer wishlist in OX Shoes.
 * Stores desired footwear items, favorite sizes, and colors.
 * Strict TypeScript: ZERO `any`.
 */

import { Schema, model, models, type Model, type HydratedDocument } from 'mongoose';
import { type IWishlist, type ICartProductItem } from '@/types';

/**
 * Wishlist item schema subdocument
 */
const wishlistItemSchema = new Schema<ICartProductItem>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product reference is required'],
    },
    size: {
      type: String,
      required: true,
      trim: true,
    },
    color: {
      type: String,
      required: true,
      trim: true,
    },
    quantity: {
      type: Number,
      default: 1,
      min: 1,
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

export type WishlistDocument = HydratedDocument<IWishlist>;
export type WishlistModelType = Model<IWishlist>;

const wishlistSchema = new Schema<IWishlist, WishlistModelType>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Wishlist must belong to a registered user'],
      unique: true,
      index: true,
    },
    products: {
      type: [wishlistItemSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export const Wishlist: WishlistModelType =
  (models.Wishlist as WishlistModelType) || model<IWishlist, WishlistModelType>('Wishlist', wishlistSchema);

export default Wishlist;
