import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { CHECKOUT_URLS, ctaLabel, formatBRL, KITS, LOWEST_PRICE, premiumComparison } from './offer';
import { DELIVERY_IMAGE, FAQ, HERO_IMAGE, PREVIEWS } from './content';
import { decorateCheckoutHref, LEAD_ID_SEPARATOR, readUtmifyLeadId } from '../lib/checkoutLink';
import { offerIdFromUrl, parseCaktoCheckout } from '../../scripts/check-checkout';

const root = path.resolve(import.meta.dirname, '..', '..');
const read = (p: string) => fs.readFileSync(path.join(root, p), 'utf8');

/** Os preços usam espaço que não quebra (U+00A0); aqui comparamos com espaço comum. */
const plain = (s: string | null) => (s ?? '').replace(/ /g, ' ');

test('oferta: dois kits com os preços, quantidades e CTAs combinados', () => {
  assert.equal(plain(formatBRL(KITS.basico.price)), 'R$ 9,90');
  assert.equal(plain(formatBRL(KITS.premium.price)), 'R$ 24,90');
  assert.equal(KITS.basico.materialsCount, 100);
  assert.equal(KITS.premium.materialsCount, 300);
  assert.equal(KITS.basico.bonusCount, 0);
  assert.equal(KITS.premium.bonusCount, 10);
  assert.equal(KITS.premium.badge, 'MAIS COMPLETO');
  assert.equal(plain(ctaLabel(KITS.basico)), 'Quero o Kit Básico — R$ 9,90');
  assert.equal(plain(ctaLabel(KITS.premium)), 'Quero o Kit Premium — R$ 24,90');
  assert.equal(LOWEST_PRICE, 9.9);
  assert.equal(plain(premiumComparison()), '3x mais materiais por R$ 15,00 a mais');
  // O destaque "3x mais materiais" precisa bater com as quantidades configuradas.
  const ratio = KITS.premium.materialsCount / KITS.basico.materialsCount;
  assert.ok(KITS.premium.highlights.includes(`${ratio}x mais materiais que o Kit Básico`));
});

test('checkout: cada kit aponta para o próprio link da Cakto', () => {
  assert.equal(KITS.basico.checkoutUrl, 'https://pay.cakto.com.br/85z54d3_1324900');
  assert.equal(KITS.premium.checkoutUrl, 'https://pay.cakto.com.br/n8msmyw');
  assert.notEqual(CHECKOUT_URLS.basico, CHECKOUT_URLS.premium);
  for (const kit of Object.values(KITS)) assert.match(kit.checkoutUrl, /^https:\/\/pay\.cakto\.com\.br\/[\w-]+$/);
  // O checkout do antigo popup (R$ 19,90) não pode mais aparecer no código.
  for (const file of ['index.html', 'src/App.tsx', 'src/config/offer.ts']) assert.doesNotMatch(read(file), /xhx8yqu/);
});

test('bônus: só nomes com arquivo confirmado e nunca mais do que o total anunciado', () => {
  assert.equal(KITS.basico.documentedBonuses.length, 0);
  assert.ok(KITS.premium.documentedBonuses.length <= KITS.premium.bonusCount);
  assert.deepEqual(KITS.premium.documentedBonuses, [
    'Primeiros 7 dias de organização',
    'Desafio de 21 dias — um passo por vez',
    'Finanças do dia a dia',
    'Metas em 90 dias',
  ]);
});

test('UTMify: textos de botões que não são checkout não contêm palavras que disparam InitiateCheckout', () => {
  // Lista usada pelo pixel da UTMify para reconhecer botões de checkout pelo texto.
  const keywords = ['comprar', 'finalizar', 'compra', 'confirmar', 'quero ter', 'proximo passo', 'inscricao', 'participar', 'participe', 'checkout'];
  const normalize = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const nonCheckoutLabels = [...FAQ.map((f) => f.question), 'Ou comece pelo Kit Básico por R$ 9,90', 'Ver kits', 'Termos de Uso', 'Política de Privacidade', 'Contato', ...PREVIEWS.map((p) => p.title)];
  for (const label of nonCheckoutLabels) {
    for (const k of keywords) assert.ok(!normalize(label).includes(k), `"${label}" contém "${k}"`);
  }
});

/**
 * Confere o caminho com maiúsculas e minúsculas exatas. No Windows o sistema de
 * arquivos ignora a diferença, mas na Vercel (Linux) "Kit-Basico.webp" ≠ "kit-basico.webp".
 */
function existsExactCase(publicUrl: string): boolean {
  let dir = path.join(root, 'public');
  for (const part of publicUrl.split('/').filter(Boolean)) {
    if (!fs.existsSync(dir) || !fs.readdirSync(dir).includes(part)) return false;
    dir = path.join(dir, part);
  }
  return true;
}

test('imagens dos kits: proporção 3:2 e nomes com caixa exata', () => {
  for (const kit of Object.values(KITS)) {
    assert.equal(kit.image.width / kit.image.height, 1.5, `${kit.name}: proporção diferente de 3:2`);
    for (const url of [kit.image.src, ...kit.image.srcSetAvif.split(','), ...kit.image.srcSetWebp.split(',')]) {
      const file = url.trim().split(' ')[0];
      assert.ok(existsExactCase(file), `caminho não existe com essa caixa exata: ${file}`);
    }
  }
});

test('imagens: todas existem e são leves', () => {
  const urls = [
    ...[HERO_IMAGE, DELIVERY_IMAGE, ...PREVIEWS.map((p) => p.thumb), KITS.basico.image, KITS.premium.image].flatMap((img) =>
      [img.src, ...img.srcSetAvif.split(','), ...img.srcSetWebp.split(',')].map((s) => s.trim().split(' ')[0])
    ),
    ...PREVIEWS.map((p) => p.full.src),
    // Tudo que o index.html aponta: preload da imagem principal, og:image, twitter:image e JSON-LD.
    ...[...read('index.html').matchAll(/\/assets\/mockups\/[\w.-]+/g)].map((m) => m[0]),
  ];
  assert.ok(urls.some((u) => u.endsWith('.jpg')), 'index.html deveria apontar a imagem de compartilhamento (og:image)');
  for (const url of new Set(urls)) {
    const file = path.join(root, 'public', url);
    assert.ok(existsExactCase(url), `imagem ausente (ou com caixa diferente): ${url}`);
    assert.ok(fs.statSync(file).size < 160 * 1024, `imagem pesada: ${url}`);
  }
});

test('prévias: a página ampliada tem a proporção do A4 e o aviso de kit só aparece onde precisa', () => {
  for (const p of PREVIEWS) {
    assert.ok(Math.abs(p.full.height / p.full.width - Math.SQRT2) < 0.01, `${p.title}: página ampliada fora da proporção A4`);
  }
  // O controle financeiro é da categoria Finanças pessoais (materiais 126 a 150): não vem no Kit Básico.
  assert.equal(PREVIEWS.find((p) => p.id === 'financeiro')?.onlyIn, 'Kit Premium');
});

test('rastreamento: index.html tem só os 2 scripts da UTMify, sem Pixel manual nem proxy de fetch', () => {
  const html = read('index.html');
  const payloads = [...html.matchAll(/atob\("([^"]+)"\)/g)].map((m) => {
    const b = Buffer.from(m[1], 'base64');
    const k = b[0];
    const key = b.subarray(1, 1 + k);
    return JSON.parse(Buffer.from(b.subarray(1 + k).map((x, i) => x ^ key[i % k])).toString('utf8'));
  });
  assert.equal(payloads.length, 2);
  assert.equal(payloads[0].url, 'https://cdn.utmify.com.br/scripts/utms/latest.js');
  assert.equal(payloads[1].url, 'https://cdn.utmify.com.br/scripts/pixel/pixel.js');
  assert.deepEqual(payloads[1].globals, [{ name: 'pixelId', value: '6afc2b5608a5363c6845f95f' }]);
  assert.doesNotMatch(html, /fbq\(|fbevents\.js|wrapFetchProxy|defineProperty/);
  const ld = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)![1]);
  assert.equal(Number(ld.offers.lowPrice), KITS.basico.price);
  assert.equal(Number(ld.offers.highPrice), KITS.premium.price);
});

test('rastreamento: o código da página não chama o Pixel nem forja respostas da UTMify', () => {
  const files = ['src/App.tsx', 'src/main.tsx', 'src/lib/checkoutLink.ts', 'vite.config.ts'];
  for (const f of files) assert.doesNotMatch(read(f), /fbq\s*\(|trackCustom|__utmifyTrackers|metaPixelIds|createServer/, f);
});

test('link de checkout: completa UTMs e o ID do lead como a UTMify faz', () => {
  const base = 'https://pay.cakto.com.br/n8msmyw';
  const page = '?utm_source=FB&utm_campaign=c1&fbclid=abc&outro=x';
  const out = new URL(decorateCheckoutHref(base, page, 'lead123'));
  assert.equal(out.searchParams.get('utm_source'), `FB${LEAD_ID_SEPARATOR}lead123`);
  assert.equal(out.searchParams.get('utm_campaign'), 'c1');
  assert.equal(out.searchParams.get('fbclid'), 'abc');
  assert.equal(out.searchParams.has('outro'), false);

  // Não duplica o ID nem sobrescreve o que a UTMify já colocou no link.
  const already = `${base}?utm_source=IG${LEAD_ID_SEPARATOR}x9&utm_campaign=orig`;
  const again = new URL(decorateCheckoutHref(already, page, 'lead123'));
  assert.equal(again.searchParams.get('utm_source'), `IG${LEAD_ID_SEPARATOR}x9`);
  assert.equal(again.searchParams.get('utm_campaign'), 'orig');

  assert.equal(decorateCheckoutHref(base, '', null), base);
  assert.equal(decorateCheckoutHref('não é url', page, 'x'), 'não é url');
  assert.equal(readUtmifyLeadId({ getItem: () => '{"_id":"abc"}' }), 'abc');
  assert.equal(readUtmifyLeadId({ getItem: () => 'quebrado' }), null);
  assert.equal(readUtmifyLeadId(undefined), null);
});

test('conferência da Cakto: lê nome e preço da oferta certa no HTML do checkout', () => {
  const html = '{\\"initialData\\":{\\"id\\":\\"n8msmyw\\",\\"name\\":\\"Coleção Premium\\",\\"price\\":24.9}} Taxa de serviço';
  const info = parseCaktoCheckout(html, 'n8msmyw');
  assert.equal(info.name, 'Coleção Premium');
  assert.equal(info.price, 24.9);
  assert.equal(info.hasServiceFee, true);
  assert.equal(parseCaktoCheckout(html, 'outro').price, null);
  assert.equal(offerIdFromUrl('https://pay.cakto.com.br/85z54d3_1324900'), '85z54d3');
  assert.equal(offerIdFromUrl('https://pay.cakto.com.br/n8msmyw'), 'n8msmyw');
});
