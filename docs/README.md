# Arithimancia API Documentation

## Visão Geral

A Arithimancia API é uma API REST para um RPG baseado no universo de Harry Potter, onde os jogadores criam personagens e enfrentam desafios matemáticos em combates contra criaturas mágicas.

## Acesso à Documentação

### Desenvolvimento
- **Swagger UI**: http://localhost:3000/api-docs
- **OpenAPI JSON**: http://localhost:3000/api-docs.json
- **Health Check**: http://localhost:3000/health

### Produção
- **Swagger UI**: https://arithimancia-api.herokuapp.com/api-docs
- **Health Check**: https://arithimancia-api.herokuapp.com/health

## Autenticação

A API utiliza JWT (JSON Web Tokens) para autenticação:

1. **Registrar**: `POST /api/v1/auth/register`
2. **Login**: `POST /api/v1/auth/login`
3. **Usar Token**: Incluir no header `Authorization: Bearer <token>`
4. **Renovar**: `POST /api/v1/auth/refresh`

### Exemplo de Uso

```bash
# Registrar novo jogador
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "hermione_granger",
    "email": "hermione@hogwarts.edu",
    "password": "securePassword123"
  }'

# Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "hermione@hogwarts.edu",
    "password": "securePassword123"
  }'

# Usar token em requisições protegidas
curl -X GET http://localhost:3000/api/v1/characters \
  -H "Authorization: Bearer <seu_access_token>"
```

## Endpoints Principais

### Autenticação
- `POST /auth/register` - Registrar novo jogador
- `POST /auth/login` - Login
- `POST /auth/refresh` - Renovar tokens
- `POST /auth/logout` - Logout
- `GET /auth/me` - Dados do jogador autenticado

### Personagens
- `GET /characters` - Listar personagens do jogador
- `POST /characters` - Criar novo personagem
- `GET /characters/:id` - Detalhes do personagem
- `PUT /characters/:id` - Atualizar personagem
- `DELETE /characters/:id` - Deletar personagem

### Jogo
- `POST /game/characters/:id/encounters` - Iniciar combate
- `POST /game/encounters/:id/solve` - Resolver problema matemático
- `GET /game/characters/:id/quests` - Missões disponíveis
- `POST /game/characters/:id/quests/:id/accept` - Aceitar missão

### Jogador
- `GET /players/profile` - Perfil do jogador
- `PUT /players/profile` - Atualizar perfil
- `PUT /players/password` - Alterar senha

## Rate Limiting

- **Geral**: 100 requisições por 15 minutos
- **Autenticação**: 5 tentativas por 15 minutos
- **Jogo**: 30 requisições por minuto

## Códigos de Status

| Código | Descrição |
|--------|-----------|
| 200 | Sucesso |
| 201 | Criado com sucesso |
| 400 | Dados inválidos |
| 401 | Não autenticado |
| 403 | Sem permissão |
| 404 | Não encontrado |
| 409 | Conflito (ex: email já existe) |
| 422 | Erro de validação |
| 429 | Rate limit excedido |
| 500 | Erro interno do servidor |

## Formato de Resposta

### Sucesso
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Erro
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": { ... },
    "timestamp": "2024-01-01T00:00:00.000Z",
    "path": "/api/v1/auth/login"
  }
}
```

## Regras de Negócio

### Personagens
- Máximo 3 personagens por jogador
- Nome único por jogador
- Level inicial: 1
- HP inicial: 100
- Gold inicial: 100
- Localização inicial: Biblioteca de Alexandria Numérica

### Combate
- Resolver problemas matemáticos para vencer
- XP e gold como recompensa
- Level up automático ao atingir XP necessário

### Missões
- Aceitar missões baseadas no level
- Completar objetivos para ganhar recompensas
- Progresso salvo automaticamente

## Desenvolvimento

### Executar Localmente
```bash
# Instalar dependências
npm install

# Configurar banco de dados
npm run db:migrate
npm run db:seed

# Executar em desenvolvimento
npm run dev

# Executar testes
npm test
```

### Variáveis de Ambiente
```env
DATABASE_URL=postgresql://...
JWT_SECRET=seu_jwt_secret
JWT_REFRESH_SECRET=seu_refresh_secret
NODE_ENV=development
PORT=3000
```

## Suporte

Para dúvidas ou problemas:
- **GitHub**: https://github.com/vinifranco48/arithimancia_api
- **Email**: vinifranco48@gmail.com
- **Issues**: https://github.com/vinifranco48/arithimancia_api/issues