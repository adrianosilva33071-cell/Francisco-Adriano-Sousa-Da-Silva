import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  formatBrazilianDate,
  calculateSavings,
  formatCurrencyBRL,
  getNextCarouselIndex,
  ensureWritableWindowFetch,
  HERO_PLANNER_IMAGE,
  PROMO_DATE_TEXT,
  GUARANTEE_BADGE_IMAGE,
  PAIN_POINTS,
  PRODUCT_DEMO_ITEMS,
  CAROUSEL_MODELS,
  STEP_ITEMS,
  KIT_OPTIONS,
  BONUS_ITEMS,
  FAQ_ITEMS,
  SUPPORT_HIGHLIGHTS,
  UPSELL_MODAL_CONTENT,
  resolveUpsellAction,
  CAKTO_BASICO_URL,
  CAKTO_PREMIUM_URL,
  CAKTO_PREMIUM_UPSELL_URL,
  toAvifUrl,
  getResponsiveImageSources,
} from './catalogData';

test('formatBrazilianDate formats 2026-11-14 as 14/11/2026', () => {
  const d = new Date('2026-11-14T12:00:00Z');
  assert.equal(formatBrazilianDate(d), '14/11/2026');
});

test('calculateSavings computes exact difference for Kit Premium De R$ 59,90 por R$ 29,90', () => {
  const saved = calculateSavings(59.9, KIT_OPTIONS.premium.priceNumeric);
  assert.equal(saved, 30);
  assert.equal(formatCurrencyBRL(saved), 'R$ 30,00');
});

test('getNextCarouselIndex wraps around forward and backward across 8 planner models', () => {
  assert.equal(getNextCarouselIndex(0, 8, 'next'), 1);
  assert.equal(getNextCarouselIndex(7, 8, 'next'), 0);
  assert.equal(getNextCarouselIndex(0, 8, 'prev'), 7);
  assert.equal(getNextCarouselIndex(2, 8, 'prev'), 1);
});

test('toAvifUrl and getResponsiveImageSources generate valid AVIF and WebP srcSets', () => {
  assert.equal(
    toAvifUrl('/assets/planners/hero-planner.webp'),
    '/assets/planners/hero-planner.avif'
  );
  const heroSet = getResponsiveImageSources('/assets/planners/hero-planner.webp', {
    suffix: '640w',
    widthDescriptor: '640w',
    fullWidthDescriptor: '1272w',
  });
  assert.equal(
    heroSet.avifSrcSet,
    '/assets/planners/hero-planner-640w.avif 640w, /assets/planners/hero-planner.avif 1272w'
  );
  assert.equal(
    heroSet.webpSrcSet,
    '/assets/planners/hero-planner-640w.webp 640w, /assets/planners/hero-planner.webp 1272w'
  );
});

test('catalog contains 6 pain points, 6 product demos (01-06), 4 support highlights, 6 bonuses, and 7 FAQs', () => {
  assert.equal(PAIN_POINTS.length, 6);
  assert.equal(PRODUCT_DEMO_ITEMS.length, 6);
  assert.deepEqual(
    PRODUCT_DEMO_ITEMS.map((item) => item.number),
    ['01', '02', '03', '04', '05', '06']
  );
  assert.equal(SUPPORT_HIGHLIGHTS.length, 4);
  assert.equal(BONUS_ITEMS.length, 6);
  for (const bonus of BONUS_ITEMS) {
    assert.equal(bonus.originalPrice, undefined);
  }
  assert.equal(KIT_OPTIONS.premium.bonuses?.length, 6);
  assert.equal(FAQ_ITEMS.length, 7);
  assert.equal(
    FAQ_ITEMS.some((f) => f.id === 'suporte-humanizado'),
    true
  );
  assert.equal(PROMO_DATE_TEXT, 'OFERTA EXCLUSIVA • POR TEMPO LIMITADO');
  assert.equal(KIT_OPTIONS.basico.price, 'R$ 9,90');
  assert.equal(KIT_OPTIONS.premium.oldPrice, 'R$ 59,90');
  assert.equal(KIT_OPTIONS.premium.price, 'R$ 29,90');
  assert.equal(KIT_OPTIONS.basico.subtitle, '50 MATERIAIS DE ORGANIZAÇÃO');
  assert.equal(KIT_OPTIONS.premium.subtitle, '150 MATERIAIS DE ORGANIZAÇÃO');
  assert.equal(KIT_OPTIONS.premium.badge, 'MAIS COMPLETO');
  assert.equal(KIT_OPTIONS.basico.checkoutUrl, 'https://pay.cakto.com.br/85z54d3_1324900');
  assert.equal(KIT_OPTIONS.premium.checkoutUrl, 'https://pay.cakto.com.br/n8msmyw');
  assert.equal(CAKTO_PREMIUM_UPSELL_URL, 'https://pay.cakto.com.br/xhx8yqu');
});

test('all 17 active planner images have AVIF + WebP + responsive mobile variants on disk and unused files are removed', () => {
  assert.equal(CAROUSEL_MODELS.length, 8);
  assert.equal(STEP_ITEMS.length, 3);

  const uniquePaths = new Set([
    HERO_PLANNER_IMAGE,
    GUARANTEE_BADGE_IMAGE,
    ...CAROUSEL_MODELS.map((m) => m.image),
    ...STEP_ITEMS.map((s) => s.image),
    ...BONUS_ITEMS.map((b) => b.image),
  ]);

  assert.equal(uniquePaths.size, 17);
  for (const relUrl of uniquePaths) {
    assert.match(relUrl, /^\/assets\/planners\/[a-z0-9-]+\.webp$/);
    const webpDiskPath = path.resolve('public', relUrl.slice(1));
    const avifDiskPath = path.resolve('public', toAvifUrl(relUrl).slice(1));
    assert.equal(fs.existsSync(webpDiskPath), true, `Missing WebP asset: ${webpDiskPath}`);
    assert.equal(fs.existsSync(avifDiskPath), true, `Missing AVIF asset: ${avifDiskPath}`);
    assert.equal(fs.statSync(webpDiskPath).size > 500, true);
    assert.equal(fs.statSync(avifDiskPath).size > 500, true);
  }

  // Verify responsive mobile hero variants exist
  assert.equal(
    fs.existsSync(path.resolve('public/assets/planners/hero-planner-640w.avif')),
    true
  );
  assert.equal(
    fs.existsSync(path.resolve('public/assets/planners/hero-planner-640w.webp')),
    true
  );

  // Verify unused directory was removed
  assert.equal(fs.existsSync(path.resolve('public/assets/cloned')), false);
});

test('ensureWritableWindowFetch converts getter-only fetch into assignable property', () => {
  const mockWin: Record<string, unknown> = {};
  const originalFn = () => 'original';
  Object.defineProperty(mockWin, 'fetch', {
    configurable: true,
    get() {
      return originalFn;
    },
  });
  assert.equal(ensureWritableWindowFetch(mockWin), true);
  const replacementFn = () => 'replaced';
  mockWin.fetch = replacementFn;
  assert.equal(mockWin.fetch, replacementFn);
});

test('upsell modal content and resolveUpsellAction handle decline and accept paths safely', () => {
  assert.equal(UPSELL_MODAL_CONTENT.headline, 'OFERTA EXCLUSIVA PARA VOCÊ!');
  assert.equal(UPSELL_MODAL_CONTENT.subheadline, 'Que tal levar a coleção completa?');
  assert.equal(UPSELL_MODAL_CONTENT.productTitle, 'KIT PREMIUM — PLANNER 2027');
  assert.equal(UPSELL_MODAL_CONTENT.originalPrice, 'R$ 29,90');
  assert.equal(UPSELL_MODAL_CONTENT.promotionalPrice, 'R$ 19,90');
  assert.equal(UPSELL_MODAL_CONTENT.acceptCtaLabel, 'SIM! QUERO MEU PREMIUM POR R$ 19,90');
  assert.equal(
    UPSELL_MODAL_CONTENT.declineCtaLabel,
    'Não, obrigado. Quero continuar com o plano básico'
  );

  // Path 1: Decline -> always redirects to Basic plan checkout
  const declined = resolveUpsellAction('decline');
  assert.equal(declined.status, 'redirect');
  assert.equal(declined.targetUrl, CAKTO_BASICO_URL);
  assert.equal(declined.priceNumeric, 9.9);

  // Path 2: Default Accept -> redirects to official promotional R$ 19,90 checkout
  const acceptedDefault = resolveUpsellAction('accept');
  assert.equal(acceptedDefault.status, 'redirect');
  assert.equal(acceptedDefault.targetUrl, 'https://pay.cakto.com.br/xhx8yqu');
  assert.equal(acceptedDefault.priceNumeric, 19.9);

  // Safeguard: Never reuse the R$ 29,90 checkout link pretending it is R$ 19,90
  const rejectedSameAs2990 = resolveUpsellAction('accept', CAKTO_PREMIUM_URL);
  assert.equal(rejectedSameAs2990.status, 'missing_upsell_url');
  assert.equal(rejectedSameAs2990.targetUrl, null);
});
