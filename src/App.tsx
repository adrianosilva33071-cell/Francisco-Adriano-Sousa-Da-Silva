/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  Calendar,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  Gift,
  HeartHandshake,
  ListChecks,
  Lock,
  ShieldCheck,
  Sparkles,
  Target,
  Wallet,
} from 'lucide-react';
import {
  BONUS_ITEMS,
  CAROUSEL_MODELS,
  FAQ_ITEMS,
  getNextCarouselIndex,
  GUARANTEE_BADGE_IMAGE,
  HERO_PLANNER_IMAGE,
  KIT_OPTIONS,
  PAIN_POINTS,
  PRODUCT_DEMO_ITEMS,
  PROMO_DATE_TEXT,
  STEP_ITEMS,
} from './utils/catalogData';
import { CheckoutModal } from './components/CheckoutModal';
import { LegalModal, LegalModalType } from './components/LegalModal';
import { WhatsAppCarousel } from './components/WhatsAppCarousel';

const MATERIAL_ICONS: Record<string, React.ReactNode> = {
  'demo-semanal': <Calendar className="w-4 h-4 text-[#c22182]" />,
  'demo-habitos': <HeartHandshake className="w-4 h-4 text-[#c22182]" />,
  'demo-tarefas': <ListChecks className="w-4 h-4 text-[#c22182]" />,
  'demo-mensal': <CalendarDays className="w-4 h-4 text-[#c22182]" />,
  'demo-financeiro': <Wallet className="w-4 h-4 text-[#c22182]" />,
  'demo-metas': <Target className="w-4 h-4 text-[#c22182]" />,
};

export default function App() {
  const [openFaqId, setOpenFaqId] = useState<string | null>('como-recebo');
  const [selectedKitId, setSelectedKitId] = useState<'basico' | 'premium' | null>(null);
  const [activeLegalModal, setActiveLegalModal] = useState<LegalModalType>(null);
  const [activeCarouselIdx, setActiveCarouselIdx] = useState<number>(0);
  const touchStartXRef = useRef<number | null>(null);

  useEffect(() => {
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
  }, []);

  const toggleFaq = (id: string) => {
    setOpenFaqId((prev) => (prev === id ? null : id));
  };

  const handleCarouselStep = (direction: 'next' | 'prev') => {
    setActiveCarouselIdx((prev) =>
      getNextCarouselIndex(prev, CAROUSEL_MODELS.length, direction)
    );
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const endX = e.changedTouches[0]?.clientX ?? touchStartXRef.current;
    const deltaX = endX - touchStartXRef.current;
    if (Math.abs(deltaX) > 36) {
      handleCarouselStep(deltaX < 0 ? 'next' : 'prev');
    }
    touchStartXRef.current = null;
  };

  // Duplicate models to create seamless infinite marquee rows
  const marqueeItems = [...CAROUSEL_MODELS, ...CAROUSEL_MODELS];
  const currentCarouselModel = CAROUSEL_MODELS[activeCarouselIdx] ?? CAROUSEL_MODELS[0];

  return (
    <div className="min-h-screen flex flex-col bg-[#fef8fc] text-[#2a212f] font-sans antialiased selection:bg-[#ffe4f7] selection:text-[#c22182] overflow-x-hidden">
      {/* 1. TOP BAR */}
      <div className="w-full min-h-[40px] bg-[#c22182] flex items-center justify-center px-[16px] py-1.5">
        <p className="font-display text-white text-[11.5px] sm:text-[13px] font-bold tracking-wide uppercase text-center leading-snug">
          {PROMO_DATE_TEXT}
        </p>
      </div>

      <main className="flex-1">
        {/* 2. PRIMEIRA DOBRA — HERO SECTION (MOBILE FIRST) */}
        <section className="w-full bg-gradient-to-b from-[#fde9f5] via-[#fef5fa] to-[#fef8fc] pt-[28px] sm:pt-[44px] pb-[44px] sm:pb-[68px] px-[16px] overflow-hidden">
          <div className="max-w-[820px] mx-auto flex flex-col items-center text-center">
            {/* HEADLINE (24px–28px mobile, larger on desktop) */}
            <h1 className="font-display font-bold text-[#2a212f] text-[25px] sm:text-[36px] md:text-[42px] leading-[1.18] tracking-[-0.01em] max-w-[760px]">
              Você também sente que os dias passam e{' '}
              <span className="text-[#c22182]">
                seus planos acabam ficando para depois?
              </span>
            </h1>

            {/* SUBHEADLINE (14.5px–16px) */}
            <p className="mt-3 text-[#5e5166] text-[14.5px] sm:text-[16px] leading-[1.55] max-w-[630px]">
              Tarefas acumuladas, compromissos esquecidos, metas que nunca saem do papel e
              aquela sensação de que falta organização na rotina.
            </p>

            {/* APRESENTAÇÃO DA SOLUÇÃO */}
            <p className="mt-2.5 text-[#2a212f] text-[14.5px] sm:text-[16px] font-medium leading-[1.5] max-w-[620px]">
              Em 2027, tenha ferramentas práticas para{' '}
              <span className="text-[#c22182] font-bold">organizar seus dias</span>, planejar
              seus objetivos e acompanhar sua evolução.
            </p>

            {/* NOME DO PRODUTO & DESCRIÇÃO */}
            <div className="mt-4 w-full max-w-[620px] rounded-[20px] bg-white/95 border border-[#f2cde4] p-4 sm:p-5 shadow-2xs text-center">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#c22182] px-3.5 py-1 text-white font-display font-bold text-[12px] uppercase tracking-wide">
                Coleção Planner 2027
              </div>
              <p className="mt-2 text-[#4b3f52] text-[14px] sm:text-[15px] leading-[1.5]">
                Uma coleção digital de planners e organizadores para ajudar você a planejar sua
                semana, acompanhar seus hábitos, organizar suas tarefas e cuidar melhor das suas
                finanças.
              </p>
            </div>

            {/* IMAGEM PRINCIPAL DO PRODUTO (ACIMA DO BOTÃO QUERO ORGANIZAR MEU 2027) */}
            <div className="mt-5 w-full max-w-[560px] flex items-center justify-center">
              <div className="relative w-full rounded-[24px] overflow-hidden shadow-[0_14px_36px_rgba(194,33,130,0.14)] border border-[#f8d0e5] bg-[#fce8f3]">
                <img
                  src={HERO_PLANNER_IMAGE}
                  alt="Coleção Planner 2027 — Capa rosa espiral, planejamento semanal e controle de hábitos"
                  width={1272}
                  height={830}
                  fetchPriority="high"
                  decoding="async"
                  className="w-full h-auto object-contain block"
                />
              </div>
            </div>

            {/* CTA & INFORMAÇÕES DE APOIO */}
            <div className="mt-5 w-full flex flex-col items-center">
              <a
                href={KIT_OPTIONS.premium.checkoutUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-display inline-flex items-center justify-center w-full max-w-[420px] h-[56px] sm:h-[60px] rounded-full bg-[#12a136] hover:bg-[#0e8b2d] active:scale-[0.99] text-white font-bold text-[14.5px] sm:text-[16px] tracking-normal uppercase shadow-[0_10px_24px_rgba(18,161,54,0.32)] transition-all cursor-pointer px-5"
              >
                QUERO ORGANIZAR MEU 2027
              </a>

              <div className="mt-3 flex flex-wrap items-center justify-center gap-x-3.5 gap-y-1 text-[13px] font-medium text-[#5e5166]">
                <span className="inline-flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 text-[#12a136] stroke-[3]" />
                  Acesso digital
                </span>
                <span aria-hidden="true" className="text-[#b68ea7]">•</span>
                <span className="inline-flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 text-[#12a136] stroke-[3]" />
                  Pronto para imprimir
                </span>
                <span aria-hidden="true" className="text-[#b68ea7]">•</span>
                <span className="inline-flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 text-[#12a136] stroke-[3]" />
                  Pagamento único
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* 3. SEÇÃO DE IDENTIFICAÇÃO COM A DOR */}
        <section className="w-full bg-white py-[44px] sm:py-[68px] px-[16px] border-y border-[#f5d5e7]">
          <div className="max-w-[1080px] mx-auto">
            <div className="text-center max-w-[720px] mx-auto">
              <span className="inline-block rounded-full bg-[#ffe9f8] px-3.5 py-1 text-[#c22182] text-[11.5px] font-bold tracking-[0.08em] uppercase">
                OLHE PARA A SUA ROTINA HOJE
              </span>
              <h2 className="mt-2.5 font-display font-bold text-[#2a212f] text-[24px] sm:text-[32px] md:text-[36px] leading-[1.22]">
                Você se identifica com alguma{' '}
                <span className="text-[#c22182]">dessas situações?</span>
              </h2>
            </div>

            <div className="mt-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
              {PAIN_POINTS.map((item) => (
                <div
                  key={item.id}
                  className="bg-[#fef8fc] rounded-[18px] border border-[#f2d0e4] p-4 sm:p-5 flex items-start gap-3 shadow-2xs"
                >
                  <div className="w-8 h-8 rounded-full bg-[#ffe0f2] text-[#c22182] flex items-center justify-center shrink-0 mt-0.5">
                    <CircleAlert className="w-4 h-4" />
                  </div>
                  <p className="font-display font-bold text-[15px] sm:text-[16px] text-[#2a212f] leading-[1.4]">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>

            {/* Fechamento acolhedor */}
            <div className="mt-6 max-w-[760px] mx-auto rounded-[18px] bg-gradient-to-r from-[#fdebf6] via-[#fef4fa] to-[#fdebf6] border border-[#f3cbe3] p-4 sm:p-5 text-center">
              <p className="font-display font-bold text-[15px] sm:text-[17.5px] text-[#2a212f] leading-[1.45]">
                “Pequenas mudanças na organização podem ajudar você a ter{' '}
                <span className="text-[#c22182]">mais clareza</span> sobre seus dias e seus
                objetivos.”
              </p>
            </div>
          </div>
        </section>

        {/* 4. APRESENTAÇÃO VISUAL EM MOVIMENTO */}
        <section className="w-full bg-[#fef8fc] py-[44px] sm:py-[68px] overflow-hidden">
          <div className="max-w-[1140px] mx-auto px-[16px] text-center">
            <span className="inline-block rounded-full bg-[#ffe9f8] px-3.5 py-1 text-[#c22182] text-[11.5px] font-bold tracking-[0.08em] uppercase">
              CONHEÇA A COLEÇÃO PLANNER 2027
            </span>
            <h2 className="mt-2.5 font-display font-bold text-[#2a212f] text-[24px] sm:text-[32px] md:text-[38px] leading-[1.22] max-w-[780px] mx-auto">
              Imagine ter tudo o que precisa para{' '}
              <span className="text-[#c22182]">organizar sua rotina</span> em um só lugar.
            </h2>
            <p className="mt-2.5 text-[#5e5166] text-[14.5px] sm:text-[16px] leading-[1.55] max-w-[700px] mx-auto">
              Com a <strong>Coleção Planner 2027</strong>, você terá materiais práticos para
              planejar seus dias, organizar compromissos, acompanhar hábitos, estabelecer metas e
              visualizar melhor suas atividades.
            </p>
          </div>

          {/* Smooth 2-Row Moving Preview Marquee + Touch & Button Controls */}
          <div
            className="mt-7 space-y-3.5 select-none"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            aria-label="Demonstração de modelos da Coleção Planner 2027"
          >
            <div className="w-full overflow-hidden">
              <div className="flex w-max gap-[12px] animate-marquee-left">
                {marqueeItems.map((item, idx) => {
                  const isDuplicate = idx >= CAROUSEL_MODELS.length;
                  const isHighlighted = idx % CAROUSEL_MODELS.length === activeCarouselIdx;
                  return (
                    <div
                      key={`row1-${item.id}-${idx}`}
                      aria-hidden={isDuplicate ? true : undefined}
                      className={`w-[165px] h-[206px] sm:w-[190px] sm:h-[238px] rounded-[18px] bg-white border p-2 shadow-2xs shrink-0 flex items-center justify-center transition-transform ${
                        isHighlighted ? 'border-[#c22182] ring-2 ring-[#c22182]/25' : 'border-[#f3d2e4]'
                      }`}
                    >
                      <img
                        src={item.image}
                        alt={isDuplicate ? '' : item.title}
                        width={320}
                        height={400}
                        decoding="async"
                        className="w-full h-full object-contain rounded-[12px] block"
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="w-full overflow-hidden" aria-hidden="true">
              <div className="flex w-max gap-[12px] animate-marquee-right">
                {marqueeItems.map((item, idx) => (
                  <div
                    key={`row2-${item.id}-${idx}`}
                    className="w-[165px] h-[206px] sm:w-[190px] sm:h-[238px] rounded-[18px] bg-white border border-[#f3d2e4] p-2 shadow-2xs shrink-0 flex items-center justify-center"
                  >
                    <img
                      src={item.image}
                      alt=""
                      width={320}
                      height={400}
                      decoding="async"
                      className="w-full h-full object-contain rounded-[12px] block"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Interactive Touch & Button Carousel Bar (Arrows + Active Model Label + Position Indicators) */}
            <div className="max-w-[540px] mx-auto px-[16px] pt-2 flex flex-col items-center gap-1.5">
              <div className="w-full flex items-center justify-between gap-2 bg-white rounded-full border border-[#f2cde4] px-2 py-1.5 shadow-2xs">
                <button
                  type="button"
                  onClick={() => handleCarouselStep('prev')}
                  aria-label="Modelo anterior"
                  className="w-11 h-11 rounded-full bg-[#fef8fc] hover:bg-[#ffe9f8] text-[#c22182] flex items-center justify-center shrink-0 transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <div className="min-w-0 flex-1 text-center px-1" aria-live="polite">
                  <p className="font-display font-bold text-[13.5px] sm:text-[14.5px] text-[#c22182] truncate">
                    {currentCarouselModel.title}
                  </p>
                  <p className="text-[12px] text-[#5e5166] truncate">
                    {currentCarouselModel.benefitText}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleCarouselStep('next')}
                  aria-label="Próximo modelo"
                  className="w-11 h-11 rounded-full bg-[#fef8fc] hover:bg-[#ffe9f8] text-[#c22182] flex items-center justify-center shrink-0 transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Position Indicators */}
              <div className="flex items-center justify-center gap-0.5" role="group" aria-label="Indicadores de posição dos modelos">
                {CAROUSEL_MODELS.map((model, idx) => {
                  const isActive = idx === activeCarouselIdx;
                  return (
                    <button
                      key={model.id}
                      type="button"
                      onClick={() => setActiveCarouselIdx(idx)}
                      aria-label={`Selecionar modelo ${idx + 1}: ${model.title}`}
                      aria-current={isActive ? 'true' : undefined}
                      className="min-h-[44px] min-w-[32px] px-1.5 flex items-center justify-center cursor-pointer"
                    >
                      <span
                        className={`block h-2 rounded-full transition-all ${
                          isActive ? 'w-6 bg-[#c22182]' : 'w-2 bg-[#e5bdd5]'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* 5. SEÇÃO CONHEÇA O QUE VOCÊ RECEBE (MOBILE-FIRST) */}
        <section className="w-full bg-white py-[44px] sm:py-[72px] px-[16px] border-t border-[#f5d5e7]">
          <div className="max-w-[1080px] mx-auto">
            <div className="bg-[#fef8fc] rounded-[24px] border border-[#f2cde4] p-5 sm:p-8 flex flex-col justify-between shadow-[0_8px_24px_rgba(194,33,130,0.05)]">
              <div>
                <div className="text-center max-w-[720px] mx-auto">
                  {/* 1. Selo "CONHEÇA O QUE VOCÊ RECEBE" */}
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#ffe9f8] border border-[#f3c4e0] px-3.5 py-1 text-[#c22182] text-[11.5px] font-bold tracking-[0.08em] uppercase">
                    CONHEÇA O QUE VOCÊ RECEBE
                  </span>

                  {/* 2. Título (23px a 28px no celular) */}
                  <h2 className="mt-3 font-display font-bold text-[#2a212f] text-[24px] sm:text-[32px] leading-[1.22]">
                    Veja o que você poderá utilizar no{' '}
                    <span className="text-[#c22182]">seu dia a dia.</span>
                  </h2>

                  {/* 3. Descrição curta (14px a 16px) */}
                  <p className="mt-2 text-[#5e5166] text-[14.5px] sm:text-[16px] leading-[1.52]">
                    Materiais práticos e prontos para imprimir que ajudam você a organizar cada
                    área da sua rotina:
                  </p>
                </div>

                {/* 4. Cards com os materiais da coleção */}
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
                  {PRODUCT_DEMO_ITEMS.map((demo) => (
                    <div
                      key={demo.id}
                      className="bg-white rounded-[18px] border border-[#f2d0e4] p-3.5 sm:p-4 flex flex-col justify-between shadow-2xs"
                    >
                      <div className="flex items-start gap-3">
                        {/* Compact Thumbnail + Icon Badge */}
                        <div className="relative w-[52px] h-[64px] rounded-[10px] bg-[#fff7fb] border border-[#f5d4e7] p-1 flex items-center justify-center shrink-0">
                          <img
                            src={demo.image}
                            alt={demo.name}
                            width={104}
                            height={128}
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-contain block"
                          />
                          <span className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-[#ffe9f8] border border-[#f2c4df] flex items-center justify-center shadow-2xs">
                            {MATERIAL_ICONS[demo.id] ?? (
                              <Sparkles className="w-3.5 h-3.5 text-[#c22182]" />
                            )}
                          </span>
                        </div>

                        <div className="min-w-0 flex-1">
                          <h3 className="font-display font-bold text-[14.5px] sm:text-[15px] text-[#c22182] leading-snug uppercase">
                            {demo.name}
                          </h3>
                          <p className="mt-1 text-[13.5px] sm:text-[14px] text-[#2a212f] leading-[1.42]">
                            {demo.explanation}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Compact 3-Step Strip */}
              <div className="mt-6 pt-5 border-t border-[#f3d6e8] grid grid-cols-1 sm:grid-cols-3 gap-3">
                {STEP_ITEMS.map((step) => (
                  <div
                    key={step.step}
                    className="rounded-[14px] bg-white border border-[#f5d8e9] px-3.5 py-2.5 flex items-center gap-3"
                  >
                    <img
                      src={step.image}
                      alt={step.title}
                      width={40}
                      height={40}
                      loading="lazy"
                      decoding="async"
                      className="w-9 h-9 object-contain shrink-0 block"
                    />
                    <span className="font-display font-bold text-[13.5px] text-[#2a212f] leading-tight">
                      {step.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 6. SEÇÃO DE DEPOIMENTOS */}
        <WhatsAppCarousel />

        {/* 7. SEÇÃO DE BÔNUS */}
        <section className="w-full bg-[#ffe9f8] py-[48px] sm:py-[76px] px-[16px] border-t border-[#f3c8e3]">
          <div className="max-w-[1180px] mx-auto">
            <div className="text-center max-w-[760px] mx-auto">
              <div className="inline-flex items-center gap-2 bg-[#c22182] text-white px-4 py-1.5 rounded-full shadow-2xs">
                <Gift className="w-4 h-4 text-[#ffe169] shrink-0" />
                <span className="font-display font-bold text-[11.5px] uppercase tracking-wider">
                  MATERIAIS EXTRAS DO KIT PREMIUM
                </span>
              </div>
              <h2 className="mt-3 font-display font-bold text-[#2a212f] text-[24px] sm:text-[32px] md:text-[36px] leading-[1.22]">
                E para deixar sua coleção ainda mais completa, você recebe{' '}
                <span className="text-[#c22182]">materiais extras!</span>
              </h2>
              <p className="mt-2.5 text-[#5e5166] text-[14.5px] sm:text-[16px] leading-[1.55]">
                Ao escolher o <strong>Kit Premium</strong>, você recebe todos os 6 materiais
                complementares abaixo para apoiar sua organização e suas finanças em 2027:
              </p>
            </div>

            <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {BONUS_ITEMS.map((bonus) => (
                <div
                  key={bonus.number}
                  className="relative bg-white rounded-[22px] border border-[#f2d5ea] p-4 sm:p-5 pt-6 flex flex-col justify-between shadow-[0_6px_20px_rgba(194,33,130,0.05)]"
                >
                  {/* Floating Top Badge */}
                  <div className="-mt-9 mb-2.5 flex items-center justify-center">
                    <div className="inline-flex items-center rounded-full bg-[#e11d74] text-white p-1 pr-3.5 shadow-2xs">
                      <span className="font-display font-bold text-[12.5px] bg-[#9d174d] text-white w-6.5 h-6.5 rounded-full flex items-center justify-center mr-2">
                        {bonus.number}
                      </span>
                      <span className="font-display text-[11px] font-bold uppercase tracking-wide">
                        INCLUSO NO PREMIUM
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3.5">
                    <div className="w-[76px] h-[94px] sm:w-[88px] sm:h-[108px] rounded-[14px] bg-[#fff7fb] border border-[#f9d8eb] flex items-center justify-center p-1.5 shrink-0 overflow-hidden">
                      <img
                        src={bonus.image}
                        alt={bonus.title}
                        width={176}
                        height={216}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-contain block"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="font-display font-bold text-[15px] sm:text-[16px] text-[#2a212f] leading-[1.3]">
                        <span className="text-[#c22182]">{bonus.number}</span> — {bonus.title}
                      </h3>
                      <p className="mt-1 text-[13.5px] sm:text-[14px] leading-[1.48] text-[#5e5166]">
                        {bonus.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 8. SEÇÃO DE PLANOS E PREÇOS */}
        <section id="escolha-seu-kit" className="w-full bg-white py-[52px] sm:py-[84px] px-[16px] border-t border-[#f5d5e7]">
          <div className="max-w-[1100px] mx-auto">
            <div className="text-center max-w-[740px] mx-auto">
              <span className="inline-block rounded-full bg-[#ffe9f8] px-3.5 py-1 text-[#c22182] text-[11.5px] font-bold tracking-[0.1em] uppercase">
                ESCOLHA SUA COLEÇÃO PLANNER 2027
              </span>
              <h2 className="mt-2.5 font-display font-bold text-[#2a212f] text-[24px] sm:text-[36px] md:text-[40px] leading-[1.22]">
                Escolha o plano ideal para{' '}
                <span className="text-[#c22182]">organizar seu 2027</span>
              </h2>
              <p className="mt-2 text-[#5e5166] text-[14.5px] sm:text-[16px] leading-[1.55]">
                Compare as opções abaixo e tenha acesso aos arquivos digitais após a confirmação do
                pagamento.
              </p>
            </div>

            <div className="mt-10 sm:mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-7 items-stretch">
              {/* LEFT CARD: KIT BÁSICO */}
              <div className="bg-white rounded-[24px] border-2 border-[#e9bfd8] p-5 sm:p-8 flex flex-col justify-between shadow-[0_8px_28px_rgba(194,33,130,0.05)]">
                <div>
                  <div className="text-center pt-1">
                    <span className="inline-block rounded-full bg-[#f8edf4] border border-[#eed2e4] px-3.5 py-1 font-display font-bold text-[12px] text-[#7a3e64] tracking-[0.08em] uppercase">
                      {KIT_OPTIONS.basico.name}
                    </span>
                    <h3 className="mt-2.5 font-display font-bold text-[22px] sm:text-[25px] text-[#2a212f] leading-[1.2] uppercase">
                      {KIT_OPTIONS.basico.subtitle}
                    </h3>
                    <p className="mt-2 text-[14px] sm:text-[14.5px] text-[#5e5166] leading-[1.5] max-w-[380px] mx-auto">
                      {KIT_OPTIONS.basico.idealFor}
                    </p>
                    <p className="mt-4 font-display font-bold text-[42px] sm:text-[46px] leading-none text-[#2a212f]">
                      {KIT_OPTIONS.basico.price}
                    </p>
                    <p className="mt-2 text-[13px] text-[#6e6275]">
                      {KIT_OPTIONS.basico.paymentNote}
                    </p>
                  </div>

                  <hr className="border-t border-[#f3d6e7] my-4 sm:my-5" />

                  <div className="bg-[#fef9fc] rounded-[18px] border border-[#f5dce9] p-4 sm:p-5">
                    <p className="font-display text-[11.5px] font-bold text-[#c22182] uppercase tracking-[0.08em] mb-3">
                      O QUE ESTÁ INCLUSO NO KIT BÁSICO:
                    </p>
                    <ul className="space-y-2.5 text-[14px] sm:text-[14.5px]">
                      {KIT_OPTIONS.basico.includedFeatures.map((feat) => (
                        <li key={feat} className="flex items-start gap-2.5 text-[#2a212f] leading-[1.45]">
                          <span className="w-4.5 h-4.5 rounded-full bg-[#e6f9f1] text-[#12a136] flex items-center justify-center shrink-0 mt-0.5">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </span>
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-6">
                  <a
                    href={KIT_OPTIONS.basico.checkoutUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-display inline-flex items-center justify-center w-full h-[54px] sm:h-[56px] rounded-full border-2 border-[#12a136] bg-white hover:bg-[#e6f9f1] text-[#0e8b2d] font-bold text-[14.5px] tracking-normal uppercase transition-all cursor-pointer"
                  >
                    {KIT_OPTIONS.basico.ctaLabel}
                  </a>
                </div>
              </div>

              {/* RIGHT CARD: KIT PREMIUM (MAIS COMPLETO) */}
              <div className="relative bg-gradient-to-b from-[#fff5fa] to-white rounded-[24px] border-3 border-[#e11d74] p-5 sm:p-8 flex flex-col justify-between shadow-[0_18px_44px_rgba(225,29,116,0.16)] mt-2 md:mt-0">
                {/* Floating Top Pill Badge */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="font-display inline-flex items-center gap-1.5 bg-[#e11d74] text-white text-[12px] sm:text-[13px] font-bold px-5 py-1.5 rounded-full uppercase tracking-wider shadow-sm whitespace-nowrap">
                    👑 {KIT_OPTIONS.premium.badge}
                  </span>
                </div>

                <div>
                  <div className="text-center pt-2">
                    <span className="inline-block rounded-full bg-[#ffe4f5] border border-[#f5bfe0] px-3.5 py-1 font-display font-bold text-[12px] text-[#c22182] tracking-[0.08em] uppercase">
                      {KIT_OPTIONS.premium.name}
                    </span>
                    <h3 className="mt-2.5 font-display font-bold text-[23px] sm:text-[26px] text-[#2a212f] leading-[1.2] uppercase">
                      {KIT_OPTIONS.premium.subtitle}
                    </h3>
                    <p className="mt-2 text-[14px] sm:text-[14.5px] text-[#5e5166] leading-[1.5] max-w-[420px] mx-auto">
                      {KIT_OPTIONS.premium.idealFor}
                    </p>
                    <p className="mt-4 font-display font-bold text-[46px] sm:text-[50px] leading-none text-[#12a136]">
                      {KIT_OPTIONS.premium.price}
                    </p>
                    <p className="mt-2 text-[13px] text-[#6e6275]">
                      {KIT_OPTIONS.premium.paymentNote}
                    </p>
                  </div>

                  <hr className="border-t border-[#f3d6e7] my-4 sm:my-5" />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4 items-stretch">
                    {/* Left Included Column */}
                    <div className="bg-white/95 rounded-[18px] border border-[#f5d5e7] p-4 flex flex-col justify-between">
                      <div>
                        <p className="font-display text-[11.5px] font-bold text-[#12a136] uppercase tracking-[0.08em] mb-2.5">
                          O QUE VOCÊ RECEBE:
                        </p>
                        <ul className="space-y-2 text-[13.5px] sm:text-[14px]">
                          {KIT_OPTIONS.premium.highlightFeature && (
                            <li className="flex items-start gap-2 font-display font-bold text-[#2a212f] leading-[1.4]">
                              <span className="w-4.5 h-4.5 rounded-full bg-[#e6f9f1] text-[#12a136] flex items-center justify-center shrink-0 mt-0.5">
                                <Check className="w-3 h-3 stroke-[3]" />
                              </span>
                              <span>{KIT_OPTIONS.premium.highlightFeature}</span>
                            </li>
                          )}
                          {KIT_OPTIONS.premium.includedFeatures.map((feat) => (
                            <li key={feat} className="flex items-start gap-2 text-[#2a212f] leading-[1.4]">
                              <span className="w-4.5 h-4.5 rounded-full bg-[#e6f9f1] text-[#12a136] flex items-center justify-center shrink-0 mt-0.5">
                                <Check className="w-3 h-3 stroke-[3]" />
                              </span>
                              <span>{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Right Included Bonuses Box */}
                    <div className="bg-[#fff7fc] rounded-[18px] border border-[#f3c4e0] p-4 shadow-2xs flex flex-col justify-between">
                      <div>
                        <p className="font-display text-[11.5px] font-bold text-[#e11d74] uppercase tracking-[0.08em] mb-2.5 flex items-center gap-1.5">
                          <Gift className="w-3.5 h-3.5 text-[#e11d74] shrink-0" />
                          <span>BÔNUS DO PREMIUM:</span>
                        </p>
                        <ul className="space-y-2 text-[13.5px] sm:text-[14px] text-[#2a212f]">
                          {KIT_OPTIONS.premium.bonuses?.map((bonusName) => (
                            <li key={bonusName} className="flex items-start gap-2 leading-[1.4]">
                              <span className="w-4.5 h-4.5 rounded-full bg-[#ffe4f5] text-[#c22182] flex items-center justify-center shrink-0 mt-0.5">
                                <Sparkles className="w-2.5 h-2.5" />
                              </span>
                              <span className="font-medium">{bonusName}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <a
                    href={KIT_OPTIONS.premium.checkoutUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-display inline-flex items-center justify-center w-full h-[56px] sm:h-[58px] rounded-full bg-[#12a136] hover:bg-[#0e8b2d] text-white font-bold text-[14.5px] sm:text-[15px] tracking-normal uppercase shadow-[0_10px_26px_rgba(18,161,54,0.34)] transition-all cursor-pointer"
                  >
                    {KIT_OPTIONS.premium.ctaLabel}
                  </a>
                </div>
              </div>
            </div>

            {/* Trust Strip Below Pricing */}
            <div className="mt-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#fef8fc] rounded-[18px] border border-[#f2d0e4] p-3.5 sm:p-4 text-center text-[13.5px] text-[#5e5166]">
              <div className="flex items-center justify-center gap-2">
                <Lock className="w-4 h-4 text-[#12a136] shrink-0" />
                <span>Pagamento único e ambiente seguro</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4 text-[#c22182] shrink-0" />
                <span>Acesso digital após confirmação</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#12a136] shrink-0" />
                <span>Garantia de 7 dias</span>
              </div>
            </div>
          </div>
        </section>

        {/* 9. PERGUNTAS FREQUENTES */}
        <section className="w-full bg-[#fef8fc] py-[48px] sm:py-[76px] px-[16px] border-t border-[#f5d5e7]">
          <div className="max-w-[780px] mx-auto">
            <div className="text-center">
              <p className="text-[#c22182] text-[12px] font-semibold tracking-[0.12em] uppercase">
                TIRE SUAS DÚVIDAS
              </p>
              <h2 className="mt-2 font-display font-bold text-[#2a212f] text-[24px] sm:text-[34px] md:text-[38px] leading-[1.22]">
                Perguntas <span className="text-[#c22182]">frequentes</span>
              </h2>
            </div>

            <div className="mt-7 sm:mt-9 space-y-3">
              {FAQ_ITEMS.map((faq) => {
                const isOpen = openFaqId === faq.id;
                return (
                  <div
                    key={faq.id}
                    className="bg-white rounded-[18px] border border-[#e4d9ed] overflow-hidden transition-colors"
                  >
                    <button
                      type="button"
                      onClick={() => toggleFaq(faq.id)}
                      aria-expanded={isOpen}
                      className="w-full px-5 py-4 flex items-center justify-between gap-3 text-left font-display font-bold text-[15.5px] sm:text-[17px] text-[#2a212f] hover:text-[#c22182] transition-colors cursor-pointer"
                    >
                      <span>{faq.question}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-[#6e6275] shrink-0 transition-transform duration-200 ${
                          isOpen ? 'rotate-180 text-[#c22182]' : ''
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-4 pt-1 text-[14.5px] leading-[1.6] text-[#5e5166] border-t border-[#f4eeff]">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 10. SEÇÃO DE GARANTIA & 11. CHAMADA FINAL */}
        <section
          className="w-full py-[48px] sm:py-[76px] px-[16px] border-t border-[#f3cde2]"
          style={{
            background: 'linear-gradient(90deg, #fde8f4 0%, #f4eeff 100%)',
          }}
        >
          <div className="max-w-[1100px] mx-auto space-y-6 sm:space-y-8">
            {/* GARANTIA */}
            <div className="bg-white/95 rounded-[24px] border border-[#f3cde2] p-5 sm:p-8 flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left shadow-xs">
              <div className="w-[104px] sm:w-[128px] shrink-0 flex items-center justify-center bg-transparent">
                <img
                  src={GUARANTEE_BADGE_IMAGE}
                  alt="Selo de garantia de 7 dias"
                  width={240}
                  height={260}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-auto object-contain block"
                />
              </div>
              <div>
                <span className="inline-block rounded-full bg-[#ffe9f8] px-3.5 py-1 text-[#c22182] text-[11.5px] font-bold tracking-[0.1em] uppercase">
                  GARANTIA DE 7 DIAS
                </span>
                <h2 className="mt-2 font-display font-bold text-[#2a212f] text-[24px] sm:text-[30px] leading-[1.22]">
                  Compre com <span className="text-[#c22182]">tranquilidade.</span>
                </h2>
                <p className="mt-2 text-[#5e5166] text-[14.5px] sm:text-[15.5px] leading-[1.58] max-w-[720px]">
                  Você terá 7 dias de garantia para conhecer o material. Se dentro desse período
                  decidir que a coleção não é adequada para você, poderá solicitar o reembolso
                  conforme as condições da garantia.
                </p>
              </div>
            </div>

            {/* CHAMADA FINAL */}
            <div className="bg-white rounded-[24px] border-2 border-[#f0bedb] p-6 sm:p-9 text-center shadow-[0_12px_32px_rgba(194,33,130,0.08)]">
              <h2 className="font-display font-bold text-[#2a212f] text-[24px] sm:text-[34px] leading-[1.22] max-w-[680px] mx-auto">
                Que tal começar 2027 com{' '}
                <span className="text-[#c22182]">mais organização?</span>
              </h2>
              <p className="mt-2.5 text-[#5e5166] text-[14.5px] sm:text-[16px] leading-[1.58] max-w-[620px] mx-auto">
                Seus planos merecem sair do papel. Escolha sua coleção, receba seus materiais
                digitais e comece a organizar seus dias com mais clareza.
              </p>
              <div className="mt-5 flex flex-col items-center">
                <a
                  href={KIT_OPTIONS.premium.checkoutUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-display inline-flex items-center justify-center w-full max-w-[420px] h-[56px] sm:h-[58px] rounded-full bg-[#12a136] hover:bg-[#0e8b2d] active:scale-[0.99] text-white font-bold text-[14.5px] sm:text-[15.5px] tracking-normal uppercase shadow-[0_10px_24px_rgba(18,161,54,0.28)] transition-all cursor-pointer px-5"
                >
                  QUERO GARANTIR MINHA COLEÇÃO
                </a>
                <p className="mt-3 text-[13px] font-medium text-[#5e5166]">
                  Acesso digital • Pagamento único • Garantia de 7 dias
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* MOBILE-FIRST FIXED BOTTOM CTA BAR (visible only on mobile screens) */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-white/95 backdrop-blur-xs border-t border-[#f2cde2] px-[16px] py-2.5 shadow-[0_-6px_20px_rgba(42,33,47,0.08)] flex items-center justify-between gap-3">
        <div>
          <p className="font-display font-bold text-[13.5px] text-[#2a212f] leading-tight">
            Coleção Planner 2027
          </p>
          <p className="text-[12px] text-[#5e5166]">
            A partir de <strong className="text-[#12a136]">R$ 9,90</strong> • Pagamento único
          </p>
        </div>
        <a
          href={KIT_OPTIONS.premium.checkoutUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="font-display inline-flex items-center justify-center shrink-0 h-[44px] px-4 rounded-full bg-[#12a136] hover:bg-[#0e8b2d] text-white font-bold text-[12px] uppercase tracking-normal shadow-sm cursor-pointer"
        >
          GARANTIR COLEÇÃO
        </a>
      </div>

      {/* 12. FOOTER */}
      <footer className="w-full bg-[#191624] text-white pt-8 pb-24 md:pb-8 px-[16px]">
        <div className="max-w-[1180px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-[13px]">
          <p className="text-white/85 text-center sm:text-left">
            🔒 © 2026. Todos os direitos reservados • Produto 100% Digital.
          </p>
          <nav aria-label="Links institucionais" className="flex flex-wrap items-center justify-center gap-3 sm:gap-5">
            <button
              type="button"
              onClick={() => setActiveLegalModal('termos')}
              className="min-h-[44px] px-2.5 inline-flex items-center text-white/90 hover:text-white transition-colors cursor-pointer"
            >
              Termos de Uso
            </button>
            <button
              type="button"
              onClick={() => setActiveLegalModal('privacidade')}
              className="min-h-[44px] px-2.5 inline-flex items-center text-white/90 hover:text-white transition-colors cursor-pointer"
            >
              Política de Privacidade
            </button>
            <button
              type="button"
              onClick={() => setActiveLegalModal('contato')}
              className="min-h-[44px] px-2.5 inline-flex items-center text-white/90 hover:text-white transition-colors cursor-pointer"
            >
              Contato
            </button>
          </nav>
        </div>
      </footer>

      {/* Interactive Modals */}
      <CheckoutModal
        selectedKitId={selectedKitId}
        onClose={() => setSelectedKitId(null)}
        onSelectKit={(kitId) => setSelectedKitId(kitId)}
      />
      <LegalModal
        activeModal={activeLegalModal}
        onClose={() => setActiveLegalModal(null)}
      />
    </div>
  );
}
