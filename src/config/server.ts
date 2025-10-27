/**
 * Server Configuration
 * Configurações principais do servidor Express
 */

export interface ServerConfig {
    port: number;
    host: string;
    nodeEnv: 'development' | 'production' | 'test';
    apiVersion: string;
    requestTimeout: number;
    bodyLimit: string;
    rateLimitWindow: number;
    rateLimitMax: number;
    gracefulShutdownTimeout: number;
}

export const serverConfig: ServerConfig = {
    port: parseInt(process.env.PORT || '3000'),
    host: process.env.HOST || '0.0.0.0',
    nodeEnv: (process.env.NODE_ENV as any) || 'development',
    apiVersion: process.env.API_VERSION || 'v1',
    requestTimeout: parseInt(process.env.REQUEST_TIMEOUT || '30000'), // 30 segundos
    bodyLimit: process.env.BODY_LIMIT || '10mb',
    rateLimitWindow: parseInt(process.env.RATE_LIMIT_WINDOW || '900000'), // 15 minutos
    rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '100'), // 100 requests por window
    gracefulShutdownTimeout: parseInt(process.env.GRACEFUL_SHUTDOWN_TIMEOUT || '10000'), // 10 segundos
};

/**
 * Configurações específicas do RPG
 */
export const gameConfig = {
    maxCharactersPerUser: parseInt(process.env.MAX_CHARACTERS_PER_USER || '5'),
    maxInventorySize: parseInt(process.env.MAX_INVENTORY_SIZE || '50'),
    baseDamageByClass: {
        warrior: 6,
        rogue: 7,
        mage: 7,
        cleric: 7,
    },
    specialAbilityMultiplier: {
        warrior: 2.0,
        rogue: 1.75,
        mage: 1.5,
        cleric: 0.95,
    },
    baseAttributes: {
        warrior: { strength: 5, dexterity: 1, intelligence: 1, wisdom: 1 },
        rogue: { strength: 1, dexterity: 6, intelligence: 1, wisdom: 1 },
        mage: { strength: 1, dexterity: 1, intelligence: 6, wisdom: 1 },
        cleric: { strength: 1, dexterity: 1, intelligence: 1, wisdom: 6 },
    },
} as const;

export type CharacterClass = keyof typeof gameConfig.baseDamageByClass;