/**
 * Script para gerar o arquivo swagger.json em tempo de build
 */

import fs from 'fs';
import path from 'path';
import swaggerJsdoc from 'swagger-jsdoc';
import { SwaggerDefinition } from 'swagger-jsdoc';

const swaggerDefinition: SwaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Arithimancia API',
    version: '1.0.0',
    description: 'API REST para RPG Arithimancia - Sistema de personagens e combate matemático baseado no universo de Harry Potter',
    contact: {
      name: 'Vinicius Franco',
      email: 'vinifranco48@gmail.com',
      url: 'https://github.com/vinifranco48/arithimancia_api'
    },
    license: {
      name: 'ISC',
      url: 'https://opensource.org/licenses/ISC'
    }
  },
  servers: [
    {
      url: (process.env.API_BASE_URL || 'https://v16843rlel.execute-api.us-east-1.amazonaws.com') + '/api/v1',
      description: 'API Server'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT token obtido através do endpoint de login'
      }
    },
    schemas: {
      ErrorResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: false
          },
          error: {
            type: 'object',
            properties: {
              code: {
                type: 'string',
                example: 'VALIDATION_ERROR'
              },
              message: {
                type: 'string',
                example: 'Validation failed'
              },
              details: {
                type: 'object',
                description: 'Additional error details'
              },
              timestamp: {
                type: 'string',
                format: 'date-time',
                example: '2024-01-01T00:00:00.000Z'
              },
              path: {
                type: 'string',
                example: '/api/v1/auth/login'
              }
            }
          }
        }
      },
      SuccessResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true
          },
          message: {
            type: 'string',
            example: 'Operation completed successfully'
          },
          data: {
            type: 'object',
            description: 'Response data'
          },
          timestamp: {
            type: 'string',
            format: 'date-time',
            example: '2024-01-01T00:00:00.000Z'
          }
        }
      },
      Player: {
        type: 'object',
        properties: {
          id: {
            type: 'integer',
            example: 1
          },
          username: {
            type: 'string',
            example: 'hermione_granger'
          },
          email: {
            type: 'string',
            format: 'email',
            example: 'hermione@hogwarts.edu'
          },
          createdAt: {
            type: 'string',
            format: 'date-time'
          },
          lastLogin: {
            type: 'string',
            format: 'date-time',
            nullable: true
          }
        }
      },
      Character: {
        type: 'object',
        properties: {
          id: {
            type: 'integer',
            example: 1
          },
          name: {
            type: 'string',
            example: 'Hermione Granger'
          },
          level: {
            type: 'integer',
            example: 5
          },
          experiencePoints: {
            type: 'integer',
            example: 1250
          },
          gold: {
            type: 'integer',
            example: 500
          },
          maxHealth: {
            type: 'integer',
            example: 100
          },
          currentHealth: {
            type: 'integer',
            example: 85
          },
          playerId: {
            type: 'integer',
            example: 1
          },
          schoolId: {
            type: 'integer',
            example: 1,
            nullable: true
          },
          currentLocationId: {
            type: 'integer',
            example: 1
          },
          createdAt: {
            type: 'string',
            format: 'date-time'
          },
          updatedAt: {
            type: 'string',
            format: 'date-time'
          }
        }
      },
      AuthTokens: {
        type: 'object',
        properties: {
          accessToken: {
            type: 'string',
            description: 'JWT access token válido por 15 minutos'
          },
          refreshToken: {
            type: 'string',
            description: 'JWT refresh token válido por 7 dias'
          }
        }
      },
      School: {
        type: 'object',
        properties: {
          id: {
            type: 'integer',
            example: 1
          },
          name: {
            type: 'string',
            example: 'Academia de Álgebra Arcana'
          },
          description: {
            type: 'string',
            example: 'Escola especializada em magia algébrica e equações místicas'
          },
          bonusType: {
            type: 'string',
            enum: ['EXPERIENCE', 'GOLD', 'HEALTH'],
            example: 'EXPERIENCE'
          },
          bonusValue: {
            type: 'integer',
            example: 10
          }
        }
      },
      Quest: {
        type: 'object',
        properties: {
          id: {
            type: 'integer',
            example: 1
          },
          title: {
            type: 'string',
            example: 'O Mistério dos Números Primos'
          },
          description: {
            type: 'string',
            example: 'Descubra o segredo por trás dos números primos mágicos'
          },
          experienceReward: {
            type: 'integer',
            example: 100
          },
          goldReward: {
            type: 'integer',
            example: 50
          },
          requiredLevel: {
            type: 'integer',
            example: 1
          },
          isActive: {
            type: 'boolean',
            example: true
          }
        }
      },
      Monster: {
        type: 'object',
        properties: {
          id: {
            type: 'integer',
            example: 1
          },
          name: {
            type: 'string',
            example: 'Dragão das Derivadas'
          },
          description: {
            type: 'string',
            example: 'Uma criatura que respira equações diferenciais'
          },
          level: {
            type: 'integer',
            example: 3
          },
          health: {
            type: 'integer',
            example: 150
          },
          experienceReward: {
            type: 'integer',
            example: 75
          },
          goldReward: {
            type: 'integer',
            example: 25
          }
        }
      }
    }
  },
  tags: [
    {
      name: 'Authentication',
      description: 'Endpoints para autenticação e gerenciamento de sessão'
    },
    {
      name: 'Players',
      description: 'Endpoints para gerenciamento de perfil do jogador'
    },
    {
      name: 'Characters',
      description: 'Endpoints para criação e gerenciamento de personagens'
    },
    {
      name: 'Game',
      description: 'Endpoints para mecânicas do jogo (combate, missões, inventário)'
    },
    {
      name: 'System',
      description: 'Endpoints do sistema (health check, informações da API)'
    }
  ]
};

const options = {
  definition: swaggerDefinition,
  apis: [
    './src/routes/*.ts',
    './src/controllers/*.ts',
    './src/schemas/*.ts'
  ]
};

// Gerar spec
console.log('Generating Swagger specification...');
const swaggerSpec = swaggerJsdoc(options);

// Salvar em arquivo
const outputPath = path.join(__dirname, '..', 'dist', 'swagger.json');
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, JSON.stringify(swaggerSpec, null, 2));

console.log(`✅ Swagger specification generated at: ${outputPath}`);
console.log(`📊 Found ${Object.keys((swaggerSpec as any).paths || {}).length} endpoints`);
