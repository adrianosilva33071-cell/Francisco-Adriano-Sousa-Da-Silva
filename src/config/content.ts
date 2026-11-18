/**
 * Conteúdo da página (textos e imagens). Tudo aqui foi conferido nos arquivos
 * reais do produto (PDF de 100 páginas + PDFs dos bônus em C:\DANONE\ofertas).
 */

/**
 * E-mail de suporte mostrado ao cliente. Fica vazio até existir um endereço
 * que funcione: o antigo (suporte@planners2027.com.br) usa um domínio que não existe.
 */
export const SUPPORT_EMAIL = '';

export interface ResponsiveImage {
  src: string;
  srcSetAvif: string;
  srcSetWebp: string;
  width: number;
  height: number;
  alt: string;
}

const responsive = (
  name: string,
  widths: [number, number],
  size: { width: number; height: number },
  alt: string
): ResponsiveImage => ({
  src: `/assets/mockups/${name}-${widths[1]}.webp`,
  srcSetAvif: widths.map((w) => `/assets/mockups/${name}-${w}.avif ${w}w`).join(', '),
  srcSetWebp: widths.map((w) => `/assets/mockups/${name}-${w}.webp ${w}w`).join(', '),
  ...size,
  alt,
});

export const HERO_IMAGE = responsive(
  'hero',
  [800, 1520],
  { width: 1520, height: 1040 },
  'Páginas reais da Coleção Planner 2027 no tablet, no celular e impressas: Organizador Semanal, Registro de Hábitos, Metas Bem Definidas e Calendário Anual 2027'
);

export const DELIVERY_IMAGE = responsive(
  'entrega',
  [640, 1000],
  { width: 1000, height: 750 },
  'Página de metas aberta no celular ao lado das mesmas páginas impressas em A4'
);

export interface PreviewItem {
  id: string;
  title: string;
  benefit: string;
  thumb: ResponsiveImage;
  full: string;
}

const preview = (name: string, alt: string): { thumb: ResponsiveImage; full: string } => ({
  thumb: responsive(name, [600, 1200], { width: 1200, height: 1200 }, alt),
  full: `/assets/mockups/${name}-1200.webp`,
});

export const PREVIEWS: PreviewItem[] = [
  {
    id: 'semanal',
    title: 'Organizador semanal',
    benefit: 'Distribua as tarefas de segunda a domingo, defina 3 prioridades e acompanhe hábitos da semana.',
    ...preview('prev-semanal', 'Páginas impressas do Organizador Semanal e do Planejador Mensal'),
  },
  {
    id: 'financeiro',
    title: 'Controle financeiro',
    benefit: 'Compare o planejado com o realizado, anote os gastos do dia e acompanhe sua meta de economia.',
    ...preview(
      'prev-financeiro',
      'Páginas impressas de Orçamento Mensal, Controle de Despesas Diárias e Planejamento de Economia'
    ),
  },
  {
    id: 'metas',
    title: 'Planejamento de metas',
    benefit: 'Escreva o objetivo, o porquê, os próximos passos e o prazo de cada meta de 2027.',
    ...preview('prev-metas', 'Páginas impressas de Metas Bem Definidas e Visão Anual de Metas'),
  },
];

/** Categorias que existem no PDF da coleção (cabeçalho de cada página). */
export const CATEGORIES: string[] = [
  'Planejamento',
  'Metas e objetivos',
  'Rotina e hábitos',
  'Finanças',
  'Bem-estar',
  'Casa e rotina',
  'Estudos',
  'Projetos e trabalho',
  'Conteúdo e negócios',
  'Viagens e eventos',
];

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

/**
 * Perguntas sem as palavras que a UTMify usa para detectar checkout em botões
 * (comprar, compra, finalizar, confirmar...): assim abrir uma dúvida nunca
 * gera um InitiateCheckout falso. O teste automatizado confere isso.
 */
export const FAQ: FaqItem[] = [
  {
    id: 'digital',
    question: 'O produto é digital?',
    answer:
      'Sim. Você recebe arquivos em PDF, no tamanho A4. Nada é enviado pelos Correios.',
  },
  {
    id: 'acesso',
    question: 'Como recebo os materiais?',
    answer:
      'Depois que o pagamento é confirmado, o acesso chega no e-mail que você informar no checkout. No Pix isso costuma levar poucos minutos; no cartão, acontece logo após a aprovação.',
  },
  {
    id: 'imprimir',
    question: 'Posso imprimir?',
    answer:
      'Pode. As páginas funcionam em impressora comum ou em qualquer gráfica rápida, e você pode imprimir de novo sempre que precisar, para uso pessoal. Se preferir, abra os arquivos no celular, tablet ou computador.',
  },
  {
    id: 'pagamento',
    question: 'O pagamento é único?',
    answer: 'Sim. Você paga uma vez só, sem mensalidade e sem assinatura.',
  },
  {
    id: 'garantia',
    question: 'Existe garantia?',
    answer:
      'Sim, 7 dias a partir do pagamento. Se o material não for para você, peça o reembolso dentro desse prazo.',
  },
  {
    id: 'diferenca',
    question: 'Qual a diferença entre os kits?',
    answer:
      'O Kit Básico tem 100 materiais digitais. O Kit Premium tem 300 materiais digitais e 10 bônus complementares.',
  },
];
