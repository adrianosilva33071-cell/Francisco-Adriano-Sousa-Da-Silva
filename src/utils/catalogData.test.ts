import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  formatBrazilianDate,
  calculateSavings,
  formatCurrencyBRL,
  getNextCarouselIndex,
  validateCheckoutInput,
  ensureWritableWindowFetch,
  HERO_PLANNER_IMAGE,
  STATIONERY_DECORATION_IMAGE,
  GUARANTEE_BADGE_IMAGE,
  PAIN_POINTS,
  SOLUTION_MATERIALS,
  PRODUCT_DEMO_ITEMS,
  CAROUSEL_MODELS,
  STEP_ITEMS,
  WHY_LOVE_ITEMS,
  WHATSAPP_DEMO_CHATS,
  KIT_OPTIONS,
  BONUS_ITEMS,
  FAQ_ITEMS,
  INCLUDED_CHECKLIST,
  TESTIMONIAL_IMAGES,
} from './catalogData';

test('formatBrazilianDate formats 2026-11-14 as 14/11/2026', () => {
  const d = new Date('2026-11-14T12:00:00Z');
  assert.equal(formatBrazilianDate(d), '14/11/2026');
});

test('calculateSavings computes exact Kit Premium discount of R$ 173,10', () => {
  const saved = calculateSavings(197, KIT_OPTIONS.premium.priceNumeric);
  assert.equal(saved, 173.1);
  assert.equal(formatCurrencyBRL(saved), 'R$ 173,10');
});

test('getNextCarouselIndex wraps around forward and backward across 5 WhatsApp chats', () => {
  assert.equal(getNextCarouselIndex(0, 5, 'next'), 1);
  assert.equal(getNextCarouselIndex(4, 5, 'next'), 0);
  assert.equal(getNextCarouselIndex(0, 5, 'prev'), 4);
  assert.equal(getNextCarouselIndex(2, 5, 'prev'), 1);
});

test('validateCheckoutInput rejects empty or invalid email and accepts valid input', () => {
  assert.equal(validateCheckoutInput({ name: '', email: 'ana@email.com' }).valid, false);
  assert.equal(validateCheckoutInput({ name: 'Ana Silva', email: 'invalido' }).valid, false);
  assert.equal(validateCheckoutInput({ name: 'Ana Silva', email: 'ana@email.com' }).valid, true);
});

test('catalog contains 6 pain points, 7 solution materials, 6 product demos, 5 WhatsApp demo chats, 6 bonuses, and 6 FAQs', () => {
  assert.equal(PAIN_POINTS.length, 6);
  assert.equal(SOLUTION_MATERIALS.length, 7);
  assert.equal(PRODUCT_DEMO_ITEMS.length, 6);
  assert.equal(WHATSAPP_DEMO_CHATS.length, 5);
  assert.equal(BONUS_ITEMS.length, 6);
  assert.equal(INCLUDED_CHECKLIST.length, 7);
  assert.equal(KIT_OPTIONS.premium.bonuses?.length, 6);
  assert.equal(FAQ_ITEMS.length, 6);
  assert.equal(KIT_OPTIONS.basico.price, 'R$ 9,90');
  assert.equal(KIT_OPTIONS.premium.price, 'R$ 23,90');
  assert.equal(KIT_OPTIONS.basico.subtitle, '50 MATERIAIS DE ORGANIZAÇÃO');
  assert.equal(KIT_OPTIONS.premium.subtitle, '100 MATERIAIS DE ORGANIZAÇÃO');
  assert.equal(KIT_OPTIONS.premium.badge, 'MAIS COMPLETO');
  assert.equal(KIT_OPTIONS.basico.checkoutUrl, 'https://pay.cakto.com.br/85z54d3_1324900');
  assert.equal(KIT_OPTIONS.premium.checkoutUrl, 'https://pay.cakto.com.br/n8msmyw');
});

test('all 24 individual planner WebP images and 4 optimized testimonial WebP images exist on disk', () => {
  assert.equal(CAROUSEL_MODELS.length, 8);
  assert.equal(STEP_ITEMS.length, 3);
  assert.equal(WHY_LOVE_ITEMS.length, 6);

  const uniquePaths = new Set([
    HERO_PLANNER_IMAGE,
    STATIONERY_DECORATION_IMAGE,
    GUARANTEE_BADGE_IMAGE,
    ...CAROUSEL_MODELS.map((m) => m.image),
    ...STEP_ITEMS.map((s) => s.image),
    ...WHY_LOVE_ITEMS.map((w) => w.image),
    ...BONUS_ITEMS.map((b) => b.image),
  ]);

  assert.equal(uniquePaths.size, 24);
  for (const relUrl of uniquePaths) {
    assert.match(relUrl, /^\/assets\/planners\/[a-z0-9-]+\.webp$/);
    const diskPath = path.resolve('public', relUrl.slice(1));
    assert.equal(fs.existsSync(diskPath), true, `Missing asset on disk: ${diskPath}`);
    const stat = fs.statSync(diskPath);
    assert.equal(stat.size > 1000, true, `Asset file too small: ${diskPath}`);
  }

  assert.equal(TESTIMONIAL_IMAGES.length, 4);
  for (const item of TESTIMONIAL_IMAGES) {
    assert.match(item.src, /^\/assets\/cloned\/depoimento-[1-4]\.webp$/);
    const diskPath = path.resolve('public', item.src.slice(1));
    assert.equal(fs.existsSync(diskPath), true, `Missing testimonial WebP: ${diskPath}`);
    const stat = fs.statSync(diskPath);
    assert.equal(stat.size > 5000 && stat.size < 60000, true, `Unexpected WebP size: ${stat.size}`);
  }
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
