/**
 * Character Service
 * Serviço de negócio para gerenciamento de personagens
 */

import CharacterRepository from '../repositories/character.repository';
import PlayerRepository from '../repositories/player.repository';
import { ConflictException } from '../exceptions/conflict';
import { BadRequestException } from '../exceptions/bad-request';
import { NotFoundException } from '../exceptions/not-found';
import { ForbiddenException } from '../exceptions/forbidden';
import {
  CreateCharacterRequest,
  UpdateCharacterRequest,
  CHARACTER_CONSTANTS,
  CHARACTER_ERROR_MESSAGES
} from '../schemas/character.schema';

// Interface para detalhes completos do personagem
export interface CharacterDetails {
  id: number;
  name: string;
  level: number;
  experiencePoints: number;
  gold: number;
  maxHealth: number;
  currentHealth: number;
  createdAt: Date;
  lastLogin: Date | null;
  player: {
    id: number;
    username: string;
  };
  school?: {
    id: number;
    name: string;
    description: string;
    axiom: string;
    healthBonus: number;
    startingGold: number;
  };
  currentLocation: {
    id: number;
    name: string;
    description: string;
    locationType: string;
    isSafeZone: boolean;
  };
  inventory: InventoryItem[];
  activeQuests: ActiveQuest[];
  stats: {
    totalItems: number;
    completedQuests: number;
    achievements: number;
    correctProblems: number;
    wonEncounters: number;
  };
}

// Interface para resumo de personagem
export interface CharacterSummary {
  id: number;
  name: string;
  level: number;
  experiencePoints: number;
  gold: number;
  school?: {
    id: number;
    name: string;
    axiom: string | null;
  };
  currentLocation: {
    id: number;
    name: string;
    locationType: string;
  };
  stats: {
    totalItems: number;
    activeQuests: number;
    achievements: number;
  };
}

// Interface para item do inventário
export interface InventoryItem {
  quantity: number;
  isEquipped: boolean;
  acquiredAt: Date;
  item: {
    id: number;
    name: string;
    description: string;
    type: string;
    healthBonus: number;
    price: number;
    isConsumable: boolean;
  };
}

// Interface para quest ativa
export interface ActiveQuest {
  status: string;
  currentObjectiveIndex: number;
  startedAt: Date;
  quest: {
    id: number;
    title: string;
    description: string;
    experienceReward: number;
    goldReward: number;
  };
}

// Interface para dados de criação de personagem
export interface CreateCharacterData extends CreateCharacterRequest {
  playerId: number;
}

// Interface para dados de atualização de personagem
export interface UpdateCharacterData extends UpdateCharacterRequest {
  characterId: number;
  playerId: number;
}

export default class CharacterService {
  /**
   * Criar novo personagem
   */
  static async createCharacter(data: CreateCharacterData): Promise<CharacterDetails> {
    // Verificar se jogador existe
    const player = await PlayerRepository.findById(data.playerId);
    if (!player) {
      throw new NotFoundException(CHARACTER_ERROR_MESSAGES.CHARACTER_NOT_FOUND, 'PLAYER_NOT_FOUND');
    }

    // Verificar limite de personagens
    const currentCount = await CharacterRepository.countByPlayerId(data.playerId);
    if (currentCount >= CHARACTER_CONSTANTS.MAX_CHARACTERS_PER_PLAYER) {
      throw new ConflictException(
        CHARACTER_ERROR_MESSAGES.CHARACTER_LIMIT_REACHED,
        'CHARACTER_LIMIT_REACHED'
      );
    }

    // Verificar se nome já existe para este jogador
    const nameExists = await CharacterRepository.nameExistsForPlayer(data.name, data.playerId);
    if (nameExists) {
      throw new ConflictException(
        CHARACTER_ERROR_MESSAGES.NAME_ALREADY_EXISTS,
        'CHARACTER_NAME_EXISTS'
      );
    }

    // TODO: Verificar se escola existe (quando implementarmos SchoolRepository)
    if (data.schoolId) {
      // Validação temporária - assumir que escolas 1-4 existem
      if (data.schoolId < 1 || data.schoolId > 4) {
        throw new BadRequestException(
          CHARACTER_ERROR_MESSAGES.SCHOOL_INVALID,
          'INVALID_SCHOOL'
        );
      }
    }

    try {
      // Criar personagem com stats iniciais
      const character = await CharacterRepository.create({
        playerId: data.playerId,
        name: data.name.trim(),
        schoolId: data.schoolId,
        currentLocationId: CHARACTER_CONSTANTS.DEFAULT_LOCATION_ID
      });

      // Retornar detalhes completos
      return await this.getCharacterDetails(character.id, data.playerId);
    } catch (error: any) {
      if (error instanceof ConflictException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to create character', 'CHARACTER_CREATION_FAILED');
    }
  }

  /**
   * Obter lista de personagens do jogador
   */
  static async getPlayerCharacters(playerId: number): Promise<CharacterSummary[]> {
    // Verificar se jogador existe
    const player = await PlayerRepository.findById(playerId);
    if (!player) {
      throw new NotFoundException('Player not found', 'PLAYER_NOT_FOUND');
    }

    const characters = await CharacterRepository.findByPlayerId(playerId);

    return characters.map((char: any) => ({
      id: char.id,
      name: char.name,
      level: char.level,
      experiencePoints: char.experiencePoints,
      gold: char.gold,
      school: char.school ? {
        id: char.school.id,
        name: char.school.name,
        axiom: char.school.axiom
      } : undefined,
      currentLocation: {
        id: char.currentLocation.id,
        name: char.currentLocation.name,
        locationType: char.currentLocation.locationType || 'Unknown'
      },
      stats: {
        totalItems: char._count.inventory,
        activeQuests: char._count.quests,
        achievements: char._count.achievements
      }
    }));
  }

  /**
   * Obter detalhes completos do personagem
   */
  static async getCharacterDetails(characterId: number, playerId: number): Promise<CharacterDetails> {
    // Verificar propriedade e obter personagem
    const character = await CharacterRepository.findByIdAndPlayerId(characterId, playerId);

    if (!character) {
      throw new NotFoundException(
        CHARACTER_ERROR_MESSAGES.CHARACTER_NOT_FOUND,
        'CHARACTER_NOT_FOUND'
      );
    }

    return {
      id: character.id,
      name: character.name,
      level: character.level,
      experiencePoints: character.experiencePoints,
      gold: character.gold,
      maxHealth: character.maxHealth,
      currentHealth: character.currentHealth,
      createdAt: character.createdAt,
      lastLogin: character.lastLogin,
      player: {
        id: character.player.id,
        username: character.player.username
      },
      school: character.school ? {
        id: character.school.id,
        name: character.school.name,
        description: character.school.description || '',
        axiom: character.school.axiom || '',
        healthBonus: character.school.healthBonus,
        startingGold: character.school.startingGold
      } : undefined,
      currentLocation: {
        id: character.currentLocation.id,
        name: character.currentLocation.name,
        description: character.currentLocation.description || '',
        locationType: character.currentLocation.locationType || 'Unknown',
        isSafeZone: character.currentLocation.isSafeZone
      },
      inventory: character.inventory.map((inv: any) => ({
        quantity: inv.quantity,
        isEquipped: inv.isEquipped,
        acquiredAt: inv.acquiredAt,
        item: {
          id: inv.item.id,
          name: inv.item.name,
          description: inv.item.description || '',
          type: inv.item.type || 'Unknown',
          healthBonus: inv.item.healthBonus,
          price: inv.item.price,
          isConsumable: inv.item.isConsumable
        }
      })),
      activeQuests: character.quests.map((cq: any) => ({
        status: cq.status,
        currentObjectiveIndex: cq.currentObjectiveIndex,
        startedAt: cq.startedAt,
        quest: {
          id: cq.quest.id,
          title: cq.quest.title,
          description: cq.quest.description || '',
          experienceReward: cq.quest.experienceReward,
          goldReward: cq.quest.goldReward
        }
      })),
      stats: {
        totalItems: character.inventory.length,
        completedQuests: character._count.achievements, // Aproximação
        achievements: character._count.achievements,
        correctProblems: character._count.problemAttempts,
        wonEncounters: character._count.encounters
      }
    };
  }

  /**
   * Atualizar personagem
   */
  static async updateCharacter(data: UpdateCharacterData): Promise<CharacterDetails> {
    // Verificar propriedade
    const ownership = await CharacterRepository.verifyOwnership(data.characterId, data.playerId);
    if (!ownership) {
      throw new ForbiddenException(
        CHARACTER_ERROR_MESSAGES.CHARACTER_NOT_OWNED,
        'CHARACTER_NOT_OWNED'
      );
    }

    // Verificar se nome já existe (se está sendo alterado)
    if (data.name) {
      const nameExists = await CharacterRepository.nameExistsForPlayer(
        data.name,
        data.playerId,
        data.characterId
      );
      if (nameExists) {
        throw new ConflictException(
          CHARACTER_ERROR_MESSAGES.NAME_ALREADY_EXISTS,
          'CHARACTER_NAME_EXISTS'
        );
      }
    }

    // TODO: Verificar se escola existe (quando implementarmos SchoolRepository)
    if (data.schoolId) {
      // Validação temporária - assumir que escolas 1-4 existem
      if (data.schoolId < 1 || data.schoolId > 4) {
        throw new BadRequestException(
          CHARACTER_ERROR_MESSAGES.SCHOOL_INVALID,
          'INVALID_SCHOOL'
        );
      }
    }

    // TODO: Verificar se localização existe (quando implementarmos LocationRepository)
    if (data.currentLocationId) {
      // Validação temporária - assumir que localizações > 0 existem
      if (data.currentLocationId < 1) {
        throw new BadRequestException(
          CHARACTER_ERROR_MESSAGES.LOCATION_INVALID,
          'INVALID_LOCATION'
        );
      }
    }

    try {
      // Preparar dados para atualização
      const updateData: any = {};
      if (data.name !== undefined) updateData.name = data.name.trim();
      if (data.schoolId !== undefined) updateData.schoolId = data.schoolId;
      if (data.currentLocationId !== undefined) updateData.currentLocationId = data.currentLocationId;

      // Atualizar personagem
      await CharacterRepository.update(data.characterId, updateData);

      // Retornar detalhes atualizados
      return await this.getCharacterDetails(data.characterId, data.playerId);
    } catch (error) {
      if (error instanceof ConflictException ||
        error instanceof BadRequestException ||
        error instanceof ForbiddenException) {
        throw error;
      }
      throw new BadRequestException('Failed to update character', 'CHARACTER_UPDATE_FAILED');
    }
  }

  /**
   * Deletar personagem
   */
  static async deleteCharacter(characterId: number, playerId: number): Promise<void> {
    // Verificar propriedade
    const ownership = await CharacterRepository.verifyOwnership(characterId, playerId);
    if (!ownership) {
      throw new ForbiddenException(
        CHARACTER_ERROR_MESSAGES.CHARACTER_NOT_OWNED,
        'CHARACTER_NOT_OWNED'
      );
    }

    try {
      // Deletar personagem (cascade irá remover dados relacionados)
      await CharacterRepository.delete(characterId);
    } catch (error) {
      throw new BadRequestException('Failed to delete character', 'CHARACTER_DELETE_FAILED');
    }
  }

  /**
   * Verificar propriedade do personagem
   */
  static async verifyCharacterOwnership(characterId: number, playerId: number): Promise<boolean> {
    return await CharacterRepository.verifyOwnership(characterId, playerId);
  }

  /**
   * Verificar se jogador pode criar mais personagens
   */
  static async canCreateMoreCharacters(playerId: number): Promise<boolean> {
    const currentCount = await CharacterRepository.countByPlayerId(playerId);
    return currentCount < CHARACTER_CONSTANTS.MAX_CHARACTERS_PER_PLAYER;
  }

  /**
   * Obter contagem de personagens do jogador
   */
  static async getCharacterCount(playerId: number): Promise<number> {
    return await CharacterRepository.countByPlayerId(playerId);
  }

  /**
   * Verificar disponibilidade de nome para personagem
   */
  static async checkNameAvailability(
    name: string,
    playerId: number,
    excludeCharacterId?: number
  ): Promise<boolean> {
    return !(await CharacterRepository.nameExistsForPlayer(name, playerId, excludeCharacterId));
  }

  /**
   * Atualizar último login do personagem
   */
  static async updateLastLogin(characterId: number, playerId: number): Promise<void> {
    // Verificar propriedade
    const ownership = await CharacterRepository.verifyOwnership(characterId, playerId);
    if (!ownership) {
      throw new ForbiddenException(
        CHARACTER_ERROR_MESSAGES.CHARACTER_NOT_OWNED,
        'CHARACTER_NOT_OWNED'
      );
    }

    try {
      await CharacterRepository.updateLastLogin(characterId);
    } catch (error) {
      throw new BadRequestException('Failed to update last login', 'UPDATE_LOGIN_FAILED');
    }
  }

  /**
   * Obter estatísticas do personagem
   */
  static async getCharacterStats(characterId: number, playerId: number) {
    // Verificar propriedade
    const ownership = await CharacterRepository.verifyOwnership(characterId, playerId);
    if (!ownership) {
      throw new ForbiddenException(
        CHARACTER_ERROR_MESSAGES.CHARACTER_NOT_OWNED,
        'CHARACTER_NOT_OWNED'
      );
    }

    const stats = await CharacterRepository.getCharacterStats(characterId);
    if (!stats) {
      throw new NotFoundException(
        CHARACTER_ERROR_MESSAGES.CHARACTER_NOT_FOUND,
        'CHARACTER_NOT_FOUND'
      );
    }

    return {
      character: {
        id: stats.id,
        name: stats.name,
        level: stats.level,
        experiencePoints: stats.experiencePoints,
        gold: stats.gold,
        maxHealth: stats.maxHealth,
        currentHealth: stats.currentHealth,
        createdAt: stats.createdAt
      },
      achievements: {
        totalItems: stats._count.inventory,
        completedQuests: stats._count.quests,
        totalAchievements: stats._count.achievements,
        correctProblems: stats._count.problemAttempts,
        wonEncounters: stats._count.encounters
      },
      progress: {
        healthPercentage: Math.round((stats.currentHealth / stats.maxHealth) * 100),
        nextLevelXp: this.calculateNextLevelXp(stats.level),
        xpToNextLevel: this.calculateNextLevelXp(stats.level) - stats.experiencePoints
      }
    };
  }

  /**
   * Calcular XP necessário para próximo nível
   */
  private static calculateNextLevelXp(currentLevel: number): number {
    // Fórmula simples: level * 100 XP para próximo nível
    return (currentLevel + 1) * 100;
  }

  /**
   * Validar dados de criação de personagem
   */
  static validateCreateCharacter(data: CreateCharacterRequest, playerId: number): CreateCharacterData {
    if (!data.name || data.name.trim().length === 0) {
      throw new BadRequestException(CHARACTER_ERROR_MESSAGES.NAME_REQUIRED, 'NAME_REQUIRED');
    }

    const trimmedName = data.name.trim();

    if (trimmedName.length < CHARACTER_CONSTANTS.MIN_NAME_LENGTH) {
      throw new BadRequestException(CHARACTER_ERROR_MESSAGES.NAME_TOO_SHORT, 'NAME_TOO_SHORT');
    }

    if (trimmedName.length > CHARACTER_CONSTANTS.MAX_NAME_LENGTH) {
      throw new BadRequestException(CHARACTER_ERROR_MESSAGES.NAME_TOO_LONG, 'NAME_TOO_LONG');
    }

    return {
      playerId,
      name: trimmedName,
      schoolId: data.schoolId
    };
  }

  /**
   * Validar dados de atualização de personagem
   */
  static validateUpdateCharacter(
    data: UpdateCharacterRequest,
    characterId: number,
    playerId: number
  ): UpdateCharacterData {
    const updateData: UpdateCharacterData = {
      characterId,
      playerId
    };

    if (data.name !== undefined) {
      if (data.name.trim().length === 0) {
        throw new BadRequestException(CHARACTER_ERROR_MESSAGES.NAME_REQUIRED, 'NAME_REQUIRED');
      }

      const trimmedName = data.name.trim();

      if (trimmedName.length < CHARACTER_CONSTANTS.MIN_NAME_LENGTH) {
        throw new BadRequestException(CHARACTER_ERROR_MESSAGES.NAME_TOO_SHORT, 'NAME_TOO_SHORT');
      }

      if (trimmedName.length > CHARACTER_CONSTANTS.MAX_NAME_LENGTH) {
        throw new BadRequestException(CHARACTER_ERROR_MESSAGES.NAME_TOO_LONG, 'NAME_TOO_LONG');
      }

      updateData.name = trimmedName;
    }

    if (data.schoolId !== undefined) {
      updateData.schoolId = data.schoolId;
    }

    if (data.currentLocationId !== undefined) {
      updateData.currentLocationId = data.currentLocationId;
    }

    // Verificar se pelo menos um campo foi fornecido
    if (!updateData.name && updateData.schoolId === undefined && updateData.currentLocationId === undefined) {
      throw new BadRequestException('At least one field must be provided for update', 'NO_UPDATE_DATA');
    }

    return updateData;
  }
}