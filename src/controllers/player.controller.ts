/**
 * Player Controller
 * Controlador para endpoints de gerenciamento de jogadores
 */

import { Request, Response } from 'express';
import PlayerService from '../services/player.service';
import { success } from '../utils/response';
import type { UpdateProfileRequest } from '../schemas/auth.schema';

export default class PlayerController {
  /**
   * GET /players/profile
   * Obter perfil completo do jogador autenticado
   */
  static async getProfile(req: Request, res: Response): Promise<void> {
    const playerId = req.user?.id;

    if (!playerId) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
          timestamp: new Date().toISOString(),
          path: req.path
        }
      });
      return;
    }

    const profile = await PlayerService.getProfile(playerId);

    res.status(200).json(success('Player profile retrieved successfully', profile));
  }

  /**
   * PUT /players/profile
   * Atualizar perfil do jogador autenticado
   */
  static async updateProfile(req: Request, res: Response): Promise<void> {
    const playerId = req.user?.id;

    if (!playerId) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
          timestamp: new Date().toISOString(),
          path: req.path
        }
      });
      return;
    }

    const data: UpdateProfileRequest = req.body;

    // Validar e extrair dados de atualização de perfil (excluindo senha)
    const updateData = PlayerService.validateProfileUpdate(data);

    const updatedProfile = await PlayerService.updateProfile(playerId, updateData);

    res.status(200).json(success('Profile updated successfully', updatedProfile));
  }

  /**
   * PUT /players/password
   * Alterar senha do jogador autenticado
   */
  static async changePassword(req: Request, res: Response): Promise<void> {
    const playerId = req.user?.id;

    if (!playerId) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
          timestamp: new Date().toISOString(),
          path: req.path
        }
      });
      return;
    }

    const data: UpdateProfileRequest = req.body;

    // Validar e extrair dados de mudança de senha
    const passwordData = PlayerService.validatePasswordChange(data);

    await PlayerService.changePassword(playerId, passwordData);

    res.status(200).json(success('Password changed successfully'));
  }

  /**
   * GET /players/stats
   * Obter estatísticas do jogador autenticado
   */
  static async getPlayerStats(req: Request, res: Response): Promise<void> {
    const playerId = req.user?.id;

    if (!playerId) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
          timestamp: new Date().toISOString(),
          path: req.path
        }
      });
      return;
    }

    const stats = await PlayerService.getPlayerStats(playerId);

    res.status(200).json(success('Player statistics retrieved successfully', stats));
  }

  /**
   * DELETE /players/account
   * Deletar conta do jogador autenticado
   */
  static async deleteAccount(req: Request, res: Response): Promise<void> {
    const playerId = req.user?.id;

    if (!playerId) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
          timestamp: new Date().toISOString(),
          path: req.path
        }
      });
      return;
    }

    await PlayerService.deleteAccount(playerId);

    res.status(200).json(success('Account deleted successfully'));
  }

  /**
   * GET /players/characters
   * Obter resumo dos personagens do jogador autenticado
   */
  static async getCharacterSummaries(req: Request, res: Response): Promise<void> {
    const playerId = req.user?.id;

    if (!playerId) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
          timestamp: new Date().toISOString(),
          path: req.path
        }
      });
      return;
    }

    const characters = await PlayerService.getCharacterSummaries(playerId);

    res.status(200).json(success('Character summaries retrieved successfully', characters));
  }

  /**
   * POST /players/check-username
   * Verificar disponibilidade de username
   */
  static async checkUsernameAvailability(req: Request, res: Response): Promise<void> {
    const { username } = req.body;
    const playerId = req.user?.id; // Opcional para excluir o próprio jogador

    const isAvailable = await PlayerService.checkUsernameAvailability(username, playerId);

    res.status(200).json(success('Username availability checked', {
      username,
      available: isAvailable
    }));
  }

  /**
   * POST /players/check-email
   * Verificar disponibilidade de email
   */
  static async checkEmailAvailability(req: Request, res: Response): Promise<void> {
    const { email } = req.body;
    const playerId = req.user?.id; // Opcional para excluir o próprio jogador

    const isAvailable = await PlayerService.checkEmailAvailability(email, playerId);

    res.status(200).json(success('Email availability checked', {
      email,
      available: isAvailable
    }));
  }
}