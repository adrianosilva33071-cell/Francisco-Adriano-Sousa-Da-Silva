import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  calculatePriceDifference,
  calculateSavings,
  formatCurrencyBRL,
  getNextCarouselIndex,
  buildCheckoutUrlWithTracking,
  createTrackingEventId,
  dispatchFunnelTrackingEvent,
  HERO_PLANNER_IMAGE,
  HERO_BADGE_TEXT,
  HERO_HEADLINE,
  HERO_SUBHEADLINE,
  HERO_QUICK_BENEFITS,
  HERO_MOCKUP_PREVIEWS,
  PLAN_COMPARISON_ROWS,
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

test('calculatePriceDifference computes exact R$ 10,00 popup difference (R$ 19,90 vs R$ 9,90) and R$ 18,00 direct difference (R$ 27,90 vs R$ 9,90)', () => {
  const popupDiff = calculatePriceDifference(
    UPSELL_MODAL_CONTENT.premiumComparison.priceNumeric,
    KIT_OPTIONS.basico.priceNumeric
  );
  assert.equal(popupDiff, 10);
  assert.equal(formatCurrencyBRL(popupDiff), 'R$ 10,00');

  const directDiff = calculatePriceDifference(
    KIT_OPTIONS.premium.priceNumeric,
    KIT_OPTIONS.basico.priceNumeric
  );
  assert.equal(directDiff, 18);
  assert.equal(
    calculateSavings(
      KIT_OPTIONS.premium.priceNumeric,
      UPSELL_MODAL_CONTENT.premiumComparison.priceNumeric
    ),
    8
  );
});

test('getNextCarouselIndex wraps around forward and backward across 8 planner models', () => {
  assert.equal(getNextCarouselIndex(0, 8, 'next'), 1);
  assert.equal(getNextCarouselIndex(7, 8, 'next'), 0);
  assert.equal(getNextCarouselIndex(0, 8, 'prev'), 7);
  assert.equal(getNextCarouselIndex(2, 8, 'prev'), 1);
});

test('buildCheckoutUrlWithTracking preserves Meta Ads & UTMify query parameters on all 3 checkout links', () => {
  assert.equal(buildCheckoutUrlWithTracking(CAKTO_PREMIUM_URL, ''), 'https://pay.cakto.com.br/n8msmyw');
  assert.equal(buildCheckoutUrlWithTracking(CAKTO_PREMIUM_UPSELL_URL, ''), 'https://pay.cakto.com.br/xhx8yqu');
  assert.equal(buildCheckoutUrlWithTracking(CAKTO_BASICO_URL, ''), 'https://pay.cakto.com.br/85z54d3_1324900');

  const trackedDirectPremium = buildCheckoutUrlWithTracking(
    CAKTO_PREMIUM_URL,
    '?utm_source=FB&utm_medium=ads&utm_campaign=planner2027&fbclid=IwAR12345&xcod=xc99&ignored_param=xyz'
  );
  assert.equal(
    trackedDirectPremium,
    'https://pay.cakto.com.br/n8msmyw?utm_source=FB&utm_medium=ads&utm_campaign=planner2027&fbclid=IwAR12345&xcod=xc99'
  );

  const trackedPopupUpsell = buildCheckoutUrlWithTracking(
    CAKTO_PREMIUM_UPSELL_URL,
    '?utm_source=FB&utm_campaign=upsell1990'
  );
  assert.equal(
    trackedPopupUpsell,
    'https://pay.cakto.com.br/xhx8yqu?utm_source=FB&utm_campaign=upsell1990'
  );

  const preDecorated = 'https://pay.cakto.com.br/xhx8yqu?utm_source=utmify_existing';
  const merged = buildCheckoutUrlWithTracking(
    preDecorated,
    '?utm_source=FB_new&utm_campaign=camp1'
  );
  assert.equal(
    merged,
    'https://pay.cakto.com.br/xhx8yqu?utm_source=utmify_existing&utm_campaign=camp1'
  );
});

test('createTrackingEventId and dispatchFunnelTrackingEvent generate distinct funnel tracking records', () => {
  assert.equal(
    createTrackingEventId('ViewContent', 1700000000),
    'planner2027_viewcontent_1700000000'
  );
  assert.equal(
    createTrackingEventId('ClickBasicButton', 1700000001),
    'planner2027_clickbasicbutton_1700000001'
  );
  assert.equal(
    createTrackingEventId('UpgradePopupShown', 1700000002),
    'planner2027_upgradepopupshown_1700000002'
  );
  assert.equal(
    createTrackingEventId('UpgradeAccepted', 1700000003),
    'planner2027_upgradeaccepted_1700000003'
  );
  assert.equal(
    createTrackingEventId('UpgradeDeclined', 1700000004),
    'planner2027_upgradedeclined_1700000004'
  );
  assert.equal(
    createTrackingEventId('ClickPremiumButton', 1700000005),
    'planner2027_clickpremiumbutton_1700000005'
  );

  const record = dispatchFunnelTrackingEvent(
    'UpgradeAccepted',
    { value: 19.9, content_name: 'KIT PREMIUM' },
    1700000099
  );
  assert.equal(record.eventName, 'UpgradeAccepted');
  assert.equal(record.eventID, 'planner2027_upgradeaccepted_1700000099');
  assert.equal(record.payload.value, 19.9);
  assert.equal(record.payload.currency, 'BRL');
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

test('catalog enforces the 3 pricing rules: Kit Básico (R$ 9,90), Direct Kit Premium (R$ 27,90), and Popup Upgrade (R$ 19,90)', () => {
  assert.equal(HERO_BADGE_TEXT, 'COLEÇÃO DIGITAL • PLANNER 2027');
  assert.equal(HERO_HEADLINE, 'SEU 2027 MAIS ORGANIZADO COMEÇA AQUI!');
  assert.equal(
    HERO_SUBHEADLINE,
    'Tenha ferramentas práticas para organizar sua rotina, acompanhar seus hábitos, planejar suas metas e cuidar melhor da sua vida financeira.'
  );
  assert.equal(HERO_QUICK_BENEFITS.length, 4);
  assert.equal(HERO_MOCKUP_PREVIEWS.length, 6);
  assert.equal(PAIN_POINTS.length, 6);
  assert.equal(PRODUCT_DEMO_ITEMS.length, 6);
  assert.equal(STEP_ITEMS.length, 3);
  assert.equal(SUPPORT_HIGHLIGHTS.length, 4);
  assert.equal(BONUS_ITEMS.length, 6);
  assert.equal(PLAN_COMPARISON_ROWS.length, 6);
  assert.deepEqual(PLAN_COMPARISON_ROWS[0], {
    feature: 'Materiais digitais',
    basico: '100',
    premium: '250',
    highlightPremium: true,
  });
  assert.deepEqual(PLAN_COMPARISON_ROWS[1], {
    feature: 'Preço',
    basico: 'R$ 9,90',
    premium: 'R$ 27,90',
    highlightPremium: true,
  });

  // 1. Kit Básico (R$ 9,90 -> https://pay.cakto.com.br/85z54d3_1324900)
  assert.equal(KIT_OPTIONS.basico.name, 'KIT BÁSICO');
  assert.equal(KIT_OPTIONS.basico.price, 'R$ 9,90');
  assert.equal(KIT_OPTIONS.basico.priceNumeric, 9.9);
  assert.equal(KIT_OPTIONS.basico.materialsCount, 100);
  assert.equal(KIT_OPTIONS.basico.includedFeatures.length, 6);
  assert.equal(KIT_OPTIONS.basico.ctaLabel, 'QUERO MEU KIT BÁSICO');
  assert.equal(KIT_OPTIONS.basico.checkoutUrl, 'https://pay.cakto.com.br/85z54d3_1324900');

  // 2. Compra direta do Kit Premium (R$ 27,90 -> https://pay.cakto.com.br/n8msmyw)
  assert.equal(KIT_OPTIONS.premium.name, 'KIT PREMIUM');
  assert.equal(KIT_OPTIONS.premium.price, 'R$ 27,90');
  assert.equal(KIT_OPTIONS.premium.priceNumeric, 27.9);
  assert.equal(KIT_OPTIONS.premium.materialsCount, 250);
  assert.equal(KIT_OPTIONS.premium.badge, 'MAIS COMPLETO');
  assert.equal(KIT_OPTIONS.premium.includedFeatures.length, 9);
  assert.equal(KIT_OPTIONS.premium.bonuses?.length, 6);
  assert.equal(KIT_OPTIONS.premium.ctaLabel, 'QUERO MEU KIT PREMIUM');
  assert.equal(KIT_OPTIONS.premium.checkoutUrl, 'https://pay.cakto.com.br/n8msmyw');

  // Garantir que os 3 links de checkout são 100% distintos
  assert.notEqual(CAKTO_BASICO_URL, CAKTO_PREMIUM_URL);
  assert.notEqual(CAKTO_BASICO_URL, CAKTO_PREMIUM_UPSELL_URL);
  assert.notEqual(CAKTO_PREMIUM_URL, CAKTO_PREMIUM_UPSELL_URL);

  assert.equal(FAQ_ITEMS.length, 7);
  assert.equal(PROMO_DATE_TEXT, 'OFERTA EXCLUSIVA • POR TEMPO LIMITADO');
});

test('all active planner images have AVIF + WebP + responsive mobile variants on disk and unused files are removed', () => {
  assert.equal(CAROUSEL_MODELS.length, 8);
  assert.equal(STEP_ITEMS.length, 3);

  const uniquePaths = new Set([
    HERO_PLANNER_IMAGE,
    GUARANTEE_BADGE_IMAGE,
    ...HERO_MOCKUP_PREVIEWS.map((m) => m.image),
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

  assert.equal(
    fs.existsSync(path.resolve('public/assets/planners/hero-planner-640w.avif')),
    true
  );
  assert.equal(
    fs.existsSync(path.resolve('public/assets/planners/hero-planner-640w.webp')),
    true
  );
  assert.equal(
    fs.existsSync(path.resolve('public/assets/planners/vitrine-uso-planner.avif')),
    true
  );
  assert.equal(
    fs.existsSync(path.resolve('public/assets/planners/vitrine-uso-planner.webp')),
    true
  );
  assert.equal(
    fs.existsSync(path.resolve('public/assets/planners/vitrine-uso-planner-640w.avif')),
    true
  );
  assert.equal(
    fs.existsSync(path.resolve('public/assets/planners/vitrine-uso-planner-640w.webp')),
    true
  );
  for (const bonus of BONUS_ITEMS) {
    const mobileAvif = path.resolve('public', bonus.image.slice(1).replace(/\.webp$/, '-280w.avif'));
    const mobileWebp = path.resolve('public', bonus.image.slice(1).replace(/\.webp$/, '-280w.webp'));
    assert.equal(fs.existsSync(mobileAvif), true, `Missing mobile AVIF bonus: ${mobileAvif}`);
    assert.equal(fs.existsSync(mobileWebp), true, `Missing mobile WebP bonus: ${mobileWebp}`);
  }
  assert.equal(fs.existsSync(path.resolve('public/assets/cloned')), false);
});

test('strategic upgrade popup content and resolveUpsellAction handle decline (R$ 9,90) and accept (R$ 19,90) paths safely without mixing with normal R$ 27,90 link', () => {
  assert.equal(
    UPSELL_MODAL_CONTENT.headline,
    'ESPERE! TEMOS UMA OFERTA ESPECIAL PARA VOCÊ!'
  );
  assert.equal(
    UPSELL_MODAL_CONTENT.subheadline,
    'Por apenas R$ 19,90, leve o Kit Premium com 250 materiais digitais!'
  );
  assert.equal(UPSELL_MODAL_CONTENT.basicComparison.name, 'BÁSICO');
  assert.equal(UPSELL_MODAL_CONTENT.basicComparison.materialsLabel, '100 materiais digitais');
  assert.equal(UPSELL_MODAL_CONTENT.basicComparison.price, 'R$ 9,90');
  assert.equal(UPSELL_MODAL_CONTENT.premiumComparison.name, 'PREMIUM');
  assert.equal(UPSELL_MODAL_CONTENT.premiumComparison.materialsLabel, '250 materiais digitais');
  assert.equal(UPSELL_MODAL_CONTENT.premiumComparison.normalPrice, 'R$ 27,90');
  assert.equal(UPSELL_MODAL_CONTENT.premiumComparison.normalPriceNumeric, 27.9);
  assert.equal(UPSELL_MODAL_CONTENT.premiumComparison.price, 'R$ 19,90');
  assert.equal(UPSELL_MODAL_CONTENT.premiumComparison.priceNumeric, 19.9);
  assert.equal(
    UPSELL_MODAL_CONTENT.acceptCtaLabel,
    'SIM! QUERO O PREMIUM POR R$ 19,90'
  );
  assert.equal(
    UPSELL_MODAL_CONTENT.declineCtaLabel,
    'NÃO, PREFIRO O BÁSICO POR R$ 9,90'
  );

  // Path 1: Decline -> always redirects to Basic plan checkout (R$ 9,90)
  const declined = resolveUpsellAction('decline');
  assert.equal(declined.status, 'redirect');
  assert.equal(declined.targetUrl, 'https://pay.cakto.com.br/85z54d3_1324900');
  assert.equal(declined.priceNumeric, 9.9);

  // Path 2: Accept -> redirects exclusively to Promotional Popup Premium checkout (R$ 19,90)
  const acceptedDefault = resolveUpsellAction('accept');
  assert.equal(acceptedDefault.status, 'redirect');
  assert.equal(acceptedDefault.targetUrl, 'https://pay.cakto.com.br/xhx8yqu');
  assert.equal(acceptedDefault.priceNumeric, 19.9);

  // Safeguard 1: Never allow Basic R$ 9,90 checkout link to be used as Popup Upgrade R$ 19,90 link
  const rejectedSameAsBasic = resolveUpsellAction('accept', CAKTO_BASICO_URL);
  assert.equal(rejectedSameAsBasic.status, 'missing_upsell_url');
  assert.equal(rejectedSameAsBasic.targetUrl, null);

  // Safeguard 2: Never allow Normal Direct Premium R$ 27,90 checkout link to be used as Popup Upgrade R$ 19,90 link
  const rejectedSameAsNormalPremium = resolveUpsellAction('accept', CAKTO_PREMIUM_URL);
  assert.equal(rejectedSameAsNormalPremium.status, 'missing_upsell_url');
  assert.equal(rejectedSameAsNormalPremium.targetUrl, null);
});

test('index.html never overwrites native window.fetch and preserves Meta Pixel and UTMify scripts', () => {
  const html = fs.readFileSync(path.resolve('index.html'), 'utf-8');
  assert.equal(/window\.fetch\s*=/.test(html), false, 'index.html must never overwrite window.fetch');
  assert.equal(/globalThis\.fetch\s*=/.test(html), false, 'index.html must never overwrite globalThis.fetch');
  assert.equal(html.includes("fbq('init', '2206669040218715')"), true);
  assert.equal(html.includes('var w_6wr=atob('), true);
  assert.equal(html.includes('var s_bg7=atob('), true);
});

