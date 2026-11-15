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
        'Ao adquirir a coleção digital Planners e Organizadores 2027, você recebe uma licença de uso para baixar, imprimir e montar seus materiais quantas vezes desejar.',
        'Os arquivos são disponibilizados em formato digital de alta qualidade (A4), prontos para impressão doméstica ou em gráfica rápida.',
        'Você possui garantia incondicional de 7 dias corridos após a compra para avaliar todo o material com total tranquilidade.',
      ],
    },
    privacidade: {
      title: 'Política de Privacidade',
      body: [
        'Seus dados cadastrais (nome e e-mail) são utilizados exclusivamente para o envio imediato do link de acesso aos arquivos digitais e suporte ao cliente.',
        'Não compartilhamos suas informações pessoais com terceiros e utilizamos conexão criptografada em todas as etapas do processamento.',
      ],
    },
    contato: {
      title: 'Atendimento e Suporte',
      body: [
        'Precisa de ajuda para acessar ou imprimir seus planners e organizadores? Nossa equipe de suporte está pronta para atender você.',
        'E-mail de suporte: suporte@planners2027.com.br',
        'Horário de atendimento: Segunda a Sexta, das 09h às 18h.',
      ],
    },
  };

  const current = contentMap[activeModal];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="legal-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-md rounded-[24px] border border-[#e4d9ed] bg-white p-6 md:p-7 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar informações"
          className="absolute top-3.5 right-3.5 flex h-11 w-11 items-center justify-center rounded-full bg-[#fef8fc] text-[#6e6275] hover:bg-[#ffe9f8] hover:text-[#c22182] transition-colors cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        <h3
          id="legal-modal-title"
          className="font-display text-[24px] font-bold text-[#2a212f]"
        >
          {current.title}
        </h3>
        <div className="mt-4 space-y-3 text-[14.5px] leading-[1.6] text-[#6e6275]">
          {current.body.map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full h-[46px] rounded-full bg-[#c22182] hover:bg-[#ad1c73] text-white font-semibold text-[13.5px] uppercase tracking-wide transition-colors cursor-pointer"
        >
          Entendi
        </button>
      </div>
    </div>
  );
}
