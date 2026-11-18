# Coleção Planner 2027 — Página de Vendas

Landing page mobile-first para tráfego do Meta Ads, com dois kits e checkout na Cakto.

| Kit | Conteúdo | Preço | Checkout |
|---|---|---|---|
| Básico | 100 materiais digitais | R$ 9,90 | https://pay.cakto.com.br/85z54d3_1324900 |
| Premium (MAIS COMPLETO) | 300 materiais digitais + 10 bônus | R$ 24,90 | https://pay.cakto.com.br/n8msmyw |

## Onde mudar cada coisa

| O quê | Arquivo |
|---|---|
| Preços, quantidades, bônus, benefícios e links de checkout | `src/config/offer.ts` |
| Textos, perguntas frequentes, categorias, imagens, e-mail de suporte | `src/config/content.ts` |
| Layout da página | `src/App.tsx` |
| Termos, privacidade e contato | `src/components/LegalModal.tsx` |
| Rastreamento (UTMify + Pixel da Meta) | `<head>` do `index.html` — não editar à mão |

Ao mudar um preço, mude também na Cakto e rode `npm run check:checkout`.

## Rastreamento

- Os dois scripts oficiais da UTMify ficam no `index.html`: `utms/latest.js` (UTMs nos links) e
  `pixel/pixel.js` (pixel da UTMify `6afc2b5608a5363c6845f95f`).
- O **Pixel da Meta `2206669040218715` é carregado pela UTMify**, a partir da configuração do
  painel da UTMify. Não instale o Pixel à mão: duplicaria os eventos.
- Eventos: PageView e ViewContent ao abrir a página; InitiateCheckout no clique em qualquer
  link `pay.cakto.com.br/` (regra configurada no painel da UTMify); Purchase vem da integração
  Cakto → UTMify, nunca da página. Navegador e servidor usam o mesmo `eventID` (deduplicação).
- `src/lib/checkoutLink.ts` só completa o link no clique (UTMs e `utm_source` + `jLj` + ID do
  lead, a mesma regra da UTMify). Não dispara eventos.
- Em `localhost` o Pixel da Meta não carrega, então testes locais não sujam os dados.

## Comandos

```bash
npm install            # dependências
npm run dev            # servidor local em http://localhost:3000
npm run lint           # checagem de tipos (TypeScript)
npm test               # testes de oferta, links, imagens e rastreamento
npm run check:checkout # confere nome e preço de cada checkout na Cakto
npm run build          # build de produção em dist/
npm run preview        # serve o build localmente
```

## Publicação

Este repositório está ligado à Vercel: um `git push` na branch `main` publica automaticamente.
Rode `npm run lint`, `npm test`, `npm run check:checkout` e `npm run build` antes do push.
