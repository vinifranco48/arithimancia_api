# 🎮 Arithimancia API

API REST para RPG de texto baseado em matemática.

# Contribuidores
Vinicius Franco
Luis Eduardo Rodrigues
Emanuel Mascarenha

## 🌐 API em Produção

**🔗 URL Base:** `https://v16843rlel.execute-api.us-east-1.amazonaws.com`

**📚 Documentação Interativa (Swagger):** [https://v16843rlel.execute-api.us-east-1.amazonaws.com/api-docs](https://v16843rlel.execute-api.us-east-1.amazonaws.com/api-docs)

## 🚀 Tecnologias

- **Runtime:** Node.js 20.x + TypeScript
- **Framework:** Express.js
- **Banco de Dados:** SQLite (em /tmp no Lambda)
- **ORM:** Prisma
- **Autenticação:** JWT (Access + Refresh Tokens)
- **Documentação:** Swagger/OpenAPI 3.0
- **Deploy:** AWS Lambda via Serverless Framework
- **Validação:** Zod

## 📋 Pré-requisitos

- Node.js 20.x ou superior
- npm ou yarn
- AWS CLI configurado (para deploy)

## 🔧 Instalação

```bash
# Clonar repositório
git clone https://github.com/vinifranco48/arithimancia_api.git
cd arithimancia_api

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Edite o .env com suas configurações

# Gerar Prisma Client
npx prisma generate

# Criar banco de dados local
npx prisma db push

# Popular banco com dados iniciais
npm run db:seed
```

## 🏃 Executar Localmente

```bash
# Modo desenvolvimento (com hot reload)
npm run dev

# Build
npm run build

# Produção local
npm start
```

A API estará disponível em `http://localhost:3000`

## 📚 Documentação

### Swagger UI
Acesse `http://localhost:3000/api-docs` (local) ou a URL de produção para ver a documentação interativa.

### Endpoints Principais

#### Autenticação
- `POST /api/v1/auth/register` - Registrar novo jogador
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/refresh` - Renovar tokens
- `POST /api/v1/auth/logout` - Logout
- `GET /api/v1/auth/me` - Dados do usuário autenticado
- `POST /api/v1/auth/check-username` - Verificar disponibilidade de username
- `POST /api/v1/auth/check-email` - Verificar disponibilidade de email

#### Personagens
- `POST /api/v1/characters` - Criar personagem
- `GET /api/v1/characters` - Listar personagens do jogador
- `GET /api/v1/characters/:id` - Detalhes do personagem
- `PATCH /api/v1/characters/:id` - Atualizar personagem
- `DELETE /api/v1/characters/:id` - Deletar personagem

#### Jogadores
- `GET /api/v1/players/profile` - Perfil do jogador
- `PATCH /api/v1/players/profile` - Atualizar perfil
- `DELETE /api/v1/players/account` - Deletar conta

#### Sistema
- `GET /health` - Health check
- `GET /` - Informações da API

## 🧪 Exemplos de Uso

### Registrar Usuário
```bash
curl -X POST https://v16843rlel.execute-api.us-east-1.amazonaws.com/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "hermione",
    "email": "hermione@hogwarts.edu",
    "password": "Senha123",
    "passwordConfirmation": "Senha123"
  }'
```

### Login
```bash
curl -X POST https://v16843rlel.execute-api.us-east-1.amazonaws.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "login": "hermione@hogwarts.edu",
    "password": "Senha123"
  }'
```

### Criar Personagem (requer autenticação)
```bash
curl -X POST https://v16843rlel.execute-api.us-east-1.amazonaws.com/api/v1/characters \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_ACCESS_TOKEN" \
  -d '{
    "name": "Hermione Granger",
    "schoolId": 1
  }'
```

## 🚀 Deploy na AWS Lambda

```bash
# Build do projeto
npm run build

# Deploy
npx serverless deploy

# Ver logs em tempo real
npx serverless logs -f api --tail

# Remover da AWS
npx serverless remove
```

## 📁 Estrutura do Projeto

```
arithimancia_api/
├── src/
│   ├── config/          # Configurações (database, logger, swagger, etc)
│   ├── controllers/     # Controladores das rotas
│   ├── middlewares/     # Middlewares (auth, validation, etc)
│   ├── routes/          # Definição de rotas
│   ├── services/        # Lógica de negócio
│   ├── repositories/    # Acesso ao banco de dados
│   ├── schemas/         # Schemas de validação (Zod)
│   ├── exceptions/      # Exceções customizadas
│   ├── utils/           # Utilitários
│   ├── app.ts           # Configuração do Express
│   ├── server.ts        # Servidor HTTP
│   └── lambda.ts        # Handler para AWS Lambda
├── prisma/
│   ├── schema.prisma    # Schema do banco de dados
│   └── seed.ts          # Dados iniciais
├── scripts/
│   └── generate-swagger.ts  # Geração do Swagger JSON
├── docs/                # Documentação adicional
├── .env.example         # Exemplo de variáveis de ambiente
├── serverless.yml       # Configuração do Serverless Framework
├── tsconfig.json        # Configuração do TypeScript
└── package.json         # Dependências e scripts
```


## 🗄️ Banco de Dados

### Schema
O projeto usa Prisma ORM com SQLite. O schema inclui:
- **Player** - Jogadores
- **Character** - Personagens
- **School** - Escolas de magia
- **Location** - Localizações
- **Quest** - Missões
- **Monster** - Monstros
- **Problem** - Problemas matemáticos
- **Item** - Itens
- **Battle** - Batalhas
- **RefreshToken** - Tokens de refresh

### Comandos Prisma
```bash
# Gerar client
npx prisma generate

# Criar/atualizar banco
npx prisma db push

# Popular com dados iniciais
npm run db:seed

# Resetar banco
npm run db:reset

# Abrir Prisma Studio
npx prisma studio
```

## 🧪 Testes

```bash
# Executar testes
npm test

# Testes em modo watch
npm run test:watch
```

## 📝 Scripts Disponíveis

```bash
npm run dev              # Desenvolvimento com hot reload
npm run build            # Build do projeto
npm start                # Executar em produção
npm test                 # Executar testes
npm run db:seed          # Popular banco de dados
npm run db:reset         # Resetar banco de dados
npm run sls:offline      # Testar Lambda localmente
npm run sls:deploy       # Deploy na AWS
```

## 🔒 Segurança

- Senhas hasheadas com bcrypt
- JWT para autenticação
- Refresh tokens com expiração
- Validação de dados com Zod
- Rate limiting
- Helmet para headers de segurança
- CORS configurado

## 📊 Monitoramento

### CloudWatch (AWS)
- Log Group: `/aws/lambda/arithimancia-api-dev-api`
- Métricas: Invocações, Duração, Erros, Throttles

### Logs Locais
Os logs são estruturados e incluem:
- Timestamp
- Level (info, warn, error, debug)
- Message
- Metadata


## 👤 Autor

**Vinicius Franco**
- Email: vinifranco48@gmail.com
- GitHub: [@vinifranco48](https://github.com/vinifranco48)

---

⭐ Se este projeto foi útil, considere dar uma estrela no GitHub!
