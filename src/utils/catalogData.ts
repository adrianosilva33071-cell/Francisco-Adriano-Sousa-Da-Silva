export interface CarouselModel {
  id: number;
  title: string;
  useCaseTitle: string;
  useCaseDescription: string;
  benefitText: string;
  image: string;
}

export interface PainPointItem {
  id: string;
  text: string;
}

export interface ProductDemoItem {
  id: string;
  number: string;
  name: string;
  explanation: string;
  benefit: string;
  image: string;
}

export interface StepItem {
  step: number;
  title: string;
  description: string;
  image: string;
}

export interface BonusItem {
  number: string;
  title: string;
  benefitTag: string;
  description: string;
  originalPrice?: string;
  image: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface KitOption {
  id: 'basico' | 'premium';
  name: string;
  subtitle?: string;
  idealFor: string;
  badge?: string;
  oldPrice?: string;
  price: string;
  priceNumeric: number;
  savingsText?: string;
  paymentNote: string;
  highlightFeature?: string;
  includedFeatures: string[];
  excludedFeatures?: string[];
  bonuses?: string[];
  ctaLabel: string;
  checkoutUrl: string;
}

export const CAKTO_BASICO_URL = 'https://pay.cakto.com.br/85z54d3_1324900';
export const CAKTO_PREMIUM_URL = 'https://pay.cakto.com.br/n8msmyw';
/**
 * Link específico do checkout promocional do Kit Premium por R$ 19,90 (Upsell).
 */
export const CAKTO_PREMIUM_UPSELL_URL = 'https://pay.cakto.com.br/xhx8yqu';

export interface UpsellModalContent {
  headline: string;
  subheadline: string;
  productTitle: string;
  originalPrice: string;
  promotionalPrice: string;
  promotionalPriceNumeric: number;
  highlightBadge: string;
  acceptCtaLabel: string;
  declineCtaLabel: string;
}

export const UPSELL_MODAL_CONTENT: UpsellModalContent = {
  headline: 'OFERTA EXCLUSIVA PARA VOCÊ!',
  subheadline: 'Que tal levar a coleção completa?',
  productTitle: 'KIT PREMIUM — PLANNER 2027',
  originalPrice: 'R$ 29,90',
  promotionalPrice: 'R$ 19,90',
  promotionalPriceNumeric: 19.9,
  highlightBadge: 'CONDIÇÃO ESPECIAL DISPONÍVEL NESTA OFERTA!',
  acceptCtaLabel: 'SIM! QUERO MEU PREMIUM POR R$ 19,90',
  declineCtaLabel: 'Não, obrigado. Quero continuar com o plano básico',
};

export function resolveUpsellAction(
  decision: 'accept' | 'decline',
  configuredUpsellUrl: string = CAKTO_PREMIUM_UPSELL_URL
): {
  status: 'redirect' | 'missing_upsell_url';
  targetUrl: string | null;
  kitName: string;
  priceNumeric: number;
} {
  if (decision === 'decline') {
    return {
      status: 'redirect',
      targetUrl: CAKTO_BASICO_URL,
      kitName: 'KIT BÁSICO',
      priceNumeric: 9.9,
    };
  }

  const trimmedUpsell = configuredUpsellUrl.trim();
  // Never allow the R$ 29,90 checkout URL to masquerade as the R$ 19,90 upsell URL
  if (!trimmedUpsell || trimmedUpsell === CAKTO_PREMIUM_URL) {
    return {
      status: 'missing_upsell_url',
      targetUrl: null,
      kitName: 'KIT PREMIUM (UPSELL R$ 19,90)',
      priceNumeric: UPSELL_MODAL_CONTENT.promotionalPriceNumeric,
    };
  }

  return {
    status: 'redirect',
    targetUrl: trimmedUpsell,
    kitName: 'KIT PREMIUM (UPSELL R$ 19,90)',
    priceNumeric: UPSELL_MODAL_CONTENT.promotionalPriceNumeric,
  };
}

export const PROMO_DATE_TEXT = 'OFERTA EXCLUSIVA • POR TEMPO LIMITADO';

export const HERO_PLANNER_IMAGE = '/assets/planners/hero-planner.webp';
export const GUARANTEE_BADGE_IMAGE = '/assets/planners/selo-garantia.webp';

export function toAvifUrl(webpPath: string): string {
  return webpPath.replace(/\.webp$/i, '.avif');
}

export function getResponsiveImageSources(
  webpPath: string,
  mobileVariant?: { suffix: string; widthDescriptor: string; fullWidthDescriptor: string }
): {
  avifSrcSet: string;
  webpSrcSet: string;
  fallbackWebp: string;
} {
  const baseAvif = toAvifUrl(webpPath);
  if (!mobileVariant) {
    return {
      avifSrcSet: baseAvif,
      webpSrcSet: webpPath,
      fallbackWebp: webpPath,
    };
  }
  const mobileWebp = webpPath.replace(/\.webp$/i, `-${mobileVariant.suffix}.webp`);
  const mobileAvif = webpPath.replace(/\.webp$/i, `-${mobileVariant.suffix}.avif`);
  return {
    avifSrcSet: `${mobileAvif} ${mobileVariant.widthDescriptor}, ${baseAvif} ${mobileVariant.fullWidthDescriptor}`,
    webpSrcSet: `${mobileWebp} ${mobileVariant.widthDescriptor}, ${webpPath} ${mobileVariant.fullWidthDescriptor}`,
    fallbackWebp: webpPath,
  };
}

export function formatBrazilianDate(date: Date): string {
  const day = String(date.getUTCDate()).padStart(2, '0');
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const year = date.getUTCFullYear();
  return `${day}/${month}/${year}`;
}

export function calculateSavings(originalPrice: number, currentPrice: number): number {
  if (originalPrice <= currentPrice) return 0;
  return Number((originalPrice - currentPrice).toFixed(2));
}

export function formatCurrencyBRL(amount: number): string {
  return `R$ ${amount.toFixed(2).replace('.', ',')}`;
}

export function getNextCarouselIndex(
  currentIndex: number,
  total: number,
  direction: 'next' | 'prev'
): number {
  if (total <= 0) return 0;
  if (direction === 'next') {
    return (currentIndex + 1) % total;
  }
  return (currentIndex - 1 + total) % total;
}

export function ensureWritableWindowFetch(target: Record<string, unknown>): boolean {
  try {
    let currentFetch = typeof target.fetch === 'function' ? target.fetch : undefined;
    const desc = Object.getOwnPropertyDescriptor(target, 'fetch');
    if (desc && desc.configurable === false) {
      return false;
    }
    Object.defineProperty(target, 'fetch', {
      configurable: true,
      enumerable: true,
      get() {
        return currentFetch;
      },
      set(fn: unknown) {
        if (typeof fn === 'function') {
          currentFetch = fn;
        }
      },
    });
    return true;
  } catch {
    return false;
  }
}

export const PAIN_POINTS: PainPointItem[] = [
  {
    id: 'semana-tarefas',
    text: 'Começa a semana com várias tarefas, mas não consegue organizar tudo.',
  },
  {
    id: 'esquece-compromissos',
    text: 'Esquece compromissos e atividades importantes.',
  },
  {
    id: 'metas-depois',
    text: 'Define metas, mas acaba deixando tudo para depois.',
  },
  {
    id: 'controlar-gastos',
    text: 'Quer controlar melhor os gastos, mas não sabe por onde começar.',
  },
  {
    id: 'falta-planejamento',
    text: 'Sente que precisa de mais planejamento no dia a dia.',
  },
  {
    id: 'acompanhar-habitos',
    text: 'Gostaria de acompanhar seus hábitos e sua evolução.',
  },
];

export const PRODUCT_DEMO_ITEMS: ProductDemoItem[] = [
  {
    id: 'demo-semanal',
    number: '01',
    name: 'PLANNER SEMANAL',
    explanation: 'Organize suas atividades e compromissos ao longo da semana.',
    benefit: 'Benefício: visualize prioridades de segunda a domingo e comece a semana com clareza.',
    image: '/assets/planners/planejamento-semanal.webp',
  },
  {
    id: 'demo-habitos',
    number: '02',
    name: 'CONTROLE DE HÁBITOS',
    explanation: 'Acompanhe seus hábitos e visualize sua consistência.',
    benefit: 'Benefício: mantenha o foco diário em rotina saudável, estudos, leitura e autocuidado.',
    image: '/assets/planners/controle-habitos.webp',
  },
  {
    id: 'demo-tarefas',
    number: '03',
    name: 'LISTA DE TAREFAS',
    explanation: 'Registre suas atividades e mantenha suas prioridades visíveis.',
    benefit: 'Benefício: tire as pendências da cabeça e acompanhe cada etapa concluída.',
    image: '/assets/planners/lista-tarefas.webp',
  },
  {
    id: 'demo-mensal',
    number: '04',
    name: 'PLANEJAMENTO MENSAL',
    explanation: 'Visualize seus compromissos e organize seu mês.',
    benefit: 'Benefício: antecipe datas importantes, prazos e eventos em uma única página.',
    image: '/assets/planners/calendario-mensal.webp',
  },
  {
    id: 'demo-financeiro',
    number: '05',
    name: 'CONTROLE FINANCEIRO',
    explanation: 'Registre receitas e despesas para acompanhar melhor suas finanças.',
    benefit: 'Benefício: saiba exatamente para onde vai seu dinheiro e planeje seus gastos.',
    image: '/assets/planners/planejamento-financeiro.webp',
  },
  {
    id: 'demo-metas',
    number: '06',
    name: 'PLANEJAMENTO DE METAS',
    explanation: 'Defina seus objetivos de 2027 e acompanhe seus próximos passos.',
    benefit: 'Benefício: transforme planos anuais em metas práticas e possíveis de realizar.',
    image: '/assets/planners/metas.webp',
  },
];

export const CAROUSEL_MODELS: CarouselModel[] = [
  {
    id: 1,
    title: 'Capa do Planner 2027',
    useCaseTitle: 'Capas delicadas e inspiradoras',
    useCaseDescription: 'Monte seu planner com visual encantador para usar ao longo de 2027.',
    benefitText: 'Organização diária com visual agradável',
    image: '/assets/planners/planner-capa.webp',
  },
  {
    id: 2,
    title: 'Planejamento semanal',
    useCaseTitle: 'Planner semanal',
    useCaseDescription: 'Organize suas atividades e compromissos ao longo da semana.',
    benefitText: 'Mais clareza para começar cada semana',
    image: '/assets/planners/planejamento-semanal.webp',
  },
  {
    id: 3,
    title: 'Controle de hábitos',
    useCaseTitle: 'Controle de hábitos',
    useCaseDescription: 'Acompanhe seus hábitos e visualize sua consistência.',
    benefitText: 'Acompanhamento visual da sua evolução',
    image: '/assets/planners/controle-habitos.webp',
  },
  {
    id: 4,
    title: 'Calendário mensal',
    useCaseTitle: 'Planejamento mensal',
    useCaseDescription: 'Visualize seus compromissos e organize seu mês.',
    benefitText: 'Visão completa das datas do mês',
    image: '/assets/planners/calendario-mensal.webp',
  },
  {
    id: 5,
    title: 'Página de metas',
    useCaseTitle: 'Planejamento de metas',
    useCaseDescription: 'Transforme seus planos de 2027 em etapas práticas.',
    benefitText: 'Foco nos seus objetivos do ano',
    image: '/assets/planners/metas.webp',
  },
  {
    id: 6,
    title: 'Lista de tarefas',
    useCaseTitle: 'Lista de tarefas',
    useCaseDescription: 'Registre suas atividades e mantenha suas prioridades visíveis.',
    benefitText: 'Prioridades sempre organizadas',
    image: '/assets/planners/lista-tarefas.webp',
  },
  {
    id: 7,
    title: 'Planejamento financeiro',
    useCaseTitle: 'Controle financeiro',
    useCaseDescription: 'Registre receitas e despesas para acompanhar melhor suas finanças.',
    benefitText: 'Mais controle sobre seus gastos',
    image: '/assets/planners/planejamento-financeiro.webp',
  },
  {
    id: 8,
    title: 'Organizador diário',
    useCaseTitle: 'Organização de compromissos',
    useCaseDescription: 'Organize horários, prioridades do dia e anotações rápidas.',
    benefitText: 'Rotina diária mais estruturada',
    image: '/assets/planners/organizador-diario.webp',
  },
];

export const STEP_ITEMS: StepItem[] = [
  {
    step: 1,
    title: '1. Acesse seus arquivos digitais',
    description:
      'Após a confirmação do pagamento, você recebe o acesso para baixar seus materiais no celular ou computador.',
    image: '/assets/planners/passo-download.webp',
  },
  {
    step: 2,
    title: '2. Imprima em casa ou na gráfica',
    description:
      'Os modelos podem ser impressos em impressora comum, sem precisar de máquina de corte.',
    image: '/assets/planners/passo-impressao.webp',
  },
  {
    step: 3,
    title: '3. Comece a organizar seu 2027',
    description:
      'Utilize em pasta, fichário, prancheta ou encaderne como preferir para acompanhar sua rotina.',
    image: '/assets/planners/passo-utilizacao.webp',
  },
];

export const BONUS_ITEMS: BonusItem[] = [
  {
    number: '01',
    title: 'GUIA DE ORGANIZAÇÃO E PRODUTIVIDADE',
    benefitTag: 'BÔNUS PREMIUM',
    description: 'Material complementar com orientações para organizar sua rotina.',
    image: '/assets/planners/bonus-organizacao.webp',
  },
  {
    number: '02',
    title: 'CONTROLE FINANCEIRO PESSOAL',
    benefitTag: 'BÔNUS PREMIUM',
    description: 'Ferramenta para registrar e acompanhar receitas e despesas.',
    image: '/assets/planners/bonus-financeiro.webp',
  },
  {
    number: '03',
    title: 'PLANNER FINANCEIRO MENSAL',
    benefitTag: 'BÔNUS PREMIUM',
    description: 'Material para organizar seu planejamento financeiro mensal.',
    image: '/assets/planners/bonus-planner.webp',
  },
  {
    number: '04',
    title: 'PACK DE LISTAS E ORGANIZADORES EXTRAS',
    benefitTag: 'BÔNUS PREMIUM',
    description: 'Modelos adicionais para organizar atividades e tarefas.',
    image: '/assets/planners/bonus-listas.webp',
  },
  {
    number: '05',
    title: 'PLANNER DE METAS E OBJETIVOS',
    benefitTag: 'BÔNUS PREMIUM',
    description: 'Material complementar para registrar e acompanhar objetivos.',
    image: '/assets/planners/metas.webp',
  },
  {
    number: '06',
    title: 'ATUALIZAÇÕES INCLUÍDAS',
    benefitTag: 'BÔNUS PREMIUM',
    description:
      'Acesso às atualizações da coleção conforme as condições reais de entrega da oferta.',
    image: '/assets/planners/planner-capa.webp',
  },
];

export const SUPPORT_HIGHLIGHTS: string[] = [
  'Ajuda com o acesso aos arquivos.',
  'Orientação para baixar os materiais.',
  'Ajuda com dúvidas sobre a utilização.',
  'Atendimento humanizado.',
];

export const KIT_OPTIONS: Record<'basico' | 'premium', KitOption> = {
  basico: {
    id: 'basico',
    name: 'KIT BÁSICO',
    subtitle: '50 MATERIAIS DE ORGANIZAÇÃO',
    idealFor: 'Tudo o que você precisa para começar a organizar sua rotina em 2027.',
    price: 'R$ 9,90',
    priceNumeric: 9.9,
    paymentNote: 'Pagamento único • Acesso após confirmação do pagamento',
    includedFeatures: [
      'Planners semanais.',
      'Calendários mensais.',
      'Listas de tarefas.',
      'Controle de hábitos.',
      'Planejamento de metas.',
      'Arquivos digitais A4 prontos para imprimir.',
      'Acesso após confirmação do pagamento.',
      'Garantia de 7 dias.',
    ],
    ctaLabel: 'QUERO O KIT BÁSICO',
    checkoutUrl: CAKTO_BASICO_URL,
  },
  premium: {
    id: 'premium',
    name: 'KIT PREMIUM',
    subtitle: '150 MATERIAIS DE ORGANIZAÇÃO',
    badge: 'MAIS COMPLETO',
    idealFor:
      'A coleção mais completa para organizar sua rotina, acompanhar suas metas e cuidar melhor das suas finanças durante 2027.',
    oldPrice: 'R$ 59,90',
    price: 'R$ 29,90',
    priceNumeric: 29.9,
    paymentNote: 'Pagamento único • Sem mensalidades • Acesso digital • Garantia de 7 dias.',
    highlightFeature: 'Tudo do Kit Básico.',
    includedFeatures: [
      '150 materiais digitais.',
      'Maior variedade de capas e layouts.',
      'Mais opções de planejamento.',
      'Materiais de organização pessoal.',
      '6 bônus complementares.',
      'Suporte humanizado.',
      'Atualizações incluídas conforme as condições da oferta.',
      'Acesso após confirmação do pagamento.',
      'Garantia de 7 dias.',
    ],
    bonuses: [
      'Guia de Organização e Produtividade.',
      'Controle Financeiro Pessoal.',
      'Planner Financeiro Mensal.',
      'Pack de Listas e Organizadores Extras.',
      'Planner de Metas e Objetivos.',
      'Atualizações incluídas.',
    ],
    ctaLabel: 'SIM, QUERO MEU KIT PREMIUM',
    checkoutUrl: CAKTO_PREMIUM_URL,
  },
};

export const FAQ_ITEMS: FaqItem[] = [
  {
    id: 'como-recebo',
    question: 'Como recebo os materiais?',
    answer:
      'Os materiais são digitais e o acesso ocorre após a confirmação do pagamento, conforme o sistema de entrega configurado.',
  },
  {
    id: 'maquina-corte',
    question: 'Preciso de máquina de corte?',
    answer:
      'Não. Os arquivos A4 comuns podem ser impressos em uma impressora convencional ou em gráfica, sem exigir máquina de corte.',
  },
  {
    id: 'imprimir-mais-de-uma-vez',
    question: 'Posso imprimir mais de uma vez?',
    answer:
      'Sim, para uso pessoal, conforme a licença de uso e os Termos de Uso disponíveis no rodapé desta página.',
  },
  {
    id: 'mensalidade',
    question: 'Preciso pagar mensalidade?',
    answer: 'Não. A oferta possui pagamento único, sem mensalidades.',
  },
  {
    id: 'diferenca-kits',
    question: 'Qual a diferença entre os kits?',
    answer:
      'O Kit Básico possui 50 materiais digitais para ajudar você a organizar sua rotina. O Kit Premium oferece 150 materiais digitais, seis bônus complementares e suporte humanizado.',
  },
  {
    id: 'suporte-humanizado',
    question: 'O Kit Premium possui suporte humanizado?',
    answer:
      'Sim! Quem escolhe o Kit Premium conta com suporte humanizado para tirar dúvidas relacionadas ao acesso, download e utilização dos materiais, conforme os canais e horários de atendimento disponibilizados.',
  },
  {
    id: 'como-funciona-garantia',
    question: 'Como funciona a garantia?',
    answer:
      'O cliente possui 7 dias de garantia, conforme as condições informadas na política de garantia e nos Termos de Uso.',
  },
];
