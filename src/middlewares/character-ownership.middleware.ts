/**
 * Character Ownership Middleware
 * Middleware para verificação automática de propriedade de personagens
 */

import { Request, Response, NextFunction } from 'express';
import { ForbiddenException } from '../exceptions/forbidden';
import { NotFoundException } from '../exceptions/not-found';
import { BadRequestException } from '../exceptions/bad-request';

// Interface para request com user autenticado
interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    username: string;
    email: string;
  };
}

/**
 * Middleware para verificar propriedade de personagem
 * Verifica se o personagem especificado no parâmetro pertence ao jogador autenticado
 * 
 * @param paramName - Nome do parâmetro que contém o ID do personagem (padrão: 'id')
 * @returns Middleware function
 */
export function verifyCharacterOwnership(paramName: string = 'id') {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
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

      // Extrair ID do personagem do parâmetro especificado
      const characterIdStr = req.params[paramName];
      
      if (!characterIdStr) {
        throw new BadRequestException(`Parameter '${paramName}' is required`, 'MISSING_PARAMETER');
      }

      const characterId = parseInt(characterIdStr, 10);

      if (isNaN(characterId) || characterId <= 0) {
        throw new BadRequestException(`Parameter '${paramName}' must be a positive number`, 'INVALID_PARAMETER');
      }

      // Importar repository dinamicamente para evitar dependências circulares
      const { default: CharacterRepository } = await import('../repositories/character.repository');

      // Verificar se o personagem existe e pertence ao jogador
      const character = await CharacterRepository.findByIdAndPlayerId(characterId, playerId);

      if (!character) {
        // Verificar se o personagem existe mas não pertence ao jogador
        const existingCharacter = await CharacterRepository.findById(characterId);
        
        if (existingCharacter) {
          throw new ForbiddenException('This character does not belong to the authenticated player', 'CHARACTER_NOT_OWNED');
        } else {
          throw new NotFoundException('Character not found', 'CHARACTER_NOT_FOUND');
        }
      }

      // Adicionar informações do personagem ao request para uso posterior
      (req as any).character = character;

      next();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Middleware para verificar propriedade de personagem usando characterId específico
 * Usado quando o parâmetro se chama 'characterId' em vez de 'id'
 */
export function verifyCharacterOwnershipById() {
  return verifyCharacterOwnership('characterId');
}

/**
 * Middleware para verificar múltiplos personagens
 * Usado quando há múltiplos IDs de personagens na requisição
 * 
 * @param paramNames - Array com nomes dos parâmetros que contêm IDs de personagens
 * @returns Middleware function
 */
export function verifyMultipleCharacterOwnership(paramNames: string[]) {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
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

      const { default: CharacterRepository } = await import('../repositories/character.repository');
      const characters: any[] = [];

      // Verificar cada personagem
      for (const paramName of paramNames) {
        const characterIdStr = req.params[paramName];
        
        if (!characterIdStr) {
          throw new BadRequestException(`Parameter '${paramName}' is required`, 'MISSING_PARAMETER');
        }

        const characterId = parseInt(characterIdStr, 10);

        if (isNaN(characterId) || characterId <= 0) {
          throw new BadRequestException(`Parameter '${paramName}' must be a positive number`, 'INVALID_PARAMETER');
        }

        const character = await CharacterRepository.findByIdAndPlayerId(characterId, playerId);

        if (!character) {
          const existingCharacter = await CharacterRepository.findById(characterId);
          
          if (existingCharacter) {
            throw new ForbiddenException(`Character with ID ${characterId} does not belong to the authenticated player`, 'CHARACTER_NOT_OWNED');
          } else {
            throw new NotFoundException(`Character with ID ${characterId} not found`, 'CHARACTER_NOT_FOUND');
          }
        }

        characters.push(character);
      }

      // Adicionar personagens ao request
      (req as any).characters = characters;

      next();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Middleware para verificar se o jogador pode criar mais personagens
 * Verifica o limite de 3 personagens por jogador
 */
export function verifyCharacterCreationLimit() {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
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

      const { default: CharacterRepository } = await import('../repositories/character.repository');

      // Contar personagens existentes do jogador
      const characterCount = await CharacterRepository.countByPlayerId(playerId);

      if (characterCount >= 3) {
        throw new ForbiddenException('Character limit reached. Maximum 3 characters per player.', 'CHARACTER_LIMIT_REACHED');
      }

      // Adicionar informação de limite ao request
      (req as any).characterLimitInfo = {
        current: characterCount,
        maximum: 3,
        remaining: 3 - characterCount
      };

      next();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Middleware para verificar se o nome do personagem é único para o jogador
 * Usado na criação e atualização de personagens
 */
export function verifyCharacterNameUniqueness(excludeCharacterIdParam?: string) {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
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

      const { name } = req.body;

      if (!name || typeof name !== 'string') {
        throw new BadRequestException('Character name is required', 'MISSING_CHARACTER_NAME');
      }

      const { default: CharacterRepository } = await import('../repositories/character.repository');

      // ID do personagem a excluir da verificação (para updates)
      let excludeCharacterId: number | undefined;
      
      if (excludeCharacterIdParam) {
        const excludeIdStr = req.params[excludeCharacterIdParam];
        if (excludeIdStr) {
          excludeCharacterId = parseInt(excludeIdStr, 10);
        }
      }

      // Verificar se já existe personagem com este nome para o jogador
      const nameExists = await CharacterRepository.nameExistsForPlayer(
        name.trim(), 
        playerId, 
        excludeCharacterId
      );

      if (nameExists) {
        throw new ForbiddenException('A character with this name already exists for this player', 'CHARACTER_NAME_EXISTS');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Middleware para verificar se o personagem está em condições de jogar
 * Verifica se o personagem tem vida suficiente, não está em combate, etc.
 */
export function verifyCharacterGameState(paramName: string = 'id') {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
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

      const characterIdStr = req.params[paramName];
      const characterId = parseInt(characterIdStr, 10);

      const { default: CharacterRepository } = await import('../repositories/character.repository');

      const character = await CharacterRepository.findByIdAndPlayerId(characterId, playerId);

      if (!character) {
        throw new NotFoundException('Character not found', 'CHARACTER_NOT_FOUND');
      }

      // Verificar se o personagem tem vida suficiente
      if (character.currentHealth <= 0) {
        throw new ForbiddenException('Character has no health remaining', 'CHARACTER_NO_HEALTH');
      }

      // Verificar se o personagem não está em combate ativo
      // (Esta verificação pode ser expandida conforme necessário)
      
      // Adicionar personagem ao request
      (req as any).character = character;

      next();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Middleware combinado para verificação completa de personagem
 * Combina verificação de propriedade e estado do jogo
 */
export function fullCharacterVerification(paramName: string = 'id') {
  return [
    verifyCharacterOwnership(paramName),
    verifyCharacterGameState(paramName)
  ];
}

export default {
  verifyCharacterOwnership,
  verifyCharacterOwnershipById,
  verifyMultipleCharacterOwnership,
  verifyCharacterCreationLimit,
  verifyCharacterNameUniqueness,
  verifyCharacterGameState,
  fullCharacterVerification
};