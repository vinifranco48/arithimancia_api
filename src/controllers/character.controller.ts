/**
 * Character Controller
 * Controlador para endpoints de gerenciamento de personagens
 */

import { Request, Response } from 'express';
import CharacterService from '../services/character.service';
import { success } from '../utils/response';
import type {
  CreateCharacterRequest,
  UpdateCharacterRequest,
  CharacterIdParams
} from '../schemas/character.schema';

// Interface para request com user autenticado
interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    username: string;
    email: string;
  };
}

export default class CharacterController {
  /**
   * POST /characters
   * Criar novo personagem
   */
  static async createCharacter(req: AuthenticatedRequest, res: Response): Promise<void> {
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

    const data: CreateCharacterRequest = req.body;

    // Validar dados de entrada
    const validatedData = CharacterService.validateCreateCharacter(data, playerId);

    // Criar personagem
    const character = await CharacterService.createCharacter(validatedData);

    res.status(201).json(success('Character created successfully', character));
  }

  /**
   * GET /characters
   * Listar personagens do jogador autenticado
   */
  static async getPlayerCharacters(req: AuthenticatedRequest, res: Response): Promise<void> {
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

    const characters = await CharacterService.getPlayerCharacters(playerId);

    res.status(200).json(success('Characters retrieved successfully', {
      characters,
      total: characters.length,
      canCreateMore: await CharacterService.canCreateMoreCharacters(playerId)
    }));
  }

  /**
   * GET /characters/:id
   * Obter detalhes de um personagem específico
   */
  static async getCharacterDetails(req: AuthenticatedRequest, res: Response): Promise<void> {
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

    const { id } = req.params as unknown as CharacterIdParams;
    const characterId = parseInt(id.toString(), 10);

    if (isNaN(characterId) || characterId <= 0) {
      res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_CHARACTER_ID',
          message: 'Character ID must be a positive number',
          timestamp: new Date().toISOString()
        }
      });
      return;
    }

    const character = await CharacterService.getCharacterDetails(characterId, playerId);

    res.status(200).json(success('Character details retrieved successfully', character));
  }

  /**
   * PUT /characters/:id
   * Atualizar personagem
   */
  static async updateCharacter(req: AuthenticatedRequest, res: Response): Promise<void> {
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

    const { id } = req.params as unknown as CharacterIdParams;
    const characterId = parseInt(id.toString(), 10);

    if (isNaN(characterId) || characterId <= 0) {
      res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_CHARACTER_ID',
          message: 'Character ID must be a positive number',
          timestamp: new Date().toISOString()
        }
      });
      return;
    }

    const data: UpdateCharacterRequest = req.body;

    // Validar dados de entrada
    const validatedData = CharacterService.validateUpdateCharacter(data, characterId, playerId);

    // Atualizar personagem
    const character = await CharacterService.updateCharacter(validatedData);

    res.status(200).json(success('Character updated successfully', character));
  }

  /**
   * DELETE /characters/:id
   * Deletar personagem
   */
  static async deleteCharacter(req: AuthenticatedRequest, res: Response): Promise<void> {
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

    const { id } = req.params as unknown as CharacterIdParams;
    const characterId = parseInt(id.toString(), 10);

    if (isNaN(characterId) || characterId <= 0) {
      res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_CHARACTER_ID',
          message: 'Character ID must be a positive number',
          timestamp: new Date().toISOString()
        }
      });
      return;
    }

    await CharacterService.deleteCharacter(characterId, playerId);

    res.status(200).json(success('Character deleted successfully'));
  }

  /**
   * GET /characters/:id/stats
   * Obter estatísticas detalhadas do personagem
   */
  static async getCharacterStats(req: AuthenticatedRequest, res: Response): Promise<void> {
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

    const { id } = req.params as unknown as CharacterIdParams;
    const characterId = parseInt(id.toString(), 10);

    if (isNaN(characterId) || characterId <= 0) {
      res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_CHARACTER_ID',
          message: 'Character ID must be a positive number',
          timestamp: new Date().toISOString()
        }
      });
      return;
    }

    const stats = await CharacterService.getCharacterStats(characterId, playerId);

    res.status(200).json(success('Character stats retrieved successfully', stats));
  }

  /**
   * POST /characters/:id/login
   * Atualizar último login do personagem
   */
  static async updateLastLogin(req: AuthenticatedRequest, res: Response): Promise<void> {
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

    const { id } = req.params as unknown as CharacterIdParams;
    const characterId = parseInt(id.toString(), 10);

    if (isNaN(characterId) || characterId <= 0) {
      res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_CHARACTER_ID',
          message: 'Character ID must be a positive number',
          timestamp: new Date().toISOString()
        }
      });
      return;
    }

    await CharacterService.updateLastLogin(characterId, playerId);

    res.status(200).json(success('Character last login updated successfully'));
  }

  /**
   * POST /characters/check-name
   * Verificar disponibilidade de nome para personagem
   */
  static async checkNameAvailability(req: AuthenticatedRequest, res: Response): Promise<void> {
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

    const { name, excludeCharacterId } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_NAME',
          message: 'Character name is required',
          timestamp: new Date().toISOString()
        }
      });
      return;
    }

    const isAvailable = await CharacterService.checkNameAvailability(
      name.trim(), 
      playerId, 
      excludeCharacterId
    );

    res.status(200).json(success('Character name availability checked', {
      name: name.trim(),
      available: isAvailable
    }));
  }

  /**
   * GET /characters/count
   * Obter contagem de personagens do jogador
   */
  static async getCharacterCount(req: AuthenticatedRequest, res: Response): Promise<void> {
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

    const count = await CharacterService.getCharacterCount(playerId);
    const canCreateMore = await CharacterService.canCreateMoreCharacters(playerId);

    res.status(200).json(success('Character count retrieved successfully', {
      count,
      maxLimit: 3,
      canCreateMore,
      remaining: 3 - count
    }));
  }

  /**
   * GET /characters/limits
   * Obter informações sobre limites de personagens
   */
  static async getCharacterLimits(req: AuthenticatedRequest, res: Response): Promise<void> {
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

    const count = await CharacterService.getCharacterCount(playerId);
    const canCreateMore = await CharacterService.canCreateMoreCharacters(playerId);

    res.status(200).json(success('Character limits retrieved successfully', {
      current: count,
      maximum: 3,
      canCreateMore,
      remaining: 3 - count,
      percentageUsed: Math.round((count / 3) * 100)
    }));
  }
}