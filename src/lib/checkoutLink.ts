/**
 * Proteção mínima da atribuição no clique para o checkout.
 *
 * O script oficial da UTMify (utms/latest.js) já coloca as UTMs nos links e
 * acrescenta o ID do lead ao utm_source no formato `origem` + `jLj` + `id`.
 * Ele só atualiza os links quando a página muda; se a pessoa clica antes de o
 * lead chegar (~0,5 s), o ID pode ficar de fora. Esta função repete a mesma
 * regra no momento do clique. Não dispara eventos, não mexe no Pixel.
 */

export const LEAD_ID_SEPARATOR = 'jLj';

/** Parâmetros de atribuição repassados ao checkout se ainda não estiverem no link. */
export const TRACKING_PARAMS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
  'utm_id',
  'fbclid',
  'src',
] as const;

export function decorateCheckoutHref(href: string, pageSearch: string, leadId: string | null): string {
  let url: URL;
  try {
    url = new URL(href);
  } catch {
    return href;
  }

  const page = new URLSearchParams(pageSearch.startsWith('?') ? pageSearch.slice(1) : pageSearch);
  for (const key of TRACKING_PARAMS) {
    const value = page.get(key)?.trim();
    if (value && !url.searchParams.has(key)) url.searchParams.set(key, value);
  }

  const source = url.searchParams.get('utm_source');
  if (leadId && source && !source.includes(LEAD_ID_SEPARATOR)) {
    url.searchParams.set('utm_source', `${source}${LEAD_ID_SEPARATOR}${leadId}`);
  }

  return url.toString();
}

export function readUtmifyLeadId(storage: Pick<Storage, 'getItem'> | undefined): string | null {
  try {
    const raw = storage?.getItem('lead');
    if (!raw) return null;
    const id = (JSON.parse(raw) as { _id?: unknown })._id;
    return typeof id === 'string' && id.trim() ? id.trim() : null;
  } catch {
    return null;
  }
}

/**
 * Atualiza o href do link de checkout no início do clique (fase de captura),
 * antes de o navegador seguir o link.
 */
export function installCheckoutLinkGuard(win: Window): void {
  win.addEventListener(
    'click',
    (event) => {
      const target = event.target as Element | null;
      const anchor = target?.closest?.('a[href*="pay.cakto.com.br/"]') as HTMLAnchorElement | null;
      if (!anchor) return;
      let storage: Storage | undefined;
      try {
        storage = win.localStorage;
      } catch {
        storage = undefined;
      }
      const next = decorateCheckoutHref(anchor.href, win.location.search, readUtmifyLeadId(storage));
      if (next !== anchor.href) anchor.setAttribute('href', next);
    },
    true
  );
}
