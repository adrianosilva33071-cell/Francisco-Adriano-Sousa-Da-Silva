# Coleção Planner 2027 — Página de Vendas Oficial

Página de vendas de alta conversão (Mobile-First) da **Coleção Planner 2027**, desenvolvida para apresentação comercial e venda dos pacotes **Kit Básico (R$ 9,90 — 100 materiais)** e **Kit Premium (R$ 27,90 — 250 materiais + 6 bônus complementares + suporte humanizado)** com checkout integrado à **Cakto** e rastreamento **UTMify**.

---

## 1. Tecnologias Utilizadas

- **React 19** + **TypeScript**
- **Vite 8** (bundler rápido e otimizado para produção)
- **Tailwind CSS v4** (`@tailwindcss/vite`)
- **Lucide React** (ícones vetoriais leves)
- **Imagens otimizadas em WebP e AVIF** (`public/assets/planners/`)

---

## 2. Pré-requisitos

Para rodar o projeto localmente no seu computador, você precisa apenas de:

- **Node.js** versão `18.x`, `20.x` ou superior ([nodejs.org](https://nodejs.org/))
- **npm** (instalado automaticamente junto com o Node.js)
- **Git** instalado para envio ao GitHub ([git-scm.com](https://git-scm.com/))

---

## 3. Como Instalar as Dependências

No terminal, dentro da pasta raiz do projeto, execute:

```bash
npm install
```

---

## 4. Como Executar Localmente (Modo Desenvolvimento)

Para iniciar o servidor local de desenvolvimento na porta `3000`:

```bash
npm run dev
```

Abra o navegador em: `http://localhost:3000`

---

## 5. Como Gerar e Testar o Build de Produção

Para compilar os arquivos otimizados de produção (gerados na pasta `dist/`):

```bash
npm run build
```

Para testar localmente o pacote de produção compilado:

```bash
npm run preview
```

Para rodar a verificação de tipos TypeScript e os testes automatizados do catálogo:

```bash
npm run lint
npm test
```

---

## 6. Variáveis de Ambiente

Esta página de vendas **não exige nenhuma variável de ambiente para funcionar**.

- O domínio canônico (`<link rel="canonical">` e `og:url`) é detectado **automaticamente** em tempo de execução através do navegador (`window.location.origin`), adaptando-se sozinho ao endereço gerado pela Vercel ou ao seu domínio próprio.
- Os links de pagamento da **Cakto** já estão configurados diretamente em `src/utils/catalogData.ts`:
  - **Kit Básico (R$ 9,90 — 100 materiais digitais)**: `https://pay.cakto.com.br/85z54d3_1324900`
  - **Kit Premium — Compra Direta (R$ 27,90 — 250 materiais digitais)**: `https://pay.cakto.com.br/n8msmyw`
  - **Kit Premium — Upgrade Exclusivo pelo Popup (R$ 19,90 — 250 materiais digitais)**: `https://pay.cakto.com.br/xhx8yqu`
- Os scripts de rastreamento **UTMify** (`utms/latest.js` e `pixel.js` com `pixelId: 6afc2b5608a5363c6845f95f`) e **Meta Pixel (`2206669040218715`)** já estão configurados no `<head>` do arquivo `index.html`.
- Caso deseje fixar manualmente um domínio definitivo após a publicação, a variável opcional `VITE_APP_URL` já está preparada e comentada no `.env.example`.

---

## 7. Como Publicar no GitHub (Passo a Passo)

1. Crie um novo repositório vazio no [GitHub](https://github.com/new).
2. No terminal, dentro da pasta do projeto, execute os comandos abaixo:

```bash
git init
git add .
git commit -m "feat: pagina de vendas Colecao Planner 2027 pronta para producao"
git branch -M main
git remote add origin <URL_DO_SEU_REPOSITORIO_NO_GITHUB>
git push -u origin main
```

---

## 8. Como Conectar o GitHub à Vercel e Publicar

O projeto já inclui o arquivo `vercel.json` pré-configurado. Siga as etapas abaixo:

1. Acesse [vercel.com](https://vercel.com/) e faça login com sua conta do **GitHub**.
2. No painel principal da Vercel, clique em **"Add New..."** → **"Project"**.
3. Localize o repositório da página de vendas na lista **"Import Git Repository"** e clique em **"Import"**.
4. A Vercel detectará automaticamente as configurações através do `vercel.json` e do `package.json`:
   - **Framework Preset**: `Vite`
   - **Install Command**: `npm install`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Clique em **"Deploy"** (não é necessário preencher nenhuma variável de ambiente).
6. Em menos de 1 minuto o build será concluído e sua página estará publicada com HTTPS ativo.

---

## 9. Como Configurar um Domínio Definitivo na Vercel (Opcional)

O projeto funciona automaticamente sem nenhuma variável de ambiente. Se, após publicar, você quiser fixar manualmente o domínio definitivo via variável de ambiente:

1. No painel do projeto na Vercel, acesse **Settings** → **Environment Variables**.
2. Adicione a chave `VITE_APP_URL` com o endereço real do seu domínio publicado.
3. Clique em **Save** e realize um **Redeploy** na aba **Deployments**.

---

## 10. Como Realizar Novas Atualizações Depois da Publicação

Sempre que você alterar qualquer texto, preço, imagem ou script no seu computador, basta enviar a atualização para o GitHub:

```bash
git add .
git commit -m "chore: atualizacao na pagina de vendas"
git push
```

A **Vercel detectará automaticamente o novo commit** na branch `main` e publicará a nova versão no ar sem precisar configurar nada novamente.
