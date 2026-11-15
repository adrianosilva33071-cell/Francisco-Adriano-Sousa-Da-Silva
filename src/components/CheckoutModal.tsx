import React, { useEffect, useState } from 'react';
import { Check, Gift, ShieldCheck, Sparkles, X } from 'lucide-react';
import {
  KIT_OPTIONS,
  KitOption,
  validateCheckoutInput,
} from '../utils/catalogData';

interface CheckoutModalProps {
  selectedKitId: 'basico' | 'premium' | null;
  onClose: () => void;
  onSelectKit: (kitId: 'basico' | 'premium') => void;
}

export function CheckoutModal({
  selectedKitId,
  onClose,
  onSelectKit,
}: CheckoutModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'card'>('pix');
  const [error, setError] = useState<string | null>(null);
  const [completedKit, setCompletedKit] = useState<KitOption | null>(null);

  useEffect(() => {
    if (!selectedKitId) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedKitId, onClose]);

  if (!selectedKitId) return null;

  const currentKit = KIT_OPTIONS[selectedKitId];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateCheckoutInput({ name, email });
    if (!validation.valid) {
      setError(validation.error || 'Preencha os campos obrigatórios.');
      return;
    }
    setError(null);
    setCompletedKit(currentKit);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="checkout-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-lg rounded-[26px] border border-[#e4d9ed] bg-white p-6 md:p-8 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar janela de inscrição"
          className="absolute top-4 right-4 flex h-11 w-11 items-center justify-center rounded-full bg-[#fef8fc] text-[#6e6275] hover:bg-[#ffe9f8] hover:text-[#c22182] transition-colors cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {completedKit ? (
          <div className="text-center py-4">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#e6f9f1] text-[#00bc7d]">
              <Check className="h-8 w-8 stroke-[2.5]" />
            </div>
            <h3
              id="checkout-modal-title"
              className="font-display text-[28px] font-bold text-[#2a212f]"
            >
              Pedido Confirmado!
            </h3>
            <p className="mt-2 text-[15px] text-[#6e6275]">
              Olá, <strong className="text-[#2a212f]">{name.trim()}</strong>! O acesso ao{' '}
              <strong className="text-[#c22182]">{completedKit.name}</strong> ({completedKit.price}) foi
              preparado e enviado para <strong className="text-[#2a212f]">{email.trim()}</strong>.
            </p>
            <div className="mt-6 rounded-[18px] bg-[#f4eeff] p-4 text-left text-[14px] text-[#2a212f]">
              <p className="font-semibold text-[#6a2fc6] mb-2">Resumo da sua coleção liberada:</p>
              <ul className="space-y-1.5">
                {completedKit.highlightFeature && (
                  <li className="flex items-center gap-2 font-semibold text-[#e17100]">
                    <Sparkles className="h-4 w-4 shrink-0" />
                    {completedKit.highlightFeature}
                  </li>
                )}
                {completedKit.includedFeatures.slice(0, 3).map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-[#0f9f5c] shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="mt-6 w-full h-[52px] rounded-full bg-[#c22182] hover:bg-[#ad1c73] text-white font-semibold text-[14px] uppercase tracking-wide transition-colors cursor-pointer"
            >
              Voltar para a página
            </button>
          </div>
        ) : (
          <div>
            <span className="inline-block rounded-full bg-[#ffe4f7] px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider text-[#c22182]">
              Acesso Digital Imediato
            </span>
            <h3
              id="checkout-modal-title"
              className="mt-2 font-display text-[26px] font-bold text-[#2a212f]"
            >
              Finalizar {currentKit.name}
            </h3>
            <p className="mt-1 text-[14px] text-[#6e6275]">
              Receba todos os arquivos em alta qualidade no seu e-mail agora mesmo.
            </p>

            {/* Kit switcher / Upgrade banner if Básico is selected */}
            {selectedKitId === 'basico' && (
              <div className="mt-4 rounded-[18px] border border-[#7535e2]/30 bg-[#f4eeff] p-3.5 flex items-center justify-between gap-3">
                <div className="text-left">
                  <p className="text-[12px] font-bold uppercase text-[#6a2fc6] flex items-center gap-1.5">
                    <Gift className="h-3.5 w-3.5 text-[#e17100]" />
                    Oferta de Upgrade Especial
                  </p>
                  <p className="text-[13px] text-[#2a212f] mt-0.5">
                    Leve o <strong>KIT PREMIUM (100 modelos + 6 Bônus)</strong> por apenas{' '}
                    <strong className="text-[#00bc7d]">R$ 23,90</strong>!
                  </p>
                </div>
                <a
                  href={KIT_OPTIONS.premium.checkoutUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => onSelectKit('premium')}
                  className="shrink-0 inline-flex items-center justify-center rounded-full bg-[#6a2fc6] px-3.5 py-2 text-[11px] font-bold uppercase text-white hover:bg-[#5b2287] transition-colors cursor-pointer"
                >
                  Quero Premium
                </a>
              </div>
            )}

            <div className="mt-4 flex items-center justify-between rounded-[16px] border border-[#e4d9ed] bg-[#fef8fc] px-4 py-3">
              <div>
                <p className="font-display text-[17px] font-bold text-[#2a212f]">
                  {currentKit.name}
                </p>
                <p className="text-[12.5px] text-[#6e6275]">{currentKit.paymentNote}</p>
              </div>
              <div className="text-right">
                {currentKit.oldPrice && (
                  <p className="text-[12px] text-[#fb2c36] line-through">{currentKit.oldPrice}</p>
                )}
                <p className="font-display text-[24px] font-bold text-[#00bc7d]">
                  {currentKit.price}
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4" noValidate>
              <div>
                <label
                  htmlFor="checkout-name"
                  className="block text-[13px] font-medium text-[#2a212f] mb-1"
                >
                  Seu nome completo
                </label>
                <input
                  id="checkout-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Maria Oliveira"
                  className="w-full h-[46px] rounded-[14px] border border-[#e4d9ed] bg-white px-4 text-[14px] text-[#2a212f] focus:border-[#c22182] focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="checkout-email"
                  className="block text-[13px] font-medium text-[#2a212f] mb-1"
                >
                  Seu melhor e-mail (para receber os arquivos)
                </label>
                <input
                  id="checkout-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seuemail@exemplo.com"
                  className="w-full h-[46px] rounded-[14px] border border-[#e4d9ed] bg-white px-4 text-[14px] text-[#2a212f] focus:border-[#c22182] focus:outline-none"
                />
              </div>

              <div>
                <span className="block text-[13px] font-medium text-[#2a212f] mb-1.5">
                  Forma de pagamento
                </span>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('pix')}
                    className={`h-[42px] rounded-[12px] border text-[13px] font-semibold transition-colors cursor-pointer ${
                      paymentMethod === 'pix'
                        ? 'border-[#c22182] bg-[#ffe4f7]/60 text-[#c22182]'
                        : 'border-[#e4d9ed] bg-white text-[#6e6275]'
                    }`}
                  >
                    PIX (Liberação Imediata)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`h-[42px] rounded-[12px] border text-[13px] font-semibold transition-colors cursor-pointer ${
                      paymentMethod === 'card'
                        ? 'border-[#c22182] bg-[#ffe4f7]/60 text-[#c22182]'
                        : 'border-[#e4d9ed] bg-white text-[#6e6275]'
                    }`}
                  >
                    Cartão de Crédito
                  </button>
                </div>
              </div>

              {error && (
                <p role="alert" className="text-[13px] font-medium text-[#fb2c36]">
                  {error}
                </p>
              )}

              <a
                href={currentKit.checkoutUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-full h-[54px] rounded-full bg-[#c22182] hover:bg-[#ad1c73] text-white font-semibold text-[14px] uppercase tracking-wide shadow-[0_8px_24px_rgba(194,33,130,0.28)] transition-all cursor-pointer"
              >
                Confirmar e Receber Acesso ({currentKit.price})
              </a>

              <p className="flex items-center justify-center gap-1.5 text-[12px] text-[#6e6275]">
                <ShieldCheck className="h-4 w-4 text-[#0f9f5c]" />
                Compra 100% segura • Garantia incondicional de 7 dias
              </p>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
