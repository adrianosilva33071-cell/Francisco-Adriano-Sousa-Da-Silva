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
  buildCheckoutUrlWithTracking,
  CAKTO_BASICO_URL,
  CAKTO_PREMIUM_UPSELL_URL,
  CAKTO_PREMIUM_URL,
  calculatePriceDifference,
  dispatchFunnelTrackingEvent,
  getResponsiveImageSources,
  GUARANTEE_BADGE_IMAGE,
  HERO_MOCKUP_PREVIEWS,
  HERO_PLANNER_IMAGE,
  KIT_OPTIONS,
  LIFESTYLE_PLANNER_IMAGE,
  PRODUCT_DEMO_ITEMS,
  SUPPORT_HIGHLIGHTS,
  toAvifUrl,
  UPSELL_MODAL_CONTENT,
} from './utils/catalogData';
import type { LegalModalType } from './components/LegalModal';
import UpsellModal from './components/UpsellModal';

const LegalModal = lazy(() => import('./components/LegalModal'));

const MATERIAL_ICONS: Record<string, React.ReactNode> = {
  'demo-semanal': <Calendar className="w-4 h-4 text-[#D83A78]" />,
  'demo-mensal': <CalendarDays className="w-4 h-4 text-[#D83A78]" />,
  'demo-habitos': <HeartHandshake className="w-4 h-4 text-[#D83A78]" />,
  'demo-tarefas': <ListChecks className="w-4 h-4 text-[#D83A78]" />,
  'demo-financeiro': <Wallet className="w-4 h-4 text-[#D83A78]" />,
  'demo-metas': <Target className="w-4 h-4 text-[#D83A78]" />,
};

const HERO_BENEFITS_LIST: string[] = [
  'Organize seus dias e compromissos.',
  'Planeje suas metas e objetivos.',
  'Acompanhe seus hábitos.',
  'Organize tarefas e finanças.',
  'Escolha entre 100 ou 250 materiais digitais.',
];

interface FunnelFaqItem {
  id: string;
  number: string;
  question: string;
  answer: string;
}

const FUNNEL_FAQ_ITEMS: FunnelFaqItem[] = [
  {
    id: 'como-recebo',
    number: '01',
    question: 'Como recebo meus materiais?',
    answer:
      'Os materiais são 100% digitais e o acesso ocorre após a confirmação do pagamento, conforme o sistema de entrega configurado na plataforma.',
  },
  {
    id: 'podem-ser-impressos',
    number: '02',
    question: 'Os materiais podem ser impressos?',
    answer:
      'Sim. Todos os arquivos da coleção são disponibilizados em formato A4 prontos para imprimir em casa ou em gráfica rápida quantas vezes desejar para uso pessoal, sem exigir máquina de corte.',
  },
  {
    id: 'usar-no-celular',
    number: '03',
    question: 'Posso utilizar no celular?',
    answer:
      'Sim. Além da opção de imprimir em folha A4, você pode abrir, consultar e utilizar os arquivos digitais diretamente no celular, tablet ou computador.',
  },
  {
    id: 'diferenca-kits',
    number: '04',
    question: 'Qual a diferença entre o Básico e o Premium?',
    answer:
      'O Kit Básico (R$ 9,90) inclui 100 materiais digitais essenciais para organizar a rotina, tarefas e hábitos. O Kit Premium (R$ 27,90) é a opção mais completa, com 250 materiais digitais e 6 bônus complementares incluídos para planejamento semanal, mensal, metas e controle financeiro.',
  },
  {
    id: 'como-funciona-garantia',
    number: '05',
    question: 'Como funciona a garantia de 7 dias?',
    answer:
      'Você possui 7 dias de garantia após a compra para conhecer o material com tranquilidade. Caso necessário dentro desse prazo, basta solicitar o reembolso conforme as condições da garantia.',
  },
  {
    id: 'como-acesso-bonus',
    number: '06',
    question: 'Como acesso meus bônus?',
    answer:
      'Ao escolher o Kit Premium, os 6 bônus complementares são liberados juntamente com os 250 materiais digitais após a confirmação do pagamento, no mesmo ambiente de entrega.',
  },
];

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

const POPUP_PRICE_DIFF = calculatePriceDifference(
  UPSELL_MODAL_CONTENT.premiumComparison.priceNumeric,
  KIT_OPTIONS.basico.priceNumeric
);

export default function App() {
  const [openFaqId, setOpenFaqId] = useState<string | null>('diferenca-kits');
  const [isUpsellModalOpen, setIsUpsellModalOpen] = useState<boolean>(false);
  const [activeLegalModal, setActiveLegalModal] = useState<LegalModalType>(null);
  const [showFloatingBar, setShowFloatingBar] = useState<boolean>(false);
  const [isOfferSectionVisible, setIsOfferSectionVisible] = useState<boolean>(false);
  const [isFloatingBarDismissed, setIsFloatingBarDismissed] = useState<boolean>(false);
  const [locationSearch, setLocationSearch] = useState<string>(() =>
    typeof window !== 'undefined' ? window.location.search : ''
  );
  const directCheckoutLockRef = useRef<boolean>(false);
  const directCheckoutTimerRef = useRef<number | null>(null);
  const viewContentTrackedRef = useRef<boolean>(false);
  const offerCardsRef = useRef<HTMLDivElement | null>(null);

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
      const shouldShow = window.scrollY > 420;
      setShowFloatingBar((prev) => (prev !== shouldShow ? shouldShow : prev));
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    let observer: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== 'undefined' && offerCardsRef.current) {
      observer = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          if (entry) {
            setIsOfferSectionVisible(entry.isIntersecting);
          }
        },
        { threshold: 0.25 }
      );
      observer.observe(offerCardsRef.current);
    }

    return () => {
      window.removeEventListener('scroll', onScroll);
      observer?.disconnect();
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

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF9F6] text-[#251B2B] font-sans antialiased selection:bg-[#D83A78]/15 selection:text-[#D83A78] overflow-x-hidden">
      {/* BARRA SUPERIOR DE CONTEXTO */}
      <header className="w-full min-h-[38px] bg-[#251B2B] flex items-center justify-center px-3 py-1.5 border-b border-[#D83A78]/30">
        <p className="font-display text-white text-[11px] sm:text-[12.5px] font-bold tracking-[0.06em] uppercase text-center leading-tight">
          <span>COLEÇÃO DIGITAL • PLANEJAMENTO 2027</span>
          <span className="hidden min-[420px]:inline text-[#D83A78]"> • </span>
          <span className="hidden min-[420px]:inline text-white/90">
            ACESSO DIGITAL APÓS CONFIRMAÇÃO
          </span>
        </p>
      </header>

      <main className="flex-1">
        {/* =====================================================================
            ETAPA 1 — HERO: PROMESSA E DESEJO (PRIMEIRA DOBRA)
            ===================================================================== */}
        <section
          id="inicio"
          className="w-full bg-gradient-to-b from-[#FFF9F6] via-[#FFFFFF] to-[#FFF9F6] pt-5 sm:pt-10 pb-8 sm:pb-14 px-4 sm:px-6 border-b border-[#251B2B]/10"
        >
          <div className="max-w-[1140px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center">
            {/* Coluna Esquerda (Desktop) / Empilhamento Vertical (Mobile): Copy, Benefícios e CTA */}
            <div className="lg:col-span-6 flex flex-col items-center lg:items-start text-center lg:text-left">
              {/* selo superior */}
              <div className="inline-flex items-center gap-2 rounded-full bg-white border border-[#D83A78]/35 px-3.5 py-1 shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-[#D83A78] shrink-0" />
                <span className="font-display font-bold text-[11px] sm:text-[12px] text-[#D83A78] tracking-[0.06em] uppercase">
                  COLEÇÃO DIGITAL • PLANEJAMENTO 2027
                </span>
              </div>

              {/* título principal */}
              <h1 className="mt-3 sm:mt-4 font-display font-bold text-[#251B2B] text-[26px] min-[390px]:text-[28px] sm:text-[38px] xl:text-[44px] leading-[1.12] tracking-[-0.015em] max-w-[600px] uppercase">
                SEU 2027 MAIS ORGANIZADO{' '}
                <span className="text-[#D83A78]">COMEÇA AQUI.</span>
              </h1>

              {/* subtítulo */}
              <p className="mt-2.5 sm:mt-3.5 text-[#77717A] text-[14.5px] sm:text-[16.5px] leading-[1.55] max-w-[560px]">
                Tenha em um só lugar ferramentas práticas para organizar sua rotina, planejar seus
                objetivos, acompanhar seus hábitos e cuidar melhor das suas finanças.
              </p>

              {/* Imagem do Produto no Mobile (Prioridade Visual após Título e Subtítulo) */}
              <div className="mt-4 w-full lg:hidden flex flex-col items-center">
                <div className="relative w-full max-w-[440px] rounded-[20px] overflow-hidden shadow-[0_14px_34px_rgba(37,27,43,0.12)] border border-[#251B2B]/10 bg-white aspect-[16/9]">
                  <picture>
                    <source type="image/avif" srcSet={HERO_SOURCES.avifSrcSet} sizes="92vw" />
                    <source type="image/webp" srcSet={HERO_SOURCES.webpSrcSet} sizes="92vw" />
                    <img
                      src={HERO_SOURCES.fallbackWebp}
                      alt="Kit de Organização e Planejamento 2027 — Coleção Planner 2027 em versão impressa A4, tablet e celular"
                      width={1272}
                      height={715}
                      fetchPriority="high"
                      decoding="async"
                      className="w-full h-full object-cover object-center block"
                    />
                  </picture>
                  <div className="absolute bottom-2.5 right-2.5 rounded-full bg-[#251B2B]/90 backdrop-blur-xs text-white px-3 py-1 font-display font-bold text-[10px] uppercase tracking-wider border border-[#D83A78]/60">
                    100 OU 250 MATERIAIS DIGITAIS
                  </div>
                </div>

                {/* 6 páginas internas reais da coleção no Mobile */}
                <div
                  className="mt-2 w-full max-w-[440px] grid grid-cols-3 sm:grid-cols-6 gap-1.5"
                  aria-label="Amostras reais das páginas internas do Kit de Organização e Planejamento 2027"
                >
                  {HERO_PREVIEW_SOURCES.map((preview) => (
                    <div
                      key={`mob-${preview.id}`}
                      className="bg-white rounded-[10px] border border-[#251B2B]/10 p-1.5 flex items-center gap-1.5 text-left sm:flex-col sm:text-center shadow-2xs"
                    >
                      <div className="w-8 h-10 sm:w-full sm:h-auto sm:aspect-[4/5] rounded-[4px] bg-[#FFF9F6] flex items-center justify-center overflow-hidden shrink-0">
                        <picture className="w-full h-full flex items-center justify-center">
                          <source
                            type="image/avif"
                            srcSet={preview.sources.avifSrcSet}
                            sizes="15vw"
                          />
                          <source
                            type="image/webp"
                            srcSet={preview.sources.webpSrcSet}
                            sizes="15vw"
                          />
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
                      <span className="font-display font-semibold text-[10px] sm:text-[9.5px] text-[#251B2B] leading-[1.15]">
                        {preview.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Lista de Benefícios da Primeira Dobra */}
              <ul className="mt-4 sm:mt-5 w-full max-w-[540px] space-y-2 text-left">
                {HERO_BENEFITS_LIST.map((benefit) => (
                  <li
                    key={benefit}
                    className="bg-white rounded-[12px] border border-[#251B2B]/10 px-3.5 py-2.5 flex items-center gap-2.5 shadow-2xs"
                  >
                    <span className="w-5 h-5 rounded-full bg-[#16A34A]/12 text-[#16A34A] flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </span>
                    <span className="font-medium text-[13.5px] sm:text-[15px] text-[#251B2B] leading-snug">
                      {benefit}
                    </span>
                  </li>
                ))}
              </ul>

              {/* Botão Principal da Primeira Dobra (rola suavemente para a seção de escolha dos kits) */}
              <div className="mt-5 sm:mt-6 w-full max-w-[540px]">
                <a
                  href="#escolha-seu-kit"
                  data-testid="hero-scroll-plans-cta"
                  className="font-display inline-flex items-center justify-center gap-2.5 w-full min-h-[54px] sm:min-h-[58px] rounded-[14px] bg-[#16A34A] hover:bg-[#15803d] active:scale-[0.99] text-white font-bold text-[15px] sm:text-[16.5px] uppercase tracking-[0.02em] shadow-[0_10px_24px_rgba(22,163,74,0.28)] transition-all cursor-pointer px-6 text-center"
                >
                  <span>QUERO ORGANIZAR MEU 2027</span>
                  <ArrowRight className="w-5 h-5 shrink-0" />
                </a>

                {/* Indicadores discretos de confiança */}
                <div className="mt-3 flex flex-wrap items-center justify-center lg:justify-start gap-x-4 gap-y-1.5 text-[12px] sm:text-[12.5px] text-[#77717A] font-medium">
                  <span className="inline-flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-[#D83A78] shrink-0" />
                    Produto 100% digital
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-[#16A34A] shrink-0" />
                    Pagamento único
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#16A34A] shrink-0" />
                    Garantia de 7 dias
                  </span>
                </div>
              </div>
            </div>

            {/* Coluna Direita no Desktop: Mockup Grande e Nítido + Páginas Internas */}
            <div className="hidden lg:flex lg:col-span-6 flex-col items-center">
              <div className="relative w-full rounded-[24px] overflow-hidden shadow-[0_18px_42px_rgba(37,27,43,0.14)] border-2 border-[#251B2B]/10 bg-white aspect-[16/9]">
                <picture>
                  <source type="image/avif" srcSet={HERO_SOURCES.avifSrcSet} sizes="560px" />
                  <source type="image/webp" srcSet={HERO_SOURCES.webpSrcSet} sizes="560px" />
                  <img
                    src={HERO_SOURCES.fallbackWebp}
                    alt="Kit de Organização e Planejamento 2027 — Planner 2027 impresso, páginas internas e uso digital em tablet e celular"
                    width={1272}
                    height={715}
                    fetchPriority="high"
                    decoding="async"
                    className="w-full h-full object-cover block"
                  />
                </picture>
                <div className="absolute bottom-3.5 right-3.5 rounded-full bg-[#251B2B]/92 backdrop-blur-xs text-white px-4 py-1.5 font-display font-bold text-[11px] uppercase tracking-wider border border-[#D83A78]">
                  KIT DE ORGANIZAÇÃO E PLANEJAMENTO 2027
                </div>
              </div>

              <div
                className="mt-3.5 w-full grid grid-cols-6 gap-2.5"
                aria-label="Páginas internas reais do Kit de Organização e Planejamento 2027"
              >
                {HERO_PREVIEW_SOURCES.map((preview) => (
                  <div
                    key={`desk-${preview.id}`}
                    className="bg-white rounded-[12px] border border-[#251B2B]/10 p-2 shadow-2xs flex flex-col items-center text-center"
                  >
                    <div className="w-full aspect-[4/5] rounded-[6px] bg-[#FFF9F6] flex items-center justify-center overflow-hidden p-0.5">
                      <picture className="w-full h-full flex items-center justify-center">
                        <source
                          type="image/avif"
                          srcSet={preview.sources.avifSrcSet}
                          sizes="90px"
                        />
                        <source
                          type="image/webp"
                          srcSet={preview.sources.webpSrcSet}
                          sizes="90px"
                        />
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
                    <span className="mt-1.5 font-display font-semibold text-[10.5px] text-[#251B2B] leading-tight line-clamp-2">
                      {preview.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================================
            ETAPA 2 — DEMONSTRAÇÃO DO PRODUTO (TANGIBILIDADE DO PRODUTO DIGITAL)
            ===================================================================== */}
        <section
          id="demonstracao-produto"
          className="cv-section w-full bg-white py-10 sm:py-16 px-4 sm:px-6 border-b border-[#251B2B]/10"
        >
          <div className="max-w-[1120px] mx-auto">
            <div className="text-center max-w-[740px] mx-auto">
              <span className="inline-block rounded-full bg-[#FFF9F6] border border-[#D83A78]/30 px-3.5 py-1 text-[#D83A78] text-[11px] font-display font-bold tracking-[0.08em] uppercase">
                CONHEÇA OS MATERIAIS POR DENTRO
              </span>
              <h2 className="mt-2.5 font-display font-bold text-[#251B2B] text-[22px] sm:text-[32px] md:text-[36px] leading-[1.18] uppercase">
                TUDO O QUE VOCÊ PRECISA PARA{' '}
                <span className="text-[#D83A78]">ORGANIZAR SUA ROTINA.</span>
              </h2>
              <p className="mt-2 text-[#77717A] text-[14.5px] sm:text-[16.5px] leading-[1.5]">
                Um conjunto de ferramentas digitais para facilitar o planejamento do seu dia a dia.
              </p>
            </div>

            {/* Galeria Visual Organizada dos 6 Materiais Principais */}
            <div className="mt-7 sm:mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {PRODUCT_DEMO_SOURCES.map((demo) => (
                <article
                  key={demo.id}
                  className="bg-[#FFF9F6] rounded-[20px] border border-[#251B2B]/10 p-4 sm:p-5 flex flex-col justify-between shadow-[0_6px_20px_rgba(37,27,43,0.04)]"
                >
                  <div>
                    <div className="relative w-full aspect-[4/4.2] sm:h-[210px] rounded-[14px] bg-white border border-[#251B2B]/10 p-3 flex items-center justify-center overflow-hidden">
                      <picture className="w-full h-full flex items-center justify-center">
                        <source
                          type="image/avif"
                          srcSet={demo.sources.avifSrcSet}
                          sizes="(max-width: 640px) 88vw, 320px"
                        />
                        <source
                          type="image/webp"
                          srcSet={demo.sources.webpSrcSet}
                          sizes="(max-width: 640px) 88vw, 320px"
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
                      <span className="absolute top-2.5 left-2.5 inline-flex items-center gap-1.5 rounded-full bg-[#FFF9F6] border border-[#D83A78]/30 px-2.5 py-0.5 text-[11px] font-display font-bold text-[#D83A78] shadow-2xs">
                        {MATERIAL_ICONS[demo.id]}
                        <span>{demo.number}</span>
                      </span>
                    </div>

                    <h3 className="mt-3.5 font-display font-bold text-[16px] sm:text-[17.5px] text-[#251B2B] leading-snug uppercase">
                      {demo.name}
                    </h3>
                    <p className="mt-1.5 text-[13.5px] sm:text-[14.5px] text-[#77717A] leading-[1.5]">
                      {demo.explanation}
                    </p>
                  </div>
                </article>
              ))}
            </div>

            {/* Vitrine Prática de Uso: Impressão A4 ou Uso Digital + Fechamento da Seção */}
            <div className="mt-8 sm:mt-10 bg-[#FFF9F6] rounded-[22px] border border-[#251B2B]/10 p-5 sm:p-7 shadow-[0_10px_28px_rgba(37,27,43,0.05)]">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                <div className="lg:col-span-6 rounded-[16px] overflow-hidden border border-[#251B2B]/10 bg-white aspect-[16/9]">
                  <picture>
                    <source
                      type="image/avif"
                      srcSet={LIFESTYLE_SOURCES.avifSrcSet}
                      sizes="(max-width: 768px) 92vw, 540px"
                    />
                    <source
                      type="image/webp"
                      srcSet={LIFESTYLE_SOURCES.webpSrcSet}
                      sizes="(max-width: 768px) 92vw, 540px"
                    />
                    <img
                      src={LIFESTYLE_SOURCES.fallbackWebp}
                      alt="Uso prático do Kit de Organização e Planejamento 2027 impresso em folha A4 e no tablet ou celular"
                      width={960}
                      height={540}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover block"
                    />
                  </picture>
                </div>

                <div className="lg:col-span-6 text-center lg:text-left">
                  <span className="inline-block rounded-full bg-white border border-[#D83A78]/30 px-3 py-0.5 font-display font-bold text-[11px] text-[#D83A78] uppercase tracking-wider">
                    FLEXIBILIDADE PARA O SEU DIA A DIA
                  </span>
                  <h3 className="mt-2 font-display font-bold text-[19px] sm:text-[24px] text-[#251B2B] leading-tight uppercase">
                    Mais organização para seus planos.{' '}
                    <span className="text-[#D83A78]">Mais clareza para sua rotina.</span>
                  </h3>
                  <p className="mt-2 text-[14px] sm:text-[15px] text-[#77717A] leading-[1.55]">
                    Os materiais são entregues em formato digital prontos para visualizar no celular,
                    tablet ou computador e também configurados em tamanho A4 para imprimir quantas
                    vezes desejar.
                  </p>

                  <div className="mt-5 flex justify-center lg:justify-start">
                    <a
                      href="#escolha-seu-kit"
                      className="font-display inline-flex items-center justify-center gap-2 w-full sm:w-auto min-h-[50px] px-6 rounded-[14px] bg-[#16A34A] hover:bg-[#15803d] active:scale-[0.99] text-white font-bold text-[14px] sm:text-[15px] uppercase tracking-[0.02em] shadow-[0_8px_20px_rgba(22,163,74,0.24)] transition-all"
                    >
                      <span>QUERO CONHECER OS KITS</span>
                      <ArrowRight className="w-4.5 h-4.5 shrink-0" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================================
            ETAPA 3 — OFERTA E ESCOLHA DO KIT (SEÇÃO MAIS IMPORTANTE DA PÁGINA)
            ===================================================================== */}
        <section
          id="escolha-seu-kit"
          className="cv-section w-full bg-[#FFF9F6] py-11 sm:py-16 px-4 sm:px-6 border-b border-[#251B2B]/10"
        >
          <div id="oferta-premium" className="max-w-[1080px] mx-auto">
            <div className="text-center max-w-[740px] mx-auto">
              <span className="inline-block rounded-full bg-white border border-[#D83A78]/35 px-3.5 py-1 text-[#D83A78] text-[11.5px] font-display font-bold tracking-[0.08em] uppercase">
                OFERTA ESPECIAL • PAGAMENTO ÚNICO
              </span>
              <h2 className="mt-2.5 font-display font-bold text-[#251B2B] text-[24px] sm:text-[34px] md:text-[38px] leading-[1.16] uppercase">
                ESCOLHA O KIT IDEAL{' '}
                <span className="text-[#D83A78]">PARA SEU 2027.</span>
              </h2>
              <p className="mt-2 text-[#77717A] text-[14.5px] sm:text-[16.5px] leading-[1.5]">
                Escolha a opção que combina com o nível de organização que você deseja alcançar.
              </p>
            </div>

            <div
              ref={offerCardsRef}
              className="mt-8 sm:mt-11 grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch"
            >
              {/* CARD 1 — KIT BÁSICO (R$ 9,90 • 100 MATERIAIS DIGITAIS) */}
              <div className="md:col-span-5 bg-white rounded-[24px] border border-[#251B2B]/15 p-5 sm:p-7 flex flex-col justify-between shadow-[0_8px_24px_rgba(37,27,43,0.06)] order-2 md:order-1">
                <div>
                  <div className="text-center pt-1">
                    <span className="inline-block rounded-full bg-[#FFF9F6] border border-[#251B2B]/15 px-3.5 py-1 font-display font-bold text-[11.5px] text-[#251B2B] tracking-[0.08em] uppercase">
                      KIT BÁSICO
                    </span>
                    <h3 className="mt-2.5 font-display font-bold text-[20px] sm:text-[23px] text-[#251B2B] leading-[1.2] uppercase">
                      100 MATERIAIS DIGITAIS
                    </h3>

                    <div className="mt-3.5">
                      <p className="font-display font-bold text-[38px] sm:text-[44px] leading-none text-[#251B2B] tabular-nums">
                        {KIT_OPTIONS.basico.price}
                      </p>
                      <p className="mt-1.5 text-[12px] sm:text-[12.5px] text-[#77717A] font-medium">
                        {KIT_OPTIONS.basico.paymentNote}
                      </p>
                    </div>

                    <p className="mt-3 text-[13.5px] sm:text-[14.5px] text-[#77717A] leading-[1.5] max-w-[380px] mx-auto">
                      Uma coleção prática para começar a organizar sua rotina, planejar tarefas e
                      acompanhar seus objetivos.
                    </p>
                  </div>

                  <hr className="border-t border-[#251B2B]/10 my-4" />

                  <div className="bg-[#FFF9F6] rounded-[16px] border border-[#251B2B]/10 p-4">
                    <p className="font-display text-[11.5px] font-bold text-[#251B2B] uppercase tracking-[0.06em] mb-2.5">
                      O QUE ESTÁ INCLUÍDO NO KIT BÁSICO:
                    </p>
                    <ul className="space-y-2 text-[13.5px] sm:text-[14px]">
                      {KIT_OPTIONS.basico.includedFeatures.map((feat) => (
                        <li
                          key={feat}
                          className="flex items-start gap-2.5 text-[#251B2B] leading-[1.42]"
                        >
                          <span className="w-4.5 h-4.5 rounded-full bg-[#16A34A]/12 text-[#16A34A] flex items-center justify-center shrink-0 mt-0.5">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </span>
                          <span className="font-medium">{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* BOTÃO DO KIT BÁSICO: Preserva integralmente o handler e rastreamento */}
                <div className="mt-6 text-center">
                  <button
                    type="button"
                    data-testid="kit-basico-cta"
                    onClick={() => handleBasicPlanClick('plans_section')}
                    className="font-display inline-flex items-center justify-center gap-2 w-full min-h-[52px] sm:min-h-[54px] rounded-[14px] border-2 border-[#16A34A] bg-white hover:bg-[#16A34A]/8 active:scale-[0.99] text-[#16A34A] font-bold text-[14px] sm:text-[15px] tracking-[0.02em] uppercase transition-colors cursor-pointer px-4"
                  >
                    <ShoppingCart className="w-4.5 h-4.5 shrink-0" />
                    <span>QUERO MEU KIT BÁSICO</span>
                  </button>
                  <p className="mt-2 text-[12px] font-medium text-[#77717A]">
                    Pagamento único • Sem mensalidade • Garantia de 7 dias
                  </p>
                </div>
              </div>

              {/* CARD 2 — KIT PREMIUM EM DESTAQUE (R$ 27,90 • 250 MATERIAIS DIGITAIS + 6 BÔNUS COMPLEMENTARES) */}
              <div className="md:col-span-7 relative bg-white rounded-[26px] border-3 border-[#D83A78] p-5 sm:p-8 flex flex-col justify-between shadow-[0_20px_48px_rgba(216,58,120,0.16)] order-1 md:order-2">
                {/* Selo de Destaque Superior */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="font-display inline-flex items-center gap-1.5 bg-[#D83A78] text-white text-[11.5px] sm:text-[13px] font-bold px-4 sm:px-5 py-1 rounded-full uppercase tracking-[0.06em] shadow-sm whitespace-nowrap">
                    <Sparkles className="w-3.5 h-3.5 text-white shrink-0" />
                    <span>KIT MAIS COMPLETO</span>
                  </span>
                </div>

                <div>
                  <div className="text-center pt-2">
                    <span className="inline-block rounded-full bg-[#D83A78]/10 border border-[#D83A78]/30 px-4 py-1 font-display font-bold text-[12px] text-[#D83A78] tracking-[0.08em] uppercase">
                      KIT PREMIUM
                    </span>
                    <h3 className="mt-2.5 font-display font-bold text-[22px] sm:text-[27px] text-[#251B2B] leading-[1.18] uppercase">
                      <span className="text-[#D83A78]">250 MATERIAIS DIGITAIS</span> + 6 BÔNUS
                      COMPLEMENTARES
                    </h3>

                    <div className="mt-3.5 inline-flex flex-col items-center bg-[#FFF9F6] border border-[#D83A78]/25 rounded-[18px] px-6 py-3.5">
                      <span className="text-[11px] font-display font-bold text-[#D83A78] uppercase tracking-wider">
                        COLEÇÃO COMPLETA • MELHOR CUSTO-BENEFÍCIO
                      </span>
                      <p className="mt-1 font-display font-bold text-[44px] sm:text-[52px] leading-none text-[#16A34A] tabular-nums">
                        {KIT_OPTIONS.premium.price}
                      </p>
                      <p className="mt-1 text-[12px] sm:text-[12.5px] font-medium text-[#77717A]">
                        {KIT_OPTIONS.premium.paymentNote}
                      </p>
                    </div>

                    <p className="mt-3 text-[13.5px] sm:text-[15px] text-[#77717A] leading-[1.5] max-w-[480px] mx-auto">
                      Tenha uma coleção ainda mais completa de materiais para planejar, organizar e
                      acompanhar diferentes áreas da sua rotina.
                    </p>
                  </div>

                  <hr className="border-t border-[#251B2B]/10 my-4" />

                  <div className="bg-[#FFF9F6] rounded-[18px] border border-[#D83A78]/20 p-4 sm:p-5">
                    <p className="font-display text-[12px] font-bold text-[#D83A78] uppercase tracking-[0.06em] mb-3">
                      TUDO O QUE VOCÊ RECEBE NO KIT PREMIUM:
                    </p>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-[13.5px] sm:text-[14px]">
                      {KIT_OPTIONS.premium.includedFeatures.map((feat, idx) => (
                        <li
                          key={feat}
                          className={`flex items-start gap-2 text-[#251B2B] leading-[1.42] ${
                            idx <= 1 ? 'font-bold text-[#D83A78]' : 'font-medium'
                          }`}
                        >
                          <span className="w-4.5 h-4.5 rounded-full bg-[#16A34A]/12 text-[#16A34A] flex items-center justify-center shrink-0 mt-0.5">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </span>
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>

                    {/* 6 Bônus Complementares Inclusos no Kit Premium */}
                    {KIT_OPTIONS.premium.bonuses && (
                      <div className="mt-4 pt-3.5 border-t border-[#251B2B]/10">
                        <p className="font-display inline-flex items-center gap-1.5 text-[11.5px] font-bold text-[#251B2B] uppercase tracking-wider mb-2.5">
                          <Gift className="w-4 h-4 text-[#D83A78] shrink-0" />
                          <span>6 BÔNUS COMPLEMENTARES INCLUÍDOS:</span>
                        </p>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[12.5px] sm:text-[13px] text-[#251B2B]">
                          {KIT_OPTIONS.premium.bonuses.map((bonus) => (
                            <li key={bonus} className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#D83A78] shrink-0" />
                              <span className="font-medium">{bonus}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                {/* BOTÃO DO KIT PREMIUM: Preserva integralmente atributos UTMify, Pixel e checkout Cakto */}
                <div className="mt-6 text-center">
                  <a
                    href={premiumCheckoutHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-testid="kit-premium-cta"
                    data-checkout-plan="premium"
                    data-checkout-name={KIT_OPTIONS.premium.name}
                    data-checkout-id="kit_premium_250"
                    data-checkout-value={String(KIT_OPTIONS.premium.priceNumeric)}
                    data-checkout-currency="BRL"
                    onClick={(e) => handleDirectPremiumClick(e, 'plans_section')}
                    className="utmify-ic-btn utmify-ic-premium font-display inline-flex items-center justify-center gap-2 w-full min-h-[54px] sm:min-h-[58px] rounded-[16px] bg-[#16A34A] hover:bg-[#15803d] active:scale-[0.99] text-white font-bold text-[15px] sm:text-[17px] tracking-[0.02em] uppercase shadow-[0_12px_28px_rgba(22,163,74,0.3)] transition-all cursor-pointer px-4"
                  >
                    <ShoppingCart className="w-5 h-5 shrink-0" />
                    <span>QUERO MEU KIT PREMIUM</span>
                    <ArrowRight className="w-4.5 h-4.5 shrink-0" />
                  </a>
                  <p className="mt-2 text-[12px] sm:text-[12.5px] font-medium text-[#77717A]">
                    Acesso digital após confirmação • Pagamento único • Garantia de 7 dias
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================================
            ETAPA 4 — CONFIANÇA, GARANTIA E FAQ + CHAMADA FINAL
            ===================================================================== */}
        <section
          id="confianca-e-faq"
          className="cv-section w-full bg-white py-11 sm:py-16 px-4 sm:px-6"
        >
          <div className="max-w-[980px] mx-auto space-y-10 sm:space-y-12">
            {/* BLOCO DE SEGURANÇA E GARANTIA: COMPRE COM TRANQUILIDADE */}
            <div className="bg-[#FFF9F6] rounded-[24px] border border-[#251B2B]/10 p-5 sm:p-8 shadow-[0_10px_28px_rgba(37,27,43,0.04)]">
              <div className="text-center max-w-[680px] mx-auto">
                <span className="inline-block rounded-full bg-white border border-[#D83A78]/30 px-3.5 py-1 text-[#D83A78] text-[11px] font-display font-bold tracking-[0.08em] uppercase">
                  COMPRA SEGURA E TRANSPARENTE
                </span>
                <h2 className="mt-2 font-display font-bold text-[#251B2B] text-[22px] sm:text-[30px] leading-[1.2] uppercase">
                  COMPRE COM <span className="text-[#D83A78]">TRANQUILIDADE.</span>
                </h2>
              </div>

              {/* 4 Indicadores Objetivos */}
              <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="bg-white rounded-[16px] border border-[#251B2B]/10 p-4 flex flex-col items-start gap-2">
                  <div className="w-9 h-9 rounded-[10px] bg-[#D83A78]/10 text-[#D83A78] flex items-center justify-center shrink-0">
                    <FileText className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-[13.5px] sm:text-[14.5px] text-[#251B2B] uppercase">
                      Produto digital
                    </h3>
                    <p className="mt-0.5 text-[12.5px] text-[#77717A] leading-snug">
                      Arquivos prontos para usar no celular, tablet ou imprimir em A4.
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-[16px] border border-[#251B2B]/10 p-4 flex flex-col items-start gap-2">
                  <div className="w-9 h-9 rounded-[10px] bg-[#16A34A]/12 text-[#16A34A] flex items-center justify-center shrink-0">
                    <Check className="w-4.5 h-4.5 stroke-[2.5]" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-[13.5px] sm:text-[14.5px] text-[#251B2B] uppercase">
                      Acesso digital
                    </h3>
                    <p className="mt-0.5 text-[12.5px] text-[#77717A] leading-snug">
                      Envio das instruções de acesso após a confirmação do pagamento.
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-[16px] border border-[#251B2B]/10 p-4 flex flex-col items-start gap-2">
                  <div className="w-9 h-9 rounded-[10px] bg-[#16A34A]/12 text-[#16A34A] flex items-center justify-center shrink-0">
                    <Lock className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-[13.5px] sm:text-[14.5px] text-[#251B2B] uppercase">
                      Pagamento único
                    </h3>
                    <p className="mt-0.5 text-[12.5px] text-[#77717A] leading-snug">
                      Você paga apenas uma vez, sem mensalidades ou cobranças extras.
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-[16px] border border-[#251B2B]/10 p-4 flex flex-col items-start gap-2">
                  <div className="w-9 h-9 rounded-[10px] bg-[#D83A78]/10 text-[#D83A78] flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-[13.5px] sm:text-[14.5px] text-[#251B2B] uppercase">
                      Garantia de 7 dias
                    </h3>
                    <p className="mt-0.5 text-[12.5px] text-[#77717A] leading-snug">
                      Direito de solicitar reembolso dentro do prazo legal de 7 dias.
                    </p>
                  </div>
                </div>
              </div>

              {/* Selo de Garantia de 7 Dias + Atendimento */}
              <div className="mt-5 pt-5 border-t border-[#251B2B]/10 grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
                <div className="lg:col-span-7 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                  <div className="w-[84px] sm:w-[104px] shrink-0 flex items-center justify-center">
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
                    <h3 className="font-display font-bold text-[#251B2B] text-[17px] sm:text-[20px] leading-snug uppercase">
                      GARANTIA DE 7 DIAS PARA SUA SEGURANÇA
                    </h3>
                    <p className="mt-1 text-[#77717A] text-[13.5px] sm:text-[14.5px] leading-[1.55]">
                      Você conta com 7 dias de garantia a partir da compra para avaliar os
                      materiais. Caso deseje solicitar o reembolso dentro desse período, basta
                      acionar o suporte oficial.
                    </p>
                  </div>
                </div>

                <div
                  data-testid="support-info-static"
                  className="lg:col-span-5 rounded-[16px] bg-white border border-[#251B2B]/10 p-4"
                >
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-[#D83A78]/10 px-2.5 py-0.5 text-[#D83A78] text-[10.5px] font-display font-bold uppercase tracking-wider">
                    <Headset className="w-3.5 h-3.5 text-[#D83A78] shrink-0" />
                    <span>SUPORTE AO COMPRADOR</span>
                  </div>
                  <ul className="mt-2.5 space-y-1.5 text-[13px] text-[#251B2B]">
                    {SUPPORT_HIGHLIGHTS.map((item) => (
                      <li key={item} className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-[#16A34A] stroke-[3] shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* FAQ COMPACTO EM FORMATO ACORDEÃO (6 PERGUNTAS OBJETIVAS) */}
            <div className="max-w-[820px] mx-auto">
              <div className="text-center">
                <span className="inline-block rounded-full bg-[#FFF9F6] border border-[#D83A78]/30 px-3.5 py-1 text-[#D83A78] text-[11px] font-display font-bold tracking-[0.08em] uppercase">
                  PERGUNTAS FREQUENTES
                </span>
                <h2 className="mt-2 font-display font-bold text-[#251B2B] text-[22px] sm:text-[30px] leading-[1.2] uppercase">
                  TIRE SUAS DÚVIDAS <span className="text-[#D83A78]">SOBRE OS KITS.</span>
                </h2>
              </div>

              <div className="mt-6 space-y-2.5">
                {FUNNEL_FAQ_ITEMS.map((faq) => {
                  const isOpen = openFaqId === faq.id;
                  return (
                    <div
                      key={faq.id}
                      className="bg-[#FFF9F6] rounded-[16px] border border-[#251B2B]/10 overflow-hidden transition-colors"
                    >
                      <button
                        type="button"
                        onClick={() => toggleFaq(faq.id)}
                        aria-expanded={isOpen}
                        className="w-full min-h-[52px] px-4 sm:px-5 py-3.5 flex items-center justify-between gap-3 text-left font-display font-bold text-[14.5px] sm:text-[16px] text-[#251B2B] hover:text-[#D83A78] transition-colors cursor-pointer"
                      >
                        <span>
                          <span className="text-[#D83A78] mr-1.5">{faq.number}.</span>
                          {faq.question}
                        </span>
                        <ChevronDown
                          className={`w-4.5 h-4.5 text-[#77717A] shrink-0 transition-transform duration-200 ${
                            isOpen ? 'rotate-180 text-[#D83A78]' : ''
                          }`}
                        />
                      </button>
                      {isOpen && (
                        <div className="px-4 sm:px-5 pb-4 pt-1 text-[13.5px] sm:text-[14.5px] leading-[1.55] text-[#77717A] bg-white border-t border-[#251B2B]/10">
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* CHAMADA FINAL */}
            <div className="max-w-[820px] mx-auto bg-[#251B2B] rounded-[24px] border-2 border-[#D83A78] p-6 sm:p-9 text-center text-white shadow-[0_16px_38px_rgba(37,27,43,0.18)]">
              <span className="inline-block rounded-full bg-[#D83A78]/20 border border-[#D83A78]/50 px-3.5 py-1 font-display font-bold text-[11px] text-white uppercase tracking-wider">
                PLANEJAMENTO 2027
              </span>
              <h2 className="mt-2.5 font-display font-bold text-[22px] sm:text-[30px] text-white uppercase leading-tight">
                COMECE A ORGANIZAR SEU 2027 HOJE!
              </h2>
              <p className="mt-2 text-[14px] sm:text-[16px] text-white/80 max-w-[540px] mx-auto leading-[1.5]">
                Escolha seu kit e tenha ferramentas práticas para planejar melhor sua rotina.
              </p>

              <div className="mt-6 flex justify-center">
                <a
                  href="#escolha-seu-kit"
                  className="font-display inline-flex items-center justify-center gap-2.5 w-full sm:w-auto min-h-[54px] px-8 rounded-[14px] bg-[#16A34A] hover:bg-[#15803d] active:scale-[0.99] text-white font-bold text-[15px] sm:text-[16.5px] uppercase tracking-[0.02em] shadow-[0_10px_24px_rgba(22,163,74,0.32)] transition-all"
                >
                  <span>ESCOLHER MEU KIT</span>
                  <ArrowRight className="w-5 h-5 shrink-0" />
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* BARRA FIXA INFERIOR NO MOBILE (Oculta automaticamente quando os cards de oferta estão visíveis) */}
      {showFloatingBar &&
        !isOfferSectionVisible &&
        !isFloatingBarDismissed &&
        !isUpsellModalOpen &&
        !activeLegalModal && (
          <div
            data-testid="mobile-sticky-bar"
            className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-white/95 backdrop-blur-xs border-t border-[#251B2B]/15 px-3 pt-2 pb-safe-bar shadow-[0_-6px_20px_rgba(37,27,43,0.1)] flex items-center justify-between gap-2"
          >
            <div className="min-w-0 pl-0.5">
              <span className="block font-display font-bold text-[10.5px] text-[#D83A78] uppercase tracking-wider leading-tight">
                KIT DE ORGANIZAÇÃO 2027
              </span>
              <span className="font-display font-bold text-[13px] text-[#251B2B] leading-tight tabular-nums">
                Básico R$ 9,90 • <strong className="text-[#16A34A]">Premium R$ 27,90</strong>
              </span>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <a
                href="#escolha-seu-kit"
                data-testid="mobile-sticky-cta"
                className="font-display inline-flex items-center justify-center gap-1.5 min-h-[42px] px-3.5 rounded-[12px] bg-[#16A34A] hover:bg-[#15803d] active:scale-[0.98] text-white font-bold text-[11.5px] uppercase tracking-normal shadow-xs transition-transform cursor-pointer whitespace-nowrap"
              >
                <ShoppingCart className="w-3.5 h-3.5 shrink-0" />
                <span>ESCOLHER KIT</span>
              </a>

              <button
                type="button"
                onClick={() => setIsFloatingBarDismissed(true)}
                aria-label="Minimizar barra de oferta"
                className="w-9 h-10 rounded-[10px] text-[#77717A] hover:text-[#251B2B] hover:bg-[#FFF9F6] flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      {/* RODAPÉ DISCRETO */}
      <footer className="w-full bg-[#251B2B] text-white pt-7 footer-safe-space px-4 border-t border-white/10">
        <div className="max-w-[1140px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-[12.5px]">
          <p className="text-white/80 text-center sm:text-left">
            © 2026 Kit de Organização e Planejamento 2027 • Coleção Planner 2027. Produto 100%
            Digital.
          </p>
          <nav
            aria-label="Links institucionais"
            className="flex flex-wrap items-center justify-center gap-3 sm:gap-5"
          >
            <button
              type="button"
              onClick={() => setActiveLegalModal('termos')}
              className="min-h-[44px] px-2.5 inline-flex items-center text-white/85 hover:text-white transition-colors cursor-pointer"
            >
              Termos de Uso
            </button>
            <button
              type="button"
              onClick={() => setActiveLegalModal('privacidade')}
              className="min-h-[44px] px-2.5 inline-flex items-center text-white/85 hover:text-white transition-colors cursor-pointer"
            >
              Política de Privacidade
            </button>
            <button
              type="button"
              onClick={() => setActiveLegalModal('contato')}
              className="min-h-[44px] px-2.5 inline-flex items-center text-white/85 hover:text-white transition-colors cursor-pointer"
            >
              Contato
            </button>
          </nav>
        </div>
      </footer>

      {/* POPUP ESTRATÉGICO DE UPGRADE (Exibido apenas ao clicar em comprar o Kit Básico) */}
      <UpsellModal
        isOpen={isUpsellModalOpen}
        locationSearch={locationSearch}
        onClose={() => setIsUpsellModalOpen(false)}
        onAcceptUpgrade={handleAcceptUpgrade}
        onDeclineUpgrade={handleDeclineUpgrade}
      />

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
