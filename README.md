# Agenda OAB Piauí - Sistema de Eventos

Sistema oficial de gerenciamento de eventos da OAB Piauí. Acompanhe a agenda de eventos, reuniões e atividades em tempo real.

## 🚀 Funcionalidades

### 📅 Gerenciamento de Eventos
- **Criação de eventos** com título, descrição, data, horário e local
- **Edição e exclusão** de eventos próprios
- **Visualização pública** da agenda para usuários não autenticados
- **Filtros por setor** (Comissões, ESA Piauí, DCE, Imprensa, etc.)
- **Detecção de conflitos** para locais específicos (Auditório ESA, Auditório OAB)

### 🔔 Sistema de Notificações
- **Notificações em tempo real** para mudanças na agenda
- **Notificações do navegador** com permissão do usuário
- **Sons de alerta** personalizados para eventos
- **Central de notificações** com histórico completo
- **Configurações personalizáveis** de notificação

### 📊 Visualizações
- **Calendário mensal** com eventos destacados por setor
- **Lista de eventos** com filtros e busca
- **Detalhes completos** de cada evento
- **Log de atividades** em tempo real
- **Relatórios** de eventos por período

### 🔐 Autenticação e Segurança
- **Sistema de login** com usuário e senha
- **Controle de acesso** - apenas usuários autenticados podem criar/editar eventos
- **Visualização pública** da agenda sem necessidade de login
- **Logs de auditoria** para todas as ações

### 📱 Interface Responsiva
- **Design moderno** com Tailwind CSS
- **Animações suaves** e transições
- **Compatível com dispositivos móveis**
- **Indicadores visuais** de status em tempo real

## 🛠️ Tecnologias Utilizadas

### Frontend
- **React 18** - Biblioteca para interface de usuário
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Framework de estilos
- **Vite** - Build tool e servidor de desenvolvimento
- **Sonner** - Sistema de notificações toast

### Backend
- **Convex** - Backend-as-a-Service com banco de dados reativo
- **Convex Auth** - Sistema de autenticação
- **Real-time subscriptions** - Atualizações em tempo real

### Funcionalidades Avançadas
- **Service Worker** - Para notificações push
- **Web Audio API** - Para sons de notificação
- **Notification API** - Para notificações do navegador
- **File Storage** - Para arquivos de áudio e imagens

## 📁 Estrutura do Projeto

```
/
├── convex/                     # Backend Convex
│   ├── schema.ts              # Esquema do banco de dados
│   ├── events.ts              # Funções de eventos
│   ├── auth.ts                # Configuração de autenticação
│   ├── notifications.ts       # Sistema de notificações
│   ├── activityLogs.ts        # Logs de atividade
│   ├── sectors.ts             # Gerenciamento de setores
│   └── ...
├── src/
│   ├── components/            # Componentes React
│   │   ├── AgendaApp.tsx      # Aplicação principal
│   │   ├── Calendar.tsx       # Componente de calendário
│   │   ├── EventForm.tsx      # Formulário de eventos
│   │   ├── NotificationBell.tsx # Sino de notificações
│   │   └── ...
│   ├── hooks/                 # Hooks customizados
│   │   └── useRealtimeNotifications.ts
│   ├── lib/                   # Utilitários
│   └── ...
├── public/
│   ├── sounds/                # Arquivos de áudio
│   ├── service-worker.js      # Service Worker
│   └── ...
└── ...
```

## 🗄️ Esquema do Banco de Dados

### Tabelas Principais

#### `events`
```typescript
{
  title: string;           // Título do evento
  description?: string;    // Descrição opcional
  date: string;           // Data no formato YYYY-MM-DD
  startTime: string;      // Horário de início (HH:MM)
  endTime?: string;       // Horário de fim (HH:MM)
  sector: string;         // Setor responsável
  location?: string;      // Local do evento
  userId: Id<"users">;    // ID do usuário criador
  notificationSent: boolean; // Status de notificação
  originalText?: string;  // Texto original (se parseado)
}
```

#### `notifications`
```typescript
{
  userId: Id<"users">;
  type: string;
  title: string;
  message: string;
  read: boolean;
  timestamp: number;
  activityLogId?: Id<"activityLogs">;
}
```

#### `activityLogs`
```typescript
{
  action: string;         // "created" | "updated" | "deleted"
  entityType: string;     // "event"
  entityId?: Id<"events">;
  userId: Id<"users">;
  userName: string;
  userEmail: string;
  timestamp: number;
  details: object;        // Detalhes da ação
}
```

#### `sectors`
```typescript
{
  name: string;           // Nome do setor
  color: string;          // Cor de fundo
  textColor: string;      // Cor do texto
  bgLight: string;        // Cor de fundo clara
}
```

### Índices
- `events.by_date` - Para consultas por data
- `events.by_sector` - Para filtros por setor
- `events.by_user` - Para eventos do usuário
- `events.by_date_and_location` - Para detecção de conflitos
- `notifications.by_userId` - Para notificações do usuário
- `activityLogs.by_timestamp` - Para ordenação cronológica

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18+
- NPM ou Yarn
- Conta no Convex

### Instalação

1. **Clone o repositório**
```bash
git clone <repository-url>
cd agenda-oab-piaui
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure o Convex**
```bash
npx convex dev
```

4. **Configure as variáveis de ambiente**
```bash
# .env.local
VITE_CONVEX_URL=<sua-url-do-convex>
```

5. **Execute o projeto**
```bash
npm run dev
```

### Deploy

1. **Deploy do backend**
```bash
npx convex deploy
```

2. **Build do frontend**
```bash
npm run build
```

3. **Deploy do frontend** (Vercel, Netlify, etc.)

## 🔧 Configuração

### Setores Padrão
O sistema vem pré-configurado com os seguintes setores:
- **COMISSÕES** - Reuniões e atividades das comissões
- **ESA PIAUÍ** - Escola Superior de Advocacia
- **DCE** - Direitos do Consumidor
- **IMPRENSA** - Atividades de comunicação
- **PODCAST** - Gravações e entrevistas
- **DEMANDAS EXTERNAS** - Prerrogativas e defesa
- **PRESIDÊNCIA** - Atividades da presidência

### Locais com Controle de Conflito
- Auditório ESA
- Auditório OAB

### Notificações
- **Sons personalizados** armazenados em Convex Storage
- **Permissões do navegador** solicitadas automaticamente
- **Configurações por usuário** salvas localmente

## 📱 Funcionalidades por Tipo de Usuário

### Usuário Não Autenticado (Público)
- ✅ Visualizar agenda completa
- ✅ Filtrar eventos por setor
- ✅ Ver detalhes dos eventos
- ✅ Receber notificações em tempo real
- ✅ Alternar entre visualização de calendário e lista
- ❌ Criar, editar ou excluir eventos

### Usuário Autenticado
- ✅ Todas as funcionalidades públicas
- ✅ Criar novos eventos
- ✅ Editar eventos próprios
- ✅ Excluir eventos próprios
- ✅ Acessar central de notificações
- ✅ Ver log de atividades detalhado
- ✅ Gerar relatórios

## 🔔 Sistema de Notificações

### Tipos de Notificação
1. **Eventos Criados** - Quando um novo evento é adicionado
2. **Eventos Atualizados** - Quando um evento é modificado
3. **Eventos Excluídos** - Quando um evento é removido

### Canais de Notificação
1. **Toast** - Notificações na interface (Sonner)
2. **Browser** - Notificações nativas do navegador
3. **Som** - Alertas sonoros personalizados
4. **Central** - Histórico completo de notificações

### Configurações
- **Ativar/Desativar** notificações do navegador
- **Testar som** de notificação
- **Controle de volume** e preferências

## 📊 Relatórios e Analytics

### Relatórios Disponíveis
- **Eventos por período** - Quantidade e detalhes
- **Atividade por setor** - Distribuição de eventos
- **Log de atividades** - Auditoria completa
- **Estatísticas de uso** - Métricas do sistema

### Exportação
- **PDF** - Relatórios formatados
- **CSV** - Dados tabulares
- **JSON** - Dados estruturados

## 🛡️ Segurança e Privacidade

### Controle de Acesso
- **Autenticação obrigatória** para modificações
- **Isolamento de dados** por usuário
- **Validação de permissões** em todas as operações

### Auditoria
- **Log completo** de todas as ações
- **Rastreamento de mudanças** com before/after
- **Identificação de usuário** em todas as operações

### Privacidade
- **Dados mínimos** coletados
- **Transparência** nas operações
- **Controle do usuário** sobre notificações

## 🎨 Design e UX

### Princípios de Design
- **Simplicidade** - Interface limpa e intuitiva
- **Responsividade** - Funciona em todos os dispositivos
- **Acessibilidade** - Seguindo padrões WCAG
- **Performance** - Carregamento rápido e fluido

### Animações
- **Micro-interações** para feedback visual
- **Transições suaves** entre estados
- **Indicadores de carregamento** para operações assíncronas

### Cores e Tipografia
- **Paleta profissional** adequada ao contexto jurídico
- **Contraste adequado** para legibilidade
- **Tipografia clara** e hierarquia visual

## 🔄 Atualizações em Tempo Real

### Tecnologia
- **Convex Subscriptions** - WebSocket automático
- **React Query** - Cache inteligente
- **Optimistic Updates** - Interface responsiva

### Funcionalidades
- **Sincronização automática** entre dispositivos
- **Notificações instantâneas** de mudanças
- **Resolução de conflitos** automática
- **Indicadores de status** de conexão

## 📈 Performance

### Otimizações
- **Lazy Loading** - Componentes carregados sob demanda
- **Memoização** - Prevenção de re-renders desnecessários
- **Paginação** - Carregamento incremental de dados
- **Caching** - Armazenamento inteligente de dados

### Métricas
- **First Contentful Paint** < 1.5s
- **Largest Contentful Paint** < 2.5s
- **Cumulative Layout Shift** < 0.1
- **First Input Delay** < 100ms

## 🧪 Testes

### Estratégia de Testes
- **Testes unitários** - Componentes isolados
- **Testes de integração** - Fluxos completos
- **Testes E2E** - Cenários de usuário
- **Testes de performance** - Métricas de velocidade

### Ferramentas
- **Vitest** - Testes unitários
- **Testing Library** - Testes de componentes
- **Playwright** - Testes E2E
- **Lighthouse** - Auditoria de performance

## 🚀 Roadmap

### Próximas Funcionalidades
- [ ] **Integração com calendários externos** (Google Calendar, Outlook)
- [ ] **Notificações por email** para eventos importantes
- [ ] **Recurring events** - Eventos recorrentes
- [ ] **Anexos de arquivos** aos eventos
- [ ] **Comentários** e discussões em eventos
- [ ] **Aprovação de eventos** - Workflow de aprovação
- [ ] **API pública** para integrações
- [ ] **App mobile** nativo

### Melhorias Técnicas
- [ ] **PWA completo** - Instalação e offline
- [ ] **Testes automatizados** - CI/CD completo
- [ ] **Monitoramento** - Logs e métricas
- [ ] **Backup automático** - Segurança de dados
- [ ] **Multi-tenancy** - Suporte a múltiplas organizações

## 🤝 Contribuição

### Como Contribuir
1. **Fork** o repositório
2. **Crie uma branch** para sua feature
3. **Implemente** as mudanças
4. **Teste** thoroughly
5. **Submeta** um Pull Request

### Padrões de Código
- **TypeScript** obrigatório
- **ESLint** para qualidade de código
- **Prettier** para formatação
- **Conventional Commits** para mensagens

### Processo de Review
- **Code review** obrigatório
- **Testes** devem passar
- **Performance** não deve regredir
- **Documentação** deve ser atualizada

## 📞 Suporte

### Contato
- **Email**: suporte@oabpi.org.br
- **Telefone**: (86) 3221-1234
- **Endereço**: Rua Exemplo, 123 - Teresina/PI

### Documentação
- **Wiki** - Documentação detalhada
- **FAQ** - Perguntas frequentes
- **Tutoriais** - Guias passo a passo
- **API Docs** - Referência técnica

### Suporte Técnico
- **Horário**: Segunda a Sexta, 8h às 18h
- **Tempo de resposta**: Até 24 horas
- **Canais**: Email, telefone, chat

## 📄 Licença

Este projeto é propriedade da **OAB Piauí** e está licenciado sob os termos da licença proprietária. Todos os direitos reservados.

### Uso Permitido
- ✅ Uso interno da OAB Piauí
- ✅ Modificações para necessidades específicas
- ✅ Backup e arquivamento

### Uso Restrito
- ❌ Distribuição para terceiros
- ❌ Uso comercial externo
- ❌ Reverse engineering

---

**OAB Piauí © 2025** - Sistema de Gerenciamento de Eventos
