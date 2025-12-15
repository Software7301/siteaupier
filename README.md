# 🚗 AutoPier - Concessionária Premium

Sistema completo para concessionária de veículos com catálogo, checkout, negociação e chat em tempo real.

## 🛠️ Stack Tecnológica

- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Socket.io
- **Banco de Dados**: PostgreSQL com Prisma ORM

## 📦 Instalação

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente
# Crie um arquivo .env na raiz com:
DATABASE_URL="postgresql://usuario:senha@localhost:5432/autopier?schema=public"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# 3. Gerar cliente Prisma
npm run db:generate

# 4. Criar tabelas no banco
npm run db:push

# 5. Popular banco com dados iniciais
npm run db:seed

# 6. Iniciar servidor de desenvolvimento
npm run dev
```

## 🏗️ Estrutura do Projeto

```
/app
  /page.tsx           → Home
  /cars               → Catálogo de veículos
  /checkout/[id]      → Checkout dinâmico
  /negociacao         → Sistema de negociação
  /negociacao/[id]    → Chat em tempo real
  /api                → API Routes
/components           → Componentes reutilizáveis
/lib                  → Utilitários e configurações
/prisma               → Schema e migrations
/styles               → Estilos globais
```

## 🎨 Features

- ✅ Catálogo de veículos com filtros
- ✅ Sistema de checkout completo
- ✅ Negociação de veículos
- ✅ Chat em tempo real (humano ↔ humano)
- ✅ Design dark premium
- ✅ 100% responsivo

## 📧 Contato

AutoPier - Sua concessionária premium

# siteaupier
