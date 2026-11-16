import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export type LegalModalType = 'termos' | 'privacidade' | 'contato' | null;

interface LegalModalProps {
  activeModal: LegalModalType;
  onClose: () => void;
}

export function LegalModal({ activeModal, onClose }: LegalModalProps) {
  useEffect(() => {
    if (!activeModal) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeModal, onClose]);

  if (!activeModal) return null;

  const contentMap = {
    termos: {
      title: 'Termos de Uso',
      body: [
        'Ao adquirir a Coleção Planner 2027, você recebe uma licença de uso pessoal para baixar, imprimir e montar seus materiais quantas vezes desejar.',
        'Os arquivos são disponibilizados em formato digital de alta qualidade (A4), prontos para impressão doméstica ou em gráfica rápida.',
        'Você possui garantia de 7 dias corridos após a compra para conhecer o material e solicitar o reembolso conforme as condições da garantia.',
      ],
    },
    privacidade: {
      title: 'Política de Privacidade',
      body: [
        'Seus dados cadastrais (nome e e-mail) são utilizados exclusivamente para a entrega do acesso aos arquivos digitais e suporte ao cliente.',
        'Não compartilhamos suas informações pessoais com terceiros e utilizamos conexão criptografada em todas as etapas do processamento.',
      ],
    },
    contato: {
      title: 'Atendimento e Suporte Humanizado',
      body: [
        'Precisa de ajuda para acessar, baixar ou utilizar seus materiais do Kit Premium? Nossa equipe de suporte humanizado está pronta para atender você.',
        'E-mail oficial de suporte: suporte@planners2027.com.br',
        'Horário de atendimento: Segunda a Sexta, das 09h às 18h.',
      ],
    },
  };

  const current = contentMap[activeModal];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#29202A]/70 p-3 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="legal-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-md max-h-[calc(100dvh-24px)] overflow-y-auto overscroll-contain rounded-[24px] border border-[#FCE8F1] bg-white p-5 sm:p-7 shadow-2xl animate-modal-enter">
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar informações"
          className="absolute top-3 right-3 flex h-11 w-11 items-center justify-center rounded-full bg-[#FFF6FA] text-[#5e5061] hover:bg-[#FCE8F1] hover:text-[#F01579] transition-colors cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        <h3
          id="legal-modal-title"
          className="font-display text-[22px] sm:text-[24px] font-bold text-[#29202A] pr-10"
        >
          {current.title}
        </h3>
        <div className="mt-3.5 space-y-3 text-[14px] sm:text-[14.5px] leading-[1.6] text-[#534656]">
          {current.body.map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="mt-5 w-full min-h-[48px] rounded-full bg-[#F01579] hover:bg-[#d4116a] active:scale-[0.99] text-white font-semibold text-[13.5px] uppercase tracking-wide transition-all cursor-pointer"
        >
          Entendi
        </button>
      </div>
    </div>
  );
}

export default LegalModal;
