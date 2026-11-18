/**
 * Confere se cada checkout da Cakto cobra o mesmo preço configurado na página.
 * Só baixa o HTML público do checkout (não executa scripts, não dispara pixel).
 *
 * Uso: npm run check:checkout
 */
import { formatBRL, KITS } from '../src/config/offer';

interface CheckoutInfo {
  name: string | null;
  price: number | null;
  hasServiceFee: boolean;
  hasUrgencyBanner: boolean;
}

/** Código da oferta na Cakto: a parte do caminho antes de "_" (ex.: 85z54d3_1324900 → 85z54d3). */
export function offerIdFromUrl(checkoutUrl: string): string {
  return new URL(checkoutUrl).pathname.replace(/^\//, '').split('_')[0];
}

export function parseCaktoCheckout(html: string, offerId: string): CheckoutInfo {
  const text = html.replace(/\\"/g, '"');
  const start = text.indexOf(`"initialData":{"id":"${offerId}"`);
  let name: string | null = null;
  let price: number | null = null;
  if (start !== -1) {
    const slice = text.slice(start, start + 4000);
    name = slice.match(/"name":"([^"]+)"/)?.[1] ?? null;
    const p = slice.match(/"price":"?([0-9]+(?:\.[0-9]+)?)"?/);
    price = p ? Number(p[1]) : null;
  }
  return {
    name,
    price,
    hasServiceFee: /Taxa de serviço/i.test(text),
    hasUrgencyBanner: /Oferta por tempo limitado/i.test(text),
  };
}

async function main() {
  let ok = true;
  for (const kit of Object.values(KITS)) {
    const offerId = offerIdFromUrl(kit.checkoutUrl);
    const res = await fetch(kit.checkoutUrl, { headers: { 'user-agent': 'Mozilla/5.0 (checkout-check)' } });
    const info = parseCaktoCheckout(await res.text(), offerId);
    const match = info.price !== null && Math.abs(info.price - kit.price) < 0.001;
    ok &&= match;
    console.log(`\n${kit.name} → ${kit.checkoutUrl}`);
    console.log(`  produto na Cakto: ${info.name ?? '(não encontrado)'}`);
    console.log(`  preço na Cakto:   ${info.price !== null ? formatBRL(info.price) : '(não encontrado)'}`);
    console.log(`  preço na página:  ${formatBRL(kit.price)}  ${match ? 'OK' : 'DIFERENTE'}`);
    if (info.hasServiceFee) console.log('  aviso: o checkout mostra "Taxa de serviço" somada ao preço');
    if (info.hasUrgencyBanner) console.log('  aviso: o checkout mostra "Oferta por tempo limitado"');
  }
  if (!ok) {
    console.error('\nPreço diferente entre página e checkout. Ajuste a Cakto ou src/config/offer.ts.');
    process.exit(1);
  }
  console.log('\nPreços conferidos.');
}

if (process.argv[1]?.endsWith('check-checkout.ts')) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
