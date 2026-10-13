'use server';

/**
 * @file actions/auth.actions.ts
 * @description Authentication Server Actions (login, register with referral code).
 * Strict TypeScript: ZERO `any`.
 */

import { connectToDatabase } from '@/lib/db/connect';
import { User } from '@/models/User';
import { signupSchema, loginSchema, type SignupInput, type LoginInput } from '@/lib/validators';
import { successResponse, errorResponse, type ActionResult } from '@/lib/response';
import { handleActionError } from '@/lib/error-handler';
import { UserRole, type IUser } from '@/types';

export async function registerUser(input: SignupInput): Promise<ActionResult<Pick<IUser, '_id' | 'name' | 'email' | 'role'>>> {
  try {
    await connectToDatabase();
    const validated = signupSchema.parse(input);

    const existingUser = await User.findOne({ email: validated.email.toLowerCase() });
    if (existingUser) {
      return errorResponse('An account with this email address already exists. Please sign in.');
    }

    // Check referral code if provided
    let referredBy: typeof User.prototype._id | undefined = undefined;
    if (validated.referralCode) {
      const referrer = await User.findOne({ referralCode: validated.referralCode.trim().toUpperCase() });
      if (referrer) {
        referredBy = referrer._id;
      }
    }

    const newUser = await User.create({
      name: validated.name.trim(),
      email: validated.email.toLowerCase().trim(),
      phone: validated.phone.trim(),
      password: validated.password, // Mongoose pre-save hook hashes with bcrypt
      role: UserRole.CUSTOMER,
      ...(referredBy ? { referredBy } : {}),
      addresses: [],
    });

    return successResponse(
      {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
      'Welcome to OX Shoes! Account created successfully.'
    );
  } catch (error: unknown) {
    return handleActionError(error);
  }
}

export async function loginUser(input: LoginInput): Promise<ActionResult<Pick<IUser, '_id' | 'name' | 'email' | 'role'>>> {
  try {
    await connectToDatabase();
    const validated = loginSchema.parse(input);

    const user = await User.findOne({ email: validated.email.toLowerCase().trim() }).select('+password');
    if (!user) {
      return errorResponse('Invalid email or password.');
    }

    const isMatch = await user.comparePassword(validated.password);
    if (!isMatch) {
      return errorResponse('Invalid email or password.');
    }

    return successResponse(
      {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      'Signed in successfully.'
    );
  } catch (error: unknown) {
    return handleActionError(error);
  }
}
