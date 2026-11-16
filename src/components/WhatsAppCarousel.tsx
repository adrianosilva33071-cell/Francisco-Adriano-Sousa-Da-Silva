import React, { useEffect, useState } from 'react';
import { X, ZoomIn } from 'lucide-react';
import { TESTIMONIAL_IMAGES } from '../utils/catalogData';

export function WhatsAppCarousel() {
  const [selectedPrint, setSelectedPrint] = useState<{
    id: number;
    src: string;
    alt: string;
  } | null>(null);

  useEffect(() => {
    if (!selectedPrint) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedPrint(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedPrint]);

  return (
    <section className="w-full bg-white py-[48px] sm:py-[72px] px-[14px] sm:px-[16px] border-t border-[#f5d5e7]">
      <div className="max-w-[1180px] mx-auto">
        {/* Heading */}
        <div className="text-center max-w-[740px] mx-auto">
          <p className="text-[#c22182] text-[12px] font-bold tracking-[0.1em] uppercase">
            PROVA SOCIAL
          </p>
          <h2 className="mt-2 font-display font-bold text-[#2a212f] text-[24px] sm:text-[34px] md:text-[38px] leading-[1.22] uppercase">
            QUEM JÁ COMPROU, <span className="text-[#c22182]">RECOMENDA</span>
          </h2>
          <p className="mt-2.5 text-[#5e5166] text-[14.5px] sm:text-[16px] leading-[1.55]">
            Veja os comentários de pessoas que conheceram a Coleção Planner 2027.
          </p>
        </div>

        {/* 4 Phone Screenshots (Clean 1-col on small mobile or 2-col on larger mobile/tablet, 4 side-by-side on desktop) */}
        <div className="mt-7 sm:mt-9 grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 items-start">
          {TESTIMONIAL_IMAGES.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setSelectedPrint(item)}
              aria-label={`Ampliar ${item.alt}`}
              className="group relative mx-auto w-full max-w-[310px] sm:max-w-[330px] rounded-[22px] sm:rounded-[26px] overflow-hidden shadow-[0_12px_28px_rgba(25,22,36,0.14)] border border-[#e7d4e0] bg-[#0b141a] transition-transform hover:scale-[1.01] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c22182] cursor-pointer block"
            >
              <img
                src={item.src}
                alt={item.alt}
                width={330}
                height={715}
                loading="lazy"
                decoding="async"
                className="w-full h-auto object-contain block"
              />
              <span className="absolute bottom-2.5 right-2.5 inline-flex items-center gap-1 rounded-full bg-black/70 text-white text-[11px] font-medium px-2.5 py-1 backdrop-blur-xs opacity-90 group-hover:opacity-100 transition-opacity">
                <ZoomIn className="w-3.5 h-3.5" />
                <span>Ampliar</span>
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Lightbox Modal for Enlarged Print Viewing */}
      {selectedPrint && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-label={selectedPrint.alt}
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedPrint(null);
          }}
        >
          <div className="relative max-w-[380px] w-full flex flex-col items-center">
            <button
              type="button"
              onClick={() => setSelectedPrint(null)}
              aria-label="Fechar visualização"
              className="mb-2.5 self-end inline-flex items-center gap-1.5 h-11 px-4 rounded-full bg-white text-[#2a212f] font-display font-bold text-[13px] shadow-md hover:bg-[#ffe9f8] hover:text-[#c22182] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
              <span>Fechar</span>
            </button>
            <div className="w-full max-h-[82vh] rounded-[24px] overflow-hidden shadow-2xl bg-[#0b141a] border border-white/20">
              <img
                src={selectedPrint.src}
                alt={selectedPrint.alt}
                width={380}
                height={823}
                className="w-full max-h-[82vh] object-contain block"
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
