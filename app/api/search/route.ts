/**
 * @file app/api/search/route.ts
 * @description Fast auto-complete and search route handler for storefront navigation.
 * Strict TypeScript: ZERO `any`.
 */

import { NextResponse, type NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/db/connect';
import { Product } from '@/models/Product';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const q = searchParams.get('q') || '';

  if (!q.trim()) {
    return NextResponse.json({ products: [], suggestions: [] });
  }

  try {
    await connectToDatabase();
    const regex = new RegExp(q.trim(), 'i');

    const products = await Product.find({
      isActive: true,
      isDeleted: { $ne: true },
      $or: [{ name: regex }, { nameUr: regex }, { subCategory: regex }, { tags: regex }],
    })
      .select('name nameUr slug price images subCategory brand rating')
      .limit(6)
      .lean();

    const formatted = products.map((p) => ({
      name: p.name,
      nameUr: p.nameUr,
      slug: p.slug,
      price: p.price,
      image: p.images[0] || '',
      subCategory: p.subCategory,
      rating: p.rating,
    }));

    return NextResponse.json({ products: formatted });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Search error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
