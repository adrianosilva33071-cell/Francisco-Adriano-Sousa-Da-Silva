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
  number: string;
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
  code: string;
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
  number: string;
  question: string;
  answer: string;
}

export interface HeroMockupPreview {
  id: string;
  label: string;
  image: string;
}

export interface PlanComparisonRow {
  feature: string;
  basico: string;
  premium: string;
  highlightPremium?: boolean;
}

export interface KitOption {
  id: 'basico' | 'premium';
  name: string;
  titleCard?: string;
  subtitle: string;
  materialsCount: number;
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

/**
 * Endereços reais de checkout configurados na operação (Cakto):
 * 1. Kit Básico (R$ 9,90 — 100 materiais digitais): https://pay.cakto.com.br/85z54d3_1324900
 * 2. Compra direta do Kit Premium (R$ 27,90 — 250 materiais digitais): https://pay.cakto.com.br/n8msmyw
 * 3. Upgrade exclusivo pelo popup para o Kit Premium (R$ 19,90 — 250 materiais digitais): https://pay.cakto.com.br/xhx8yqu
 */
export const CAKTO_BASICO_URL = 'https://pay.cakto.com.br/85z54d3_1324900';
export const CAKTO_PREMIUM_URL = 'https://pay.cakto.com.br/n8msmyw';
export const CAKTO_PREMIUM_UPSELL_URL = 'https://pay.cakto.com.br/xhx8yqu';

export const TRACKING_PARAM_KEYS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'utm_id',
  'fbclid',
  'gclid',
  'ttclid',
  'xcod',
  'sck',
  'src',
  'subid',
] as const;

/**
 * Preserva parâmetros UTM e de campanha (Meta Ads / UTMify) da URL atual no link de checkout,
 * sem sobrescrever parâmetros que a UTMify já tenha anexado.
 */
export function buildCheckoutUrlWithTracking(baseUrl: string, searchString: string = ''): string {
  const trimmedBase = baseUrl.trim();
  if (!trimmedBase) return '';
  if (!searchString || !searchString.trim()) return trimmedBase;

  try {
    const url = new URL(trimmedBase);
    const incomingParams = new URLSearchParams(
      searchString.startsWith('?') ? searchString.slice(1) : searchString
    );

    incomingParams.forEach((value, key) => {
      const cleanVal = value.trim();
      if (!cleanVal) return;
      const lowerKey = key.toLowerCase();
      const isTrackingParam =
        lowerKey.startsWith('utm_') ||
        (TRACKING_PARAM_KEYS as readonly string[]).includes(lowerKey);
      if (isTrackingParam && !url.searchParams.has(key)) {
        url.searchParams.set(key, cleanVal);
      }
    });

    return url.toString();
  } catch {
    return trimmedBase;
  }
}

export type FunnelTrackingEventName =
  | 'ViewContent'
  | 'ClickBasicButton'
  | 'UpgradePopupShown'
  | 'UpgradeAccepted'
  | 'UpgradeDeclined'
  | 'ClickPremiumButton'
  | 'InitiateCheckout';

/**
 * Gera um event_id determinístico/único para deduplicação entre Meta Pixel e Conversions API (CAPI).
 */
export function createTrackingEventId(
  eventName: FunnelTrackingEventName,
  seed: number = Date.now()
): string {
  const normalized = eventName.toLowerCase();
  return `planner2027_${normalized}_${seed}`;
}

export interface FunnelTrackingRecord {
  eventName: FunnelTrackingEventName;
  eventID: string;
  payload: Record<string, unknown>;
  timestamp: number;
}

/**
 * Registra separadamente cada etapa do funil no Meta Pixel (fbq) e em memória para auditoria/CAPI,
 * sem jamais simular ou disparar Purchase no clique de botão.
 */
export function dispatchFunnelTrackingEvent(
  eventName: FunnelTrackingEventName,
  payload: Record<string, unknown> = {},
  seed: number = Date.now()
): FunnelTrackingRecord {
  const eventID = createTrackingEventId(eventName, seed);
  const record: FunnelTrackingRecord = {
    eventName,
    eventID,
    payload: {
      currency: 'BRL',
      ...payload,
    },
    timestamp: seed,
  };

  if (typeof window !== 'undefined') {
    const win = window as unknown as {
      fbq?: (...args: unknown[]) => void;
      __plannerFunnelEvents?: FunnelTrackingRecord[];
    };

    if (!Array.isArray(win.__plannerFunnelEvents)) {
      win.__plannerFunnelEvents = [];
    }
    win.__plannerFunnelEvents.push(record);

    try {
      if (typeof win.fbq === 'function') {
        const isStandardMetaEvent =
          eventName === 'ViewContent' || eventName === 'InitiateCheckout';
        win.fbq(
          isStandardMetaEvent ? 'track' : 'trackCustom',
          eventName,
          record.payload,
          { eventID }
        );
      }
    } catch {
      // Preserva funcionamento nativo mesmo se bloqueadores interceptarem o script
    }
  }

  return record;
}

export interface UpsellModalContent {
  headline: string;
  subheadline: string;
  priceDifferenceCallout: string;
  highlightBadge: string;
  basicComparison: {
    name: string;
    materialsLabel: string;
    price: string;
    priceNumeric: number;
  };
  premiumComparison: {
    name: string;
    materialsLabel: string;
    normalPrice: string;
    normalPriceNumeric: number;
    price: string;
    priceNumeric: number;
    differenceBadge: string;
  };
  acceptCtaLabel: string;
  declineCtaLabel: string;
}

export const UPSELL_MODAL_CONTENT: UpsellModalContent = {
  headline: 'ESPERE! TEMOS UMA OFERTA ESPECIAL PARA VOCÊ!',
  subheadline: 'Por apenas R$ 19,90, leve o Kit Premium com 250 materiais digitais!',
  priceDifferenceCallout:
    '250 materiais digitais + 6 bônus exclusivos — R$ 27,90 normalmente, mas com oferta especial de R$ 19,90 no total pelo popup!',
  highlightBadge: 'OFERTA ESPECIAL EXCLUSIVA DO POPUP • DE R$ 27,90 POR R$ 19,90',
  basicComparison: {
    name: 'BÁSICO',
    materialsLabel: '100 materiais digitais',
    price: 'R$ 9,90',
    priceNumeric: 9.9,
  },
  premiumComparison: {
    name: 'PREMIUM',
    materialsLabel: '250 materiais digitais',
    normalPrice: 'R$ 27,90',
    normalPriceNumeric: 27.9,
    price: 'R$ 19,90',
    priceNumeric: 19.9,
    differenceBadge: 'R$ 27,90 normalmente • R$ 19,90 pelo popup',
  },
  acceptCtaLabel: 'SIM! QUERO O PREMIUM POR R$ 19,90',
  declineCtaLabel: 'NÃO, PREFIRO O BÁSICO POR R$ 9,90',
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
      kitName: 'KIT BÁSICO (100 MATERIAIS)',
      priceNumeric: 9.9,
    };
  }

  const trimmedUpsell = configuredUpsellUrl.trim();
  // Safeguard: nunca permitir URL vazia, nem o checkout do Básico (R$ 9,90), nem o checkout normal do Premium (R$ 27,90) no upgrade promocional de R$ 19,90
  if (
    !trimmedUpsell ||
    trimmedUpsell === CAKTO_BASICO_URL ||
    trimmedUpsell === CAKTO_PREMIUM_URL
  ) {
    return {
      status: 'missing_upsell_url',
      targetUrl: null,
      kitName: 'KIT PREMIUM (250 MATERIAIS — UPGRADE POPUP)',
      priceNumeric: UPSELL_MODAL_CONTENT.premiumComparison.priceNumeric,
    };
  }

  return {
    status: 'redirect',
    targetUrl: trimmedUpsell,
    kitName: 'KIT PREMIUM (250 MATERIAIS — UPGRADE POPUP)',
    priceNumeric: UPSELL_MODAL_CONTENT.premiumComparison.priceNumeric,
  };
}

export const PROMO_DATE_TEXT = 'OFERTA EXCLUSIVA • POR TEMPO LIMITADO';
export const HERO_BADGE_TEXT = 'COLEÇÃO DIGITAL • PLANNER 2027';
export const HERO_HEADLINE = 'SEU 2027 MAIS ORGANIZADO COMEÇA AQUI!';
export const HERO_SUBHEADLINE =
  'Tenha ferramentas práticas para organizar sua rotina, acompanhar seus hábitos, planejar suas metas e cuidar melhor da sua vida financeira.';

export const HERO_PLANNER_IMAGE = '/assets/planners/hero-planner.webp';
export const LIFESTYLE_PLANNER_IMAGE = '/assets/planners/vitrine-uso-planner.webp';
export const GUARANTEE_BADGE_IMAGE = '/assets/planners/selo-garantia.webp';

export const HERO_QUICK_BENEFITS: string[] = [
  'Opções com 100 ou 250 materiais digitais.',
  'Pagamento único, sem mensalidades.',
  'Acesso digital após confirmação.',
  'Arquivos prontos para imprimir + Garantia de 7 dias.',
];

export const HERO_MOCKUP_PREVIEWS: HeroMockupPreview[] = [
  {
    id: 'capa-rosa',
    label: 'Capa rosa do Planner 2027',
    image: '/assets/planners/planner-capa.webp',
  },
  {
    id: 'planner-semanal',
    label: 'Planner semanal',
    image: '/assets/planners/planejamento-semanal.webp',
  },
  {
    id: 'controle-habitos',
    label: 'Controle de hábitos',
    image: '/assets/planners/controle-habitos.webp',
  },
  {
    id: 'planejamento-mensal',
    label: 'Planejamento mensal',
    image: '/assets/planners/calendario-mensal.webp',
  },
  {
    id: 'controle-financeiro',
    label: 'Controle financeiro',
    image: '/assets/planners/planejamento-financeiro.webp',
  },
  {
    id: 'lista-tarefas',
    label: 'Lista de tarefas',
    image: '/assets/planners/lista-tarefas.webp',
  },
];

export const PLAN_COMPARISON_ROWS: PlanComparisonRow[] = [
  {
    feature: 'Materiais digitais',
    basico: '100',
    premium: '250',
    highlightPremium: true,
  },
  {
    feature: 'Preço',
    basico: 'R$ 9,90',
    premium: 'R$ 27,90',
    highlightPremium: true,
  },
  {
    feature: 'Planejamento',
    basico: 'Sim',
    premium: 'Sim',
  },
  {
    feature: 'Organização pessoal',
    basico: 'Sim',
    premium: 'Sim',
  },
  {
    feature: 'Controle de hábitos',
    basico: 'Sim',
    premium: 'Sim',
  },
  {
    feature: 'Planejamento financeiro',
    basico: 'Conforme conteúdo incluído',
    premium: 'Conforme conteúdo incluído',
  },
];

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

export function calculatePriceDifference(premiumPrice: number, basicPrice: number): number {
  if (premiumPrice <= basicPrice) return 0;
  return Number((premiumPrice - basicPrice).toFixed(2));
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
    number: '01',
    text: 'Começa a semana com várias tarefas, mas não consegue organizar tudo.',
  },
  {
    id: 'esquece-compromissos',
    number: '02',
    text: 'Esquece compromissos e atividades importantes.',
  },
  {
    id: 'metas-depois',
    number: '03',
    text: 'Define metas, mas acaba deixando tudo para depois.',
  },
  {
    id: 'controlar-gastos',
    number: '04',
    text: 'Quer controlar melhor os gastos, mas não sabe por onde começar.',
  },
  {
    id: 'falta-planejamento',
    number: '05',
    text: 'Sente que precisa de mais planejamento no dia a dia.',
  },
  {
    id: 'acompanhar-habitos',
    number: '06',
    text: 'Gostaria de acompanhar seus hábitos e sua evolução.',
  },
];

export const PRODUCT_DEMO_ITEMS: ProductDemoItem[] = [
  {
    id: 'demo-semanal',
    number: '01',
    name: 'PLANNER SEMANAL',
    explanation: 'Organize suas atividades e compromissos de segunda a domingo com clareza visual.',
    benefit: 'Visualize prioridades de segunda a domingo e comece a semana organizada.',
    image: '/assets/planners/planejamento-semanal.webp',
  },
  {
    id: 'demo-mensal',
    number: '02',
    name: 'PLANEJAMENTO MENSAL',
    explanation: 'Visualize todos os dias do mês em uma única página para antecipar prazos e datas.',
    benefit: 'Antecipe datas importantes, compromissos e eventos do mês.',
    image: '/assets/planners/calendario-mensal.webp',
  },
  {
    id: 'demo-habitos',
    number: '03',
    name: 'CONTROLE DE HÁBITOS',
    explanation: 'Acompanhe seus hábitos diários e visualize sua evolução ao longo de cada semana.',
    benefit: 'Mantenha o foco diário em rotina saudável, estudos, leitura e autocuidado.',
    image: '/assets/planners/controle-habitos.webp',
  },
  {
    id: 'demo-tarefas',
    number: '04',
    name: 'LISTA DE TAREFAS',
    explanation: 'Registre suas atividades em formato checklist e mantenha prioridades visíveis.',
    benefit: 'Tire as pendências da cabeça e acompanhe cada etapa concluída.',
    image: '/assets/planners/lista-tarefas.webp',
  },
  {
    id: 'demo-financeiro',
    number: '05',
    name: 'CONTROLE FINANCEIRO',
    explanation: 'Registre entradas do mês, despesas fixas/variáveis, saldo e meta de economia.',
    benefit: 'Saiba exatamente para onde vai seu dinheiro e planeje melhor seus gastos.',
    image: '/assets/planners/planejamento-financeiro.webp',
  },
  {
    id: 'demo-metas',
    number: '06',
    name: 'PLANEJAMENTO DE METAS',
    explanation: 'Defina seus objetivos de 2027 e divida em próximos passos práticos.',
    benefit: 'Transforme planos anuais em metas reais e possíveis de realizar.',
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
    useCaseDescription: 'Registre entradas, despesas, saldo do mês e meta de economia.',
    benefitText: 'Mais controle sobre seus gastos',
    image: '/assets/planners/planejamento-financeiro.webp',
  },
  {
    id: 8,
    title: 'Organizador diário',
    useCaseTitle: 'Organização de compromissos',
    useCaseDescription: 'Organize prioridades 1, 2 e 3, horários das 07h às 20h e tarefas do dia.',
    benefitText: 'Rotina diária mais estruturada',
    image: '/assets/planners/organizador-diario.webp',
  },
];

export const STEP_ITEMS: StepItem[] = [
  {
    step: 1,
    code: 'ETAPA 01',
    title: 'ACESSE SEUS ARQUIVOS',
    description:
      'Depois da confirmação do pagamento, tenha acesso aos materiais digitais conforme o sistema de entrega configurado.',
    image: '/assets/planners/passo-download.webp',
  },
  {
    step: 2,
    code: 'ETAPA 02',
    title: 'IMPRIMA SEUS MATERIAIS',
    description: 'Utilize os arquivos conforme as orientações de impressão da coleção.',
    image: '/assets/planners/passo-impressao.webp',
  },
  {
    step: 3,
    code: 'ETAPA 03',
    title: 'COMECE A ORGANIZAR SUA ROTINA',
    description:
      'Utilize seus planners e organizadores para planejar atividades, acompanhar hábitos e registrar metas.',
    image: '/assets/planners/passo-utilizacao.webp',
  },
];

export const BONUS_ITEMS: BonusItem[] = [
  {
    number: '01',
    title: 'GUIA DE ORGANIZAÇÃO E PRODUTIVIDADE',
    benefitTag: 'BÔNUS 01 • KIT PREMIUM',
    description: 'Material complementar com orientações práticas para organizar sua rotina.',
    image: '/assets/planners/bonus-organizacao.webp',
  },
  {
    number: '02',
    title: 'CONTROLE FINANCEIRO PESSOAL',
    benefitTag: 'BÔNUS 02 • KIT PREMIUM',
    description: 'Ferramenta dedicada para registrar e acompanhar receitas e despesas.',
    image: '/assets/planners/bonus-financeiro.webp',
  },
  {
    number: '03',
    title: 'PLANNER FINANCEIRO MENSAL',
    benefitTag: 'BÔNUS 03 • KIT PREMIUM',
    description: 'Material para estruturar seu planejamento financeiro mês a mês.',
    image: '/assets/planners/bonus-planner.webp',
  },
  {
    number: '04',
    title: 'PACK DE LISTAS E ORGANIZADORES EXTRAS',
    benefitTag: 'BÔNUS 04 • KIT PREMIUM',
    description: 'Modelos adicionais de checklists para organizar atividades e tarefas.',
    image: '/assets/planners/bonus-listas.webp',
  },
  {
    number: '05',
    title: 'PLANNER DE METAS E OBJETIVOS',
    benefitTag: 'BÔNUS 05 • KIT PREMIUM',
    description: 'Material complementar para registrar e acompanhar objetivos de 2027.',
    image: '/assets/planners/metas.webp',
  },
  {
    number: '06',
    title: 'ATUALIZAÇÕES INCLUÍDAS',
    benefitTag: 'BÔNUS 06 • KIT PREMIUM',
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
    titleCard: 'KIT BÁSICO — 100 MATERIAIS DIGITAIS',
    subtitle: '100 materiais digitais.',
    materialsCount: 100,
    idealFor:
      'Opção econômica para quem deseja começar a organizar sua rotina com 100 materiais digitais práticos.',
    price: 'R$ 9,90',
    priceNumeric: 9.9,
    paymentNote: 'Pagamento único • Sem mensalidade • Acesso digital • Garantia de 7 dias.',
    includedFeatures: [
      '100 materiais digitais.',
      'Organização pessoal.',
      'Planejamento da rotina.',
      'Listas e tarefas.',
      'Controle de hábitos.',
      'Ferramentas de planejamento.',
    ],
    ctaLabel: 'QUERO MEU KIT BÁSICO',
    checkoutUrl: CAKTO_BASICO_URL,
  },
  premium: {
    id: 'premium',
    name: 'KIT PREMIUM',
    titleCard: 'KIT PREMIUM — 250 MATERIAIS DIGITAIS + 6 BÔNUS',
    subtitle: '250 materiais digitais.',
    materialsCount: 250,
    badge: 'MAIS COMPLETO',
    idealFor:
      'A coleção mais completa: 250 materiais digitais + 6 bônus incluídos para organizar sua rotina, objetivos, hábitos e vida financeira.',
    price: 'R$ 27,90',
    priceNumeric: 27.9,
    paymentNote: 'Pagamento único • Sem mensalidade • Acesso digital • Garantia de 7 dias.',
    includedFeatures: [
      '250 materiais digitais.',
      '6 bônus complementares incluídos.',
      'Mais ferramentas de planejamento.',
      'Organização pessoal.',
      'Controle de hábitos.',
      'Planejamento mensal e semanal.',
      'Controle financeiro.',
      'Planejamento de metas.',
      'Materiais complementares.',
    ],
    bonuses: [
      'Bônus 01: Guia de Organização e Produtividade',
      'Bônus 02: Controle Financeiro Pessoal',
      'Bônus 03: Planner Financeiro Mensal',
      'Bônus 04: Pack de Listas e Organizadores Extras',
      'Bônus 05: Planner de Metas e Objetivos',
      'Bônus 06: Atualizações Incluídas',
    ],
    ctaLabel: 'QUERO MEU KIT PREMIUM',
    checkoutUrl: CAKTO_PREMIUM_URL,
  },
};

export const FAQ_ITEMS: FaqItem[] = [
  {
    id: 'como-recebo',
    number: '01',
    question: 'Como recebo os materiais?',
    answer:
      'Os materiais são digitais e o acesso ocorre após a confirmação do pagamento, conforme o sistema de entrega configurado.',
  },
  {
    id: 'maquina-corte',
    number: '02',
    question: 'Preciso de máquina de corte para imprimir?',
    answer:
      'Não. Os materiais da coleção são disponibilizados em formato digital A4, prontos para imprimir em impressora doméstica comum ou em gráfica rápida, sem exigir máquina de corte.',
  },
  {
    id: 'imprimir-mais-de-uma-vez',
    number: '03',
    question: 'Posso imprimir mais de uma vez?',
    answer:
      'Sim. Ao adquirir a coleção, você recebe uma licença de uso pessoal para baixar e imprimir seus materiais quantas vezes desejar, conforme previsto nos Termos de Uso disponíveis no rodapé desta página.',
  },
  {
    id: 'mensalidade',
    number: '04',
    question: 'Preciso pagar mensalidade?',
    answer: 'Não. O pagamento tanto do Kit Básico quanto do Kit Premium é único, sem mensalidades.',
  },
  {
    id: 'diferenca-kits',
    number: '05',
    question: 'Qual a diferença entre o Kit Básico e o Kit Premium?',
    answer:
      'O Kit Básico (R$ 9,90) oferece 100 materiais digitais essenciais para planejamento e organização pessoal. O Kit Premium (R$ 27,90) é a opção mais completa, com 250 materiais digitais, incluindo mais ferramentas de planejamento semanal e mensal, controle financeiro, planejamento de metas e materiais complementares.',
  },
  {
    id: 'suporte-humanizado',
    number: '06',
    question: 'Como funciona o suporte?',
    answer:
      'Você conta com suporte humanizado pelos canais oficiais da operação (suporte@planners2027.com.br, de segunda a sexta, das 09h às 18h) para tirar dúvidas sobre acesso, download e utilização dos materiais.',
  },
  {
    id: 'como-funciona-garantia',
    number: '07',
    question: 'Como funciona a garantia de 7 dias?',
    answer:
      'Você possui 7 dias de garantia após a compra para conhecer o material e, caso necessário, solicitar o reembolso conforme as condições da garantia.',
  },
];
