'use client';

export type PaginatedResult<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
};

function buildAdminUrl(
  path: string,
  params?: Record<string, string | number | undefined>,
): string {
  const base = process.env.NEXT_PUBLIC_API_URL;
  if (!base) {
    throw new Error('NEXT_PUBLIC_API_URL is not set');
  }
  const root = base.replace(/\/$/, '');
  const p = path.startsWith('/') ? path : `/${path}`;
  const url = new URL(`${root}${p}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== '') {
        url.searchParams.set(k, String(v));
      }
    });
  }
  return url.toString();
}

export async function adminGet<T>(
  accessToken: string,
  path: string,
  params?: Record<string, string | number | undefined>
): Promise<T> {
  const res = await fetch(buildAdminUrl(path, params), {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
  return res.json();
}

export async function adminPatch<T>(
  accessToken: string,
  path: string,
  body: unknown,
): Promise<T> {
  const url = buildAdminUrl(path);
  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
  return res.json();
}
