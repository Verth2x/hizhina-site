import { revalidatePath, revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';
import { CONTENT_TAG } from '@/lib/content/directus/client';
import { locales } from '@/i18n/config';

function isAuthorized(request: Request): boolean {
  const secret = process.env.REVALIDATE_SECRET?.trim();
  if (!secret) return false;

  const header = request.headers.get('x-revalidate-secret');
  if (header && header === secret) return true;

  const url = new URL(request.url);
  const query = url.searchParams.get('secret');
  return query === secret;
}

/**
 * On-demand revalidation после правок в Directus.
 * Directus Flow → POST сюда с заголовком x-revalidate-secret.
 */
export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  revalidateTag(CONTENT_TAG, 'max');
  for (const locale of locales) {
    revalidatePath(`/${locale}`);
    revalidatePath(`/${locale}/privacy`);
  }

  return NextResponse.json({ ok: true, revalidated: true, tag: CONTENT_TAG });
}

export async function GET(request: Request) {
  return POST(request);
}
