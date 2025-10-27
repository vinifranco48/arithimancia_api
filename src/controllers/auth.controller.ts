/**
 * Auth Controller
 * Controlador para endpoints de autenticação
 */

import { Request, Response } from 'express';
import AuthService from '../services/auth.service';
import { success } from '../utils/response';
import type {
  LoginRequest,
  RegisterRequest,
  RefreshTokenRequest
} from '../schemas/auth.schema';

export default class AuthController {
  /**
   * POST /auth/register
   * Registrar novo jogador
   */
  static async register(req: Request, res: Response): Promise<void> {
    const data: RegisterRequest = req.body;

    const result = await AuthService.register(data);

    res.status(201).json(success('Player registered successfully', result));
  }

  /**
   * POST /auth/login
   * Login do jogador
   */
  static async login(req: Request, res: Response): Promise<void> {
    const data: LoginRequest = req.body;

    const result = await AuthService.login(data);

    res.status(200).json(success('Login successful', result));
  }

  /**
   * POST /auth/refresh
   * Renovar tokens de acesso
   */
  static async refresh(req: Request, res: Response): Promise<void> {
    const data: RefreshTokenRequest = req.body;

    const result = await AuthService.refreshToken(data);

    res.status(200).json(success('Token refreshed successfully', result));
  }

  /**
   * POST /auth/logout
   * Logout do jogador (invalidar tokens)
   */
  static async logout(req: Request, res: Response): Promise<void> {
    // O playerId vem do middleware de autenticação
    const playerId = req.user?.id;

    if (!playerId) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
          timestamp: new Date().toISOString()
        }
      });
      return;
    }

    // Extrair tokens do header Authorization e body (se fornecidos)
    const authHeader = req.headers.authorization;
    const accessToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : undefined;
    const { refreshToken } = req.body || {};

    await AuthService.logout(playerId, accessToken, refreshToken);

    res.status(200).json(success('Logout successful'));
  }

  /**
   * GET /auth/me
   * Obter dados do jogador autenticado
   */
  static async me(req: Request, res: Response): Promise<void> {
    const playerId = req.user?.id;

    if (!playerId) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
          timestamp: new Date().toISOString()
        }
      });
      return;
    }

    const player = await AuthService.verifyPlayer(playerId);

    res.status(200).json(success('Player data retrieved successfully', player));
  }

  /**
   * POST /auth/check-username
   * Verificar disponibilidade de username
   */
  static async checkUsername(req: Request, res: Response): Promise<void> {
    const { username } = req.body;

    const isAvailable = await AuthService.checkUsernameAvailability(username);

    res.status(200).json(success('Username availability checked', {
      username,
      available: isAvailable
    }));
  }

  /**
   * POST /auth/check-email
   * Verificar disponibilidade de email
   */
  static async checkEmail(req: Request, res: Response): Promise<void> {
    const { email } = req.body;

    const isAvailable = await AuthService.checkEmailAvailability(email);

    res.status(200).json(success('Email availability checked', {
      email,
      available: isAvailable
    }));
  }
}