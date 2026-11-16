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

export interface SolutionMaterialItem {
  id: string;
  name: string;
  image: string;
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

export interface WhyLoveItem {
  id: string;
  title: string;
  description: string;
  iconName: 'check' | 'file' | 'clock' | 'layers' | 'grid' | 'download';
  tone: 'pink' | 'purple';
  image: string;
}

export interface WhatsAppDemoChat {
  id: string;
  numberLabel: string;
  topic: string;
  contactLabel: string;
  clientMessage: string;
  clientTime: string;
  replyMessage: string;
  replyTime: string;
  /** Optional real screenshot path when authorized client captures are added later */
  authorizedScreenshotUrl?: string;
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

export const PROMO_DATE_TEXT = 'COLEÇÃO PLANNER 2027 • ACESSO DIGITAL • PRONTO PARA IMPRIMIR';

export const HERO_PLANNER_IMAGE = '/assets/planners/hero-planner.webp';
export const STATIONERY_DECORATION_IMAGE = '/assets/planners/decoracao-papelaria.webp';
export const GUARANTEE_BADGE_IMAGE = '/assets/planners/selo-garantia.webp';

export const TESTIMONIAL_IMAGES: { id: number; src: string; alt: string }[] = [
  {
    id: 1,
    src: '/assets/cloned/depoimento-1.webp',
    alt: 'Depoimento 1 no WhatsApp sobre a Coleção Planner 2027',
  },
  {
    id: 2,
    src: '/assets/cloned/depoimento-2.webp',
    alt: 'Depoimento 2 no WhatsApp confirmando recebimento dos arquivos',
  },
  {
    id: 3,
    src: '/assets/cloned/depoimento-3.webp',
    alt: 'Depoimento 3 no WhatsApp elogiando os modelos da coleção',
  },
  {
    id: 4,
    src: '/assets/cloned/depoimento-4.webp',
    alt: 'Depoimento 4 no WhatsApp elogiando o material',
  },
];

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

export function getNextCarouselIndex(currentIndex: number, total: number, direction: 'next' | 'prev'): number {
  if (total <= 0) return 0;
  if (direction === 'next') {
    return (currentIndex + 1) % total;
  }
  return (currentIndex - 1 + total) % total;
}

export function validateCheckoutInput(input: { name: string; email: string }): {
  valid: boolean;
  error?: string;
} {
  const trimmedName = input.name.trim();
  const trimmedEmail = input.email.trim();
  if (!trimmedName || trimmedName.length < 2) {
    return { valid: false, error: 'Informe seu nome completo para receber o acesso.' };
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmedEmail)) {
    return { valid: false, error: 'Informe um e-mail válido para envio dos arquivos.' };
  }
  return { valid: true };
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

export const SOLUTION_MATERIALS: SolutionMaterialItem[] = [
  {
    id: 'sol-semanal',
    name: 'Planner semanal',
    image: '/assets/planners/planejamento-semanal.webp',
  },
  {
    id: 'sol-mensal',
    name: 'Calendário mensal',
    image: '/assets/planners/calendario-mensal.webp',
  },
  {
    id: 'sol-habitos',
    name: 'Controle de hábitos',
    image: '/assets/planners/controle-habitos.webp',
  },
  {
    id: 'sol-tarefas',
    name: 'Lista de tarefas',
    image: '/assets/planners/lista-tarefas.webp',
  },
  {
    id: 'sol-metas',
    name: 'Planejamento de metas',
    image: '/assets/planners/metas.webp',
  },
  {
    id: 'sol-financeiro',
    name: 'Controle financeiro',
    image: '/assets/planners/planejamento-financeiro.webp',
  },
  {
    id: 'sol-compromissos',
    name: 'Organização de compromissos',
    image: '/assets/planners/organizador-diario.webp',
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
    description: 'Após a confirmação do pagamento, você recebe o acesso para baixar seus materiais no celular ou computador.',
    image: '/assets/planners/passo-download.webp',
  },
  {
    step: 2,
    title: '2. Imprima em casa ou na gráfica',
    description: 'Os modelos podem ser impressos em impressora comum, sem precisar de máquina de corte.',
    image: '/assets/planners/passo-impressao.webp',
  },
  {
    step: 3,
    title: '3. Comece a organizar seu 2027',
    description: 'Utilize em pasta, fichário, prancheta ou encaderne como preferir para acompanhar sua rotina.',
    image: '/assets/planners/passo-utilizacao.webp',
  },
];

export const WHY_LOVE_ITEMS: WhyLoveItem[] = [
  {
    id: 'facil',
    title: 'Fácil de usar',
    description: 'Layouts práticos para preencher no seu ritmo.',
    iconName: 'check',
    tone: 'pink',
    image: '/assets/planners/beneficio-facil.webp',
  },
  {
    id: 'pronto',
    title: 'Pronto para imprimir',
    description: 'Formatado em A4 para impressão simples.',
    iconName: 'file',
    tone: 'purple',
    image: '/assets/planners/beneficio-impressao.webp',
  },
  {
    id: 'tempo',
    title: 'Economia de tempo',
    description: 'Páginas prontas para facilitar seu planejamento.',
    iconName: 'clock',
    tone: 'pink',
    image: '/assets/planners/beneficio-tempo.webp',
  },
  {
    id: 'qualidade',
    title: 'Alta qualidade',
    description: 'Arquivos digitais com visual limpo e delicado.',
    iconName: 'layers',
    tone: 'purple',
    image: '/assets/planners/beneficio-qualidade.webp',
  },
  {
    id: 'opcoes',
    title: 'Diversas opções',
    description: 'Materiais para rotina, metas, tarefas e finanças.',
    iconName: 'grid',
    tone: 'pink',
    image: '/assets/planners/beneficio-variedade.webp',
  },
  {
    id: 'acesso',
    title: 'Acesso digital',
    description: 'Disponível após a confirmação do pagamento.',
    iconName: 'download',
    tone: 'purple',
    image: '/assets/planners/beneficio-acesso.webp',
  },
];

export const INCLUDED_CHECKLIST: string[] = [
  'Tenha suas atividades organizadas.',
  'Planeje sua semana com mais clareza.',
  'Acompanhe seus hábitos.',
  'Visualize suas metas.',
  'Organize seus compromissos.',
  'Tenha seus materiais sempre disponíveis para imprimir.',
  'Economize tempo na hora de planejar.',
];

export const WHATSAPP_DEMO_CHATS: WhatsAppDemoChat[] = [
  {
    id: 'conversa-01',
    numberLabel: 'CONVERSA 01',
    topic: 'ORGANIZAÇÃO DA ROTINA',
    contactLabel: 'Cliente Demonstrativo 01 (Exemplo)',
    clientMessage:
      'Eu estava precisando muito de algo para organizar minha semana. Gostei bastante da variedade de planners!',
    clientTime: '09:42',
    replyMessage: 'Que bom! A ideia é justamente facilitar seu planejamento. 💗',
    replyTime: '09:44',
  },
  {
    id: 'conversa-02',
    numberLabel: 'CONVERSA 02',
    topic: 'CONTROLE DE HÁBITOS',
    contactLabel: 'Cliente Demonstrativo 02 (Exemplo)',
    clientMessage:
      'Gostei muito da parte de controle de hábitos. Quero começar a acompanhar melhor minha rotina.',
    clientTime: '11:15',
    replyMessage:
      'Esse material pode ajudar você a visualizar seus hábitos e acompanhar sua evolução! 😊',
    replyTime: '11:17',
  },
  {
    id: 'conversa-03',
    numberLabel: 'CONVERSA 03',
    topic: 'PLANEJAMENTO SEMANAL',
    contactLabel: 'Cliente Demonstrativo 03 (Exemplo)',
    clientMessage:
      'Os modelos são muito bonitos! Já estou organizando minhas atividades da semana.',
    clientTime: '14:28',
    replyMessage: 'Ficamos felizes que tenha gostado! Aproveite sua coleção. 💗',
    replyTime: '14:30',
  },
  {
    id: 'conversa-04',
    numberLabel: 'CONVERSA 04',
    topic: 'ORGANIZAÇÃO FINANCEIRA',
    contactLabel: 'Cliente Demonstrativo 04 (Exemplo)',
    clientMessage:
      'Gostei de ter opções para organizar minhas despesas também. Era algo que eu estava procurando.',
    clientTime: '16:05',
    replyMessage:
      'Ótimo! O material financeiro foi pensado para ajudar no acompanhamento das suas receitas e despesas.',
    replyTime: '16:08',
  },
  {
    id: 'conversa-05',
    numberLabel: 'CONVERSA 05',
    topic: 'EXPERIÊNCIA COM O MATERIAL',
    contactLabel: 'Cliente Demonstrativo 05 (Exemplo)',
    clientMessage:
      'Gostei de poder imprimir e deixar tudo organizado no meu cantinho de estudos.',
    clientTime: '19:12',
    replyMessage:
      'Que bom! Esperamos que a coleção ajude bastante na sua organização. 💗',
    replyTime: '19:14',
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
    description: 'Acesso às atualizações da coleção conforme as condições reais de entrega da oferta.',
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
    answer:
      'Não. A oferta possui pagamento único, sem mensalidades.',
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

