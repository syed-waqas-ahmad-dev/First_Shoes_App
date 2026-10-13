'use server';

/**
 * @file actions/dashboard.actions.ts
 * @description Administrative analytics and sales KPIs for OX Shoes Pakistan.
 * Strict TypeScript: ZERO `any`.
 */

import { connectToDatabase } from '@/lib/db/connect';
import { Order } from '@/models/Order';
import { Product } from '@/models/Product';
import { User } from '@/models/User';
import { successResponse, type ActionResult } from '@/lib/response';
import { handleActionError } from '@/lib/error-handler';
import { OrderStatus } from '@/types';

export interface AdminDashboardMetrics {
  totalRevenuePKR: number;
  totalOrders: number;
  pendingOrders: number;
  totalProducts: number;
  lowStockProducts: number;
  totalCustomers: number;
  recentOrders: Array<{
    _id: string;
    orderNumber: string;
    customerName: string;
    totalAmount: number;
    status: string;
    paymentMethod: string;
    createdAt: string;
  }>;
}

export async function getAdminMetrics(): Promise<ActionResult<AdminDashboardMetrics>> {
  try {
    await connectToDatabase();

    const [orders, totalProducts, lowStockProducts, totalCustomers] = await Promise.all([
      Order.find().sort({ createdAt: -1 }).limit(100).lean(),
      Product.countDocuments({ isDeleted: { $ne: true } }),
      Product.countDocuments({ stock: { $lte: 5 }, isDeleted: { $ne: true } }),
      User.countDocuments({ isDeleted: { $ne: true } }),
    ]);

    const totalRevenuePKR = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const pendingOrders = orders.filter((o) => o.status === OrderStatus.PENDING || o.status === OrderStatus.CONFIRMED).length;

    const recentOrders = orders.slice(0, 8).map((o) => ({
      _id: o._id.toString(),
      orderNumber: o.orderNumber,
      customerName: o.shippingAddress?.fullName || 'Guest Customer',
      totalAmount: o.totalAmount,
      status: o.status,
      paymentMethod: o.paymentMethod,
      createdAt: o.createdAt.toISOString(),
    }));

    return successResponse({
      totalRevenuePKR,
      totalOrders: orders.length,
      pendingOrders,
      totalProducts,
      lowStockProducts,
      totalCustomers,
      recentOrders,
    });
  } catch (error: unknown) {
    return handleActionError(error);
  }
}
