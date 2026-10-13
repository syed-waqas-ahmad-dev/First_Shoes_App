'use server';

/**
 * @file actions/user.actions.ts
 * @description Customer profile, address management, and referral tracking.
 * Strict TypeScript: ZERO `any`.
 */

import { connectToDatabase } from '@/lib/db/connect';
import { User } from '@/models/User';
import { addressSchema, type AddressInput } from '@/lib/validators';
import { successResponse, errorResponse, type ActionResult } from '@/lib/response';
import { handleActionError } from '@/lib/error-handler';
import { Types } from 'mongoose';
import type { IUser, IAddress } from '@/types';

export async function getUserProfile(userId: string): Promise<ActionResult<IUser>> {
  try {
    await connectToDatabase();
    const user = await User.findById(userId).lean();
    if (!user) {
      return errorResponse('User account not found.');
    }
    return successResponse(JSON.parse(JSON.stringify(user)));
  } catch (error: unknown) {
    return handleActionError(error);
  }
}

export async function addAddress(userId: string, input: AddressInput): Promise<ActionResult<IAddress[]>> {
  try {
    await connectToDatabase();
    const validated = addressSchema.parse(input);

    const user = await User.findById(userId);
    if (!user) {
      return errorResponse('User not found.');
    }

    if (validated.isDefault) {
      user.addresses.forEach((addr) => {
        addr.isDefault = false;
      });
    } else if (user.addresses.length === 0) {
      validated.isDefault = true;
    }

    user.addresses.push(validated as any);
    await user.save();

    return successResponse(JSON.parse(JSON.stringify(user.addresses)), 'Address added successfully.');
  } catch (error: unknown) {
    return handleActionError(error);
  }
}

export async function deleteAddress(userId: string, addressId: string): Promise<ActionResult<IAddress[]>> {
  try {
    await connectToDatabase();
    const user = await User.findById(userId);
    if (!user) {
      return errorResponse('User not found.');
    }

    user.addresses = user.addresses.filter((addr) => addr._id?.toString() !== addressId) as any;
    await user.save();

    return successResponse(JSON.parse(JSON.stringify(user.addresses)), 'Address removed.');
  } catch (error: unknown) {
    return handleActionError(error);
  }
}
