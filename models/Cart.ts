/**
 * @file models/Cart.ts
 * @description Mongoose schema & model for customer shopping carts in OX Shoes.
 * Stores selected shoes, sizes, color swatches, and quantities.
 * Strict TypeScript: ZERO `any`.
 */

import { Schema, model, models, type Model, type HydratedDocument } from 'mongoose';
import { type ICart, type ICartProductItem } from '@/types';

/**
 * Cart product item subdocument
 */
const cartProductItemSchema = new Schema<ICartProductItem>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product reference is required'],
    },
    size: {
      type: String,
      required: [true, 'Shoe size selection is required'],
      trim: true,
    },
    color: {
      type: String,
      required: [true, 'Shoe color selection is required'],
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1'],
      default: 1,
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

export type CartDocument = HydratedDocument<ICart>;
export type CartModelType = Model<ICart>;

const cartSchema = new Schema<ICart, CartModelType>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Cart must be linked to a user account'],
      unique: true,
      index: true,
    },
    products: {
      type: [cartProductItemSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export const Cart: CartModelType =
  (models.Cart as CartModelType) || model<ICart, CartModelType>('Cart', cartSchema);

export default Cart;
