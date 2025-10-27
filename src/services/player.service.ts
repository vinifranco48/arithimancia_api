/**
 * Player Service
 * Serviço de negócio para gerenciamento de jogadores
 */

import PlayerRepository from '../repositories/player.repository';
import { hashPassword, verifyPassword } from '../utils/password';
import { ConflictException } from '../exceptions/conflict';
import { UnauthorizedException } from '../exceptions/unauthorized';
import { BadRequestException } from '../exceptions/bad-request';
import { NotFoundException } from '../exceptions/not-found';
import type { UpdateProfileRequest } from '../schemas/auth.schema';

// Interface para perfil do jogador
export interface PlayerProfile {
  id: number;
  username: string;
  email: string;
  createdAt: Date;
  lastLogin: Date | null;
  characters: CharacterSummary[];
}

// Interface para resumo de personagem
export interface CharacterSummary {
  id: number;
  name: string;
  level: number;
  experiencePoints: number;
  gold: number;
  school?: {
    name: string;
  };
  currentLocation?: {
    name: string;
  };
}

// Interface para estatísticas do jogador
export interface PlayerStats {
  totalCharacters: number;
  totalExperience: number;
  totalGold: number;
  highestLevel: number;
  averageLevel: number;
  playTime: {
    daysSinceRegistration: number;
    daysSinceLastLogin: number | null;
  };
  achievements: {
    charactersCreated: number;
    maxCharactersReached: boolean;
  };
}

// Interface para atualização de perfil
export interface UpdateProfileData {
  username?: string;
  email?: string;
}

// Interface para mudança de senha
export interface ChangePasswordData {
  oldPassword: string;
  newPassword: string;
}

export default class PlayerService {
  /**
   * Obter perfil completo do jogador
   */
  static async getProfile(playerId: number): Promise<PlayerProfile> {
    const player = await PlayerRepository.findById(playerId);
    
    if (!player) {
      throw new NotFoundException('Player not found', 'PLAYER_NOT_FOUND');
    }

    return {
      id: player.id,
      username: player.username,
      email: player.email,
      createdAt: player.createdAt,
      lastLogin: player.lastLogin,
      characters: player.characters.map((char: any) => ({
        id: char.id,
        name: char.name,
        level: char.level,
        experiencePoints: char.experiencePoints,
        gold: char.gold,
        school: char.school,
        currentLocation: char.currentLocation
      }))
    };
  }

  /**
   * Atualizar perfil do jogador
   */
  static async updateProfile(
    playerId: number, 
    data: UpdateProfileData
  ): Promise<PlayerProfile> {
    // Verificar se jogador existe
    const existingPlayer = await PlayerRepository.findById(playerId);
    if (!existingPlayer) {
      throw new NotFoundException('Player not found', 'PLAYER_NOT_FOUND');
    }

    // Validar conflitos de dados únicos
    if (data.email && data.email !== existingPlayer.email) {
      const emailExists = await PlayerRepository.emailExists(data.email, playerId);
      if (emailExists) {
        throw new ConflictException('Email already in use', 'EMAIL_EXISTS');
      }
    }

    if (data.username && data.username !== existingPlayer.username) {
      const usernameExists = await PlayerRepository.usernameExists(data.username, playerId);
      if (usernameExists) {
        throw new ConflictException('Username already taken', 'USERNAME_EXISTS');
      }
    }

    try {
      // Atualizar dados
      await PlayerRepository.updatePlayer(playerId, {
        username: data.username,
        email: data.email
      });

      // Retornar perfil atualizado
      return await this.getProfile(playerId);
    } catch (error) {
      if (error instanceof ConflictException || error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to update profile', 'UPDATE_FAILED');
    }
  }

  /**
   * Alterar senha do jogador
   */
  static async changePassword(
    playerId: number, 
    data: ChangePasswordData
  ): Promise<void> {
    // Buscar jogador completo
    const fullPlayer = await PlayerRepository.findById(playerId);
    
    if (!fullPlayer) {
      throw new NotFoundException('Player not found', 'PLAYER_NOT_FOUND');
    }

    // Buscar dados de autenticação
    const authPlayer = await PlayerRepository.findByEmailForAuth(fullPlayer.email);
    if (!authPlayer) {
      throw new NotFoundException('Player authentication data not found', 'AUTH_DATA_NOT_FOUND');
    }

    // Verificar senha atual
    const isOldPasswordValid = await verifyPassword(data.oldPassword, authPlayer.passwordHash);
    if (!isOldPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect', 'INVALID_PASSWORD');
    }

    try {
      // Hash da nova senha
      const newPasswordHash = await hashPassword(data.newPassword);

      // Atualizar senha
      await PlayerRepository.updatePlayer(playerId, {
        passwordHash: newPasswordHash
      });
    } catch (error) {
      throw new BadRequestException('Failed to change password', 'PASSWORD_CHANGE_FAILED');
    }
  }

  /**
   * Obter estatísticas do jogador
   */
  static async getPlayerStats(playerId: number): Promise<PlayerStats> {
    const player = await PlayerRepository.findById(playerId);
    
    if (!player) {
      throw new NotFoundException('Player not found', 'PLAYER_NOT_FOUND');
    }

    // Calcular estatísticas dos personagens
    const characters = player.characters;
    const totalCharacters = characters.length;
    const totalExperience = characters.reduce((sum: number, char: any) => sum + char.experiencePoints, 0);
    const totalGold = characters.reduce((sum: number, char: any) => sum + char.gold, 0);
    const highestLevel = characters.length > 0 ? Math.max(...characters.map((char: any) => char.level)) : 0;
    const averageLevel = characters.length > 0 
      ? characters.reduce((sum: number, char: any) => sum + char.level, 0) / characters.length 
      : 0;

    // Calcular tempo de jogo
    const now = new Date();
    const daysSinceRegistration = Math.floor(
      (now.getTime() - player.createdAt.getTime()) / (1000 * 60 * 60 * 24)
    );
    const daysSinceLastLogin = player.lastLogin 
      ? Math.floor((now.getTime() - player.lastLogin.getTime()) / (1000 * 60 * 60 * 24))
      : null;

    return {
      totalCharacters,
      totalExperience,
      totalGold,
      highestLevel,
      averageLevel: Math.round(averageLevel * 100) / 100, // 2 casas decimais
      playTime: {
        daysSinceRegistration,
        daysSinceLastLogin
      },
      achievements: {
        charactersCreated: totalCharacters,
        maxCharactersReached: totalCharacters >= 3 // Limite máximo de personagens
      }
    };
  }

  /**
   * Deletar conta do jogador
   */
  static async deleteAccount(playerId: number): Promise<void> {
    // Verificar se jogador existe
    const player = await PlayerRepository.findById(playerId);
    if (!player) {
      throw new NotFoundException('Player not found', 'PLAYER_NOT_FOUND');
    }

    try {
      // Deletar jogador (cascade irá remover personagens relacionados)
      await PlayerRepository.deletePlayer(playerId);
    } catch (error) {
      throw new BadRequestException('Failed to delete account', 'DELETE_FAILED');
    }
  }

  /**
   * Verificar disponibilidade de username
   */
  static async checkUsernameAvailability(username: string, excludePlayerId?: number): Promise<boolean> {
    return !(await PlayerRepository.usernameExists(username, excludePlayerId));
  }

  /**
   * Verificar disponibilidade de email
   */
  static async checkEmailAvailability(email: string, excludePlayerId?: number): Promise<boolean> {
    return !(await PlayerRepository.emailExists(email, excludePlayerId));
  }

  /**
   * Obter resumo de personagens do jogador
   */
  static async getCharacterSummaries(playerId: number): Promise<CharacterSummary[]> {
    const player = await PlayerRepository.findById(playerId);
    
    if (!player) {
      throw new NotFoundException('Player not found', 'PLAYER_NOT_FOUND');
    }

    return player.characters.map((char: any) => ({
      id: char.id,
      name: char.name,
      level: char.level,
      experiencePoints: char.experiencePoints,
      gold: char.gold,
      school: char.school,
      currentLocation: char.currentLocation
    }));
  }

  /**
   * Validar dados de atualização de perfil
   */
  static validateProfileUpdate(data: UpdateProfileRequest): UpdateProfileData {
    const updateData: UpdateProfileData = {};

    if (data.username !== undefined) {
      updateData.username = data.username;
    }

    if (data.email !== undefined) {
      updateData.email = data.email;
    }

    // Verificar se pelo menos um campo foi fornecido
    if (Object.keys(updateData).length === 0) {
      throw new BadRequestException('At least one field must be provided for update', 'NO_UPDATE_DATA');
    }

    return updateData;
  }

  /**
   * Validar dados de mudança de senha
   */
  static validatePasswordChange(data: UpdateProfileRequest): ChangePasswordData {
    if (!data.oldPassword || !data.password) {
      throw new BadRequestException('Old password and new password are required', 'MISSING_PASSWORD_DATA');
    }

    if (data.password !== data.passwordConfirmation) {
      throw new BadRequestException('Password confirmation does not match', 'PASSWORD_MISMATCH');
    }

    return {
      oldPassword: data.oldPassword,
      newPassword: data.password
    };
  }
}