# ClinicaSaaS — Arquitetura e Decisões Técnicas

## Visão Geral

Sistema SaaS multi-tenant de gestão para clínicas de estética. Uma única instância do software serve múltiplas clínicas, com isolamento de dados por `clinic_id` em todas as queries.

---

## Stack Tecnológica

| Camada | Tecnologia | Motivo da Escolha |
|---|---|---|
| Backend | NestJS (Node.js) | Arquitetura modular, TypeScript nativo, DI, decorators |
| Frontend | Nuxt.js 3 (Vue 3) | SSR/SSG, DX excelente, composables, auto-imports |
| Banco de dados | MySQL 8.4 | JSON nativo, FULLTEXT search, ACID, amplamente disponível em hostings BR |
| Cache / Filas | Redis | Cache de sessão, filas de notificação (Bull) |
| ORM | TypeORM | Migrations, decorators, suporte TypeScript completo |
| Auth | JWT + Passport | Stateless, escalável, refresh tokens |
| CSS | Tailwind CSS | Utilitário, dark mode, consistência visual |
| IA | Claude (Anthropic) | Análises, sugestões, assistente conversacional |

---

## Arquitetura Multi-Tenant

### Estratégia: Row-Level Isolation

Cada tabela possui `clinic_id`. Não usamos schemas/databases separados por tenant pois:
- MySQL Community não tem row-level security nativa — isolamento por `clinic_id` é mais simples e direto
- Facilita queries cross-tenant para o super admin
- Performance adequada com índices corretos
- Compatível com qualquer plano de hospedagem MySQL

```
clinica A (slug: bella-vita)  ──┐
clinica B (slug: studio-zen)  ──┼──► Mesmo PostgreSQL, mesmo schema
clinica C (slug: arte-e-pele) ──┘    Separação por clinic_id
```

### Fluxo de Autenticação

```
Login → JWT (payload: user_id, clinic_id, role)
      → JwtAuthGuard valida token
      → @CurrentTenant() extrai clinic_id
      → Todo service recebe clinicId como primeiro parâmetro
```

---

## Estrutura de Permissões (RBAC)

```
super_admin     → Acesso total à plataforma
clinic_owner    → Acesso total à sua clínica
manager         → Quase total, sem dados sensíveis de pagamento
receptionist    → Agenda + clientes, sem financeiro
professional    → Apenas sua agenda
financial       → Módulo financeiro apenas
```

---

## Módulos do Backend

```
src/
├── auth/           Autenticação, JWT, registro de clínicas
├── clinics/        CRUD de clínicas (super admin)
├── clients/        Gestão de clientes + prontuário
├── appointments/   Agenda, disponibilidade, conflitos
├── services/       Procedimentos e configurações
├── packages/       Pacotes de sessões
├── financial/      Fluxo de caixa, contas
├── professionals/  Agenda individual, comissões
├── stock/          Estoque, movimentações
├── marketing/      Campanhas, CRM
├── ai/             Assistente, análises, sugestões
└── common/         Guards, decorators, filters
```

---

## Modelo de Dados Resumido

```
clinics (tenant)
  └── users (colaboradores da clínica)
  └── clients (pacientes)
       └── appointments (agendamentos)
            └── financial_transactions (pagamentos)
       └── client_packages (pacotes comprados)
            └── package_sessions (sessões do pacote)
  └── services (procedimentos oferecidos)
  └── professionals (esteticistas)
  └── stock_products (estoque)
       └── stock_movements (entradas/saídas)
  └── marketing_campaigns
```

---

## Agenda Inteligente

### Verificação de Conflitos

```typescript
// Algoritmo de detecção de conflito de horário
SELECT * FROM appointments
WHERE professional_id = $1
  AND status NOT IN ('cancelled', 'no_show')
  AND start_at < $endAt
  AND end_at > $startAt
```

### Geração de Slots Disponíveis

1. Buscar horário de trabalho do profissional (JSONB `working_hours`)
2. Buscar agendamentos existentes no dia
3. Iterar intervalos de 30min gerando slots
4. Marcar como ocupado se há conflito com agendamento ou intervalo (break)

---

## Módulo de IA

### Modelo Utilizado: Claude (claude-opus-4-6)

**Por que Claude?**
- Melhor em raciocínio analítico e textos longos
- Seguimento rigoroso de instruções
- Menor custo por token vs GPT-4 em tarefas complexas

### Funcionalidades

1. **Chat livre** — Assistente que conhece os dados reais da clínica
2. **Análise financeira** — Compara meses, identifica tendências
3. **Campanhas de marketing** — Gera mensagens de WhatsApp prontas
4. **Sugestão de tratamentos** — Baseado no histórico e anamnese do cliente

### Prompt Engineering

```
system: contexto da clínica + dados reais
user: pergunta/pedido
→ Claude responde com dados e sugestões acionáveis
```

---

## Frontend — Design System

### Paleta de Cores

```
Primary: #9333ea (roxo — profissional, feminino, luxo)
Surface: escala de slate (cinzas modernos)
Success: #10b981 (emerald)
Warning: #f59e0b (amber)
Danger:  #ef4444 (red)
```

### Componentes Base

- `card` — Container com shadow e border
- `btn`, `btn-primary`, `btn-secondary` — Botões
- `input`, `label` — Formulários
- `badge-*` — Status e labels
- `skeleton` — Loading states

### Dark Mode

Implementado via `class="dark"` na `<html>` tag.
Tailwind `dark:` prefix em todos os componentes.
Preferência salva no `localStorage`.

---

## Performance

### Backend
- Redis cache para endpoints de leitura (5min TTL)
- Índices PostgreSQL em todas as foreign keys e colunas de busca
- `FULLTEXT INDEX` do MySQL para busca textual eficiente por nome de cliente
- Paginação em todos os endpoints de listagem

### Frontend
- Nuxt auto-imports (zero boilerplate)
- Code splitting automático por página
- SSR para SEO (página de onboarding/marketing)
- CSR para dashboard (interatividade)

---

## Segurança

1. **JWT** com expiração curta (7 dias) + refresh token (30 dias)
2. **Tenant isolation** — `clinic_id` em todo service, impossível acessar dados de outra clínica
3. **RBAC** — Guards verificam role antes de cada endpoint sensível
4. **Rate limiting** — Throttler: 10 req/s, 50/10s, 200/min
5. **Soft delete** — Dados nunca são removidos fisicamente (compliance LGPD)
6. **bcrypt** — Hash de senhas com salt rounds = 12
7. **Validação** — `class-validator` em todos os DTOs

---

## Roadmap de Desenvolvimento

### Fase 1 — MVP (4-6 semanas)
- [x] Autenticação + onboarding
- [x] Gestão de clientes
- [x] Agenda básica
- [x] Serviços e profissionais
- [ ] Financeiro básico (recebimentos)
- [ ] Notificações WhatsApp (lembrete de consulta)

### Fase 2 — Produto Completo (6-8 semanas)
- [ ] Módulo financeiro completo (DRE, fluxo de caixa)
- [ ] Pacotes de sessões
- [ ] Controle de estoque
- [ ] Relatórios gerenciais
- [ ] App mobile (React Native)

### Fase 3 — Escala e IA (4-6 semanas)
- [ ] Módulo IA completo
- [ ] Campanhas de marketing automáticas
- [ ] Auto-agendamento pelo cliente (link público)
- [ ] Integração Stripe (cobrança SaaS)
- [ ] Marketplace de temas/customização

### Fase 4 — Enterprise
- [ ] API pública para integrações
- [ ] Franquias (multi-unidade por clínica)
- [ ] BI avançado (Metabase embed)
- [ ] White-label

---

## Estimativa de Custos de Infraestrutura

| Serviço | Plano | Custo/mês |
|---|---|---|
| Railway / Render (Backend) | Starter | $5-20 |
| PlanetScale / Railway (MySQL) | Pro | $25 |
| Upstash (Redis) | Pay-per-use | $5-10 |
| Vercel (Frontend) | Pro | $20 |
| Cloudflare R2 (Storage) | Pay-per-use | $5 |
| **Total inicial** | | **~$60-80/mês** |

Suporta facilmente 50-100 clínicas ativas com esse budget.

---

## Precificação SaaS Sugerida

| Plano | Profissionais | Preço/mês |
|---|---|---|
| Starter | 1 | R$ 97 |
| Professional | 5 | R$ 197 |
| Business | 15 | R$ 397 |
| Enterprise | Ilimitado + IA | R$ 697 |

**Break-even:** ~2-3 clientes no plano Starter já cobrem a infra.

---

## Como Iniciar o Desenvolvimento

```bash
# 1. Clonar e instalar dependências
cd backend && npm install
cd ../frontend && npm install

# 2. Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com suas credenciais

# 3. Subir banco e Redis
cd docker && docker-compose up -d postgres redis

# 4. Rodar migrations
cd backend && npm run migration:run

# 5. Iniciar backend
npm run start:dev

# 6. Iniciar frontend (outro terminal)
cd frontend && npm run dev
```

Acesse:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001/api/v1
- Swagger Docs: http://localhost:3001/docs
