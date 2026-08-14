import { timingSafeEqual } from 'node:crypto';
import { revalidatePath, revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';
import { CONTENT_TAG } from '@/lib/content/directus/client';
import { locales } from '@/i18n/config';

/**
 * Секрет принимается только заголовком.
 *
 * Раньше он читался ещё и из `?secret=` — а query-строка попадает в access-лог
 * Nginx, в `Referer` и в историю браузера, то есть долгоживущий секрет оседал
 * сразу в трёх местах. Документированный Directus Flow
 * (directus/flows/revalidate.md) и так шлёт заголовок.
 */
function isAuthorized(request: Request): boolean {
  const secret = process.env.REVALIDATE_SECRET?.trim();
  if (!secret) return false;

  const header = request.headers.get('x-revalidate-secret');
  if (!header) return false;

  const expected = Buffer.from(secret, 'utf8');
  const received = Buffer.from(header, 'utf8');

  // timingSafeEqual бросает исключение при разной длине буферов. Сравниваем
  // ожидаемое с самим собой, чтобы время ответа не подсказывало, угадана ли
  // длина секрета, — и только потом возвращаем false.
  if (expected.length !== received.length) {
    timingSafeEqual(expected, expected);
    return false;
  }

  return timingSafeEqual(expected, received);
}

/**
 * On-demand revalidation после правок в Directus.
 * Directus Flow → POST сюда с заголовком x-revalidate-secret.
 *
 * Только POST: ревалидация — побочный эффект, а GET на неё дёргается чем
 * угодно, от префетча до `<img src>` на чужой странице.
 */
export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  revalidateTag(CONTENT_TAG, 'max');
  for (const locale of locales) {
    revalidatePath(`/${locale}`);
    revalidatePath(`/${locale}/privacy`);
  }

  return NextResponse.json({ ok: true, revalidated: true, tag: CONTENT_TAG });
}
