/**
 * @file models/Referral.ts
 * @description Mongoose schema & model for referral incentive rewards in OX Shoes.
 * Tracks referrer customer, referred new customer, voucher code, and PKR rewards.
 * Strict TypeScript: ZERO `any`.
 */

import { Schema, model, models, type Model, type HydratedDocument } from 'mongoose';
import { ReferralStatus, type IReferral } from '@/types';

export type ReferralDocument = HydratedDocument<IReferral>;
export type ReferralModelType = Model<IReferral>;

const referralSchema = new Schema<IReferral, ReferralModelType>(
  {
    referrerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Referrer user ID is required'],
      index: true,
    },
    refereeId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Referee user ID is required'],
      index: true,
    },
    code: {
      type: String,
      required: [true, 'Referral code is required'],
      uppercase: true,
      trim: true,
      index: true,
    },
    rewardAmount: {
      type: Number,
      required: [true, 'Reward amount in PKR is required'],
      min: [0, 'Reward amount cannot be negative'],
      default: 500, // PKR 500 store credit
    },
    status: {
      type: String,
      enum: {
        values: Object.values(ReferralStatus),
        message: '{VALUE} is not a valid referral status',
      },
      default: ReferralStatus.PENDING,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

referralSchema.index({ referrerId: 1, status: 1 });
referralSchema.index({ code: 1, status: 1 });

export const Referral: ReferralModelType =
  (models.Referral as ReferralModelType) ||
  model<IReferral, ReferralModelType>('Referral', referralSchema);

export default Referral;
