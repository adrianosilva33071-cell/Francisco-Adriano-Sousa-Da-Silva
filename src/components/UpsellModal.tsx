import React, { useEffect, useMemo, useRef } from 'react';
import { ArrowRight, Check, ShieldCheck, ShoppingCart, Sparkles, X } from 'lucide-react';
import {
  buildCheckoutUrlWithTracking,
  CAKTO_BASICO_URL,
  CAKTO_PREMIUM_UPSELL_URL,
  getResponsiveImageSources,
  HERO_PLANNER_IMAGE,
  resolveUpsellAction,
  UPSELL_MODAL_CONTENT,
} from '../utils/catalogData';

interface UpsellModalProps {
  isOpen: boolean;
  locationSearch?: string;
  onClose: () => void;
  onAcceptUpgrade: (kitName: string, priceValue: number) => void;
  onDeclineUpgrade: (kitName: string, priceValue: number) => void;
}

const POPUP_HERO_SOURCES = getResponsiveImageSources(HERO_PLANNER_IMAGE, {
  suffix: '640w',
  widthDescriptor: '640w',
  fullWidthDescriptor: '1272w',
});

const ACCEPT_RESOLUTION = resolveUpsellAction('accept', CAKTO_PREMIUM_UPSELL_URL);
const DECLINE_RESOLUTION = resolveUpsellAction('decline', CAKTO_PREMIUM_UPSELL_URL);

export function UpsellModal({
  isOpen,
  locationSearch = '',
  onClose,
  onAcceptUpgrade,
  onDeclineUpgrade,
}: UpsellModalProps) {
  const redirectLockRef = useRef(false);
  const closeTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      redirectLockRef.current = false;
    }
    return () => {
      if (closeTimerRef.current !== null) {
        window.clearTimeout(closeTimerRef.current);
        closeTimerRef.current = null;
      }
    };
  }, [isOpen]);

  const acceptCheckoutHref = useMemo(
    () =>
      buildCheckoutUrlWithTracking(
        ACCEPT_RESOLUTION.targetUrl ?? CAKTO_PREMIUM_UPSELL_URL,
        locationSearch
      ),
    [locationSearch]
  );

  const declineCheckoutHref = useMemo(
    () =>
      buildCheckoutUrlWithTracking(
        DECLINE_RESOLUTION.targetUrl ?? CAKTO_BASICO_URL,
        locationSearch
      ),
    [locationSearch]
  );

  if (!isOpen) return null;

  const handleDeclineClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (redirectLockRef.current) {
      e.preventDefault();
      return;
    }
    redirectLockRef.current = true;
    onDeclineUpgrade(DECLINE_RESOLUTION.kitName, DECLINE_RESOLUTION.priceNumeric);
    closeTimerRef.current = window.setTimeout(() => {
      onClose();
    }, 150);
  };

  const handleAcceptClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (redirectLockRef.current) {
      e.preventDefault();
      return;
    }
    redirectLockRef.current = true;
    onAcceptUpgrade(ACCEPT_RESOLUTION.kitName, ACCEPT_RESOLUTION.priceNumeric);
    closeTimerRef.current = window.setTimeout(() => {
      onClose();
    }, 150);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#29202A]/75 p-2.5 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="upsell-modal-headline"
      aria-describedby="upsell-modal-subheadline"
    >
      <div className="relative w-full max-w-[500px] max-h-[calc(100dvh-20px)] overflow-y-auto overscroll-contain rounded-[24px] border-2 border-[#F01579] bg-white px-3.5 pt-3.5 pb-4 sm:px-6 sm:py-5 shadow-[0_20px_50px_rgba(41,32,42,0.45)] text-center animate-modal-enter">
        {/* Faixa decorativa superior */}
        <div
          aria-hidden="true"
          className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#F01579] via-[#F4C542] to-[#F01579]"
        />

        {/* Topo do Popup: Etiqueta de Upgrade + Botão Fechar (X) */}
        <div className="flex items-center justify-between gap-2 pt-0.5">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[#FCE8F1] border border-[#F4C542] px-2.5 py-1 text-[#F01579] text-[9.5px] sm:text-[11px] font-display font-bold tracking-[0.03em] uppercase text-left leading-tight">
            <Sparkles className="w-3.5 h-3.5 text-[#F4C542] shrink-0" />
            <span>{UPSELL_MODAL_CONTENT.highlightBadge}</span>
          </div>

          <a
            href={declineCheckoutHref}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleDeclineClick}
            aria-label="Fechar popup e continuar com o Kit Básico por R$ 9,90"
            data-testid="upsell-close-x"
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#FFF6FA] hover:bg-[#FCE8F1] active:scale-95 border border-[#FCE8F1] text-[#29202A] hover:text-[#F01579] flex items-center justify-center shrink-0 transition-transform cursor-pointer"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </a>
        </div>

        {/* Headline */}
        <h2
          id="upsell-modal-headline"
          className="mt-2 font-display font-bold text-[#F01579] text-[18px] sm:text-[23px] leading-[1.16] uppercase tracking-[-0.01em]"
        >
          {UPSELL_MODAL_CONTENT.headline}
        </h2>

        {/* Subheadline */}
        <p
          id="upsell-modal-subheadline"
          className="mt-1 text-[#29202A] text-[13px] sm:text-[15px] font-medium leading-[1.35] max-w-[430px] mx-auto"
        >
          {UPSELL_MODAL_CONTENT.subheadline}
        </p>

        {/* Destaque da Diferença de R$ 10,00 */}
        <div className="mt-2 rounded-[14px] bg-[#FFF6FA] border border-[#F4C542] px-3 py-2">
          <p className="font-display font-bold text-[12.5px] sm:text-[14px] text-[#29202A] leading-snug">
            {UPSELL_MODAL_CONTENT.priceDifferenceCallout}
          </p>
        </div>

        {/* Mockup Demonstrativo da Coleção Premium */}
        <div className="mt-2.5 flex items-center gap-3 rounded-[16px] bg-[#FFF6FA] border border-[#FCE8F1] p-2.5 text-left">
          <div className="w-[96px] sm:w-[116px] aspect-[16/9] rounded-[10px] overflow-hidden border border-[#FCE8F1] bg-white shrink-0">
            <picture>
              <source type="image/avif" srcSet={POPUP_HERO_SOURCES.avifSrcSet} sizes="120px" />
              <source type="image/webp" srcSet={POPUP_HERO_SOURCES.webpSrcSet} sizes="120px" />
              <img
                src={POPUP_HERO_SOURCES.fallbackWebp}
                alt="Mockup da Coleção Kit Premium — 250 materiais digitais"
                width={240}
                height={135}
                loading="eager"
                decoding="async"
                className="w-full h-full object-cover block"
              />
            </picture>
          </div>
          <div className="min-w-0 flex-1">
            <span className="inline-block rounded-full bg-[#F01579] text-white px-2 py-0.5 font-display font-bold text-[9.5px] uppercase tracking-wider">
              COLEÇÃO PREMIUM COMPLETA
            </span>
            <p className="mt-1 font-display font-bold text-[13px] sm:text-[14px] text-[#29202A] leading-tight">
              Leve 250 materiais digitais em vez de 100
            </p>
            <p className="mt-0.5 text-[11.5px] text-[#534656] leading-tight">
              Inclui planejamento semanal e mensal, controle financeiro, metas e hábitos.
            </p>
          </div>
        </div>

        {/* Comparação Visual Lado a Lado: BÁSICO vs PREMIUM */}
        <div className="mt-2.5 grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5 text-left">
          {/* Card BÁSICO */}
          <div className="rounded-[16px] bg-[#FFF6FA] border border-[#FCE8F1] p-2.5 sm:p-3 flex flex-col justify-between">
            <div>
              <span className="font-display font-bold text-[11px] text-[#6e5f70] uppercase tracking-wider">
                {UPSELL_MODAL_CONTENT.basicComparison.name}:
              </span>
              <p className="mt-1 font-display font-bold text-[13px] sm:text-[13.5px] text-[#29202A] leading-snug">
                {UPSELL_MODAL_CONTENT.basicComparison.materialsLabel} —{' '}
                <span>{UPSELL_MODAL_CONTENT.basicComparison.price}.</span>
              </p>
            </div>
            <p className="mt-1.5 text-[11px] text-[#6e5f70]">Opção econômica inicial</p>
          </div>

          {/* Card PREMIUM (Destaque Visual + De R$ 27,90 por R$ 19,90 exclusivamente no popup) */}
          <div className="relative rounded-[16px] bg-gradient-to-b from-[#FCE8F1]/70 to-white border-2 border-[#F01579] p-2.5 sm:p-3 flex flex-col justify-between shadow-2xs">
            <div>
              <div className="flex items-center justify-between gap-1">
                <span className="font-display font-bold text-[11px] text-[#F01579] uppercase tracking-wider">
                  {UPSELL_MODAL_CONTENT.premiumComparison.name}:
                </span>
                <span className="inline-flex items-center rounded-full bg-[#F4C542] text-[#29202A] px-1.5 py-0.5 font-display font-bold text-[9px] uppercase">
                  +150 ITENS + 6 BÔNUS
                </span>
              </div>
              <p className="mt-1 text-[12px] sm:text-[12.5px] font-medium text-[#29202A] leading-snug">
                <strong className="font-display font-bold">
                  {UPSELL_MODAL_CONTENT.premiumComparison.materialsLabel}
                </strong>{' '}
                —{' '}
                <span className="line-through text-[#6e5f70]">
                  {UPSELL_MODAL_CONTENT.premiumComparison.normalPrice}
                </span>{' '}
                normalmente, mas com oferta especial de{' '}
                <strong className="font-display font-bold text-[#16B83A] text-[13.5px]">
                  {UPSELL_MODAL_CONTENT.premiumComparison.price}
                </strong>{' '}
                pelo popup.
              </p>
            </div>
            <p className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-bold text-[#16B83A]">
              <Check className="w-3 h-3 stroke-[3] shrink-0" />
              <span>Valor total único de R$ 19,90 (sem somar valores)</span>
            </p>
          </div>
        </div>

        {/* BOTÃO PRINCIPAL DO POPUP (Redireciona para o checkout promocional R$ 19,90) */}
        <div className="mt-3">
          <a
            href={acceptCheckoutHref}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleAcceptClick}
            data-testid="upsell-accept-cta"
            className="font-display inline-flex items-center justify-center gap-2 w-full min-h-[50px] sm:min-h-[54px] rounded-[14px] bg-[#16B83A] hover:bg-[#139e31] active:scale-[0.99] text-white font-bold text-[13.5px] sm:text-[15.5px] tracking-normal uppercase shadow-[0_8px_22px_rgba(22,184,58,0.32)] transition-all cursor-pointer px-4 py-2 leading-snug"
          >
            <ShoppingCart className="w-4.5 h-4.5 shrink-0" />
            <span>{UPSELL_MODAL_CONTENT.acceptCtaLabel}</span>
            <ArrowRight className="w-4 h-4 shrink-0" />
          </a>
        </div>

        {/* BOTÃO SECUNDÁRIO DO POPUP (Redireciona para o checkout do Básico R$ 9,90) */}
        <div className="mt-2">
          <a
            href={declineCheckoutHref}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleDeclineClick}
            data-testid="upsell-decline-link"
            className="font-display inline-flex items-center justify-center w-full min-h-[44px] rounded-[12px] border border-[#FCE8F1] bg-[#FFF6FA] hover:bg-[#FCE8F1]/60 px-3 py-2 text-[12px] sm:text-[13px] font-bold text-[#534656] hover:text-[#29202A] uppercase transition-colors cursor-pointer leading-snug"
          >
            {UPSELL_MODAL_CONTENT.declineCtaLabel}
          </a>
        </div>

        {/* Rodapé de transparência e segurança */}
        <div className="mt-2 pt-2 border-t border-[#FCE8F1] flex items-center justify-center gap-1.5 text-[11px] text-[#534656]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#16B83A] shrink-0" />
          <span>
            Oferta exclusiva deste popup (R$ 19,90 no total) • Pagamento único • Garantia de 7 dias
          </span>
        </div>
      </div>
    </div>
  );
}

export default UpsellModal;
