import React, { useEffect, useRef } from 'react';
import { Check, Gift, Headset, ShieldCheck, Sparkles, X } from 'lucide-react';
import {
  CAKTO_BASICO_URL,
  CAKTO_PREMIUM_UPSELL_URL,
  resolveUpsellAction,
  UPSELL_MODAL_CONTENT,
} from '../utils/catalogData';

interface UpsellModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTrackCheckout: (kitName: string, priceValue: number) => void;
}

export function UpsellModal({
  isOpen,
  onClose,
  onTrackCheckout,
}: UpsellModalProps) {
  const redirectLockRef = useRef(false);

  useEffect(() => {
    if (isOpen) {
      redirectLockRef.current = false;
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const acceptResolution = resolveUpsellAction('accept', CAKTO_PREMIUM_UPSELL_URL);
  const declineResolution = resolveUpsellAction('decline', CAKTO_PREMIUM_UPSELL_URL);

  const handleDeclineClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (redirectLockRef.current) {
      e.preventDefault();
      return;
    }
    redirectLockRef.current = true;
    onTrackCheckout(declineResolution.kitName, declineResolution.priceNumeric);
    window.setTimeout(() => {
      onClose();
    }, 150);
  };

  const handleAcceptClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (redirectLockRef.current) {
      e.preventDefault();
      return;
    }
    redirectLockRef.current = true;
    onTrackCheckout(acceptResolution.kitName, acceptResolution.priceNumeric);
    window.setTimeout(() => {
      onClose();
    }, 150);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#191020]/75 p-3 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="upsell-modal-headline"
      aria-describedby="upsell-modal-subheadline"
    >
      <div className="relative w-full max-w-[450px] max-h-[calc(100dvh-20px)] overflow-y-auto overscroll-contain rounded-[24px] border-2 border-[#e11d74] bg-white px-3.5 pt-3.5 pb-3.5 sm:px-6 sm:py-5 shadow-[0_20px_50px_rgba(25,16,32,0.45)] text-center animate-modal-enter">
        {/* Top decorative accent bar */}
        <div
          aria-hidden="true"
          className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#c22182] via-[#e11d74] to-[#c22182]"
        />

        {/* Top Header Row: Destaque Superior + Botão X (nunca sobrepõem em 320px+) */}
        <div className="flex items-center justify-between gap-2 pt-0.5">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[#ffe9f8] border border-[#f3c4e0] px-2.5 py-1 text-[#c22182] text-[9.5px] sm:text-[11px] font-display font-bold tracking-[0.03em] uppercase text-left leading-tight">
            <Sparkles className="w-3 h-3 text-[#e11d74] shrink-0" />
            <span>{UPSELL_MODAL_CONTENT.highlightBadge}</span>
          </div>

          <a
            href={declineResolution.targetUrl ?? CAKTO_BASICO_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleDeclineClick}
            aria-label="Fechar oferta e continuar para o checkout do plano Básico"
            data-testid="upsell-close-x"
            className="w-11 h-11 rounded-full bg-[#fef5fa] hover:bg-[#ffe4f5] active:scale-95 border border-[#f2cde4] text-[#7a3e64] hover:text-[#c22182] flex items-center justify-center shrink-0 transition-transform cursor-pointer"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </a>
        </div>

        {/* Headline */}
        <h2
          id="upsell-modal-headline"
          className="mt-2 font-display font-bold text-[#c22182] text-[19px] sm:text-[24px] leading-[1.16] uppercase tracking-[-0.01em]"
        >
          {UPSELL_MODAL_CONTENT.headline}
        </h2>

        {/* Subheadline */}
        <p
          id="upsell-modal-subheadline"
          className="mt-1 text-[#4b3f52] text-[13.5px] sm:text-[15.5px] font-medium leading-[1.35] max-w-[400px] mx-auto"
        >
          {UPSELL_MODAL_CONTENT.subheadline}
        </p>

        {/* Card da Oferta do Produto */}
        <div className="mt-2.5 sm:mt-3 rounded-[18px] bg-gradient-to-b from-[#fff5fa] to-[#fef9fc] border-2 border-[#f2c4df] p-3 sm:p-4 text-center">
          <p className="font-display font-bold text-[14px] sm:text-[16px] text-[#2a212f] uppercase tracking-wide">
            {UPSELL_MODAL_CONTENT.productTitle}
          </p>

          {/* Resumo enxuto de valor do Kit Premium */}
          <div className="mt-1.5 flex flex-wrap items-center justify-center gap-1 sm:gap-1.5 text-[11px] sm:text-[12px] font-medium text-[#4b3f52]">
            <span className="inline-flex items-center gap-1 rounded-full bg-white border border-[#f2d0e4] px-2 py-0.5">
              <Check className="w-3 h-3 text-[#12a136] stroke-[3]" />
              150 materiais digitais
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-white border border-[#f2d0e4] px-2 py-0.5">
              <Gift className="w-3 h-3 text-[#e11d74]" />
              6 bônus extras
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-white border border-[#f2d0e4] px-2 py-0.5">
              <Headset className="w-3 h-3 text-[#c22182]" />
              Suporte humanizado
            </span>
          </div>

          {/* Preço: De R$ 29,90 por apenas R$ 19,90. */}
          <div className="mt-2.5 pt-2 border-t border-[#f3d6e7]">
            <p className="font-display text-[13.5px] sm:text-[15px] font-bold text-[#5e5166]">
              De{' '}
              <span className="line-through text-[#e11d74]">
                {UPSELL_MODAL_CONTENT.originalPrice}
              </span>{' '}
              por apenas{' '}
              <strong className="text-[#12a136]">
                {UPSELL_MODAL_CONTENT.promotionalPrice}
              </strong>
              .
            </p>
            <p className="mt-0.5 font-display font-bold text-[34px] sm:text-[42px] leading-none text-[#12a136]">
              {UPSELL_MODAL_CONTENT.promotionalPrice}
            </p>
            <p className="mt-1 text-[11px] sm:text-[11.5px] text-[#6e6275] font-medium">
              Pagamento único • Acesso digital • Garantia de 7 dias
            </p>
          </div>
        </div>

        {/* Botão Principal: SIM! QUERO MEU PREMIUM POR R$ 19,90 */}
        <div className="mt-3">
          <a
            href={acceptResolution.targetUrl ?? CAKTO_PREMIUM_UPSELL_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleAcceptClick}
            data-testid="upsell-accept-cta"
            className="font-display inline-flex items-center justify-center w-full min-h-[50px] sm:min-h-[54px] rounded-full bg-[#12a136] hover:bg-[#0e8b2d] active:scale-[0.98] text-white font-bold text-[13px] sm:text-[15px] tracking-normal uppercase shadow-[0_8px_22px_rgba(18,161,54,0.32)] transition-transform cursor-pointer px-3.5 py-2 leading-snug"
          >
            {UPSELL_MODAL_CONTENT.acceptCtaLabel}
          </a>
        </div>

        {/* Opção de Recusa: Mesmo comportamento do botão X, direcionando ao checkout original do Plano Básico */}
        <div className="mt-1.5">
          <a
            href={declineResolution.targetUrl ?? CAKTO_BASICO_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleDeclineClick}
            data-testid="upsell-decline-link"
            className="inline-flex items-center justify-center min-h-[44px] px-2 py-1 text-[12px] sm:text-[13.5px] font-medium text-[#6e6275] hover:text-[#2a212f] underline underline-offset-4 transition-colors cursor-pointer leading-snug"
          >
            {UPSELL_MODAL_CONTENT.declineCtaLabel}
          </a>
        </div>

        {/* Rodapé de segurança compacto */}
        <div className="mt-1.5 pt-2 border-t border-[#f5dce9] flex items-center justify-center gap-1.5 text-[11px] sm:text-[11.5px] text-[#6e6275]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#12a136] shrink-0" />
          <span>Ambiente 100% seguro • Garantia incondicional de 7 dias</span>
        </div>
      </div>
    </div>
  );
}

export default UpsellModal;
