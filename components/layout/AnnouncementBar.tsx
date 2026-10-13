'use client';

/**
 * @file components/layout/AnnouncementBar.tsx
 * @description Top promotional ticker for free shipping & COD announcements.
 * Strict TypeScript: ZERO `any`.
 */

import { useLocaleStore } from '@/lib/store/locale';
import { Truck, ShieldCheck, Zap } from 'lucide-react';

export function AnnouncementBar() {
  const { isUrdu } = useLocaleStore();

  return (
    <div className="bg-neutral-900 text-neutral-200 text-xs py-2 px-4 border-b border-neutral-800 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between text-[11px] sm:text-xs">
        <div className="flex items-center gap-2 font-medium tracking-wide mx-auto sm:mx-0">
          <Truck className="h-3.5 w-3.5 text-amber-400 shrink-0" />
          <span>
            {isUrdu
              ? 'پورے پاکستان میں روپے ۳,۵۰۰ سے زیادہ کے آرڈرز پر مفت ایکسپریس ڈیلیوری | کیش آن ڈیلیوری دستیاب ہے'
              : 'FREE EXPRESS SHIPPING ON ORDERS OVER PKR 3,500 ACROSS PAKISTAN | CASH ON DELIVERY (COD) AVAILABLE'}
          </span>
        </div>

        <div className="hidden sm:flex items-center gap-4 text-neutral-400 text-[11px]">
          <span className="flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            {isUrdu ? '۷ دن کی آسان واپسی' : '7-Day Easy Returns'}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Zap className="h-3.5 w-3.5 text-sky-400" />
            {isUrdu ? 'جے زیڈ کیش اور ایزی پیسہ' : 'JazzCash & Easypaisa'}
          </span>
        </div>
      </div>
    </div>
  );
}
