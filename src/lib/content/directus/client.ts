const CONTENT_TAG = 'site-content';

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

  const url = path.startsWith('http') ? path : `${base}${path.startsWith('/') ? path : `/${path}`}`;
  const res = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    next: {
      tags: [CONTENT_TAG],
      revalidate: 60,
      ...(init?.next ?? {}),
    },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Directus ${res.status} ${path}: ${body.slice(0, 400)}`);
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
