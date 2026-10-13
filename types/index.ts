/**
 * @file types/index.ts
 * @description Master TypeScript definitions, enums, interfaces, and DTOs
 * for the OX Shoes enterprise e-commerce platform (Pakistani market).
 * Strict TypeScript: ZERO `any`.
 */

import type { Types, Document, PopulateOptions } from 'mongoose';

/* ==========================================================================
   ENUMS
   ========================================================================== */

/**
 * Platform administrative and customer roles
 */
export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  MANAGER = 'manager',
  CUSTOMER = 'customer',
}

/**
 * Top-level audience categories for footwear
 */
export enum ProductCategory {
  MEN = 'Men',
  WOMEN = 'Women',
  KIDS = 'Kids',
}

/**
 * Sub-categories specializing in Pakistani cultural and international shoe styles
 */
export enum ProductSubCategory {
  PESHAWARI_CHAPPAL = 'Peshawari Chappal',
  NOWSHERI_CHAPPAL = 'Nowsheri Chappal',
  KHUSSA = 'Khussa',
  FORMAL_SHOES = 'Formal Shoes',
  SNEAKERS = 'Sneakers',
  JOGGERS = 'Joggers',
  HEELS = 'Heels',
  FLATS = 'Flats',
  SCHOOL_SHOES = 'School Shoes',
}

/**
 * Supported domestic and international shoe brands in Pakistan
 */
export enum ProductBrand {
  BATA = 'Bata',
  SERVIS = 'Servis',
  NIKE = 'Nike',
  ADIDAS = 'Adidas',
  PUMA = 'Puma',
  REEBOK = 'Reebok',
  HUSH_PUPPIES = 'Hush Puppies',
  STYLO = 'Stylo',
  BORJAN = 'Borjan',
  NDURE = 'Ndure',
  LOCAL = 'Local',
}

/**
 * Complete order lifecycle states
 */
export enum OrderStatus {
  PENDING = 'Pending',
  CONFIRMED = 'Confirmed',
  PROCESSING = 'Processing',
  SHIPPED = 'Shipped',
  OUT_FOR_DELIVERY = 'OutForDelivery',
  DELIVERED = 'Delivered',
  CANCELLED = 'Cancelled',
  RETURNED = 'Returned',
}

/**
 * Pakistani payment gateways and methods
 */
export enum PaymentMethod {
  COD = 'COD',
  EASYPAISA = 'Easypaisa',
  JAZZCASH = 'JazzCash',
  BANK_TRANSFER = 'BankTransfer',
  CARD = 'Card',
}

/**
 * Transaction settlement status
 */
export enum PaymentStatus {
  PENDING = 'Pending',
  PAID = 'Paid',
  FAILED = 'Failed',
  REFUNDED = 'Refunded',
  PARTIALLY_REFUNDED = 'PartiallyRefunded',
}

/**
 * Pakistani premier courier partners
 */
export enum Courier {
  TCS = 'TCS',
  LEOPARDS = 'Leopards',
  M_AND_P = 'M&P',
  TRAX = 'Trax',
}

/**
 * Category taxonomy types
 */
export enum CategoryType {
  MEN = 'Men',
  WOMEN = 'Women',
  KIDS = 'Kids',
  BRAND = 'Brand',
}

/**
 * Discount calculation types
 */
export enum CouponType {
  PERCENTAGE = 'percentage',
  FIXED = 'fixed',
  FREE_SHIPPING = 'free_shipping',
}

/**
 * System and user notification categories
 */
export enum NotificationType {
  ORDER_UPDATE = 'order_update',
  PROMOTION = 'promotion',
  SYSTEM = 'system',
  REVIEW_REPLY = 'review_reply',
}

/**
 * Standard return and exchange reasons
 */
export enum ReturnReason {
  SIZE_ISSUE = 'size_issue',
  DAMAGED = 'damaged',
  WRONG_ITEM = 'wrong_item',
  NOT_AS_DESCRIBED = 'not_as_described',
  OTHER = 'other',
}

/**
 * Reverse logistics & refund status
 */
export enum ReturnStatus {
  PENDING = 'Pending',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
  PICKED_UP = 'PickedUp',
  REFUNDED = 'Refunded',
}

/**
 * Visual banner placements
 */
export enum BannerPosition {
  HERO = 'hero',
  TOP_STRIP = 'top_strip',
  MID_PAGE = 'mid_page',
  FOOTER = 'footer',
}

/**
 * Referral reward status
 */
export enum ReferralStatus {
  PENDING = 'Pending',
  COMPLETED = 'Completed',
}

/* ==========================================================================
   SUBDOCUMENT & COMPONENT INTERFACES
   ========================================================================== */

/**
 * Address subdocument for Pakistani delivery destinations
 */
export interface IAddress {
  _id?: Types.ObjectId;
  label: string; // e.g., 'Home', 'Office', 'Warehouse'
  fullName: string;
  phone: string; // Validated +923XXXXXXXXX
  street: string;
  city: string; // e.g., 'Lahore', 'Karachi', 'Islamabad'
  postalCode: string;
  isDefault: boolean;
}

/**
 * Color swatch representation
 */
export interface IColorOption {
  name: string;
  hex: string;
}

/**
 * Granular SKU inventory variant by size and color
 */
export interface IProductVariant {
  _id?: Types.ObjectId;
  size: string;
  color: string;
  stock: number;
  sku: string;
}

/**
 * Order line item snapshot preserving price & metadata at checkout
 */
export interface IOrderItem {
  _id?: Types.ObjectId;
  productId: Types.ObjectId;
  name: string;
  image: string;
  size: string;
  color: string;
  quantity: number;
  price: number; // Stored in PKR
  sku: string;
}

/**
 * Immutable shipping snapshot on Order
 */
export interface IOrderShippingAddress {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
}

/**
 * Payment gateway transaction metadata
 */
export interface IOrderPaymentDetails {
  transactionId?: string;
  gatewayResponse?: Record<string, unknown>;
  receiptUrl?: string;
}

/**
 * Single item inside Cart or Wishlist
 */
export interface ICartProductItem {
  _id?: Types.ObjectId;
  productId: Types.ObjectId;
  size: string;
  color: string;
  quantity: number;
  addedAt: Date;
}

/**
 * Size Guide dimension mapping
 */
export interface ISizeMeasurement {
  size: string;
  length_cm: number;
  width_cm: number;
  ukSize: string;
  usSize: string;
  euSize: string;
}

/**
 * Shipping zone transit SLA
 */
export interface IEstimatedDeliveryDays {
  min: number;
  max: number;
}

/* ==========================================================================
   DOCUMENT INTERFACES (Full Mongoose Types)
   ========================================================================== */

/**
 * User account document
 */
export interface IUser {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password?: string;
  googleId?: string;
  image?: string;
  role: UserRole;
  phone: string;
  isPhoneVerified: boolean;
  isEmailVerified: boolean;
  addresses: IAddress[];
  referralCode: string;
  referredBy?: Types.ObjectId;
  isDeleted: boolean;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Product document with Pakistani market specifications
 */
export interface IProduct {
  _id: Types.ObjectId;
  name: string;
  nameUr: string; // Urdu script name (e.g. پشاوری چپل)
  slug: string;
  sku: string;
  price: number; // PKR
  originalPrice: number; // PKR
  discount: number; // Percentage computed: Math.round(((originalPrice - price) / originalPrice) * 100)
  category: ProductCategory;
  subCategory: ProductSubCategory;
  brand: ProductBrand;
  sizes: string[];
  colors: IColorOption[];
  variants: IProductVariant[];
  stock: number;
  reservedStock: number;
  lowStockThreshold: number;
  images: string[];
  description: string;
  shortDescription: string;
  specifications: Map<string, string>;
  sizeGuideId?: Types.ObjectId;
  weight: number; // Grams
  isFeatured: boolean;
  isActive: boolean;
  tags: string[];
  rating: number;
  numReviews: number;
  seoTitle: string;
  seoDescription: string;
  isDeleted: boolean;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Customer order document
 */
export interface IOrder {
  _id: Types.ObjectId;
  orderNumber: string; // Format: OX-YYYY-XXXX
  userId?: Types.ObjectId | null;
  guestEmail?: string;
  guestPhone?: string;
  orderItems: IOrderItem[];
  subtotal: number; // PKR
  discountAmount: number; // PKR
  couponCode?: string;
  taxAmount: number; // 17% GST
  shippingCharges: number; // PKR
  totalAmount: number; // PKR
  shippingAddress: IOrderShippingAddress;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentDetails: IOrderPaymentDetails;
  trackingNumber?: string;
  courier?: Courier;
  estimatedDelivery?: Date;
  deliveredAt?: Date;
  codOtp?: string;
  codOtpExpiry?: Date;
  notes?: string;
  adminNotes?: string;
  invoiceUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Category taxonomy document
 */
export interface ICategory {
  _id: Types.ObjectId;
  name: string;
  nameUr: string;
  slug: string;
  type: CategoryType;
  image?: string;
  description?: string;
  parentCategory?: Types.ObjectId | null;
  order: number;
  isActive: boolean;
  seoTitle?: string;
  seoDescription?: string;
  isDeleted: boolean;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Product review document
 */
export interface IReview {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  productId: Types.ObjectId;
  orderId: Types.ObjectId;
  rating: number; // 1 to 5
  title?: string;
  comment: string;
  images: string[];
  isVerifiedPurchase: boolean;
  isApproved: boolean;
  helpfulCount: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Shopping cart document
 */
export interface ICart {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  products: ICartProductItem[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Wishlist document
 */
export interface IWishlist {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  products: ICartProductItem[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Promotional coupon document
 */
export interface ICoupon {
  _id: Types.ObjectId;
  code: string;
  type: CouponType;
  value: number; // Percentage or fixed PKR
  minOrderAmount: number;
  maxDiscountAmount?: number;
  usageLimit: number;
  usedCount: number;
  perUserLimit: number;
  applicableCategories: ProductCategory[];
  applicableBrands: ProductBrand[];
  isFirstOrderOnly: boolean;
  startsAt: Date;
  expiresAt: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Coupon redemption tracking document
 */
export interface ICouponUsage {
  _id: Types.ObjectId;
  couponId: Types.ObjectId;
  userId: Types.ObjectId;
  orderId: Types.ObjectId;
  discountApplied: number;
  usedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Push/in-app notification document
 */
export interface INotification {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Return & replacement claim document
 */
export interface IReturnRequest {
  _id: Types.ObjectId;
  orderId: Types.ObjectId;
  userId: Types.ObjectId;
  orderItemId: Types.ObjectId;
  reason: ReturnReason;
  description: string;
  images: string[];
  status: ReturnStatus;
  refundAmount: number;
  refundMethod: PaymentMethod;
  adminNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Audit log with automatic 1-year TTL
 */
export interface IAuditLog {
  _id: Types.ObjectId;
  adminId: Types.ObjectId;
  action: string;
  entity: string;
  entityId: Types.ObjectId;
  changes: {
    before?: Record<string, unknown>;
    after?: Record<string, unknown>;
  };
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Email newsletter subscriber
 */
export interface INewsletter {
  _id: Types.ObjectId;
  email: string;
  isActive: boolean;
  source: string;
  subscribedAt: Date;
  unsubscribedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Homepage & promotional banner
 */
export interface IBanner {
  _id: Types.ObjectId;
  title: string;
  image: string;
  mobileImage?: string;
  link?: string;
  position: BannerPosition;
  order: number;
  isActive: boolean;
  startsAt: Date;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Footwear size guide specification
 */
export interface ISizeGuide {
  _id: Types.ObjectId;
  name: string;
  categoryId?: Types.ObjectId;
  measurements: ISizeMeasurement[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Regional shipping courier tariff zone
 */
export interface IShippingZone {
  _id: Types.ObjectId;
  name: string;
  cities: string[];
  baseRate: number; // PKR
  perKgRate: number; // PKR
  estimatedDays: IEstimatedDeliveryDays;
  freeShippingThreshold?: number; // PKR
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Referral reward record
 */
export interface IReferral {
  _id: Types.ObjectId;
  referrerId: Types.ObjectId;
  refereeId: Types.ObjectId;
  code: string;
  rewardAmount: number; // PKR
  status: ReferralStatus;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Time-boxed flash sales
 */
export interface IFlashSale {
  _id: Types.ObjectId;
  name: string;
  productIds: Types.ObjectId[];
  discountPercentage: number;
  startsAt: Date;
  endsAt: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Abandoned checkout recovery candidate
 */
export interface IAbandonedCart {
  _id: Types.ObjectId;
  userId?: Types.ObjectId;
  email: string;
  cartSnapshot: ICartProductItem[];
  recoveryEmailSent: boolean;
  recoveredAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/* ==========================================================================
   PAGINATION & API QUERY TYPES
   ========================================================================== */

/**
 * Options for paginateQuery helper
 */
export interface IPaginationOptions {
  page?: number;
  limit?: number;
  sort?: Record<string, 1 | -1> | string;
  select?: string | Record<string, number>;
  populate?: string | PopulateOptions | (string | PopulateOptions)[];
  lean?: boolean;
}

/**
 * Type-safe paginated result payload
 */
export interface IPaginatedResult<T> {
  docs: T[];
  totalDocs: number;
  limit: number;
  page: number;
  totalPages: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  prevPage: number | null;
  nextPage: number | null;
}
