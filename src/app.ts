/**
 * Express Application Configuration
 * Configuração principal da aplicação Express com middlewares e rotas
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import swaggerUi from 'swagger-ui-express';
import { corsConfig } from './config/cors';
import { logger } from './config/logger';
import { RootException } from './exceptions/root';
import { createSuccessResponse, createErrorResponse } from './utils/response';
import { prisma, queryOptimizationMiddleware } from './config/database';
import { swaggerSpec } from './config/swagger';

// Import routes
import apiRoutes from './routes/index.routes';

// Criar aplicação Express
const app = express();

// Configurar trust proxy para deployment
app.set('trust proxy', 1);

// Response compression
app.use(compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
  level: 6,
  threshold: 1024
}));

// Middlewares de segurança
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://unpkg.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://unpkg.com"],
      imgSrc: ["'self'", "data:", "https:", "https://unpkg.com"],
      connectSrc: ["'self'", "https://unpkg.com"],
      fontSrc: ["'self'", "https://unpkg.com"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  noSniff: true,
  xssFilter: true,
  referrerPolicy: { policy: 'same-origin' },
  permittedCrossDomainPolicies: false
}));

// Security headers middleware
app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
  // Remove server information
  res.removeHeader('X-Powered-By');
  
  // Add security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'same-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  next();
});

// Caching headers middleware
app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
  // Static assets caching
  if (req.path.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/)) {
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  }
  // API responses - no cache for dynamic content
  else if (req.path.startsWith('/api/')) {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
  // Health check - short cache
  else if (req.path === '/health') {
    res.setHeader('Cache-Control', 'public, max-age=60');
  }
  // Documentation - medium cache
  else if (req.path.startsWith('/api-docs')) {
    res.setHeader('Cache-Control', 'public, max-age=3600');
  }
  
  next();
});

// CORS - deve vir antes do body parser
app.use(cors(corsConfig));

// Body parsing - DEVE VIR ANTES de qualquer middleware que acesse req.body
app.use(express.json({ 
  limit: '10mb',
  strict: true,
}));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging - vem DEPOIS do body parser
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined', {
    stream: {
      write: (message: string) => {
        logger.info(message.trim());
      }
    }
  }));
}

// Query optimization middleware
app.use(queryOptimizationMiddleware);

// Request logging middleware
app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const logData = {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      contentLength: res.get('Content-Length') || '0'
    };

    if (res.statusCode >= 400) {
      logger.warn('Request completed with error', logData);
    } else if (duration > 1000) {
      logger.warn('Slow request detected', logData);
    } else {
      logger.debug('Request completed', logData);
    }
  });

  next();
});

// Health check endpoint with database connectivity
app.get('/health', async (req, res) => {
  let dbStatus = 'unknown';
  let dbError = null;
  
  try {
    // Test database connection with timeout
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Database connection timeout')), 5000)
    );
    
    const dbPromise = prisma.$queryRaw`SELECT 1`;
    
    await Promise.race([dbPromise, timeoutPromise]);
    dbStatus = 'connected';
  } catch (error) {
    logger.warn('Database health check failed', error);
    dbStatus = 'disconnected';
    dbError = error instanceof Error ? error.message : 'Unknown error';
  }
  
  // Always return 200 for basic health check
  res.json(createSuccessResponse({
    status: dbStatus === 'connected' ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.API_VERSION || 'v1',
    database: dbStatus,
    databaseError: dbError,
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
    }
  }));
});

// API info endpoint
app.get('/', (req, res) => {
  res.json(createSuccessResponse({
    name: 'Arithimancia API',
    description: 'API REST para RPG Arithimancia - Sistema de personagens e combate matemático',
    version: process.env.API_VERSION || 'v1',
    environment: process.env.NODE_ENV || 'development',
    documentation: '/api-docs',
    health: '/health',
    endpoints: {
      auth: '/api/v1/auth',
      players: '/api/v1/players',
      characters: '/api/v1/characters',
      game: '/api/v1/game'
    }
  }));
});

// Swagger JSON endpoint (sempre disponível)
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  
  // Clonar o spec para não modificar o original
  const spec = JSON.parse(JSON.stringify(swaggerSpec));
  
  // Detectar se a requisição vem de localhost ou AWS
  const host = req.get('host') || '';
  const isLocalhost = host.includes('localhost') || host.includes('127.0.0.1');
  
  // Reordenar servidores baseado no ambiente
  if (isLocalhost && spec.servers && spec.servers.length > 1) {
    // Se localhost, colocar servidor local em primeiro
    spec.servers = [
      spec.servers.find((s: any) => s.url.includes('localhost')) || spec.servers[1],
      spec.servers.find((s: any) => !s.url.includes('localhost')) || spec.servers[0]
    ];
  }
  // Se não for localhost (AWS), a ordem já está correta (AWS primeiro)
  
  res.send(spec);
});

// Swagger UI via CDN (funciona em serverless!)
app.get('/api-docs', (req, res) => {
  // Usar URL relativa para funcionar em qualquer ambiente
  const specUrl = '/api-docs.json';
  
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Arithimancia API Documentation</title>
      <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.10.5/swagger-ui.css">
      <style>
        body {
          margin: 0;
          padding: 0;
        }
        .topbar {
          display: none;
        }
        #swagger-ui {
          max-width: 1460px;
          margin: 0 auto;
        }
      </style>
    </head>
    <body>
      <div id="swagger-ui"></div>
      <script src="https://unpkg.com/swagger-ui-dist@5.10.5/swagger-ui-bundle.js" crossorigin></script>
      <script src="https://unpkg.com/swagger-ui-dist@5.10.5/swagger-ui-standalone-preset.js" crossorigin></script>
      <script>
        window.onload = function() {
          console.log('Initializing Swagger UI...');
          console.log('Spec URL:', '${specUrl}');
          console.log('Current host:', window.location.host);
          
          try {
            window.ui = SwaggerUIBundle({
              url: '${specUrl}',
              dom_id: '#swagger-ui',
              deepLinking: true,
              presets: [
                SwaggerUIBundle.presets.apis,
                SwaggerUIStandalonePreset
              ],
              plugins: [
                SwaggerUIBundle.plugins.DownloadUrl
              ],
              layout: "StandaloneLayout",
              persistAuthorization: true,
              displayRequestDuration: true,
              docExpansion: 'list',
              filter: true,
              tryItOutEnabled: true,
              onComplete: function() {
                console.log('Swagger UI loaded successfully!');
              },
              onFailure: function(error) {
                console.error('Swagger UI failed to load:', error);
              }
            });
          } catch (error) {
            console.error('Error initializing Swagger UI:', error);
            document.getElementById('swagger-ui').innerHTML = 
              '<div style="padding: 20px; color: red;">Error loading Swagger UI: ' + error.message + '</div>';
          }
        };
      </script>
    </body>
    </html>
  `);
});

// API Documentation tradicional (apenas em desenvolvimento local)
if (process.env.NODE_ENV !== 'production' && !process.env.IS_LAMBDA) {
  app.use('/api-docs-local', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Arithimancia API Documentation',
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      docExpansion: 'none',
      filter: true,
      showExtensions: true,
      showCommonExtensions: true,
      tryItOutEnabled: true
    }
  }));
}

// API Routes
app.use('/api/v1', apiRoutes);

// Middleware para rotas não encontradas
app.use((req: express.Request, res: express.Response) => {
  res.status(404).json(createErrorResponse({
    code: 'ROUTE_NOT_FOUND',
    message: `Route ${req.method} ${req.originalUrl} not found`,
    details: {
      method: req.method,
      path: req.originalUrl,
      timestamp: new Date().toISOString()
    }
  }));
});

// Middleware global de tratamento de erros
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  // Log do erro
  logger.error('Unhandled error:', {
    error: error.message,
    stack: error.stack,
    method: req.method,
    path: req.path,
    body: req.body,
    query: req.query,
    params: req.params,
    headers: req.headers,
    timestamp: new Date().toISOString()
  });

  // Se é uma exceção customizada
  if (error instanceof RootException) {
    return res.status(error.statusCode).json(createErrorResponse({
      code: error.code,
      message: error.message,
      details: error.details,
      timestamp: new Date().toISOString(),
      path: req.originalUrl
    }));
  }

  // Erro de validação do Express
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json(createErrorResponse({
      code: 'INVALID_JSON',
      message: 'Invalid JSON in request body',
      details: error.message,
      timestamp: new Date().toISOString(),
      path: req.originalUrl
    }));
  }

  // Erro de payload muito grande
  if (error.type === 'entity.too.large') {
    return res.status(413).json(createErrorResponse({
      code: 'PAYLOAD_TOO_LARGE',
      message: 'Request payload too large',
      details: error.message,
      timestamp: new Date().toISOString(),
      path: req.originalUrl
    }));
  }

  // Erro genérico do servidor
  res.status(500).json(createErrorResponse({
    code: 'INTERNAL_SERVER_ERROR',
    message: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : error.message,
    details: process.env.NODE_ENV === 'production' 
      ? undefined 
      : {
          stack: error.stack,
          name: error.name
        },
    timestamp: new Date().toISOString(),
    path: req.originalUrl
  }));
});

export default app;