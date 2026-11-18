/**
 * Conteúdo da página (textos e imagens). Tudo aqui foi conferido nos arquivos
 * reais do produto (pasta "Planner-2027-Kit-Premium-para-clientes": índice,
 * 300 materiais em 12 categorias e 10 bônus). As imagens mostram páginas reais
 * desses PDFs. O Kit Básico entrega os materiais 001 a 100 (4 primeiras categorias).
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
  'hero-v2',
  [800, 1520],
  { width: 1520, height: 1040 },
  'Páginas reais da Coleção Planner 2027: Calendário anual 2027 no tablet, Planejamento semanal clássico e Rotina da manhã no celular, e as páginas impressas Janeiro 2027 e Mapa dos sonhos para 2027'
);

export const DELIVERY_IMAGE = responsive(
  'entrega-v2',
  [640, 1000],
  { width: 1000, height: 750 },
  'Calendário de Janeiro 2027 aberto no celular ao lado da mesma página impressa em A4, com o Calendário anual 2027 atrás'
);

export interface PreviewItem {
  id: string;
  title: string;
  benefit: string;
  /** Preenchido quando a página não vem nos dois kits (ex.: "Kit Premium"). */
  onlyIn?: string;
  thumb: ResponsiveImage;
  /** Página inteira, sem fundo, mostrada na prévia ampliada. */
  full: { src: string; width: number; height: number; alt: string };
}

/** `page` é o título impresso na página mostrada em destaque. */
const preview = (name: string, page: string, alt: string): Pick<PreviewItem, 'thumb' | 'full'> => ({
  thumb: responsive(`${name}-v2`, [600, 1200], { width: 1200, height: 1200 }, alt),
  full: {
    src: `/assets/mockups/${name}-pagina-1000.webp`,
    width: 1000,
    height: 1414,
    alt: `Página ${page} inteira, como vem no PDF`,
  },
});

export const PREVIEWS: PreviewItem[] = [
  {
    id: 'semanal',
    title: 'Planejamento semanal',
    benefit: 'Os 7 dias em uma página: compromissos de segunda a domingo, o foco da semana e o que você aprendeu.',
    ...preview(
      'prev-semanal',
      'Planejamento semanal clássico',
      'Página Planejamento semanal clássico, com espaço de segunda a domingo e quadro de aprendizado da semana, sobre a página Checklist de início de semana'
    ),
  },
  {
    id: 'financeiro',
    title: 'Controle financeiro',
    benefit: 'Anote entradas e saídas com data e categoria e feche o período sabendo o seu saldo.',
    onlyIn: 'Kit Premium',
    ...preview(
      'prev-financeiro',
      'Controle de receitas e despesas',
      'Página Controle de receitas e despesas, com colunas de data, descrição, categoria, entrada e saída e quadro de saldo do período, sobre a página Orçamento mensal doméstico'
    ),
  },
  {
    id: 'metas',
    title: 'Planejamento de metas',
    benefit: 'Decida o que quer manter, começar, reduzir e transformar em 2027 e escreva a próxima ação.',
    ...preview(
      'prev-metas',
      'Mapa dos sonhos para 2027',
      'Página Mapa dos sonhos para 2027, com os campos o que quero manter, começar, reduzir e transformar, sobre a página Metas pessoais do ano'
    ),
  },
];

/**
 * As 12 categorias do índice do kit, na ordem dos materiais (25 em cada).
 * O Kit Básico traz as 4 primeiras (materiais 001 a 100); o Premium, todas.
 */
export const CATEGORIES: string[] = [
  'Rotina e tempo',
  'Semanas e tarefas',
  'Calendários e datas 2027',
  'Metas e projetos',
  'Hábitos e constância',
  'Finanças pessoais',
  'Casa e vida prática',
  'Estudos e aprendizado',
  'Trabalho e produtividade',
  'Autocuidado e equilíbrio',
  'Família e relações',
  'Revisões e recomeços',
];

/** Quantas categorias (do começo da lista acima) vêm no Kit Básico. */
export const BASIC_CATEGORY_COUNT = 4;

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
