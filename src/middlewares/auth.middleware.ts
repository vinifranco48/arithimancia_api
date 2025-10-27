import { Request, Response, NextFunction } from "express";
import { verifyAccessToken, extractTokenFromHeader } from "../utils/jwt";
import { isTokenBlacklisted } from "../utils/token-blacklist";
import AuthService from "../services/auth.service";
import { UnauthorizedException } from "../exceptions/unauthorized";

// Interface para player autenticado
export interface AuthenticatedPlayer {
    id: number;
    username: string;
    email: string;
}

// Estender Request para incluir player
declare global {
    namespace Express {
        interface Request {
            user?: AuthenticatedPlayer;
        }
    }
}

/**
 * Middleware de autenticação JWT
 */
const authMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        // Extrair token do header Authorization
        const token = extractTokenFromHeader(req.headers.authorization);

        // Verificar se token está na blacklist
        if (isTokenBlacklisted(token)) {
            throw new UnauthorizedException("Token has been invalidated", "TOKEN_BLACKLISTED");
        }

        // Verificar e decodificar token de acesso
        const payload = verifyAccessToken(token);

        // Verificar se jogador ainda existe e está ativo
        const player = await AuthService.verifyPlayer(payload.playerId);

        // Adicionar dados do player à requisição
        req.user = {
            id: player.id,
            username: player.username,
            email: player.email
        };

        next();
    } catch (error) {
        // Se for uma UnauthorizedException, repassar
        if (error instanceof UnauthorizedException) {
            next(error);
            return;
        }

        // Para outros erros, criar UnauthorizedException genérica
        next(new UnauthorizedException("Authentication failed", "AUTH_FAILED"));
    }
};

/**
 * Middleware de autenticação opcional
 * Não falha se não houver token, apenas adiciona user se token válido
 */
export const optionalAuthMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;
        
        // Se não há header, continuar sem autenticação
        if (!authHeader) {
            next();
            return;
        }

        // Tentar extrair e verificar token
        const token = extractTokenFromHeader(authHeader);

        // Verificar se token está na blacklist
        if (isTokenBlacklisted(token)) {
            next();
            return;
        }

        // Verificar token
        const payload = verifyAccessToken(token);
        const player = await AuthService.verifyPlayer(payload.playerId);

        // Adicionar dados do player à requisição
        req.user = {
            id: player.id,
            username: player.username,
            email: player.email
        };

        next();
    } catch {
        // Em caso de erro, continuar sem autenticação
        next();
    }
};

export default authMiddleware;