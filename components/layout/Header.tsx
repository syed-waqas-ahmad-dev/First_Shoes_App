'use client';

/**
 * @file components/layout/Header.tsx
 * @description Nike-inspired minimalist e-commerce navigation header for OX Shoes.
 * Clean monochrome palette, visual image logo without textual clutter,
 * menu icon shifted to right side on mobile, fully responsive with zero overflow.
 * Strict TypeScript: ZERO `any`.
 */

import { useState } from 'react';
import Link from 'next/link';
import { useCartStore } from '@/lib/store/cart';
import { useWishlistStore } from '@/lib/store/wishlist';
import { useLocaleStore } from '@/lib/store/locale';
import { NAV_LINKS } from '@/lib/constants';
import { Logo } from '@/components/layout/Logo';
import {
  Search,
  ShoppingBag,
  Heart,
  User,
  Globe,
  Menu,
  X,
  Compass,
  ChevronRight,
} from 'lucide-react';

interface HeaderProps {
  onOpenSearch: () => void;
}

export function Header({ onOpenSearch }: HeaderProps) {
  const { openCart, getTotalItems } = useCartStore();
  const { items: wishlistItems } = useWishlistStore();
  const { isUrdu, toggleLocale } = useLocaleStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const totalCartCount = getTotalItems();
  const wishlistCount = wishlistItems.length;

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-neutral-200 text-neutral-900 transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2 sm:gap-4">
          {/* Left: Brand Image Logo ONLY (no text, no left menu) */}
          <div className="flex items-center shrink-0">
            <Logo size="md" />
          </div>

          {/* Center: Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-7 text-sm font-semibold tracking-tight">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`transition-colors py-2 relative hover:text-neutral-950 ${
                  link.highlight
                    ? 'text-red-600 hover:text-red-700 font-bold'
                    : 'text-neutral-700 hover:text-black'
                }`}
              >
                {isUrdu ? link.labelUr : link.label}
              </Link>
            ))}
          </nav>

          {/* Right Action Icons & Mobile Menu Button (shifted to right side) */}
          <div className="flex items-center gap-1 sm:gap-2 md:gap-3 shrink-0">
            {/* Search Trigger */}
            <button
              onClick={onOpenSearch}
              className="flex items-center gap-2 p-2 sm:px-3 sm:py-2 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-600 text-xs font-medium transition-colors"
              title="Search shoes (Cmd + K)"
              aria-label="Search shoes"
            >
              <Search className="h-4 w-4 text-neutral-600 shrink-0" />
              <span className="hidden md:inline-block">
                {isUrdu ? 'تلاش کریں...' : 'Search...'}
              </span>
              <kbd className="hidden md:inline-block px-1.5 py-0.5 text-[10px] bg-white border border-neutral-300 rounded font-mono text-neutral-500">
                ⌘K
              </kbd>
            </button>

            {/* Language Switcher (Visible on tablet/desktop, integrated into drawer on mobile) */}
            <button
              onClick={toggleLocale}
              className="hidden sm:flex px-2.5 py-1.5 rounded-full hover:bg-neutral-100 text-neutral-700 text-xs font-bold transition-colors items-center gap-1 border border-neutral-200 shrink-0"
              title="Switch Language / زبان تبدیل کریں"
              aria-label="Switch Language"
            >
              <Globe className="h-3.5 w-3.5" />
              <span>{isUrdu ? 'EN' : 'اردو'}</span>
            </button>

            {/* Wishlist Link */}
            <Link
              href="/dashboard/wishlist"
              className="p-2 rounded-full hover:bg-neutral-100 text-neutral-700 transition-colors relative shrink-0"
              aria-label="Wishlist"
            >
              <Heart className="h-5 w-5" />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 h-4 w-4 bg-red-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-in zoom-in-50">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart Drawer Launcher */}
            <button
              onClick={openCart}
              className="p-2 rounded-full hover:bg-neutral-100 text-neutral-900 transition-colors relative shrink-0"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="h-5 w-5" />
              {totalCartCount > 0 && (
                <span className="absolute top-1 right-1 h-4 w-4 bg-neutral-950 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-in zoom-in-50">
                  {totalCartCount}
                </span>
              )}
            </button>

            {/* User Account / Sign In (Visible on tablet/desktop, in drawer on mobile) */}
            <Link
              href="/dashboard/profile"
              className="hidden sm:flex p-2 rounded-full hover:bg-neutral-100 text-neutral-700 transition-colors shrink-0"
              aria-label="Account"
            >
              <User className="h-5 w-5" />
            </Link>

            {/* Mobile Menu Toggle Button (SHIFTED TO RIGHT SIDE) */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-md hover:bg-neutral-100 text-neutral-800 transition-colors shrink-0"
              aria-label={mobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-neutral-200 bg-white px-4 py-4 space-y-4 animate-in slide-in-from-top-2 duration-200 shadow-lg">
          {/* Mobile Profile & Language Quick Access */}
          <div className="flex flex-col gap-2 pb-3 border-b border-neutral-100">
            <Link
              href="/dashboard/profile"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-50 hover:bg-neutral-100 border border-neutral-100 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-neutral-900 text-white flex items-center justify-center">
                  <User className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-neutral-900">
                    {isUrdu ? 'میرا اکاؤنٹ' : 'My Account'}
                  </div>
                  <div className="text-[11px] text-neutral-500">
                    {isUrdu ? 'پروفائل، آرڈرز اور پتہ' : 'Orders, Wishlist & Profile'}
                  </div>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-neutral-400" />
            </Link>

            <div className="flex items-center justify-between px-2 pt-1">
              <span className="text-xs font-medium text-neutral-600 flex items-center gap-1.5">
                <Globe className="h-3.5 w-3.5 text-neutral-500" />
                {isUrdu ? 'زبان منتخب کریں' : 'Language'}
              </span>
              <button
                onClick={toggleLocale}
                className="px-3 py-1 rounded-full bg-neutral-100 hover:bg-neutral-200 text-xs font-bold text-neutral-800 border border-neutral-200 transition-colors"
              >
                {isUrdu ? 'English میں دیکھیں' : 'اردو میں دیکھیں'}
              </button>
            </div>
          </div>

          {/* Navigation Category Links */}
          <div className="flex flex-col space-y-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`py-2 px-2 rounded-lg text-sm font-semibold transition-colors ${
                  link.highlight
                    ? 'text-red-600 bg-red-50/50 hover:bg-red-50'
                    : 'text-neutral-800 hover:bg-neutral-50'
                }`}
              >
                {isUrdu ? link.labelUr : link.label}
              </Link>
            ))}
          </div>

          {/* Auxiliary Links */}
          <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-600">
            <Link
              href="/dashboard/orders"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-1.5 hover:text-neutral-950 font-medium py-1"
            >
              <Compass className="h-4 w-4 text-amber-600" />
              {isUrdu ? 'آرڈر ٹریک کریں' : 'Track Order'}
            </Link>

            <Link
              href="/dashboard/wishlist"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-1.5 hover:text-neutral-950 font-medium py-1"
            >
              <Heart className="h-4 w-4 text-red-500" />
              {isUrdu ? 'پسندیدہ اشیاء' : 'Wishlist'} ({wishlistCount})
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
