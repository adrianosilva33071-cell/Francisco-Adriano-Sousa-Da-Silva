/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight,
  Calendar,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  FileText,
  Gift,
  Headset,
  HeartHandshake,
  ListChecks,
  Lock,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Target,
  Wallet,
  X,
} from 'lucide-react';
import {
  BONUS_ITEMS,
  buildCheckoutUrlWithTracking,
  CAKTO_BASICO_URL,
  CAKTO_PREMIUM_UPSELL_URL,
  CAKTO_PREMIUM_URL,
  calculatePriceDifference,
  CAROUSEL_MODELS,
  dispatchFunnelTrackingEvent,
  FAQ_ITEMS,
  getNextCarouselIndex,
  getResponsiveImageSources,
  GUARANTEE_BADGE_IMAGE,
  HERO_BADGE_TEXT,
  HERO_MOCKUP_PREVIEWS,
  HERO_PLANNER_IMAGE,
  HERO_QUICK_BENEFITS,
  HERO_SUBHEADLINE,
  KIT_OPTIONS,
  LIFESTYLE_PLANNER_IMAGE,
  PAIN_POINTS,
  PLAN_COMPARISON_ROWS,
  PRODUCT_DEMO_ITEMS,
  PROMO_DATE_TEXT,
  STEP_ITEMS,
  SUPPORT_HIGHLIGHTS,
  toAvifUrl,
  UPSELL_MODAL_CONTENT,
} from './utils/catalogData';
import type { LegalModalType } from './components/LegalModal';

const UpsellModal = lazy(() => import('./components/UpsellModal'));
const LegalModal = lazy(() => import('./components/LegalModal'));

const PAIN_ICONS: Record<string, React.ReactNode> = {
  'semana-tarefas': <ListChecks className="w-5 h-5 text-[#F01579]" />,
  'esquece-compromissos': <Calendar className="w-5 h-5 text-[#F01579]" />,
  'metas-depois': <Target className="w-5 h-5 text-[#F01579]" />,
  'controlar-gastos': <Wallet className="w-5 h-5 text-[#F01579]" />,
  'falta-planejamento': <Clock className="w-5 h-5 text-[#F01579]" />,
  'acompanhar-habitos': <HeartHandshake className="w-5 h-5 text-[#F01579]" />,
};

const MATERIAL_ICONS: Record<string, React.ReactNode> = {
  'demo-semanal': <Calendar className="w-4 h-4 text-[#F01579]" />,
  'demo-habitos': <HeartHandshake className="w-4 h-4 text-[#F01579]" />,
  'demo-tarefas': <ListChecks className="w-4 h-4 text-[#F01579]" />,
  'demo-mensal': <CalendarDays className="w-4 h-4 text-[#F01579]" />,
  'demo-financeiro': <Wallet className="w-4 h-4 text-[#F01579]" />,
  'demo-metas': <Target className="w-4 h-4 text-[#F01579]" />,
};

const HERO_SOURCES = getResponsiveImageSources(HERO_PLANNER_IMAGE, {
  suffix: '640w',
  widthDescriptor: '640w',
  fullWidthDescriptor: '1272w',
});

const LIFESTYLE_SOURCES = getResponsiveImageSources(LIFESTYLE_PLANNER_IMAGE, {
  suffix: '640w',
  widthDescriptor: '640w',
  fullWidthDescriptor: '960w',
});

const HERO_PREVIEW_SOURCES = HERO_MOCKUP_PREVIEWS.map((preview) => ({
  ...preview,
  sources: getResponsiveImageSources(preview.image, {
    suffix: '280w',
    widthDescriptor: '280w',
    fullWidthDescriptor: '424w',
  }),
}));

const PRODUCT_DEMO_SOURCES = PRODUCT_DEMO_ITEMS.map((demo) => ({
  ...demo,
  sources: getResponsiveImageSources(demo.image, {
    suffix: '280w',
    widthDescriptor: '280w',
    fullWidthDescriptor: '424w',
  }),
}));

const CAROUSEL_MODEL_SOURCES = CAROUSEL_MODELS.map((model) => ({
  ...model,
  sources: getResponsiveImageSources(model.image, {
    suffix: '280w',
    widthDescriptor: '280w',
    fullWidthDescriptor: '424w',
  }),
}));

const BONUS_ITEM_SOURCES = BONUS_ITEMS.map((bonus) => ({
  ...bonus,
  sources: getResponsiveImageSources(bonus.image, {
    suffix: '280w',
    widthDescriptor: '280w',
    fullWidthDescriptor: '424w',
  }),
}));

const POPUP_PRICE_DIFF = calculatePriceDifference(
  UPSELL_MODAL_CONTENT.premiumComparison.priceNumeric,
  KIT_OPTIONS.basico.priceNumeric
);

export default function App() {
  const [openFaqId, setOpenFaqId] = useState<string | null>('como-recebo');
  const [isUpsellModalOpen, setIsUpsellModalOpen] = useState<boolean>(false);
  const [activeLegalModal, setActiveLegalModal] = useState<LegalModalType>(null);
  const [activeCarouselIdx, setActiveCarouselIdx] = useState<number>(0);
  const [showFloatingBar, setShowFloatingBar] = useState<boolean>(false);
  const [isFloatingBarDismissed, setIsFloatingBarDismissed] = useState<boolean>(false);
  const [locationSearch, setLocationSearch] = useState<string>(() =>
    typeof window !== 'undefined' ? window.location.search : ''
  );

  const touchStartXRef = useRef<number | null>(null);
  const directCheckoutLockRef = useRef<boolean>(false);
  const directCheckoutTimerRef = useRef<number | null>(null);
  const viewContentTrackedRef = useRef<boolean>(false);

  const premiumCheckoutHref = useMemo(
    () => buildCheckoutUrlWithTracking(KIT_OPTIONS.premium.checkoutUrl, locationSearch),
    [locationSearch]
  );

  useEffect(() => {
    setLocationSearch(window.location.search);

    const configuredBaseUrl = (import.meta.env.VITE_APP_URL as string | undefined)?.trim();
    const baseOrigin = configuredBaseUrl
      ? configuredBaseUrl.replace(/\/+$/, '')
      : window.location.origin;
    const canonicalUrl = `${baseOrigin}${window.location.pathname}`;

    let canonicalLink = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', canonicalUrl);

    let ogUrlMeta = document.querySelector<HTMLMetaElement>('meta[property="og:url"]');
    if (!ogUrlMeta) {
      ogUrlMeta = document.createElement('meta');
      ogUrlMeta.setAttribute('property', 'og:url');
      document.head.appendChild(ogUrlMeta);
    }
    ogUrlMeta.setAttribute('content', canonicalUrl);

    // 1. Evento ViewContent (1 vez por sessão/visualização)
    if (!viewContentTrackedRef.current) {
      viewContentTrackedRef.current = true;
      dispatchFunnelTrackingEvent('ViewContent', {
        content_name: 'Coleção Planner 2027',
        content_category: 'Planners Digitais',
        content_ids: ['kit_basico_100', 'kit_premium_250'],
        content_type: 'product_group',
      });
    }

    const onScroll = () => {
      const shouldShow = window.scrollY > 480;
      setShowFloatingBar((prev) => (prev !== shouldShow ? shouldShow : prev));
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (directCheckoutTimerRef.current !== null) {
        window.clearTimeout(directCheckoutTimerRef.current);
        directCheckoutTimerRef.current = null;
      }
    };
  }, []);

  // 2. Clique no botão do Básico (R$ 9,90) -> Registra ClickBasicButton + UpgradePopupShown (oferta exclusiva de R$ 27,90 por R$ 19,90) e abre o Popup
  const handleBasicPlanClick = useCallback((sourceSection: string) => {
    dispatchFunnelTrackingEvent('ClickBasicButton', {
      content_name: KIT_OPTIONS.basico.name,
      materials_count: KIT_OPTIONS.basico.materialsCount,
      value: KIT_OPTIONS.basico.priceNumeric,
      source_section: sourceSection,
    });
    dispatchFunnelTrackingEvent('UpgradePopupShown', {
      offered_kit: UPSELL_MODAL_CONTENT.premiumComparison.name,
      offered_materials: KIT_OPTIONS.premium.materialsCount,
      normal_price: UPSELL_MODAL_CONTENT.premiumComparison.normalPriceNumeric,
      offered_price: UPSELL_MODAL_CONTENT.premiumComparison.priceNumeric,
      price_difference: POPUP_PRICE_DIFF,
    });
    setIsUpsellModalOpen(true);
  }, []);

  // 3. Aceitação do upgrade Premium no Popup -> Registra UpgradeAccepted + InitiateCheckout (R$ 19,90 -> CAKTO_PREMIUM_UPSELL_URL)
  const handleAcceptUpgrade = useCallback((kitName: string, priceValue: number) => {
    dispatchFunnelTrackingEvent('UpgradeAccepted', {
      content_name: kitName,
      materials_count: KIT_OPTIONS.premium.materialsCount,
      value: priceValue,
      checkout_url: CAKTO_PREMIUM_UPSELL_URL,
    });
    dispatchFunnelTrackingEvent('InitiateCheckout', {
      content_name: kitName,
      content_ids: ['kit_premium_250_popup_promo'],
      content_type: 'product',
      value: priceValue,
      checkout_origin: 'upgrade_popup_accepted',
      checkout_url: CAKTO_PREMIUM_UPSELL_URL,
    });
  }, []);

  // 4. Recusa do upgrade no Popup (ou botão X) -> Registra UpgradeDeclined + InitiateCheckout (R$ 9,90 -> CAKTO_BASICO_URL)
  const handleDeclineUpgrade = useCallback((kitName: string, priceValue: number) => {
    dispatchFunnelTrackingEvent('UpgradeDeclined', {
      content_name: kitName,
      materials_count: KIT_OPTIONS.basico.materialsCount,
      value: priceValue,
      checkout_url: CAKTO_BASICO_URL,
    });
    dispatchFunnelTrackingEvent('InitiateCheckout', {
      content_name: kitName,
      content_ids: ['kit_basico_100'],
      content_type: 'product',
      value: priceValue,
      checkout_origin: 'upgrade_popup_declined',
      checkout_url: CAKTO_BASICO_URL,
    });
  }, []);

  // 5. Clique direto no botão do Kit Premium -> Registra ClickPremiumButton + InitiateCheckout (R$ 27,90 -> CAKTO_PREMIUM_URL)
  const handleDirectPremiumClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, sourceSection: string = 'direct_premium') => {
      if (directCheckoutLockRef.current) {
        e.preventDefault();
        return;
      }
      directCheckoutLockRef.current = true;
      dispatchFunnelTrackingEvent('ClickPremiumButton', {
        content_name: KIT_OPTIONS.premium.name,
        materials_count: KIT_OPTIONS.premium.materialsCount,
        value: KIT_OPTIONS.premium.priceNumeric,
        source_section: sourceSection,
        checkout_url: CAKTO_PREMIUM_URL,
      });
      dispatchFunnelTrackingEvent('InitiateCheckout', {
        content_name: KIT_OPTIONS.premium.name,
        content_ids: ['kit_premium_250'],
        content_type: 'product',
        value: KIT_OPTIONS.premium.priceNumeric,
        checkout_origin: sourceSection,
        checkout_url: CAKTO_PREMIUM_URL,
      });
      if (directCheckoutTimerRef.current !== null) {
        window.clearTimeout(directCheckoutTimerRef.current);
      }
      directCheckoutTimerRef.current = window.setTimeout(() => {
        directCheckoutLockRef.current = false;
        directCheckoutTimerRef.current = null;
      }, 800);
    },
    []
  );

  const toggleFaq = useCallback((id: string) => {
    setOpenFaqId((prev) => (prev === id ? null : id));
  }, []);

  const handleCarouselStep = useCallback((direction: 'next' | 'prev') => {
    setActiveCarouselIdx((prev) =>
      getNextCarouselIndex(prev, CAROUSEL_MODELS.length, direction)
    );
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0]?.clientX ?? null;
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (touchStartXRef.current === null) return;
      const endX = e.changedTouches[0]?.clientX ?? touchStartXRef.current;
      const deltaX = endX - touchStartXRef.current;
      if (Math.abs(deltaX) > 36) {
        handleCarouselStep(deltaX < 0 ? 'next' : 'prev');
      }
      touchStartXRef.current = null;
    },
    [handleCarouselStep]
  );

  const currentCarouselModel = CAROUSEL_MODELS[activeCarouselIdx] ?? CAROUSEL_MODELS[0];

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF6FA] text-[#29202A] font-sans antialiased selection:bg-[#FCE8F1] selection:text-[#F01579] overflow-x-hidden">
      {/* 1. FAIXA SUPERIOR */}
      <div className="w-full min-h-[38px] sm:min-h-[40px] bg-[#F01579] flex items-center justify-center px-[10px] sm:px-[16px] py-2 border-b border-[#F4C542]/30">
        <p className="font-display text-white text-[10.5px] min-[360px]:text-[11.5px] sm:text-[13.5px] font-bold tracking-[0.05em] sm:tracking-[0.06em] uppercase text-center leading-none whitespace-nowrap">
          {PROMO_DATE_TEXT}
        </p>
      </div>

      <main className="flex-1">
        {/* 2. PRIMEIRA DOBRA — TÍTULO, SUBTÍTULO, IMAGENS DOS MATERIAIS, BENEFÍCIOS E OS 2 PLANOS */}
        <section className="w-full bg-gradient-to-b from-[#FCE8F1] via-[#FFF6FA] to-[#FFFFFF] pt-[14px] sm:pt-[28px] pb-[26px] sm:pb-[48px] px-[12px] sm:px-[18px] overflow-hidden border-b border-[#FCE8F1]">
          <div className="max-w-[1140px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-8 items-center">
            {/* Coluna Esquerda: Título, Subtítulo, Benefícios e Acesso Rápido aos 2 Planos */}
            <div className="lg:col-span-6 flex flex-col items-center lg:items-start text-center lg:text-left">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-white border border-[#F4C542] px-3 py-0.5 sm:px-3.5 sm:py-1 shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-[#F4C542] shrink-0" />
                <span className="font-display font-bold text-[11px] sm:text-[12px] text-[#F01579] tracking-[0.08em] uppercase whitespace-nowrap">
                  {HERO_BADGE_TEXT}
                </span>
              </div>

              {/* Título principal (H1) */}
              <h1 className="mt-2 sm:mt-3 font-display font-bold text-[#29202A] text-[22px] sm:text-[34px] xl:text-[40px] leading-[1.14] tracking-[-0.01em] max-w-[650px] uppercase">
                SEU 2027 MAIS ORGANIZADO{' '}
                <span className="text-[#F01579]">COMEÇA AQUI!</span>
              </h1>

              {/* Subtítulo */}
              <p className="mt-1.5 sm:mt-2.5 text-[#4a3d4c] text-[13px] sm:text-[15.5px] leading-[1.45] max-w-[600px]">
                {HERO_SUBHEADLINE}
              </p>

              {/* Imagem principal + 6 amostras no Mobile */}
              <div className="mt-2.5 w-full lg:hidden flex flex-col items-center">
                <div className="relative w-full max-w-[420px] rounded-[18px] overflow-hidden shadow-[0_10px_26px_rgba(240,21,121,0.14)] border border-[#FCE8F1] bg-white aspect-[16/9]">
                  <picture>
                    <source type="image/avif" srcSet={HERO_SOURCES.avifSrcSet} sizes="92vw" />
                    <source type="image/webp" srcSet={HERO_SOURCES.webpSrcSet} sizes="92vw" />
                    <img
                      src={HERO_SOURCES.fallbackWebp}
                      alt="Coleção Planner 2027 — Planner impresso em espiral, páginas de planejamento semanal, controle de hábitos, metas e versão digital em tablet e celular"
                      width={1272}
                      height={715}
                      fetchPriority="high"
                      decoding="async"
                      className="w-full h-full object-cover object-center block"
                    />
                  </picture>
                </div>

                <div
                  className="mt-1.5 w-full max-w-[420px] grid grid-cols-6 gap-1"
                  aria-label="Amostra ilustrativa dos materiais do Planner 2027"
                >
                  {HERO_PREVIEW_SOURCES.map((preview) => (
                    <div
                      key={`mob-${preview.id}`}
                      className="bg-white rounded-[8px] border border-[#FCE8F1] p-1 flex flex-col items-center text-center"
                    >
                      <div className="w-full aspect-[4/5] rounded-[4px] bg-[#FFF6FA] flex items-center justify-center overflow-hidden">
                        <picture className="w-full h-full flex items-center justify-center">
                          <source type="image/avif" srcSet={preview.sources.avifSrcSet} sizes="15vw" />
                          <source type="image/webp" srcSet={preview.sources.webpSrcSet} sizes="15vw" />
                          <img
                            src={preview.sources.fallbackWebp}
                            alt={preview.label}
                            width={64}
                            height={80}
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-contain block"
                          />
                        </picture>
                      </div>
                      <span className="mt-0.5 font-display font-semibold text-[8.5px] text-[#29202A] leading-[1.1] line-clamp-1">
                        {preview.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Benefícios rápidos da coleção */}
              <div className="mt-2.5 sm:mt-4 w-full max-w-[560px] grid grid-cols-2 gap-1.5 sm:gap-2">
                {HERO_QUICK_BENEFITS.map((benefit) => (
                  <div
                    key={benefit}
                    className="bg-white rounded-[12px] border border-[#FCE8F1] px-2.5 py-1.5 sm:px-3 sm:py-2 flex items-center gap-1.5 text-left shadow-2xs"
                  >
                    <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-[#e8faee] text-[#16B83A] flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </span>
                    <span className="font-medium text-[11.5px] sm:text-[12.5px] text-[#29202A] leading-tight">
                      {benefit}
                    </span>
                  </div>
                ))}
              </div>

              {/* Botão Principal de Compra na Primeira Dobra (leva à seção dos planos) */}
              <div className="mt-3 sm:mt-4 w-full max-w-[560px]">
                <a
                  href="#escolha-seu-kit"
                  data-testid="hero-scroll-plans-cta"
                  className="font-display inline-flex items-center justify-center gap-2 w-full min-h-[48px] sm:min-h-[54px] rounded-[14px] bg-[#16B83A] hover:bg-[#139e31] active:scale-[0.99] text-white font-bold text-[13.5px] sm:text-[15.5px] uppercase tracking-normal shadow-[0_10px_24px_rgba(22,184,58,0.28)] transition-all cursor-pointer px-4"
                >
                  <ShoppingCart className="w-4.5 h-4.5 shrink-0" />
                  <span>QUERO ORGANIZAR MEU 2027 • VER PLANOS</span>
                  <ArrowRight className="w-4 h-4 shrink-0" />
                </a>
              </div>

              {/* Resumo dos Dois Planos Disponíveis na Primeira Dobra */}
              <div className="mt-2.5 sm:mt-3 w-full max-w-[560px] grid grid-cols-1 min-[350px]:grid-cols-2 gap-2.5">
                {/* Mini Card Kit Básico */}
                <div className="rounded-[16px] bg-white border border-[#FCE8F1] p-2.5 sm:p-3.5 flex flex-col justify-between text-left shadow-2xs">
                  <div>
                    <span className="inline-block rounded-full bg-[#FFF6FA] border border-[#FCE8F1] px-2.5 py-0.5 font-display font-bold text-[10px] sm:text-[11px] text-[#29202A] uppercase">
                      {KIT_OPTIONS.basico.name}
                    </span>
                    <p className="mt-1 font-display font-bold text-[12px] sm:text-[13.5px] text-[#29202A]">
                      100 materiais digitais
                    </p>
                    <p className="mt-0.5 font-display font-bold text-[20px] sm:text-[24px] leading-none text-[#29202A] tabular-nums">
                      {KIT_OPTIONS.basico.price}
                    </p>
                  </div>
                  <button
                    type="button"
                    data-testid="hero-basico-cta"
                    onClick={() => handleBasicPlanClick('hero')}
                    className="mt-2 font-display inline-flex items-center justify-center w-full min-h-[44px] rounded-[10px] border-2 border-[#16B83A] bg-white hover:bg-[#e8faee] active:scale-[0.99] text-[#16B83A] font-bold text-[11px] sm:text-[11.5px] uppercase transition-colors cursor-pointer px-2 text-center leading-tight"
                  >
                    {KIT_OPTIONS.basico.ctaLabel}
                  </button>
                </div>

                {/* Mini Card Kit Premium (Mais Completo — R$ 27,90 na compra direta) */}
                <div className="relative rounded-[16px] bg-white border-2 border-[#F01579] p-2.5 sm:p-3.5 flex flex-col justify-between text-left shadow-[0_8px_22px_rgba(240,21,121,0.12)]">
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-1">
                      <span className="inline-block rounded-full bg-[#FCE8F1] px-2 py-0.5 font-display font-bold text-[10px] sm:text-[11px] text-[#F01579] uppercase whitespace-nowrap">
                        {KIT_OPTIONS.premium.name}
                      </span>
                      <span className="inline-block rounded-full bg-[#F4C542] px-1.5 py-0.5 font-display font-bold text-[8.5px] sm:text-[9px] text-[#29202A] uppercase whitespace-nowrap">
                        {KIT_OPTIONS.premium.badge}
                      </span>
                    </div>
                    <p className="mt-1 font-display font-bold text-[12px] sm:text-[13.5px] text-[#F01579]">
                      250 materiais + 6 bônus
                    </p>
                    <p className="mt-0.5 font-display font-bold text-[20px] sm:text-[24px] leading-none text-[#16B83A] tabular-nums">
                      {KIT_OPTIONS.premium.price}
                    </p>
                  </div>
                  <a
                    href={premiumCheckoutHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-testid="hero-premium-cta"
                    onClick={(e) => handleDirectPremiumClick(e, 'hero')}
                    className="mt-2 font-display inline-flex items-center justify-center gap-1 w-full min-h-[44px] rounded-[10px] bg-[#16B83A] hover:bg-[#139e31] active:scale-[0.99] text-white font-bold text-[11px] sm:text-[11.5px] uppercase shadow-xs transition-all cursor-pointer px-2 text-center leading-tight"
                  >
                    <ShoppingCart className="w-3.5 h-3.5 shrink-0" />
                    <span>{KIT_OPTIONS.premium.ctaLabel}</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Coluna Direita no Desktop: Mockup Principal + 6 Materiais Ilustrativos */}
            <div className="hidden lg:flex lg:col-span-6 flex-col items-center">
              <div className="relative w-full rounded-[24px] overflow-hidden shadow-[0_14px_36px_rgba(240,21,121,0.14)] border-2 border-[#FCE8F1] bg-white aspect-[16/9]">
                <picture>
                  <source type="image/avif" srcSet={HERO_SOURCES.avifSrcSet} sizes="540px" />
                  <source type="image/webp" srcSet={HERO_SOURCES.webpSrcSet} sizes="540px" />
                  <img
                    src={HERO_SOURCES.fallbackWebp}
                    alt="Coleção Planner 2027 — Planner impresso em espiral, páginas de planejamento semanal, controle de hábitos, metas e versão digital em tablet e celular"
                    width={1272}
                    height={715}
                    fetchPriority="high"
                    decoding="async"
                    className="w-full h-full object-cover block"
                  />
                </picture>
              </div>

              <div
                className="mt-3 w-full grid grid-cols-6 gap-2"
                aria-label="Composição real dos materiais do Planner 2027"
              >
                {HERO_PREVIEW_SOURCES.map((preview) => (
                  <div
                    key={`desk-${preview.id}`}
                    className="bg-white rounded-[12px] border border-[#FCE8F1] p-1.5 shadow-2xs flex flex-col items-center text-center"
                  >
                    <div className="w-full aspect-[4/5] rounded-[6px] bg-[#FFF6FA] flex items-center justify-center overflow-hidden p-0.5">
                      <picture className="w-full h-full flex items-center justify-center">
                        <source type="image/avif" srcSet={preview.sources.avifSrcSet} sizes="90px" />
                        <source type="image/webp" srcSet={preview.sources.webpSrcSet} sizes="90px" />
                        <img
                          src={preview.sources.fallbackWebp}
                          alt={preview.label}
                          width={90}
                          height={112}
                          loading="lazy"
                          decoding="async"
                          className="w-full h-full object-contain block"
                        />
                      </picture>
                    </div>
                    <span className="mt-1 font-display font-semibold text-[10px] text-[#29202A] leading-tight line-clamp-2">
                      {preview.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 3. SEÇÃO — IDENTIFICAÇÃO COM A ROTINA */}
        <section className="w-full bg-white py-[44px] sm:py-[64px] px-[14px] sm:px-[18px] border-b border-[#FCE8F1]">
          <div className="max-w-[1060px] mx-auto">
            <div className="text-center max-w-[700px] mx-auto">
              <h2 className="font-display font-bold text-[#29202A] text-[22px] sm:text-[32px] md:text-[36px] leading-[1.2] uppercase">
                SUA ROTINA PRECISA DE{' '}
                <span className="text-[#F01579]">MAIS ORGANIZAÇÃO?</span>
              </h2>
              <p className="mt-2 text-[#534656] text-[15px] sm:text-[17px] font-medium leading-[1.5]">
                Você se identifica com alguma dessas situações?
              </p>
            </div>

            <div className="mt-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
              {PAIN_POINTS.map((item) => (
                <div
                  key={item.id}
                  className="bg-[#FFF6FA] rounded-[20px] border border-[#FCE8F1] p-4 sm:p-5 flex items-start gap-3.5 shadow-2xs"
                >
                  <div className="w-10 h-10 rounded-[14px] bg-[#FCE8F1] text-[#F01579] flex items-center justify-center shrink-0">
                    {PAIN_ICONS[item.id] ?? <Calendar className="w-5 h-5 text-[#F01579]" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="font-display font-bold text-[12px] text-[#F01579] tracking-wider">
                      {item.number}.
                    </span>
                    <p className="mt-0.5 font-medium text-[14.5px] sm:text-[15.5px] text-[#29202A] leading-[1.45]">
                      {item.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 4. SEÇÃO — CONHEÇA OS MATERIAIS DO PLANNER 2027 */}
        <section
          id="conheca-o-planner"
          className="cv-section w-full bg-[#FFF6FA] py-[46px] sm:py-[70px] px-[14px] sm:px-[18px] border-b border-[#FCE8F1]"
        >
          <div className="max-w-[1120px] mx-auto">
            <div className="text-center max-w-[760px] mx-auto">
              <span className="inline-block rounded-full bg-[#FCE8F1] px-3.5 py-1 text-[#F01579] text-[11.5px] font-bold tracking-[0.08em] uppercase">
                MATERIAIS PRÁTICOS E PRONTOS PARA IMPRIMIR
              </span>
              <h2 className="mt-2.5 font-display font-bold text-[#29202A] text-[22px] sm:text-[32px] md:text-[38px] leading-[1.2] uppercase">
                TUDO PARA ORGANIZAR SUA ROTINA{' '}
                <span className="text-[#F01579]">EM UM SÓ LUGAR!</span>
              </h2>
              <p className="mt-2.5 text-[#534656] text-[14.5px] sm:text-[16.5px] leading-[1.55]">
                Conheça as principais ferramentas incluídas na coleção para planejar seus dias,
                acompanhar hábitos, controlar finanças e organizar suas prioridades.
              </p>
            </div>

            <div className="mt-7 sm:mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {PRODUCT_DEMO_SOURCES.map((demo) => (
                <div
                  key={demo.id}
                  className="bg-white rounded-[22px] border border-[#FCE8F1] p-4 sm:p-5 flex flex-col justify-between shadow-[0_8px_24px_rgba(240,21,121,0.05)]"
                >
                  <div>
                    <div className="relative w-full h-[200px] sm:h-[220px] rounded-[16px] bg-[#FFF6FA] border border-[#FCE8F1] p-3 flex items-center justify-center overflow-hidden">
                      <picture className="w-full h-full flex items-center justify-center">
                        <source
                          type="image/avif"
                          srcSet={demo.sources.avifSrcSet}
                          sizes="(max-width: 640px) 84vw, 320px"
                        />
                        <source
                          type="image/webp"
                          srcSet={demo.sources.webpSrcSet}
                          sizes="(max-width: 640px) 84vw, 320px"
                        />
                        <img
                          src={demo.sources.fallbackWebp}
                          alt={`${demo.number} — ${demo.name}`}
                          width={280}
                          height={350}
                          loading="lazy"
                          decoding="async"
                          className="w-full h-full object-contain block"
                        />
                      </picture>
                      <span className="absolute top-2.5 left-2.5 inline-flex items-center gap-1.5 rounded-full bg-white/95 border border-[#FCE8F1] px-2.5 py-1 text-[11px] font-display font-bold text-[#F01579] shadow-2xs">
                        {MATERIAL_ICONS[demo.id]}
                        <span>{demo.number}</span>
                      </span>
                    </div>

                    <h3 className="mt-4 font-display font-bold text-[16px] sm:text-[17.5px] text-[#29202A] leading-snug uppercase">
                      <span className="text-[#F01579]">{demo.number}</span> — {demo.name}
                    </h3>
                    <p className="mt-1.5 text-[14px] sm:text-[14.5px] text-[#534656] leading-[1.5]">
                      {demo.explanation}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Vitrine Real de Uso (Planner Impresso + Tablet e Celular em Mesa Organizada) */}
            <div className="mt-8 bg-white rounded-[24px] border-2 border-[#FCE8F1] p-4 sm:p-6 shadow-[0_10px_28px_rgba(240,21,121,0.06)] grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
              <div className="lg:col-span-7 rounded-[18px] overflow-hidden border border-[#FCE8F1] bg-[#FFF6FA] aspect-[16/9]">
                <picture>
                  <source
                    type="image/avif"
                    srcSet={LIFESTYLE_SOURCES.avifSrcSet}
                    sizes="(max-width: 768px) 92vw, 600px"
                  />
                  <source
                    type="image/webp"
                    srcSet={LIFESTYLE_SOURCES.webpSrcSet}
                    sizes="(max-width: 768px) 92vw, 600px"
                  />
                  <img
                    src={LIFESTYLE_SOURCES.fallbackWebp}
                    alt="Demonstração real de uso do Planner 2027 impresso e encadernado junto ao tablet e celular exibindo os arquivos digitais"
                    width={960}
                    height={540}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover block"
                  />
                </picture>
              </div>
              <div className="lg:col-span-5 text-center lg:text-left">
                <span className="inline-block rounded-full bg-[#FCE8F1] px-3 py-1 font-display font-bold text-[11px] text-[#F01579] uppercase tracking-wider">
                  PRATICIDADE NO PAPEL OU NA TELA
                </span>
                <h3 className="mt-2 font-display font-bold text-[19px] sm:text-[23px] text-[#29202A] leading-tight uppercase">
                  IMPRIMA E ENCADERNE OU CONSULTE{' '}
                  <span className="text-[#F01579]">NO CELULAR E TABLET!</span>
                </h3>
                <p className="mt-2 text-[14px] sm:text-[14.5px] text-[#534656] leading-[1.55]">
                  Os arquivos digitais em alta definição foram desenhados no formato A4 para você
                  imprimir em casa ou gráfica rápida quantas vezes quiser, mantendo sua mesa e sua
                  rotina sempre organizadas.
                </p>
                <div className="mt-4">
                  <a
                    href="#escolha-seu-kit"
                    className="font-display inline-flex items-center justify-center gap-2 w-full sm:w-auto min-h-[46px] px-5 rounded-[12px] bg-[#16B83A] hover:bg-[#139e31] text-white font-bold text-[13px] uppercase shadow-xs transition-colors"
                  >
                    <ShoppingCart className="w-4 h-4 shrink-0" />
                    <span>ESCOLHER MEU PLANO AGORA</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Galeria Interativa dos Modelos */}
            <div
              className="mt-6 bg-white rounded-[22px] border border-[#FCE8F1] p-4 sm:p-6 shadow-2xs"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              aria-label="Navegação pelos modelos reais da Coleção Planner 2027"
            >
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-4 border-b border-[#FCE8F1]">
                <div className="text-center sm:text-left">
                  <p className="font-display font-bold text-[14.5px] sm:text-[16px] text-[#29202A]">
                    Veja mais modelos reais da coleção Planner 2027:
                  </p>
                  <p className="text-[13px] text-[#534656]" aria-live="polite">
                    Modelo selecionado:{' '}
                    <strong className="text-[#F01579]">{currentCarouselModel.title}</strong> —{' '}
                    {currentCarouselModel.benefitText}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleCarouselStep('prev')}
                    aria-label="Modelo anterior"
                    className="w-11 h-11 rounded-full bg-[#FFF6FA] hover:bg-[#FCE8F1] active:scale-95 text-[#F01579] border border-[#FCE8F1] flex items-center justify-center transition-transform cursor-pointer"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCarouselStep('next')}
                    aria-label="Próximo modelo"
                    className="w-11 h-11 rounded-full bg-[#FFF6FA] hover:bg-[#FCE8F1] active:scale-95 text-[#F01579] border border-[#FCE8F1] flex items-center justify-center transition-transform cursor-pointer"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
                {CAROUSEL_MODEL_SOURCES.map((model, idx) => {
                  const isActive = idx === activeCarouselIdx;
                  return (
                    <button
                      key={model.id}
                      type="button"
                      onClick={() => setActiveCarouselIdx(idx)}
                      aria-label={`Selecionar modelo ${idx + 1}: ${model.title}`}
                      aria-current={isActive ? 'true' : undefined}
                      className={`group rounded-[14px] p-2 border text-center transition-colors cursor-pointer flex flex-col items-center ${
                        isActive
                          ? 'bg-[#FCE8F1]/60 border-[#F01579] ring-2 ring-[#F01579]/20'
                          : 'bg-[#FFF6FA] border-[#FCE8F1] hover:border-[#F01579]/50'
                      }`}
                    >
                      <div className="w-full aspect-[4/5] rounded-[8px] bg-white p-1 flex items-center justify-center overflow-hidden">
                        <picture className="w-full h-full flex items-center justify-center">
                          <source type="image/avif" srcSet={model.sources.avifSrcSet} sizes="120px" />
                          <source type="image/webp" srcSet={model.sources.webpSrcSet} sizes="120px" />
                          <img
                            src={model.sources.fallbackWebp}
                            alt={model.title}
                            width={120}
                            height={150}
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-contain block"
                          />
                        </picture>
                      </div>
                      <span className="mt-1.5 font-display font-semibold text-[11px] text-[#29202A] leading-tight line-clamp-1">
                        {model.title}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* 5. SEÇÃO — COMO FUNCIONA EM 3 ETAPAS */}
        <section className="cv-section w-full bg-white py-[44px] sm:py-[64px] px-[14px] sm:px-[18px] border-b border-[#FCE8F1]">
          <div className="max-w-[1060px] mx-auto">
            <div className="text-center max-w-[700px] mx-auto">
              <span className="inline-block rounded-full bg-[#FCE8F1] px-3.5 py-1 text-[#F01579] text-[11.5px] font-bold tracking-[0.08em] uppercase">
                PASSO A PASSO SIMPLES
              </span>
              <h2 className="mt-2.5 font-display font-bold text-[#29202A] text-[22px] sm:text-[32px] md:text-[36px] leading-[1.2] uppercase">
                É SIMPLES COMEÇAR A{' '}
                <span className="text-[#F01579]">ORGANIZAR SEU 2027!</span>
              </h2>
            </div>

            <div className="mt-7 sm:mt-9 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              {STEP_ITEMS.map((step) => (
                <div
                  key={step.step}
                  className="bg-[#FFF6FA] rounded-[22px] border border-[#FCE8F1] p-5 sm:p-6 flex flex-col items-center text-center shadow-2xs"
                >
                  <div className="w-16 h-16 rounded-[18px] bg-white border border-[#FCE8F1] p-2.5 flex items-center justify-center shadow-2xs">
                    <picture className="w-full h-full flex items-center justify-center">
                      <source type="image/avif" srcSet={toAvifUrl(step.image)} />
                      <img
                        src={step.image}
                        alt={`${step.code} — ${step.title}`}
                        width={56}
                        height={56}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-contain block"
                      />
                    </picture>
                  </div>

                  <span className="mt-3.5 inline-block rounded-full bg-[#FCE8F1] px-3 py-0.5 font-display font-bold text-[11px] text-[#F01579] tracking-wider uppercase">
                    {step.code}
                  </span>

                  <h3 className="mt-2 font-display font-bold text-[16.5px] sm:text-[18px] text-[#29202A] leading-snug uppercase">
                    {step.code} — {step.title}
                  </h3>

                  <p className="mt-2 text-[14px] sm:text-[14.5px] text-[#534656] leading-[1.52]">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 6. SEÇÃO DE OFERTA DOS DOIS PLANOS (KIT BÁSICO R$ 9,90 E KIT PREMIUM R$ 27,90) */}
        <section
          id="escolha-seu-kit"
          className="cv-section w-full bg-[#FFF6FA] py-[48px] sm:py-[76px] px-[14px] sm:px-[18px] border-b border-[#FCE8F1]"
        >
          <div id="oferta-premium" className="max-w-[1080px] mx-auto">
            <div className="text-center max-w-[740px] mx-auto">
              <span className="inline-block rounded-full bg-[#FCE8F1] px-3.5 py-1 text-[#F01579] text-[11.5px] font-bold tracking-[0.08em] uppercase">
                ESCOLHA O PLANO IDEAL PARA VOCÊ
              </span>
              <h2 className="mt-2.5 font-display font-bold text-[#29202A] text-[23px] sm:text-[36px] md:text-[40px] leading-[1.2] uppercase">
                DUAS OPÇÕES PARA ORGANIZAR{' '}
                <span className="text-[#F01579]">SEU 2027</span>
              </h2>
              <p className="mt-2 text-[#534656] text-[14.5px] sm:text-[16.5px] leading-[1.52]">
                Escolha entre o <strong>Kit Básico (100 materiais digitais)</strong> ou o{' '}
                <strong>Kit Premium (250 materiais digitais)</strong> com pagamento único e acesso
                digital.
              </p>
            </div>

            <div className="mt-9 sm:mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-7 items-stretch">
              {/* CARD 1: PLANO BÁSICO — R$ 9,90 (100 MATERIAIS DIGITAIS) */}
              <div className="bg-white rounded-[26px] border-2 border-[#FCE8F1] p-5 sm:p-8 flex flex-col justify-between shadow-[0_8px_28px_rgba(41,32,42,0.05)]">
                <div>
                  <div className="text-center pt-1">
                    <span className="inline-block rounded-full bg-[#FFF6FA] border border-[#FCE8F1] px-4 py-1 font-display font-bold text-[12px] text-[#29202A] tracking-[0.08em] uppercase">
                      {KIT_OPTIONS.basico.name}
                    </span>
                    <h3 className="mt-2.5 font-display font-bold text-[22px] sm:text-[26px] text-[#29202A] leading-[1.2] uppercase">
                      {KIT_OPTIONS.basico.subtitle}
                    </h3>
                    <p className="mt-2 text-[14px] sm:text-[15px] text-[#534656] leading-[1.5] max-w-[400px] mx-auto">
                      {KIT_OPTIONS.basico.idealFor}
                    </p>
                    <p className="mt-4 font-display font-bold text-[42px] sm:text-[48px] leading-none text-[#29202A] tabular-nums">
                      {KIT_OPTIONS.basico.price}
                    </p>
                    <p className="mt-2 text-[12.5px] sm:text-[13px] text-[#534656]">
                      {KIT_OPTIONS.basico.paymentNote}
                    </p>
                  </div>

                  <hr className="border-t border-[#FCE8F1] my-5" />

                  <div className="bg-[#FFF6FA] rounded-[18px] border border-[#FCE8F1] p-4 sm:p-5">
                    <p className="font-display text-[12px] font-bold text-[#F01579] uppercase tracking-[0.08em] mb-3">
                      DESTAQUES DO KIT BÁSICO:
                    </p>
                    <ul className="space-y-2.5 text-[14px] sm:text-[14.5px]">
                      {KIT_OPTIONS.basico.includedFeatures.map((feat) => (
                        <li
                          key={feat}
                          className="flex items-start gap-2.5 text-[#29202A] leading-[1.45]"
                        >
                          <span className="w-5 h-5 rounded-full bg-[#e8faee] text-[#16B83A] flex items-center justify-center shrink-0 mt-0.5">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </span>
                          <span className="font-medium">{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* BOTÃO DO KIT BÁSICO: Abre o Popup Estratégico de Upgrade antes de ir ao checkout */}
                <div className="mt-6 text-center">
                  <button
                    type="button"
                    data-testid="kit-basico-cta"
                    onClick={() => handleBasicPlanClick('plans_section')}
                    className="font-display inline-flex items-center justify-center gap-2 w-full min-h-[54px] sm:min-h-[58px] rounded-[16px] border-2 border-[#16B83A] bg-white hover:bg-[#e8faee] active:scale-[0.99] text-[#16B83A] font-bold text-[14px] sm:text-[15.5px] tracking-normal uppercase transition-all cursor-pointer px-4"
                  >
                    <ShoppingCart className="w-5 h-5 shrink-0" />
                    <span>{KIT_OPTIONS.basico.ctaLabel}</span>
                  </button>
                  <p className="mt-2.5 text-[12px] sm:text-[13px] font-medium text-[#534656]">
                    Pagamento único • Sem mensalidade • Garantia de 7 dias
                  </p>
                </div>
              </div>

              {/* CARD 2: PLANO PREMIUM — R$ 27,90 (250 MATERIAIS DIGITAIS — MAIS COMPLETO) */}
              <div className="relative bg-gradient-to-b from-[#FCE8F1]/60 via-white to-white rounded-[26px] border-2 border-[#F01579] p-5 sm:p-8 flex flex-col justify-between shadow-[0_18px_46px_rgba(240,21,121,0.16)] mt-2 md:mt-0">
                {/* Selo Superior: MAIS COMPLETO */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="font-display inline-flex items-center gap-1.5 bg-[#F01579] border border-[#F4C542] text-white text-[12px] sm:text-[13px] font-bold px-5 py-1.5 rounded-full uppercase tracking-wider shadow-sm whitespace-nowrap">
                    <Sparkles className="w-3.5 h-3.5 text-[#F4C542] shrink-0" />
                    <span>{KIT_OPTIONS.premium.badge}</span>
                  </span>
                </div>

                <div>
                  <div className="text-center pt-2">
                    <span className="inline-block rounded-full bg-[#FCE8F1] border border-[#F01579]/30 px-4 py-1 font-display font-bold text-[12px] text-[#F01579] tracking-[0.08em] uppercase">
                      {KIT_OPTIONS.premium.name}
                    </span>
                    <h3 className="mt-2.5 font-display font-bold text-[22px] sm:text-[26px] text-[#29202A] leading-[1.2] uppercase">
                      <span className="text-[#F01579]">250</span> materiais digitais.
                    </h3>
                    <p className="mt-2 text-[14px] sm:text-[15px] text-[#534656] leading-[1.5] max-w-[420px] mx-auto">
                      {KIT_OPTIONS.premium.idealFor}
                    </p>
                    <p className="mt-4 font-display font-bold text-[44px] sm:text-[52px] leading-none text-[#16B83A] tabular-nums">
                      {KIT_OPTIONS.premium.price}
                    </p>
                    <p className="mt-2 text-[12.5px] sm:text-[13px] text-[#534656]">
                      {KIT_OPTIONS.premium.paymentNote}
                    </p>
                  </div>

                  <hr className="border-t border-[#FCE8F1] my-5" />

                  <div className="bg-white rounded-[18px] border border-[#FCE8F1] p-4 sm:p-5">
                    <p className="font-display text-[12px] font-bold text-[#F01579] uppercase tracking-[0.08em] mb-3">
                      DESTAQUES DO KIT PREMIUM (OPÇÃO MAIS COMPLETA):
                    </p>
                    <ul className="space-y-2.5 text-[14px] sm:text-[14.5px]">
                      {KIT_OPTIONS.premium.includedFeatures.map((feat, idx) => (
                        <li
                          key={feat}
                          className={`flex items-start gap-2.5 text-[#29202A] leading-[1.45] ${
                            idx <= 1 ? 'font-bold text-[#F01579]' : 'font-medium'
                          }`}
                        >
                          <span className="w-5 h-5 rounded-full bg-[#e8faee] text-[#16B83A] flex items-center justify-center shrink-0 mt-0.5">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </span>
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Destaque dos 6 Bônus Incluídos no Kit Premium */}
                    {KIT_OPTIONS.premium.bonuses && (
                      <div className="mt-4 pt-4 border-t border-[#FCE8F1]">
                        <p className="font-display inline-flex items-center gap-1.5 text-[11.5px] font-bold text-[#29202A] uppercase tracking-wider mb-2">
                          <Gift className="w-4 h-4 text-[#F01579] shrink-0" />
                          <span>6 BÔNUS EXCLUSIVOS INCLUÍDOS NO PREMIUM:</span>
                        </p>
                        <ul className="space-y-1.5 text-[13px] text-[#534656]">
                          {KIT_OPTIONS.premium.bonuses.map((bonus) => (
                            <li key={bonus} className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#F01579] shrink-0" />
                              <span className="font-medium text-[#29202A]">{bonus}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                {/* BOTÃO DO KIT PREMIUM: Direciona diretamente para o checkout Premium (R$ 27,90) */}
                <div className="mt-6 text-center">
                  <a
                    href={premiumCheckoutHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-testid="kit-premium-cta"
                    onClick={(e) => handleDirectPremiumClick(e, 'plans_section')}
                    className="font-display inline-flex items-center justify-center gap-2 w-full min-h-[54px] sm:min-h-[58px] rounded-[16px] bg-[#16B83A] hover:bg-[#139e31] hover:-translate-y-0.5 active:scale-[0.99] text-white font-bold text-[15px] sm:text-[17px] tracking-normal uppercase shadow-[0_12px_28px_rgba(22,184,58,0.32)] transition-all cursor-pointer px-4"
                  >
                    <ShoppingCart className="w-5 h-5 shrink-0" />
                    <span>{KIT_OPTIONS.premium.ctaLabel}</span>
                  </a>
                  <p className="mt-2.5 text-[12px] sm:text-[13px] font-medium text-[#534656]">
                    Pagamento único • Sem mensalidade • Garantia de 7 dias
                  </p>
                </div>
              </div>
            </div>

            {/* Vitrine Visual dos 6 Bônus Inclusos no Kit Premium */}
            <div className="mt-10 bg-white rounded-[24px] border-2 border-[#FCE8F1] p-5 sm:p-7 shadow-2xs">
              <div className="text-center max-w-[680px] mx-auto">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FCE8F1] border border-[#F4C542] px-3.5 py-1 text-[#F01579] text-[11px] font-display font-bold uppercase tracking-wider">
                  <Gift className="w-3.5 h-3.5 text-[#F01579]" />
                  <span>INCLUÍDOS NO KIT PREMIUM</span>
                </span>
                <h3 className="mt-2 font-display font-bold text-[#29202A] text-[20px] sm:text-[26px] leading-tight uppercase">
                  CONHEÇA OS <span className="text-[#F01579]">6 BÔNUS COMPLEMENTARES</span> DO KIT
                  PREMIUM
                </h3>
                <p className="mt-1.5 text-[14px] text-[#534656]">
                  Ao escolher o Kit Premium, além dos 250 materiais digitais, você recebe estes 6
                  materiais complementares sem custo adicional:
                </p>
              </div>

              <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {BONUS_ITEM_SOURCES.map((bonus) => (
                  <div
                    key={bonus.number}
                    className="rounded-[16px] bg-[#FFF6FA] border border-[#FCE8F1] p-2.5 flex flex-col justify-between text-center"
                  >
                    <div>
                      <div className="w-full aspect-[3/4] rounded-[10px] bg-white border border-[#FCE8F1] p-1.5 flex items-center justify-center overflow-hidden">
                        <picture className="w-full h-full flex items-center justify-center">
                          <source
                            type="image/avif"
                            srcSet={bonus.sources.avifSrcSet}
                            sizes="(max-width: 640px) 44vw, 180px"
                          />
                          <source
                            type="image/webp"
                            srcSet={bonus.sources.webpSrcSet}
                            sizes="(max-width: 640px) 44vw, 180px"
                          />
                          <img
                            src={bonus.sources.fallbackWebp}
                            alt={`Bônus ${bonus.number} — ${bonus.title}`}
                            width={180}
                            height={240}
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-contain block"
                          />
                        </picture>
                      </div>
                      <span className="mt-2 inline-block rounded-full bg-[#FCE8F1] px-2 py-0.5 font-display font-bold text-[9.5px] text-[#F01579] uppercase">
                        BÔNUS {bonus.number}
                      </span>
                      <h4 className="mt-1 font-display font-bold text-[12px] text-[#29202A] leading-tight uppercase">
                        {bonus.title}
                      </h4>
                    </div>
                    <p className="mt-1 text-[11px] text-[#534656] leading-snug">
                      {bonus.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 7. SEÇÃO — COMPARAÇÃO DOS PLANOS (TABELA VISUAL) */}
        <section className="cv-section w-full bg-white py-[46px] sm:py-[72px] px-[14px] sm:px-[18px] border-b border-[#FCE8F1]">
          <div className="max-w-[900px] mx-auto">
            <div className="text-center max-w-[680px] mx-auto">
              <span className="inline-block rounded-full bg-[#FCE8F1] px-3.5 py-1 text-[#F01579] text-[11.5px] font-bold tracking-[0.08em] uppercase">
                COMPARATIVO TRANSPARENTE
              </span>
              <h2 className="mt-2.5 font-display font-bold text-[#29202A] text-[22px] sm:text-[34px] leading-[1.2] uppercase">
                COMPARE AS <span className="text-[#F01579]">DUAS OPÇÕES</span>
              </h2>
              <p className="mt-2 text-[#534656] text-[14.5px] sm:text-[16px] leading-[1.5]">
                Veja lado a lado o que está incluído no Kit Básico e no Kit Premium.
              </p>
            </div>

            <div className="mt-7 sm:mt-9 overflow-hidden rounded-[22px] border-2 border-[#FCE8F1] bg-white shadow-2xs">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b-2 border-[#FCE8F1] bg-[#FFF6FA]">
                    <th className="py-3.5 px-3 sm:px-5 font-display font-bold text-[12.5px] sm:text-[14.5px] text-[#29202A] uppercase">
                      Característica
                    </th>
                    <th className="py-3.5 px-3 sm:px-5 font-display font-bold text-[12.5px] sm:text-[14.5px] text-[#29202A] text-center uppercase">
                      Básico
                    </th>
                    <th className="py-3.5 px-3 sm:px-5 font-display font-bold text-[12.5px] sm:text-[14.5px] text-[#F01579] text-center uppercase bg-[#FCE8F1]/60">
                      <span className="block">Premium</span>
                      <span className="inline-block mt-0.5 rounded-full bg-[#F4C542] text-[#29202A] px-2 py-0.5 text-[9.5px] font-bold">
                        MAIS COMPLETO
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#FCE8F1] text-[13px] sm:text-[14.5px]">
                  {PLAN_COMPARISON_ROWS.map((row) => (
                    <tr key={row.feature} className="hover:bg-[#FFF6FA]/60 transition-colors">
                      <td className="py-3.5 px-3 sm:px-5 font-medium text-[#29202A]">
                        {row.feature}
                      </td>
                      <td className="py-3.5 px-3 sm:px-5 text-center font-medium text-[#534656] tabular-nums">
                        {row.basico}
                      </td>
                      <td
                        className={`py-3.5 px-3 sm:px-5 text-center bg-[#FCE8F1]/30 tabular-nums ${
                          row.highlightPremium
                            ? 'font-display font-bold text-[15px] sm:text-[17px] text-[#F01579]'
                            : 'font-semibold text-[#29202A]'
                        }`}
                      >
                        {row.premium}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* 8. SEÇÃO — CONFIANÇA, SEGURANÇA E SUPORTE HUMANIZADO */}
        <section className="cv-section w-full bg-[#FFF6FA] py-[46px] sm:py-[68px] px-[14px] sm:px-[18px] border-b border-[#FCE8F1]">
          <div className="max-w-[1040px] mx-auto space-y-6 sm:space-y-8">
            {/* Pilares de Confiança */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
              <div className="bg-white rounded-[20px] border border-[#FCE8F1] p-4 sm:p-5 flex items-start gap-3 shadow-2xs">
                <div className="w-10 h-10 rounded-[12px] bg-[#e8faee] text-[#16B83A] flex items-center justify-center shrink-0">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-[14.5px] text-[#29202A] uppercase">
                    Pagamento único
                  </h3>
                  <p className="mt-1 text-[13px] text-[#534656] leading-snug">
                    Sem mensalidade e sem cobranças recorrentes.
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-[20px] border border-[#FCE8F1] p-4 sm:p-5 flex items-start gap-3 shadow-2xs">
                <div className="w-10 h-10 rounded-[12px] bg-[#FCE8F1] text-[#F01579] flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-[14.5px] text-[#29202A] uppercase">
                    Acesso digital
                  </h3>
                  <p className="mt-1 text-[13px] text-[#534656] leading-snug">
                    Liberação dos arquivos após a confirmação do pagamento.
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-[20px] border border-[#FCE8F1] p-4 sm:p-5 flex items-start gap-3 shadow-2xs">
                <div className="w-10 h-10 rounded-[12px] bg-[#e8faee] text-[#16B83A] flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-[14.5px] text-[#29202A] uppercase">
                    Garantia de 7 dias
                  </h3>
                  <p className="mt-1 text-[13px] text-[#534656] leading-snug">
                    Segurança para conhecer o material com tranquilidade.
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-[20px] border border-[#FCE8F1] p-4 sm:p-5 flex items-start gap-3 shadow-2xs">
                <div className="w-10 h-10 rounded-[12px] bg-[#FCE8F1] text-[#F01579] flex items-center justify-center shrink-0">
                  <Headset className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-[14.5px] text-[#29202A] uppercase">
                    Suporte humanizado
                  </h3>
                  <p className="mt-1 text-[13px] text-[#534656] leading-snug">
                    Atendimento pelos canais oficiais da operação.
                  </p>
                </div>
              </div>
            </div>

            {/* Bloco de Garantia de 7 Dias + Canal Oficial de Suporte */}
            <div className="bg-white rounded-[24px] border-2 border-[#FCE8F1] p-5 sm:p-8 shadow-2xs grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              <div className="lg:col-span-7 flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
                <div className="w-[100px] sm:w-[124px] shrink-0 flex items-center justify-center">
                  <picture className="w-full">
                    <source type="image/avif" srcSet={toAvifUrl(GUARANTEE_BADGE_IMAGE)} />
                    <img
                      src={GUARANTEE_BADGE_IMAGE}
                      alt="Selo de Garantia de 7 Dias"
                      width={240}
                      height={260}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-auto object-contain block"
                    />
                  </picture>
                </div>
                <div>
                  <span className="inline-block rounded-full bg-[#FCE8F1] border border-[#F4C542] px-3.5 py-1 text-[#F01579] text-[11px] font-bold tracking-[0.08em] uppercase">
                    GARANTIA DE 7 DIAS
                  </span>
                  <h2 className="mt-2 font-display font-bold text-[#29202A] text-[21px] sm:text-[26px] leading-[1.2] uppercase">
                    COMPRE COM <span className="text-[#F01579]">TRANQUILIDADE!</span>
                  </h2>
                  <p className="mt-1.5 text-[#534656] text-[14px] sm:text-[15px] leading-[1.55]">
                    Você tem 7 dias de garantia para conhecer o material. Se dentro desse período
                    decidir que a coleção não é adequada para você, poderá solicitar o reembolso
                    conforme as condições da garantia.
                  </p>
                </div>
              </div>

              {/* Elemento estritamente informativo de Suporte Humanizado (sem ação de clique conforme Regra 9) */}
              <div
                data-testid="support-info-static"
                className="lg:col-span-5 rounded-[20px] bg-[#FFF6FA] border border-[#FCE8F1] p-4 sm:p-5 select-none"
              >
                <div className="inline-flex items-center gap-1.5 rounded-full bg-[#FCE8F1] px-3 py-1 text-[#F01579] text-[11px] font-display font-bold uppercase tracking-wider">
                  <Headset className="w-3.5 h-3.5 text-[#F01579] shrink-0" />
                  <span>SUPORTE HUMANIZADO</span>
                </div>
                <h3 className="mt-2 font-display font-bold text-[15px] text-[#29202A] uppercase">
                  Atendimento e acompanhamento ao aluno
                </h3>
                <ul className="mt-2.5 space-y-2 text-[13.5px] text-[#29202A]">
                  {SUPPORT_HIGHLIGHTS.map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#16B83A] stroke-[3] shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* 9. SEÇÃO — PERGUNTAS FREQUENTES */}
        <section className="cv-section w-full bg-white py-[46px] sm:py-[72px] px-[14px] sm:px-[18px]">
          <div className="max-w-[800px] mx-auto">
            <div className="text-center">
              <span className="inline-block rounded-full bg-[#FCE8F1] px-3.5 py-1 text-[#F01579] text-[11.5px] font-bold tracking-[0.08em] uppercase">
                PERGUNTAS FREQUENTES
              </span>
              <h2 className="mt-2.5 font-display font-bold text-[#29202A] text-[22px] sm:text-[34px] md:text-[38px] leading-[1.2] uppercase">
                TIRE SUAS DÚVIDAS <span className="text-[#F01579]">ANTES DE COMPRAR</span>
              </h2>
            </div>

            <div className="mt-7 sm:mt-9 space-y-3">
              {FAQ_ITEMS.map((faq) => {
                const isOpen = openFaqId === faq.id;
                return (
                  <div
                    key={faq.id}
                    className="bg-[#FFF6FA] rounded-[18px] border border-[#FCE8F1] overflow-hidden transition-colors"
                  >
                    <button
                      type="button"
                      onClick={() => toggleFaq(faq.id)}
                      aria-expanded={isOpen}
                      className="w-full min-h-[54px] px-4 sm:px-5 py-3.5 sm:py-4 flex items-center justify-between gap-3 text-left font-display font-bold text-[15px] sm:text-[16.5px] text-[#29202A] hover:text-[#F01579] transition-colors cursor-pointer"
                    >
                      <span>
                        <span className="text-[#F01579] mr-1.5">{faq.number}.</span>
                        {faq.question}
                      </span>
                      <ChevronDown
                        className={`w-4.5 h-4.5 text-[#534656] shrink-0 transition-transform duration-200 ${
                          isOpen ? 'rotate-180 text-[#F01579]' : ''
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-4 sm:px-5 pb-4 pt-1 text-[14px] sm:text-[15px] leading-[1.6] text-[#534656] bg-white border-t border-[#FCE8F1]">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      {/* 10. BARRA FIXA INFERIOR NO CELULAR */}
      {showFloatingBar && !isFloatingBarDismissed && !isUpsellModalOpen && !activeLegalModal && (
        <div
          data-testid="mobile-sticky-bar"
          className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-white/95 backdrop-blur-xs border-t border-[#FCE8F1] px-[12px] pt-2 pb-safe-bar shadow-[0_-6px_20px_rgba(41,32,42,0.08)] flex items-center justify-between gap-2"
        >
          <div className="min-w-0 pl-1">
            <span className="block font-display font-bold text-[11px] text-[#F01579] uppercase tracking-wider leading-tight">
              PLANNER 2027
            </span>
            <span className="font-display font-bold text-[13.5px] text-[#29202A] leading-tight tabular-nums">
              Básico R$ 9,90 • <strong className="text-[#16B83A]">Premium R$ 27,90</strong>
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <a
              href="#escolha-seu-kit"
              data-testid="mobile-sticky-cta"
              className="font-display inline-flex items-center justify-center gap-1.5 min-h-[42px] px-3.5 rounded-[12px] bg-[#16B83A] hover:bg-[#139e31] active:scale-[0.98] text-white font-bold text-[12px] uppercase tracking-normal shadow-xs transition-transform cursor-pointer whitespace-nowrap"
            >
              <ShoppingCart className="w-3.5 h-3.5 shrink-0" />
              <span>ESCOLHER PLANO</span>
            </a>

            <button
              type="button"
              onClick={() => setIsFloatingBarDismissed(true)}
              aria-label="Minimizar barra de oferta"
              className="w-9 h-10 rounded-[10px] text-[#6e5f70] hover:text-[#29202A] hover:bg-[#FFF6FA] flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 11. RODAPÉ */}
      <footer className="w-full bg-[#29202A] text-white pt-8 footer-safe-space px-[16px]">
        <div className="max-w-[1140px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-[13px]">
          <p className="text-white/85 text-center sm:text-left">
            © 2026 Coleção Planner 2027. Todos os direitos reservados • Produto 100% Digital.
          </p>
          <nav
            aria-label="Links institucionais"
            className="flex flex-wrap items-center justify-center gap-3 sm:gap-5"
          >
            <button
              type="button"
              onClick={() => setActiveLegalModal('termos')}
              className="min-h-[44px] px-2.5 inline-flex items-center text-white/90 hover:text-[#FCE8F1] transition-colors cursor-pointer"
            >
              Termos de Uso
            </button>
            <button
              type="button"
              onClick={() => setActiveLegalModal('privacidade')}
              className="min-h-[44px] px-2.5 inline-flex items-center text-white/90 hover:text-[#FCE8F1] transition-colors cursor-pointer"
            >
              Política de Privacidade
            </button>
            <button
              type="button"
              onClick={() => setActiveLegalModal('contato')}
              className="min-h-[44px] px-2.5 inline-flex items-center text-white/90 hover:text-[#FCE8F1] transition-colors cursor-pointer"
            >
              Contato
            </button>
          </nav>
        </div>
      </footer>

      {/* POPUP ESTRATÉGICO DE UPGRADE (Exibido apenas ao clicar em comprar o Kit Básico) */}
      {isUpsellModalOpen && (
        <Suspense fallback={null}>
          <UpsellModal
            isOpen={isUpsellModalOpen}
            locationSearch={locationSearch}
            onClose={() => setIsUpsellModalOpen(false)}
            onAcceptUpgrade={handleAcceptUpgrade}
            onDeclineUpgrade={handleDeclineUpgrade}
          />
        </Suspense>
      )}

      {/* Modal Institucional / Suporte */}
      {activeLegalModal && (
        <Suspense fallback={null}>
          <LegalModal
            activeModal={activeLegalModal}
            onClose={() => setActiveLegalModal(null)}
          />
        </Suspense>
      )}
    </div>
  );
}
