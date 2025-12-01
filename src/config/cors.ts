/**
 * CORS Configuration
 * Configurações de Cross-Origin Resource Sharing
 */

import { CorsOptions } from 'cors';

const productionOrigins = [
    'https://arithimancia.vercel.app',
    'https://v16843rlel.execute-api.us-east-1.amazonaws.com',
];

const isDevelopment = process.env.NODE_ENV !== 'production';

export const corsConfig: CorsOptions = {
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
        // Permitir requests sem origin (mobile apps, Postman, etc.)
        if (!origin) {
            return callback(null, true);
        }

        // Em desenvolvimento, permite qualquer localhost
        if (isDevelopment && origin.startsWith('http://localhost')) {
            return callback(null, true);
        }

        // Em produção, verifica a lista de origens permitidas
        if (productionOrigins.includes(origin)) {
            return callback(null, true);
        }

        // Se não for desenvolvimento nem produção válida, rejeita
        if (!isDevelopment) {
            return callback(new Error('Não permitido pelo CORS'));
        }

        // Fallback para desenvolvimento
        callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
        'Origin',
        'X-Requested-With',
        'Content-Type',
        'Accept',
        'Authorization',
        'Cache-Control',
        'X-API-Key',
    ],
    exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
    maxAge: 86400, // 24 horas
    optionsSuccessStatus: 200, // Alguns navegadores antigos (IE11) têm problema com 204
};

// Configuração alternativa: permitir TODAS as origens (use com cuidado!)
export const corsOpenConfig: CorsOptions = {
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
        // ATENÇÃO: Isso permite QUALQUER origem - use apenas para desenvolvimento/testes
        callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
        'Origin',
        'X-Requested-With',
        'Content-Type',
        'Accept',
        'Authorization',
        'Cache-Control',
        'X-API-Key',
    ],
    exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
    maxAge: 86400,
    optionsSuccessStatus: 200,
};