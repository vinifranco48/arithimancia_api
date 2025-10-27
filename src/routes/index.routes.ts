/**
 * Route Aggregator
 * Combina todas as rotas dos módulos e aplica middlewares
 */

import { Router, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

// Import route modules
import authRoutes from './auth.routes';
import playerRoutes from './player.routes';
import characterRoutes from './character.routes';
import gameRoutes from './game.routes';

// Import middlewares
import { validateContentType, sanitizeStrings } from '../middlewares/validation.middleware';

const router = Router();

// ===== SECURITY MIDDLEWARES =====

/**
 * CORS Configuration
 * Configuração para Cross-Origin Resource Sharing
 */
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  maxAge: 86400 // 24 hours
};

/**
 * Helmet Configuration
 * Configuração de cabeçalhos de segurança
 */
const helmetOptions = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
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
  }
};

/**
 * Rate Limiting Configuration
 * Configuração de limite de requisições
 */
const generalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Máximo 100 requisições por IP por janela
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests from this IP, please try again later.',
      timestamp: new Date().toISOString()
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req: Request) => {
    // Pular rate limiting para health check
    return req.path === '/health' || req.path === '/';
  }
});

/**
 * Strict Rate Limiting para endpoints sensíveis
 * Aplicado a login, registro e outras operações críticas
 */
const strictRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // Máximo 5 tentativas por IP por janela
  message: {
    success: false,
    error: {
      code: 'STRICT_RATE_LIMIT_EXCEEDED',
      message: 'Too many attempts from this IP, please try again later.',
      timestamp: new Date().toISOString()
    }
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Rate Limiting para API de jogo
 * Mais permissivo para gameplay normal
 */
const gameRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 30, // Máximo 30 requisições por IP por minuto
  message: {
    success: false,
    error: {
      code: 'GAME_RATE_LIMIT_EXCEEDED',
      message: 'Too many game actions, please slow down.',
      timestamp: new Date().toISOString()
    }
  },
  standardHeaders: true,
  legacyHeaders: false
});

// ===== APPLY GLOBAL MIDDLEWARES =====

// Security headers
router.use(helmet(helmetOptions));

// CORS
router.use(cors(corsOptions));

// General rate limiting
router.use(generalRateLimit);

// Content type validation and sanitization
router.use(validateContentType);
router.use(sanitizeStrings);

// ===== HEALTH CHECK ENDPOINT =====

/**
 * GET /
 * Health check endpoint
 */
router.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Arithimancia API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

/**
 * GET /health
 * Detailed health check endpoint
 */
router.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'API Health Check',
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      database: 'connected' // TODO: Add actual database health check
    }
  });
});

// ===== API ROUTES =====

/**
 * Authentication Routes
 * Aplicar rate limiting estrito para endpoints de auth
 */
router.use('/auth/login', strictRateLimit);
router.use('/auth/register', strictRateLimit);
router.use('/auth/refresh', strictRateLimit);
router.use('/auth', authRoutes);

/**
 * Player Management Routes
 * Rate limiting padrão aplicado
 */
router.use('/players', playerRoutes);

/**
 * Character Management Routes
 * Rate limiting padrão aplicado
 */
router.use('/characters', characterRoutes);

/**
 * Game Mechanics Routes
 * Rate limiting específico para gameplay
 */
router.use('/game', gameRateLimit, gameRoutes);

// ===== ERROR HANDLING FOR ROUTES =====

/**
 * 404 Handler para rotas não encontradas
 */
router.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'ROUTE_NOT_FOUND',
      message: `Route ${req.method} ${req.originalUrl} not found`,
      timestamp: new Date().toISOString(),
      path: req.originalUrl
    }
  });
});

export default router;