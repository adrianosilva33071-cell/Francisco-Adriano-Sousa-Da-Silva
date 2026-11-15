import React from 'react';
import { TESTIMONIAL_IMAGES } from '../utils/catalogData';

export function WhatsAppCarousel() {
  return (
    <section className="w-full bg-white py-[44px] sm:py-[72px] px-[16px] border-t border-[#f5d5e7]">
      <div className="max-w-[1160px] mx-auto">
        {/* Heading */}
        <div className="text-center max-w-[740px] mx-auto">
          <p className="text-[#c22182] text-[11.5px] sm:text-[12px] font-semibold tracking-[0.12em] uppercase">
            DEPOIMENTOS REAIS
          </p>
          <h2 className="mt-2 font-display font-bold text-[#2a212f] text-[24px] sm:text-[34px] md:text-[38px] leading-[1.22]">
            Quem já comprou, <span className="text-[#c22182]">recomenda</span>
          </h2>
          <p className="mt-2 text-[#5e5166] text-[14.5px] sm:text-[16px] leading-[1.55]">
            Olha o que as pessoas estão dizendo sobre a experiência com os planners!
          </p>
        </div>

        {/* 4 Phone Screenshots (2x2 compact grid on mobile, 4 side-by-side on desktop) */}
        <div className="mt-7 sm:mt-9 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 items-start">
          {TESTIMONIAL_IMAGES.map((item) => (
            <div
              key={item.id}
              className="mx-auto w-full rounded-[20px] sm:rounded-[26px] overflow-hidden shadow-[0_10px_26px_rgba(25,22,36,0.12)] bg-[#0b141a]"
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
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
