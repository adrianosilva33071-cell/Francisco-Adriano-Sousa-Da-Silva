import React, { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { ArrowDown, Check, ChevronDown, Gift, Lock, Mail, ShieldCheck, X, ZoomIn } from 'lucide-react';
import {
  ctaLabel,
  formatBRL,
  Kit,
  KIT_ORDER,
  KITS,
  LOWEST_PRICE,
  premiumComparison,
} from './config/offer';
import {
  BASIC_CATEGORY_COUNT,
  CATEGORIES,
  DELIVERY_IMAGE,
  FAQ,
  HERO_IMAGE,
  PreviewItem,
  PREVIEWS,
} from './config/content';
import { Picture } from './components/Picture';
import type { LegalModalType } from './components/LegalModal';

const LegalModal = lazy(() => import('./components/LegalModal'));

const COMPARISON = premiumComparison();

function SectionHeading({ eyebrow, title, intro }: { eyebrow: string; title: string; intro?: string }) {
  return (
    <div className="max-w-[640px] mx-auto text-center">
      <p className="text-rose text-[13px] font-semibold tracking-[0.12em] uppercase">{eyebrow}</p>
      <h2 className="mt-2 font-display font-semibold text-plum text-[26px] sm:text-[34px] leading-[1.15]">
        {title}
      </h2>
      {intro && <p className="mt-2.5 text-muted text-[15.5px] sm:text-[17px] leading-[1.55]">{intro}</p>}
    </div>
  );
}

/**
 * Botão de compra: um <a> comum com o link da Cakto, presente no HTML desde o
 * carregamento. A UTMify reconhece links com "pay.cakto.com.br/" e dispara o
 * InitiateCheckout no clique; o script de UTMs anexa os parâmetros ao link.
 */
function CheckoutButton({ kit, variant = 'solid', className = '' }: { kit: Kit; variant?: 'solid' | 'outline' | 'outline-light'; className?: string }) {
  const styles = {
    solid: 'bg-rose hover:bg-rose-deep text-white shadow-[0_6px_18px_rgba(194,33,130,0.28)]',
    outline: 'border-2 border-plum/80 text-plum hover:bg-plum hover:text-white',
    'outline-light': 'border-2 border-white/80 text-white hover:bg-white hover:text-plum',
  }[variant];
  return (
    <a
      href={kit.checkoutUrl}
      data-kit={kit.id}
      aria-label={ctaLabel(kit)}
      className={`inline-flex items-center justify-center text-center w-full min-h-[56px] px-4 py-3 rounded-full font-bold uppercase tracking-[0.01em] leading-tight text-[15px] sm:text-[16px] transition-colors ${styles} ${className}`}
    >
      <span>
        Quero o {kit.name} <span className="whitespace-nowrap">— {formatBRL(kit.price)}</span>
      </span>
    </a>
  );
}

function KitCard({ kit }: { kit: Kit }) {
  const featured = Boolean(kit.badge);
  return (
    <article
      id={`kit-${kit.id}`}
      className={`relative flex flex-col rounded-[24px] bg-white ${
        featured ? 'border-2 border-rose shadow-[0_14px_36px_rgba(46,20,56,0.12)]' : 'border border-line'
      } ${kit.id === 'basico' ? 'md:order-1' : 'md:order-2'}`}
    >
      {kit.badge && (
        <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10 whitespace-nowrap rounded-full bg-plum text-white text-[12.5px] font-bold tracking-[0.1em] px-4 py-1.5">
          {kit.badge}
        </span>
      )}
      <div
        className={`aspect-[3/2] overflow-hidden bg-blush ${featured ? 'rounded-t-[22px]' : 'rounded-t-[23px]'}`}
      >
        <Picture
          img={kit.image}
          sizes="(min-width: 768px) 480px, calc(100vw - 32px)"
          className="block w-full h-full"
          imgClassName="w-full h-full object-cover block"
        />
      </div>
      <div className="flex flex-col flex-1 p-5 sm:p-6">
        <h3 className="font-display font-semibold text-plum text-[24px] leading-tight">{kit.name}</h3>
        <p className="mt-1 text-[15.5px] font-semibold text-rose-deep">
          {kit.materialsCount} materiais digitais
          {kit.bonusCount > 0 ? ` + ${kit.bonusCount} bônus` : ''}
        </p>
        <div className="mt-4 flex flex-wrap items-end gap-x-2 gap-y-1">
          <p className="font-display font-semibold text-plum text-[38px] min-[360px]:text-[42px] leading-none whitespace-nowrap">
            {formatBRL(kit.price)}
          </p>
          <p className="pb-1 text-muted text-[14px] whitespace-nowrap">pagamento único</p>
        </div>
        <ul className="mt-4 space-y-2">
          {kit.highlights.map((item) => (
            <li key={item} className="flex items-start gap-2.5 text-[15px] leading-[1.45]">
              <Check className="w-5 h-5 shrink-0 text-rose stroke-[2.5] mt-[1px]" aria-hidden="true" />
              <span>{item}</span>
            </li>
          ))}
        </ul>

        {kit.documentedBonuses.length > 0 && (
          <div className="mt-4 rounded-[16px] bg-blush px-4 py-3">
            <p className="flex items-center gap-2 text-[13px] font-semibold tracking-[0.06em] uppercase text-rose-deep">
              <Gift className="w-4 h-4" aria-hidden="true" />
              {kit.bonusCount} bônus, entre eles
            </p>
            <ul className="mt-2 space-y-1 text-[14.5px] leading-[1.45] text-ink">
              {kit.documentedBonuses.map((bonus) => (
                <li key={bonus}>• {bonus}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-auto pt-5">
          <CheckoutButton kit={kit} variant={featured ? 'solid' : 'outline'} />
        </div>
      </div>
    </article>
  );
}

export default function App() {
  const [openFaq, setOpenFaq] = useState<string | null>(FAQ[0]?.id ?? null);
  const [zoom, setZoom] = useState<PreviewItem | null>(null);
  const [legal, setLegal] = useState<LegalModalType>(null);
  const [showSticky, setShowSticky] = useState(false);

  const heroCtaRef = useRef<HTMLDivElement>(null);
  const kitsRef = useRef<HTMLElement>(null);
  const finalRef = useRef<HTMLElement>(null);

  // Barra fixa do celular: só depois que o botão do topo saiu da tela, e some
  // enquanto a seção de kits ou o fechamento (que já têm botões) estão visíveis.
  useEffect(() => {
    const hero = heroCtaRef.current;
    const kits = kitsRef.current;
    const final = finalRef.current;
    if (!hero || !kits || !final || typeof IntersectionObserver === 'undefined') return;
    const state = { heroPassed: false, kits: false, final: false };
    const observer = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.target === hero) state.heroPassed = !e.isIntersecting && e.boundingClientRect.top < 0;
        else if (e.target === kits) state.kits = e.isIntersecting;
        else if (e.target === final) state.final = e.isIntersecting;
      }
      setShowSticky(state.heroPassed && !state.kits && !state.final);
    });
    [hero, kits, final].forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Prévia ampliada: fecha com Esc e trava a rolagem do fundo.
  useEffect(() => {
    if (!zoom) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setZoom(null);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', onKey);
    };
  }, [zoom]);

  return (
    <div className="min-h-screen flex flex-col bg-cream text-ink font-sans antialiased">
      <header className="w-full border-b border-line">
        <div className="max-w-[1080px] mx-auto h-12 px-4 flex items-center justify-between">
          <span className="font-display font-semibold text-plum text-[17px]">
            Coleção Planner <span className="text-rose">2027</span>
          </span>
          <span className="hidden min-[360px]:inline-flex items-center gap-1.5 text-[13px] text-muted">
            <Lock className="w-3.5 h-3.5" aria-hidden="true" />
            Compra segura
          </span>
        </div>
      </header>

      <main className="flex-1">
        {/* 1. HERO */}
        <section className="px-4 pt-5 pb-10 sm:pt-10 sm:pb-14">
          <div className="max-w-[1080px] mx-auto grid grid-cols-1 md:grid-cols-[1.05fr_1fr] gap-x-10 gap-y-4 md:items-center">
            <div className="text-center md:text-left md:col-start-1 md:row-start-1">
              <p className="inline-block rounded-full bg-blush text-rose-deep px-3 py-1 text-[12.5px] font-semibold tracking-[0.06em] uppercase">
                Coleção digital · Planner 2027
              </p>
              <h1 className="mt-3 font-display font-semibold text-plum text-[26px] min-[360px]:text-[29px] min-[390px]:text-[31px] sm:text-[42px] md:text-[46px] leading-[1.1] tracking-[-0.01em]">
                Seu 2027 mais organizado começa por{' '}
                <span className="text-rose whitespace-nowrap">apenas {formatBRL(LOWEST_PRICE)}.</span>
              </h1>
              <p className="mt-3 text-muted text-[15.5px] sm:text-[18px] leading-[1.5] max-w-[540px] mx-auto md:mx-0">
                Materiais digitais prontos para organizar sua rotina, planejar seus objetivos e
                acompanhar seus hábitos.
              </p>
            </div>

            <div className="md:col-start-2 md:row-start-1 md:row-span-2">
              <Picture
                img={HERO_IMAGE}
                sizes="(min-width: 768px) 500px, calc(100vw - 32px)"
                priority
                imgClassName="w-full max-w-[420px] md:max-w-none mx-auto h-auto rounded-[20px] bg-blush block shadow-[0_10px_30px_rgba(46,20,56,0.10)]"
              />
            </div>

            <div ref={heroCtaRef} className="md:col-start-1 md:row-start-2 w-full max-w-[460px] mx-auto md:mx-0">
              <ul className="grid grid-cols-2 gap-2.5" aria-label="Kits disponíveis">
                {(['basico', 'premium'] as const).map((id) => {
                  const kit = KITS[id];
                  return (
                    <li
                      key={id}
                      className={`rounded-[16px] px-3 py-2.5 text-left ${
                        kit.badge ? 'bg-plum text-white' : 'bg-white border border-line text-plum'
                      }`}
                    >
                      <p className="text-[13px] font-semibold leading-tight">{kit.name}</p>
                      <p className={`text-[12.5px] leading-tight ${kit.badge ? 'text-white/80' : 'text-muted'}`}>
                        {kit.materialsCount} materiais{kit.bonusCount ? ` + ${kit.bonusCount} bônus` : ''}
                      </p>
                      <p className="mt-1 font-display font-semibold text-[21px] leading-none">{formatBRL(kit.price)}</p>
                    </li>
                  );
                })}
              </ul>
              <a
                href="#kits"
                className="mt-3.5 inline-flex items-center justify-center gap-2 w-full min-h-[56px] rounded-full bg-rose hover:bg-rose-deep text-white font-bold uppercase tracking-[0.02em] text-[16px] shadow-[0_6px_18px_rgba(194,33,130,0.28)] transition-colors"
              >
                Ver meus kits
                <ArrowDown className="w-5 h-5" aria-hidden="true" />
              </a>
              <ul className="mt-3 flex flex-wrap justify-center md:justify-start gap-x-4 gap-y-1 text-[13.5px] text-muted">
                <li className="inline-flex items-center gap-1.5"><Check className="w-4 h-4 text-rose" aria-hidden="true" />Pagamento único</li>
                <li className="inline-flex items-center gap-1.5"><Check className="w-4 h-4 text-rose" aria-hidden="true" />PDF em A4</li>
                <li className="inline-flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-rose" aria-hidden="true" />Garantia de 7 dias</li>
              </ul>
            </div>
          </div>
        </section>

        {/* 2. O QUE VOCÊ RECEBE */}
        <section id="materiais" className="bg-white border-y border-line px-4 py-12 sm:py-16">
          <div className="max-w-[1080px] mx-auto">
            <SectionHeading
              eyebrow="O que você recebe"
              title="Páginas prontas para cada parte da sua rotina"
              intro="Veja páginas reais da coleção. Toque na imagem para ampliar."
            />
            <ul className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              {PREVIEWS.map((item) => (
                <li key={item.id} className="flex md:flex-col items-center md:items-stretch gap-4 rounded-[18px] border border-line bg-cream p-3 md:p-4">
                  <button
                    type="button"
                    onClick={() => setZoom(item)}
                    aria-label={`Ampliar: ${item.title}`}
                    className="relative shrink-0 w-[112px] md:w-full rounded-[12px] overflow-hidden bg-blush cursor-zoom-in"
                  >
                    <Picture
                      img={item.thumb}
                      sizes="(min-width: 768px) 320px, 112px"
                      imgClassName="w-full h-auto block"
                    />
                    <span className="absolute bottom-1.5 right-1.5 w-7 h-7 rounded-full bg-white/90 text-plum flex items-center justify-center">
                      <ZoomIn className="w-4 h-4" aria-hidden="true" />
                    </span>
                  </button>
                  <div className="min-w-0 text-left">
                    {item.onlyIn && (
                      <p className="mb-1.5 inline-block rounded-full bg-plum text-white text-[12px] font-semibold tracking-[0.02em] px-2.5 py-0.5">
                        Só no {item.onlyIn}
                      </p>
                    )}
                    <h3 className="font-bold text-plum text-[17px] leading-snug">{item.title}</h3>
                    <p className="mt-1 text-muted text-[15px] leading-[1.5]">{item.benefit}</p>
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-7 text-center">
              <p className="text-[14px] font-semibold text-plum">Categorias da coleção</p>
              <p className="mt-3 text-[13px] text-muted">Nos dois kits</p>
              <ul className="mt-1.5 flex flex-wrap justify-center gap-2">
                {CATEGORIES.slice(0, BASIC_CATEGORY_COUNT).map((c) => (
                  <li key={c} className="rounded-full bg-blush px-3 py-1 text-[14px] text-rose-deep">{c}</li>
                ))}
              </ul>
              <p className="mt-4 text-[13px] text-muted">Só no Kit Premium</p>
              <ul className="mt-1.5 flex flex-wrap justify-center gap-2">
                {CATEGORIES.slice(BASIC_CATEGORY_COUNT).map((c) => (
                  <li key={c} className="rounded-full bg-blush px-3 py-1 text-[14px] text-rose-deep">{c}</li>
                ))}
              </ul>
              <p className="mt-4 text-muted text-[15px] leading-[1.5] max-w-[560px] mx-auto">
                Tudo em PDF, tamanho A4: imprima em casa ou na gráfica, ou abra no celular, no tablet e
                no computador.
              </p>
            </div>
          </div>
        </section>

        {/* 3. ESCOLHA SEU KIT */}
        <section id="kits" ref={kitsRef} className="scroll-mt-4 bg-blush px-4 py-12 sm:py-16">
          <div className="max-w-[1000px] mx-auto">
            <SectionHeading
              eyebrow="Escolha seu kit"
              title="Dois kits, pagamento único"
              intro={`Kit Básico por ${formatBRL(KITS.basico.price)} ou Kit Premium por ${formatBRL(KITS.premium.price)}${
                COMPARISON ? `: ${COMPARISON}.` : '.'
              }`}
            />
            <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-6 items-stretch">
              {KIT_ORDER.map((id) => (
                <KitCard key={id} kit={KITS[id]} />
              ))}
            </div>
            <ul className="mt-6 flex flex-wrap justify-center gap-x-5 gap-y-1.5 text-[14px] text-muted">
              <li className="inline-flex items-center gap-1.5"><Lock className="w-4 h-4 text-rose" aria-hidden="true" />Pagamento pela Cakto: Pix ou cartão</li>
              <li className="inline-flex items-center gap-1.5"><Mail className="w-4 h-4 text-rose" aria-hidden="true" />Acesso digital após a confirmação</li>
              <li className="inline-flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-rose" aria-hidden="true" />Garantia de 7 dias</li>
            </ul>
          </div>
        </section>

        {/* 4. CONFIANÇA E DÚVIDAS */}
        <section id="duvidas" className="bg-white border-y border-line px-4 py-12 sm:py-16">
          <div className="max-w-[1000px] mx-auto">
            <SectionHeading eyebrow="Compra segura" title="Dúvidas rápidas" />
            <div className="mt-8 grid grid-cols-1 md:grid-cols-[0.9fr_1.1fr] gap-6 md:gap-10 md:items-start">
              <div className="hidden md:block">
                <Picture
                  img={DELIVERY_IMAGE}
                  sizes="420px"
                  imgClassName="w-full h-auto rounded-[20px] bg-blush block"
                />
                <p className="mt-3 text-center text-muted text-[14px]">Use no celular ou imprima em A4.</p>
              </div>
              <div className="space-y-2.5">
                {FAQ.map((item) => {
                  const open = openFaq === item.id;
                  return (
                    <div key={item.id} className="rounded-[16px] border border-line bg-cream">
                      <button
                        type="button"
                        onClick={() => setOpenFaq(open ? null : item.id)}
                        aria-expanded={open}
                        aria-controls={`faq-${item.id}`}
                        className="w-full min-h-[56px] px-4 py-3 flex items-center justify-between gap-3 text-left font-semibold text-plum text-[16px] cursor-pointer"
                      >
                        <span>{item.question}</span>
                        <ChevronDown className={`w-5 h-5 shrink-0 text-rose transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
                      </button>
                      <div id={`faq-${item.id}`} hidden={!open} className="px-4 pb-4 text-muted text-[15px] leading-[1.6]">
                        {item.answer}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* 5. CTA FINAL */}
        <section ref={finalRef} className="px-4 py-12 sm:py-16">
          <div className="max-w-[720px] mx-auto rounded-[24px] bg-plum text-white text-center px-5 py-9 sm:px-10">
            <h2 className="font-display font-semibold text-[27px] sm:text-[34px] leading-[1.15]">
              Comece 2027 com tudo no lugar.
            </h2>
            <p className="mt-2.5 text-white/85 text-[15.5px] sm:text-[17px] leading-[1.55]">
              Escolha seu kit e receba os arquivos digitais assim que o pagamento for confirmado.
            </p>
            <div className="mt-6 grid gap-3 max-w-[420px] mx-auto">
              <CheckoutButton kit={KITS.premium} />
              <CheckoutButton kit={KITS.basico} variant="outline-light" />
            </div>
          </div>
        </section>
      </main>

      {/* Barra fixa do celular (sempre no HTML; só muda a visibilidade). */}
      <div
        aria-hidden={!showSticky}
        className={`md:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-line px-4 pt-2.5 pb-[calc(0.625rem+env(safe-area-inset-bottom,0px))] shadow-[0_-4px_16px_rgba(46,20,56,0.08)] flex items-center justify-between gap-3 transition-transform duration-200 ${
          showSticky ? 'translate-y-0 visible' : 'translate-y-full invisible'
        }`}
      >
        <p className="text-[14px] leading-tight text-plum">
          Kits a partir de <strong>{formatBRL(LOWEST_PRICE)}</strong>
          <span className="block text-[12.5px] text-muted">pagamento único</span>
        </p>
        <a
          href="#kits"
          tabIndex={showSticky ? undefined : -1}
          className="shrink-0 inline-flex items-center justify-center h-[46px] px-5 rounded-full bg-rose hover:bg-rose-deep text-white font-bold text-[14px] uppercase"
        >
          Ver kits
        </a>
      </div>

      <footer className="bg-plum-deep text-white/85 px-4 pt-7 pb-[calc(6rem+env(safe-area-inset-bottom,0px))] md:pb-7">
        <div className="max-w-[1080px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-[13.5px]">
          <p className="text-center sm:text-left">© 2026 Coleção Planner 2027 · Produto 100% digital</p>
          <nav aria-label="Links institucionais" className="flex flex-wrap items-center justify-center gap-1">
            {(
              [
                ['termos', 'Termos de Uso'],
                ['privacidade', 'Política de Privacidade'],
                ['contato', 'Contato'],
              ] as const
            ).map(([key, label]) => (
              <button key={key} type="button" onClick={() => setLegal(key)} className="min-h-[44px] px-2.5 text-white/90 hover:text-white cursor-pointer">
                {label}
              </button>
            ))}
          </nav>
        </div>
      </footer>

      {zoom && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={zoom.title}
          className="fixed inset-0 z-50 bg-plum-deep/85 flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && setZoom(null)}
        >
          <div className="relative w-full max-w-[560px]">
            <button
              type="button"
              onClick={() => setZoom(null)}
              aria-label="Fechar"
              autoFocus
              className="absolute -top-12 right-0 w-11 h-11 rounded-full bg-white text-plum flex items-center justify-center cursor-pointer"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
            <img
              src={zoom.full.src}
              alt={zoom.full.alt}
              width={zoom.full.width}
              height={zoom.full.height}
              className="block mx-auto w-auto max-w-full h-auto max-h-[80vh] rounded-[10px] bg-white"
            />
            <p className="mt-3 text-center text-white font-semibold text-[16px]">{zoom.title}</p>
          </div>
        </div>
      )}

      {legal && (
        <Suspense fallback={null}>
          <LegalModal activeModal={legal} onClose={() => setLegal(null)} />
        </Suspense>
      )}
    </div>
  );
}
