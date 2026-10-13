'use server';

/**
 * @file actions/order.actions.ts
 * @description Enterprise order placement flow for Pakistani market.
 * Server-side recalculation of pricing, 17% GST, courier tariffs, atomic stock decrement,
 * and COD OTP requirement evaluation.
 * Strict TypeScript: ZERO `any`.
 */

import { connectToDatabase } from '@/lib/db/connect';
import { Order } from '@/models/Order';
import { Product } from '@/models/Product';
import { Coupon } from '@/models/Coupon';
import { CouponUsage } from '@/models/CouponUsage';
import { calculateOrderTotals } from '@/lib/pricing';
import { validateCouponRules } from '@/lib/coupon-validator';
import { successResponse, errorResponse, type ActionResult } from '@/lib/response';
import { handleActionError } from '@/lib/error-handler';
import { checkoutOrderSchema, type CheckoutOrderInput } from '@/lib/validators';
import { OrderStatus, PaymentStatus, Courier, type IOrder, type IOrderItem } from '@/types';
import { COD_MAX_LIMIT_WITHOUT_OTP } from '@/lib/constants';
import { Types } from 'mongoose';

export interface CreateOrderPayload {
  items: Array<{
    productId: string;
    size: string;
    color: string;
    quantity: number;
  }>;
  checkoutData: CheckoutOrderInput;
  userId?: string;
}

export async function createOrder(payload: CreateOrderPayload): Promise<ActionResult<{ order: IOrder; requiresOtp: boolean }>> {
  try {
    await connectToDatabase();

    // 1. Validate Form Input
    const validatedData = checkoutOrderSchema.parse(payload.checkoutData);

    if (!payload.items || payload.items.length === 0) {
      return errorResponse('Your cart is empty. Please add shoes before checking out.');
    }

    // 2. Fetch Live Products and Validate Stocks
    const productIds = payload.items.map((i) => i.productId);
    const products = await Product.find({ _id: { $in: productIds }, isActive: true, isDeleted: { $ne: true } });
    const productMap = new Map(products.map((p) => [p._id.toString(), p]));

    const orderItems: IOrderItem[] = [];
    let totalWeight = 0;

    for (const item of payload.items) {
      const product = productMap.get(item.productId);
      if (!product) {
        return errorResponse(`One of the selected shoes is no longer available.`);
      }

      // Check stock
      if (product.stock < item.quantity) {
        return errorResponse(`Insufficient stock for "${product.name}". Only ${product.stock} available.`);
      }

      totalWeight += (product.weight || 750) * item.quantity;

      orderItems.push({
        _id: new Types.ObjectId(),
        productId: product._id,
        name: product.name,
        image: product.images[0] || '',
        size: item.size,
        color: item.color,
        quantity: item.quantity,
        price: product.price,
        sku: `${product.sku}-${item.size}-${item.color.slice(0, 3).toUpperCase()}`,
      });
    }

    // 3. Re-validate Coupon if provided
    let appliedCouponDoc = null;
    if (validatedData.couponCode) {
      const couponDoc = await Coupon.findOne({ code: validatedData.couponCode.trim().toUpperCase() });
      if (couponDoc) {
        const subtotal = orderItems.reduce((acc, curr) => acc + curr.price * curr.quantity, 0);
        const couponCheck = validateCouponRules(couponDoc, subtotal, products);
        if (couponCheck.valid) {
          appliedCouponDoc = couponDoc;
        }
      }
    }

    // 4. Server-Side Accurate Pricing (Subtotal, 17% GST, Shipping Tariffs, Coupon)
    const pricing = calculateOrderTotals(
      orderItems.map((i) => ({ price: i.price, quantity: i.quantity })),
      validatedData.shippingAddress.city,
      totalWeight,
      appliedCouponDoc
    );

    // 5. Check if COD requires OTP (orders > PKR 10,000)
    const isCOD = validatedData.paymentMethod === 'COD';
    const requiresOtp = isCOD && pricing.totalAmount > COD_MAX_LIMIT_WITHOUT_OTP;

    // 6. Generate Order Number: OX-YYYY-XXXX
    const currentYear = new Date().getFullYear();
    const randomHex = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `OX-${currentYear}-${randomHex}`;

    // 7. Determine Courier based on region
    const city = validatedData.shippingAddress.city.toLowerCase();
    const courier = city.includes('lahore') || city.includes('karachi') ? Courier.TCS : Courier.LEOPARDS;

    const trackingNumber = `TCS-${Math.floor(10000000 + Math.random() * 90000000)}`;

    // 8. Create Order Document
    const newOrder = await Order.create({
      orderNumber,
      userId: payload.userId ? new Types.ObjectId(payload.userId) : null,
      guestEmail: validatedData.guestEmail || '',
      guestPhone: validatedData.guestPhone || '',
      orderItems,
      subtotal: pricing.subtotal,
      discountAmount: pricing.discountAmount,
      couponCode: appliedCouponDoc ? appliedCouponDoc.code : undefined,
      taxAmount: pricing.taxAmount,
      shippingCharges: pricing.shippingCharges,
      totalAmount: pricing.totalAmount,
      shippingAddress: {
        fullName: validatedData.shippingAddress.fullName,
        phone: validatedData.shippingAddress.phone,
        address: validatedData.shippingAddress.street || 'Address',
        street: validatedData.shippingAddress.street,
        city: validatedData.shippingAddress.city,
        postalCode: validatedData.shippingAddress.postalCode,
      },
      status: OrderStatus.CONFIRMED,
      paymentMethod: validatedData.paymentMethod,
      paymentStatus: isCOD ? PaymentStatus.PENDING : PaymentStatus.PAID,
      courier,
      trackingNumber,
      notes: validatedData.notes,
    });

    // 9. Decrement Inventory Atomic
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: -item.quantity },
      });
    }

    // 10. Record Coupon Usage if coupon was applied
    if (appliedCouponDoc) {
      await Coupon.findByIdAndUpdate(appliedCouponDoc._id, { $inc: { usedCount: 1 } });
      if (payload.userId) {
        await CouponUsage.create({
          couponId: appliedCouponDoc._id,
          userId: new Types.ObjectId(payload.userId),
          orderId: newOrder._id,
          discountApplied: pricing.discountAmount,
        });
      }
    }

    return successResponse({
      order: JSON.parse(JSON.stringify(newOrder)),
      requiresOtp,
    });
  } catch (error: unknown) {
    return handleActionError(error);
  }
}

export async function getOrderById(orderId: string): Promise<ActionResult<IOrder>> {
  try {
    await connectToDatabase();
    const order = await Order.findById(orderId).lean();
    if (!order) {
      return errorResponse('Order not found.');
    }
    return successResponse(JSON.parse(JSON.stringify(order)));
  } catch (error: unknown) {
    return handleActionError(error);
  }
}

export async function trackOrder(orderNumber: string): Promise<ActionResult<IOrder>> {
  try {
    await connectToDatabase();
    const order = await Order.findOne({ orderNumber: orderNumber.trim().toUpperCase() }).lean();
    if (!order) {
      return errorResponse(`No order found matching "${orderNumber}". Please verify your order number.`);
    }
    return successResponse(JSON.parse(JSON.stringify(order)));
  } catch (error: unknown) {
    return handleActionError(error);
  }
}

export async function getUserOrders(userId: string): Promise<ActionResult<IOrder[]>> {
  try {
    await connectToDatabase();
    const orders = await Order.find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .lean();
    return successResponse(JSON.parse(JSON.stringify(orders)));
  } catch (error: unknown) {
    return handleActionError(error);
  }
}

export async function getAllOrders(filters?: {
  status?: string;
  paymentStatus?: string;
  search?: string;
}): Promise<ActionResult<IOrder[]>> {
  try {
    await connectToDatabase();
    const query: Record<string, unknown> = {};

    if (filters?.status && filters.status !== 'all') {
      query.status = filters.status;
    }
    if (filters?.paymentStatus && filters.paymentStatus !== 'all') {
      query.paymentStatus = filters.paymentStatus;
    }
    if (filters?.search) {
      const regex = new RegExp(filters.search.trim(), 'i');
      query.$or = [
        { orderNumber: regex },
        { 'shippingAddress.fullName': regex },
        { 'shippingAddress.phone': regex },
        { trackingNumber: regex },
      ];
    }

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();
    return successResponse(JSON.parse(JSON.stringify(orders)));
  } catch (error: unknown) {
    return handleActionError(error);
  }
}

export async function updateOrderStatus(
  orderId: string,
  updates: {
    status?: OrderStatus;
    paymentStatus?: PaymentStatus;
    trackingNumber?: string;
    courier?: Courier;
  }
): Promise<ActionResult<IOrder>> {
  try {
    await connectToDatabase();
    const updated = await Order.findByIdAndUpdate(orderId, { $set: updates }, { new: true }).lean();
    if (!updated) {
      return errorResponse('Order not found.');
    }
    return successResponse(JSON.parse(JSON.stringify(updated)));
  } catch (error: unknown) {
    return handleActionError(error);
  }
}
