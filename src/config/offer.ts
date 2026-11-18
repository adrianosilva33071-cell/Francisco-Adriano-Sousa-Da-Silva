/**
 * CONFIGURAÇÃO COMERCIAL CENTRAL — Coleção Planner 2027
 *
 * Preços, quantidades, benefícios e links de checkout ficam SOMENTE aqui.
 * O valor cobrado vem da Cakto: ao mudar um preço aqui, mude também na Cakto
 * (e rode `npm run check:checkout` para conferir se os dois batem).
 */

export type KitId = 'basico' | 'premium';

export interface Kit {
  id: KitId;
  name: string;
  /** Preço em reais (ex.: 9.9). */
  price: number;
  materialsCount: number;
  bonusCount: number;
  /**
   * Bônus com arquivo confirmado na pasta do produto (C:\DANONE\ofertas).
   * Nunca liste aqui um bônus que não exista de verdade.
   */
  documentedBonuses: string[];
  /** Benefícios reais, mostrados no card do kit. */
  highlights: string[];
  checkoutUrl: string;
  badge?: string;
  image: { src: string; srcSetAvif: string; srcSetWebp: string; width: number; height: number; alt: string };
}

export const CHECKOUT_URLS: Record<KitId, string> = {
  basico: 'https://pay.cakto.com.br/85z54d3_1324900',
  premium: 'https://pay.cakto.com.br/n8msmyw',
};

/** Preço em reais com espaço que não quebra linha entre "R$" e o valor. */
export function formatBRL(value: number): string {
  return `R$ ${value.toFixed(2).replace('.', ',')}`;
}

const kitImage = (name: string, alt: string) => ({
  src: `/assets/mockups/${name}-1200.webp`,
  srcSetAvif: `/assets/mockups/${name}-640.avif 640w, /assets/mockups/${name}-1200.avif 1200w`,
  srcSetWebp: `/assets/mockups/${name}-640.webp 640w, /assets/mockups/${name}-1200.webp 1200w`,
  width: 1200,
  height: 800,
  alt,
});

export const KITS: Record<KitId, Kit> = {
  basico: {
    id: 'basico',
    name: 'Kit Básico',
    price: 9.9,
    materialsCount: 100,
    bonusCount: 0,
    documentedBonuses: [],
    highlights: [
      'PDF em tamanho A4: imprima ou abra no celular',
      'Planejamento semanal, mensal e anual',
      'Metas, hábitos e rotina',
      'Finanças, casa, estudos e outras categorias',
    ],
    checkoutUrl: CHECKOUT_URLS.basico,
    image: kitImage(
      'kit-basico',
      'Kit Básico: páginas reais impressas em A4, com o Planejador Mensal sobre um bloco de folhas e as páginas Rotina da Manhã, Registro de Hábitos, Metas Bem Definidas e Visão Anual de Metas'
    ),
  },
  premium: {
    id: 'premium',
    name: 'Kit Premium',
    price: 24.9,
    materialsCount: 300,
    bonusCount: 10,
    documentedBonuses: [
      'Guia de Organização e Produtividade',
      'Controle Financeiro Pessoal',
      'Planner Financeiro Mensal',
      'Pack de Listas e Organizadores Extras',
    ],
    highlights: [
      'PDF em tamanho A4: imprima ou abra no celular',
      'Planejamento semanal, mensal e anual',
      'Metas, hábitos, rotina e finanças',
      '3x mais materiais que o Kit Básico',
    ],
    checkoutUrl: CHECKOUT_URLS.premium,
    badge: 'MAIS COMPLETO',
    image: kitImage(
      'kit-premium',
      'Kit Premium: Calendário Anual 2027 no tablet, Registro de Hábitos no celular, um bloco de páginas da coleção e as capas reais dos bônus Guia de Organização e Produtividade, Controle Financeiro Pessoal, Planner Financeiro Mensal e Pack de Listas e Organizadores Extras'
    ),
  },
};

/** Ordem de exibição dos cards: no celular o Premium aparece primeiro. */
export const KIT_ORDER: KitId[] = ['premium', 'basico'];

export const LOWEST_PRICE = Math.min(...Object.values(KITS).map((k) => k.price));

export function ctaLabel(kit: Kit): string {
  return `Quero o ${kit.name} — ${formatBRL(kit.price)}`;
}

/**
 * Comparação verdadeira entre os kits, calculada a partir dos números acima
 * (ex.: "3x mais materiais por R$ 15,00 a mais"). Sem desconto inventado.
 */
export function premiumComparison(): string | null {
  const { basico, premium } = KITS;
  const ratio = premium.materialsCount / basico.materialsCount;
  const diff = premium.price - basico.price;
  if (!Number.isInteger(ratio) || ratio < 2 || diff <= 0) return null;
  return `${ratio}x mais materiais por ${formatBRL(diff)} a mais`;
}
