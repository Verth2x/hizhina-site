const CONTENT_TAG = 'site-content';

/**
 * Directus зовёт /api/revalidate на каждую правку (directus/flows/revalidate.md),
 * поэтому фоновое протухание — не основной путь инвалидации, а страховка на
 * случай, если Flow отключили или webhook не дошёл. Прежние 60 секунд означали
 * пять запросов к CMS в минуту на локаль ради контента, который меняется
 * несколько раз в год.
 */
const CONTENT_REVALIDATE_SECONDS = 3600;

/** Столько ждём CMS, прежде чем считать её недоступной. */
const REQUEST_TIMEOUT_MS = 5000;

export function getDirectusUrl(): string | undefined {
  const url = process.env.DIRECTUS_URL?.trim();
  return url ? url.replace(/\/+$/, '') : undefined;
}

export function getDirectusToken(): string | undefined {
  return process.env.DIRECTUS_TOKEN?.trim() || undefined;
}

type DirectusListResponse<T> = { data: T };
type DirectusItemResponse<T> = { data: T };

type FetchInit = RequestInit & {
  next?: { tags?: string[]; revalidate?: number | false };
};

export async function directusFetch<T>(path: string, init?: FetchInit): Promise<T> {
  const base = getDirectusUrl();
  const token = getDirectusToken();
  if (!base) {
    throw new Error('DIRECTUS_URL не задан');
  }
  if (!token) {
    throw new Error('DIRECTUS_TOKEN не задан');
  }

  // Путь всегда относительный. Раньше строка, начинающаяся с http, уходила
  // в fetch как есть — заготовленный SSRF на случай, если путь однажды
  // придёт снаружи. Ни один вызов такой формой не пользовался.
  const url = `${base}${path.startsWith('/') ? path : `/${path}`}`;

  const res = await fetch(url, {
    ...init,
    // Без таймаута зависший Directus держит рендер страницы столько, сколько
    // готов ждать сокет, и с CONTENT_FALLBACK=static переход на статику тоже
    // не случается — падать нужно быстро и предсказуемо.
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    next: {
      tags: [CONTENT_TAG],
      revalidate: CONTENT_REVALIDATE_SECONDS,
      ...(init?.next ?? {}),
    },
  });

  if (!res.ok) {
    // Тело ответа — в лог, но не в текст ошибки: сообщение доезжает до
    // страницы ошибки и до digest, а Directus кладёт в тело подробности схемы.
    const body = await res.text().catch(() => '');
    console.error(`[directus] ${res.status} ${path}`, body.slice(0, 400));
    throw new Error(`Directus ${res.status} ${path}`);
  }

  return res.json() as Promise<T>;
}

export async function directusGetItem<T>(collection: string, query = ''): Promise<T> {
  const q = query ? (query.startsWith('?') ? query : `?${query}`) : '';
  const json = await directusFetch<DirectusItemResponse<T>>(`/items/${collection}${q}`);
  return json.data;
}

export async function directusGetItems<T>(collection: string, query = ''): Promise<T[]> {
  const q = query ? (query.startsWith('?') ? query : `?${query}`) : '';
  const json = await directusFetch<DirectusListResponse<T[]>>(`/items/${collection}${q}`);
  return json.data ?? [];
}

export { CONTENT_TAG };
