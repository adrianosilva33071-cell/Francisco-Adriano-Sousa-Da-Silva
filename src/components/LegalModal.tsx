import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { SUPPORT_EMAIL } from '../config/content';

export type LegalModalType = 'termos' | 'privacidade' | 'contato' | null;

interface LegalModalProps {
  activeModal: LegalModalType;
  onClose: () => void;
}

const CONTENT: Record<Exclude<LegalModalType, null>, { title: string; body: string[] }> = {
  termos: {
    title: 'Termos de Uso',
    body: [
      'Ao adquirir a Coleção Planner 2027, você recebe uma licença de uso pessoal para baixar, imprimir e usar os materiais quantas vezes precisar. Não é permitido revender ou redistribuir os arquivos.',
      'Os materiais são digitais, em PDF no tamanho A4. Nenhum item físico é enviado.',
      'Você tem 7 dias corridos a partir do pagamento para pedir o reembolso, se o material não for para você.',
    ],
  },
  privacidade: {
    title: 'Política de Privacidade',
    body: [
      'O pagamento e os dados da compra (nome, e-mail, CPF e forma de pagamento) são processados pela Cakto, plataforma de checkout. Esses dados são usados para liberar o acesso e para o suporte.',
      'Esta página usa o Pixel da Meta e a UTMify para medir os resultados dos anúncios, como visitas e cliques para o checkout. Essas ferramentas podem usar cookies e identificadores do navegador.',
      'Você pode limitar esse rastreamento nas configurações de privacidade do seu navegador e da sua conta da Meta.',
    ],
  },
  contato: {
    title: 'Atendimento',
    body: [
      SUPPORT_EMAIL
        ? `Dúvidas sobre acesso, download ou reembolso: ${SUPPORT_EMAIL}`
        : 'Dúvidas sobre acesso, download ou reembolso: use o contato de suporte informado no e-mail de confirmação da sua compra.',
    ],
  },
};

export function LegalModal({ activeModal, onClose }: LegalModalProps) {
  useEffect(() => {
    if (!activeModal) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activeModal, onClose]);

  if (!activeModal) return null;
  const current = CONTENT[activeModal];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-plum-deep/70 p-3 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="legal-modal-title"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative w-full max-w-md max-h-[calc(100dvh-24px)] overflow-y-auto overscroll-contain rounded-[24px] border border-line bg-white p-5 sm:p-7 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar"
          className="absolute top-3 right-3 flex h-11 w-11 items-center justify-center rounded-full bg-cream text-muted hover:bg-blush hover:text-rose transition-colors cursor-pointer"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
        <h3 id="legal-modal-title" className="font-display font-semibold text-[24px] text-plum pr-10">
          {current.title}
        </h3>
        <div className="mt-3.5 space-y-3 text-[15px] leading-[1.6] text-muted">
          {current.body.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="mt-5 w-full min-h-[48px] rounded-full bg-rose hover:bg-rose-deep text-white font-semibold text-[14px] uppercase tracking-wide transition-colors cursor-pointer"
        >
          Entendi
        </button>
      </div>
    </div>
  );
}

export default LegalModal;
