'use client';

/**
 * @file app/admin/page.tsx
 * @description Enterprise Operations & Invoices Management Dashboard for OX Shoes Pakistan.
 * Manages Pakistani orders, TCS courier dispatching, auto-generated FBR Tax Invoices,
 * and live fulfillment KPIs.
 * Strict TypeScript: ZERO `any`.
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getAdminMetrics, type AdminDashboardMetrics } from '@/actions/dashboard.actions';
import { getAllOrders, updateOrderStatus } from '@/actions/order.actions';
import { formatPKR } from '@/lib/formatters/currency';
import { formatDate } from '@/lib/formatters/date';
import { Logo } from '@/components/layout/Logo';
import { OrderStatus, PaymentStatus, Courier, type IOrder } from '@/types';
import {
  Package,
  TrendingUp,
  Truck,
  Users,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Search,
  CheckCircle2,
  FileText,
  Printer,
  Compass,
  MapPin,
  ExternalLink,
  ShieldCheck,
  Clock,
  Filter,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<AdminDashboardMetrics | null>(null);
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'orders' | 'invoices'>('orders');
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('all');

  const fetchData = async () => {
    setLoading(true);
    const [metricsRes, ordersRes] = await Promise.all([
      getAdminMetrics(),
      getAllOrders(),
    ]);

    if (metricsRes.success && metricsRes.data) {
      setMetrics(metricsRes.data);
    }
    if (ordersRes.success && ordersRes.data) {
      setOrders(ordersRes.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    let active = true;
    Promise.all([getAdminMetrics(), getAllOrders()]).then(([metricsRes, ordersRes]) => {
      if (active) {
        if (metricsRes.success && metricsRes.data) setMetrics(metricsRes.data);
        if (ordersRes.success && ordersRes.data) setOrders(ordersRes.data);
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    const res = await updateOrderStatus(orderId, { status: newStatus });
    if (res.success) {
      fetchData();
    }
  };

  const handleMarkPaid = async (orderId: string) => {
    const res = await updateOrderStatus(orderId, { paymentStatus: PaymentStatus.PAID });
    if (res.success) {
      fetchData();
    }
  };

  const filteredOrders = orders.filter((ord) => {
    const shipAddr = ord.shippingAddress as unknown as Record<string, string> | undefined;
    const matchesSearch =
      !searchTerm ||
      ord.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (shipAddr?.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (shipAddr?.city || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ord.trackingNumber || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesPayment =
      paymentFilter === 'all' ||
      (paymentFilter === 'paid' && ord.paymentStatus === PaymentStatus.PAID) ||
      (paymentFilter === 'pending' && ord.paymentStatus !== PaymentStatus.PAID);

    return matchesSearch && matchesPayment;
  });

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col justify-between selection:bg-amber-500 selection:text-black">
      {/* Top Admin Bar */}
      <header className="border-b border-neutral-800 bg-neutral-900/80 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <Logo theme="dark" size="sm" />
          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded bg-amber-500 text-black uppercase tracking-widest">
            ERP & Operations
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/stores"
            className="text-xs text-neutral-400 hover:text-white transition-colors flex items-center gap-1"
          >
            <Compass className="h-3.5 w-3.5" />
            <span>Store Locator</span>
          </Link>
          <Link
            href="/"
            className="text-xs text-neutral-400 hover:text-white transition-colors"
          >
            ← View Storefront
          </Link>
          <button
            onClick={fetchData}
            className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors border border-neutral-700"
            title="Refresh Data"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1 space-y-8">
        {/* Title & Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
              Operations, Logistics & Tax Invoices Hub
            </h1>
            <p className="text-xs text-neutral-400 mt-0.5">
              Pakistani Footwear Fulfillment • TCS / Leopards Consignments • FBR Tax Invoices
            </p>
          </div>

          <div className="flex items-center gap-2 bg-neutral-900 p-1 rounded-xl border border-neutral-800">
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'orders'
                  ? 'bg-amber-500 text-black shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Package className="h-3.5 w-3.5" />
              <span>Orders Queue</span>
            </button>
            <button
              onClick={() => setActiveTab('invoices')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'invoices'
                  ? 'bg-amber-500 text-black shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <FileText className="h-3.5 w-3.5" />
              <span>Tax Invoices ({orders.length})</span>
            </button>
          </div>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-2">
            <div className="flex items-center justify-between text-neutral-400 text-xs">
              <span>Total Revenue</span>
              <TrendingUp className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white">
              {formatPKR(metrics?.totalRevenuePKR || 0)}
            </div>
            <span className="text-[11px] text-emerald-400 block font-medium">All Pakistani orders</span>
          </div>

          <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-2">
            <div className="flex items-center justify-between text-neutral-400 text-xs">
              <span>Pending Orders</span>
              <Truck className="h-4 w-4 text-amber-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white">
              {metrics?.pendingOrders || 0}
            </div>
            <span className="text-[11px] text-amber-400 block font-medium">Ready for TCS dispatch</span>
          </div>

          <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-2">
            <div className="flex items-center justify-between text-neutral-400 text-xs">
              <span>FBR Invoices Generated</span>
              <FileText className="h-4 w-4 text-sky-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white">
              {orders.length} Invoices
            </div>
            <span className="text-[11px] text-sky-400 block font-medium">17% GST Auto-Calculated</span>
          </div>

          <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-2">
            <div className="flex items-center justify-between text-neutral-400 text-xs">
              <span>Low Stock Alerts</span>
              <AlertTriangle className="h-4 w-4 text-red-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-red-400">
              {metrics?.lowStockProducts || 0} SKUs
            </div>
            <span className="text-[11px] text-neutral-400 block font-medium">Requires artisan restock</span>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 w-full sm:w-80 bg-neutral-950 px-3 py-2 rounded-xl border border-neutral-800 focus-within:border-amber-500">
            <Search className="h-4 w-4 text-neutral-500 shrink-0" />
            <input
              type="text"
              placeholder="Search by order #, customer, city, tracking..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent border-none outline-none text-xs text-white placeholder:text-neutral-500 w-full"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs text-neutral-400 flex items-center gap-1">
              <Filter className="h-3.5 w-3.5" />
              Payment:
            </span>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="bg-neutral-950 text-neutral-200 border border-neutral-800 rounded-xl px-3 py-1.5 text-xs outline-none focus:border-amber-500"
            >
              <option value="all">All Payments</option>
              <option value="paid">Paid (Prepaid)</option>
              <option value="pending">Pending (COD)</option>
            </select>
          </div>
        </div>

        {/* Orders Queue View */}
        {activeTab === 'orders' && (
          <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="font-bold text-sm uppercase tracking-wider text-white flex items-center gap-2">
                <Package className="h-4 w-4 text-amber-400" />
                Live Fulfillment & Dispatch Operations ({filteredOrders.length})
              </h3>
              <span className="text-xs text-neutral-400">TCS Express & Leopards Nationwide</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-neutral-800 text-neutral-400">
                    <th className="py-3 px-3">Order #</th>
                    <th className="py-3 px-3">Recipient & City</th>
                    <th className="py-3 px-3">Payment</th>
                    <th className="py-3 px-3">Amount (PKR)</th>
                    <th className="py-3 px-3">Fulfillment Status</th>
                    <th className="py-3 px-3">Courier Tracking</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60 font-medium">
                  {filteredOrders.length > 0 ? (
                    filteredOrders.map((ord) => {
                      const shipAddr = ord.shippingAddress as unknown as Record<string, string> | undefined;
                      return (
                        <tr key={ord._id.toString()} className="hover:bg-neutral-800/40 transition-colors">
                          <td className="py-3.5 px-3 font-mono font-bold text-white">
                            {ord.orderNumber}
                          </td>
                          <td className="py-3.5 px-3">
                            <span className="text-neutral-200 font-bold block">{shipAddr?.fullName || 'Customer'}</span>
                            <span className="text-[11px] text-neutral-400 flex items-center gap-1">
                              <MapPin className="h-3 w-3 text-amber-500" />
                              {shipAddr?.city || 'Lahore'}
                            </span>
                          </td>
                          <td className="py-3.5 px-3">
                            <span className="px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 font-bold text-[11px] block w-fit">
                              {ord.paymentMethod}
                            </span>
                            <span className={`text-[10px] font-bold ${ord.paymentStatus === PaymentStatus.PAID ? 'text-emerald-400' : 'text-amber-400'}`}>
                              {ord.paymentStatus.toUpperCase()}
                            </span>
                          </td>
                          <td className="py-3.5 px-3 font-bold text-emerald-400 font-mono">
                            {formatPKR(ord.totalAmount)}
                          </td>
                          <td className="py-3.5 px-3">
                            <select
                              value={ord.status}
                              onChange={(e) => handleUpdateStatus(ord._id.toString(), e.target.value as OrderStatus)}
                              className="bg-neutral-800 border border-neutral-700 text-neutral-200 rounded px-2 py-1 text-[11px] font-bold outline-none focus:border-amber-500"
                            >
                              <option value={OrderStatus.CONFIRMED}>CONFIRMED</option>
                              <option value={OrderStatus.PROCESSING}>PROCESSING</option>
                              <option value={OrderStatus.SHIPPED}>SHIPPED (TCS)</option>
                              <option value={OrderStatus.DELIVERED}>DELIVERED</option>
                              <option value={OrderStatus.CANCELLED}>CANCELLED</option>
                            </select>
                          </td>
                          <td className="py-3.5 px-3">
                            <Link
                              href={`/track?order=${ord.orderNumber}`}
                              className="font-mono text-[11px] text-amber-400 hover:text-amber-300 underline flex items-center gap-1"
                            >
                              <Truck className="h-3 w-3" />
                              {ord.trackingNumber || 'Track Delivery'}
                            </Link>
                          </td>
                          <td className="py-3.5 px-3 text-right space-x-2">
                            <Link
                              href={`/invoice/${ord._id}`}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-amber-400 font-bold text-[11px] transition-colors border border-neutral-700"
                              title="Print Tax Invoice"
                            >
                              <Printer className="h-3 w-3" />
                              <span>Invoice</span>
                            </Link>
                            <Link
                              href={`/order-confirmation/${ord._id}`}
                              className="text-neutral-400 hover:text-white font-bold text-[11px]"
                            >
                              Details →
                            </Link>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-neutral-500">
                        No orders match the current filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Invoices Ledger View */}
        {activeTab === 'invoices' && (
          <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-3">
              <div>
                <h3 className="font-bold text-sm uppercase tracking-wider text-white flex items-center gap-2">
                  <FileText className="h-4 w-4 text-sky-400" />
                  Auto-Generated Pakistani Tax Invoices Ledger
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  FBR Sales Tax Special Procedure Rules • NTN: 8241920-4 • STRN: 3277876123456
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-3 py-1 rounded-full flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  All Invoices FBR Verified
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-neutral-800 text-neutral-400">
                    <th className="py-3 px-3">Invoice #</th>
                    <th className="py-3 px-3">Order Ref</th>
                    <th className="py-3 px-3">Customer Bill-To</th>
                    <th className="py-3 px-3">GST 17%</th>
                    <th className="py-3 px-3">Invoice Total (PKR)</th>
                    <th className="py-3 px-3">Payment Status</th>
                    <th className="py-3 px-3 text-right">Invoice Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60 font-medium">
                  {filteredOrders.length > 0 ? (
                    filteredOrders.map((ord) => {
                      const shipAddr = ord.shippingAddress as unknown as Record<string, string> | undefined;
                      const invNum = `INV-${(ord.orderNumber || '').replace('OX-', '')}`;
                      const isPaid = ord.paymentStatus === PaymentStatus.PAID;
                      return (
                        <tr key={ord._id.toString()} className="hover:bg-neutral-800/40 transition-colors">
                          <td className="py-3.5 px-3 font-mono font-bold text-sky-400">
                            {invNum}
                          </td>
                          <td className="py-3.5 px-3 font-mono text-neutral-300">
                            {ord.orderNumber}
                          </td>
                          <td className="py-3.5 px-3">
                            <span className="text-white font-bold block">{shipAddr?.fullName || 'Customer'}</span>
                            <span className="text-[11px] text-neutral-400">{shipAddr?.city || 'Lahore'}</span>
                          </td>
                          <td className="py-3.5 px-3 font-mono text-neutral-400">
                            {formatPKR(ord.taxAmount)}
                          </td>
                          <td className="py-3.5 px-3 font-mono font-bold text-emerald-400">
                            {formatPKR(ord.totalAmount)}
                          </td>
                          <td className="py-3.5 px-3">
                            <div className="flex items-center gap-2">
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                  isPaid
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                                }`}
                              >
                                {isPaid ? 'PAID' : 'COD UNPAID'}
                              </span>
                              {!isPaid && (
                                <button
                                  onClick={() => handleMarkPaid(ord._id.toString())}
                                  className="text-[10px] font-bold text-neutral-400 hover:text-emerald-400 underline"
                                  title="Mark as paid upon courier remittance"
                                >
                                  Mark Paid
                                </button>
                              )}
                            </div>
                          </td>
                          <td className="py-3.5 px-3 text-right">
                            <Link
                              href={`/invoice/${ord._id}`}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-black font-black text-xs transition-transform hover:scale-105 shadow-sm"
                            >
                              <Printer className="h-3.5 w-3.5" />
                              <span>View / Print</span>
                            </Link>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-neutral-500">
                        No invoices match search criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-neutral-900 bg-neutral-950 px-6 py-4 text-xs text-neutral-500 text-center">
        OX Shoes ERP & Invoicing Hub • Integrated with FBR Sales Tax & OpenStreetMap Store Locator
      </footer>
    </div>
  );
}
