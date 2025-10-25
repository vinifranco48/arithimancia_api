# Documento de Design - Backend Node.js com Express

## Visão Geral

O projeto será estruturado seguindo os princípios de Clean Architecture e padrões MVC, com foco em modularidade, testabilidade e manutenibilidade. A arquitetura será organizada em camadas bem definidas, utilizando as melhores práticas da comunidade Node.js.

## Arquitetura

### Estrutura de Diretórios

```
src/
├── config/           # Configurações da aplicação
│   ├── database.js   # Configuração de banco de dados
│   ├── logger.js     # Configuração do sistema de logs
│   └── env.js        # Validação e carregamento de variáveis de ambiente
├── controllers/      # Controladores da aplicação
│   ├── healthController.js
│   └── index.js
├── middleware/       # Middleware customizado
│   ├── errorHandler.js
│   ├── notFound.js
│   ├── requestLogger.js
│   └── validation.js
├── routes/          # Definição de rotas
│   ├── api/
│   │   ├── v1/
│   │   │   ├── health.js
│   │   │   └── index.js
│   │   └── index.js
│   └── index.js
├── services/        # Lógica de negócio
├── utils/           # Utilitários e helpers
│   ├── logger.js
│   └── response.js
└── app.js           # Configuração principal do Express
server.js            # Ponto de entrada da aplicação
```

### Padrões Arquiteturais

1. **Separation of Concerns**: Cada camada tem responsabilidade específica
2. **Dependency Injection**: Facilita testes e manutenção
3. **Error-First Callbacks**: Padrão Node.js para tratamento de erros
4. **Middleware Pattern**: Para funcionalidades transversais

## Componentes e Interfaces

### 1. Servidor Principal (server.js)

**Responsabilidade**: Ponto de entrada da aplicação
- Carrega variáveis de ambiente
- Inicializa o servidor Express
- Configura graceful shutdown

### 2. Aplicação Express (app.js)

**Responsabilidade**: Configuração do Express e middleware
- Configuração de middleware global
- Registro de rotas
- Configuração de tratamento de erros

```javascript
// Interface esperada
const app = express();
app.use(middleware);
app.use('/api', routes);
app.use(errorHandler);
```

### 3. Sistema de Roteamento

**Responsabilidade**: Organização e versionamento de endpoints

```javascript
// Estrutura de roteamento
/api/v1/health     -> GET  - Status de saúde
/api/v1/info       -> GET  - Informações da aplicação
```

### 4. Controllers

**Responsabilidade**: Processamento de requisições HTTP

```javascript
// Interface padrão de controller
const controller = {
  async methodName(req, res, next) {
    try {
      // Lógica do controller
      res.json(response);
    } catch (error) {
      next(error);
    }
  }
};
```

### 5. Middleware de Erro

**Responsabilidade**: Tratamento centralizado de exceções

```javascript
// Interface de error handler
function errorHandler(err, req, res, next) {
  // Log do erro
  // Formatação da resposta
  // Envio da resposta apropriada
}
```

## Modelos de Dados

### Entidades do RPG

#### Character (Personagem)
```javascript
{
  id: string,
  name: string,
  description: string,
  race: string,
  class: 'warrior' | 'rogue' | 'mage' | 'cleric',
  attributes: {
    strength: number,
    dexterity: number,
    intelligence: number,
    wisdom: number
  },
  inventory: Item[],
  createdAt: Date,
  updatedAt: Date
}
```

#### Item (Item/Equipamento)
```javascript
{
  id: string,
  name: string,
  description: string,
  type: 'weapon' | 'armor' | 'accessory',
  attributes: {
    strength?: number,
    dexterity?: number,
    intelligence?: number,
    wisdom?: number,
    damage?: number
  },
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
}
```

#### Combat Stats (Estatísticas de Combate)
```javascript
{
  baseDamage: number,
  specialAbilityDamage: number,
  totalAttributes: {
    strength: number,
    dexterity: number,
    intelligence: number,
    wisdom: number
  }
}
```

### Estrutura de Resposta Padronizada

```javascript
{
  success: boolean,
  data: any,
  message: string,
  timestamp: string,
  requestId: string
}
```

### Estrutura de Erro Padronizada

```javascript
{
  success: false,
  error: {
    code: string,
    message: string,
    details: any
  },
  timestamp: string,
  requestId: string
}
```

### Configuração de Ambiente

```javascript
{
  NODE_ENV: 'development' | 'production' | 'test',
  PORT: number,
  LOG_LEVEL: 'debug' | 'info' | 'warn' | 'error',
  API_VERSION: string,
  SUPABASE_URL: string,
  SUPABASE_ANON_KEY: string,
  SUPABASE_SERVICE_ROLE_KEY: string
}
```

## Tratamento de Erros

### Estratégia de Error Handling

1. **Async Error Wrapper**: Wrapper para capturar erros em funções async
2. **Error Classes**: Classes customizadas para diferentes tipos de erro
3. **Global Error Handler**: Middleware global para tratamento de erros
4. **404 Handler**: Middleware específico para rotas não encontradas

### Tipos de Erro

```javascript
class AppError extends Error {
  constructor(message, statusCode, code) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
  }
}

// Tipos específicos
class ValidationError extends AppError {}
class NotFoundError extends AppError {}
class DatabaseError extends AppError {}
```

## Estratégia de Testes

### Estrutura de Testes

```
tests/
├── unit/            # Testes unitários
│   ├── controllers/
│   ├── middleware/
│   └── utils/
├── integration/     # Testes de integração
│   └── routes/
└── fixtures/        # Dados de teste
```

### Ferramentas de Teste

- **Jest**: Framework de testes principal
- **Supertest**: Testes de API HTTP
- **Sinon**: Mocks e stubs
- **Istanbul/NYC**: Cobertura de código

### Estratégias de Teste

1. **Unit Tests**: Testam componentes isoladamente
2. **Integration Tests**: Testam fluxos completos de API
3. **Contract Tests**: Validam interfaces entre componentes
4. **Health Check Tests**: Verificam endpoints de monitoramento

## Configuração de Segurança

### Middleware de Segurança

1. **Helmet**: Headers de segurança HTTP
2. **CORS**: Configuração de Cross-Origin Resource Sharing
3. **Rate Limiting**: Proteção contra ataques de força bruta
4. **Input Validation**: Validação e sanitização de entrada

### Configurações de Produção

```javascript
// Configurações específicas para produção
{
  trustProxy: true,
  compression: true,
  securityHeaders: true,
  rateLimiting: {
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100 // máximo 100 requests por IP
  }
}
```

## Sistema de Logging

### Estrutura de Logs

```javascript
{
  timestamp: ISO8601,
  level: 'debug' | 'info' | 'warn' | 'error',
  message: string,
  requestId: string,
  userId?: string,
  metadata: {
    method: string,
    url: string,
    statusCode: number,
    responseTime: number,
    userAgent: string,
    ip: string
  }
}
```

### Configuração por Ambiente

- **Development**: Console output com cores
- **Production**: JSON structured logs
- **Test**: Logs silenciados ou mínimos

## Performance e Monitoramento

### Métricas de Saúde

```javascript
{
  status: 'healthy' | 'degraded' | 'unhealthy',
  timestamp: ISO8601,
  uptime: number,
  memory: {
    used: number,
    total: number,
    percentage: number
  },
  version: string,
  environment: string
}
```

### Endpoints de Monitoramento

- `GET /health`: Status básico de saúde
- `GET /api/v1/info`: Informações da aplicação
- `GET /metrics`: Métricas detalhadas (opcional)

## Decisões de Design

### 1. Estrutura Modular
**Decisão**: Organizar código em módulos por funcionalidade
**Justificativa**: Facilita manutenção e permite crescimento escalável

### 2. Middleware-First Approach
**Decisão**: Usar middleware para funcionalidades transversais
**Justificativa**: Reutilização de código e separação de responsabilidades

### 3. Error-First Pattern
**Decisão**: Seguir padrão Node.js de error-first callbacks
**Justificativa**: Consistência com ecossistema Node.js

### 4. Environment-Based Configuration
**Decisão**: Configuração baseada em variáveis de ambiente
**Justificativa**: Segurança e flexibilidade para diferentes ambientes

### 5. Structured Logging
**Decisão**: Logs estruturados em JSON para produção
**Justificativa**: Facilita análise e monitoramento automatizado