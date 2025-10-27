/**
 * Character Repository
 * Repository para operações de banco de dados relacionadas aos personagens
 */

import { prisma } from "../config/database";

/**
 * Interfaces para requests
 */
export interface CreateCharacterRequest {
  playerId: number;
  name: string;
  schoolId?: number;
  currentLocationId?: number;
}

export interface UpdateCharacterRequest {
  name?: string;
  schoolId?: number;
  currentLocationId?: number;
  level?: number;
  experiencePoints?: number;
  maxHealth?: number;
  currentHealth?: number;
  gold?: number;
  lastLogin?: Date;
}

export interface CharacterSearchFilters {
  playerId?: number;
  schoolId?: number;
  locationId?: number;
  minLevel?: number;
  maxLevel?: number;
  name?: string;
}

export default class CharacterRepository {
  /**
   * Buscar personagens por ID do jogador
   */
  static async findByPlayerId(playerId: number) {
    return await prisma.character.findMany({
      where: { playerId },
      include: {
        school: {
          select: {
            id: true,
            name: true,
            axiom: true,
          },
        },
        currentLocation: {
          select: {
            id: true,
            name: true,
            locationType: true,
          },
        },
        _count: {
          select: {
            inventory: true,
            quests: true,
            achievements: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Buscar personagem por ID e verificar propriedade
   */
  static async findByIdAndPlayerId(id: number, playerId: number) {
    return await prisma.character.findFirst({
      where: {
        id,
        playerId,
      },
      include: {
        player: {
          select: {
            id: true,
            username: true,
          },
        },
        school: {
          select: {
            id: true,
            name: true,
            description: true,
            axiom: true,
            healthBonus: true,
            startingGold: true,
          },
        },
        currentLocation: {
          select: {
            id: true,
            name: true,
            description: true,
            locationType: true,
            isSafeZone: true,
          },
        },
        inventory: {
          include: {
            item: {
              select: {
                id: true,
                name: true,
                description: true,
                type: true,
                healthBonus: true,
                price: true,
                isConsumable: true,
              },
            },
          },
          orderBy: {
            acquiredAt: 'desc',
          },
        },
        quests: {
          where: {
            status: 'ACTIVE',
          },
          include: {
            quest: {
              select: {
                id: true,
                title: true,
                description: true,
                experienceReward: true,
                goldReward: true,
              },
            },
          },
        },
        _count: {
          select: {
            achievements: true,
            problemAttempts: true,
            encounters: true,
          },
        },
      },
    });
  }

  /**
   * Buscar personagem por ID (sem verificação de propriedade)
   */
  static async findById(id: number) {
    return await prisma.character.findUnique({
      where: { id },
      include: {
        player: {
          select: {
            id: true,
            username: true,
          },
        },
        school: {
          select: {
            id: true,
            name: true,
            axiom: true,
          },
        },
        currentLocation: {
          select: {
            id: true,
            name: true,
            locationType: true,
          },
        },
      },
    });
  }

  /**
   * Criar novo personagem
   */
  static async create(data: CreateCharacterRequest) {
    // Localização padrão: Biblioteca de Alexandria Numérica (ID: 1)
    const defaultLocationId = data.currentLocationId || 1;

    return await prisma.character.create({
      data: {
        playerId: data.playerId,
        name: data.name,
        schoolId: data.schoolId,
        currentLocationId: defaultLocationId,
        level: 1,
        experiencePoints: 0,
        maxHealth: 100,
        currentHealth: 100,
        gold: 100,
      },
      include: {
        school: {
          select: {
            id: true,
            name: true,
            axiom: true,
            healthBonus: true,
            startingGold: true,
          },
        },
        currentLocation: {
          select: {
            id: true,
            name: true,
            locationType: true,
          },
        },
      },
    });
  }

  /**
   * Atualizar personagem
   */
  static async update(id: number, data: UpdateCharacterRequest) {
    const updateData: any = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.schoolId !== undefined) updateData.schoolId = data.schoolId;
    if (data.currentLocationId !== undefined) updateData.currentLocationId = data.currentLocationId;
    if (data.level !== undefined) updateData.level = data.level;
    if (data.experiencePoints !== undefined) updateData.experiencePoints = data.experiencePoints;
    if (data.maxHealth !== undefined) updateData.maxHealth = data.maxHealth;
    if (data.currentHealth !== undefined) updateData.currentHealth = data.currentHealth;
    if (data.gold !== undefined) updateData.gold = data.gold;
    if (data.lastLogin !== undefined) updateData.lastLogin = data.lastLogin;

    return await prisma.character.update({
      where: { id },
      data: updateData,
      include: {
        school: {
          select: {
            id: true,
            name: true,
            axiom: true,
          },
        },
        currentLocation: {
          select: {
            id: true,
            name: true,
            locationType: true,
          },
        },
      },
    });
  }

  /**
   * Deletar personagem
   */
  static async delete(id: number) {
    return await prisma.character.delete({
      where: { id },
    });
  }

  /**
   * Contar personagens por jogador
   */
  static async countByPlayerId(playerId: number) {
    return await prisma.character.count({
      where: { playerId },
    });
  }

  /**
   * Verificar se nome do personagem já existe para um jogador
   */
  static async nameExistsForPlayer(name: string, playerId: number, excludeId?: number) {
    const where: any = {
      name,
      playerId,
    };

    if (excludeId) {
      where.id = { not: excludeId };
    }

    const character = await prisma.character.findFirst({
      where,
      select: { id: true },
    });

    return !!character;
  }

  /**
   * Verificar propriedade do personagem
   */
  static async verifyOwnership(characterId: number, playerId: number) {
    const character = await prisma.character.findFirst({
      where: {
        id: characterId,
        playerId,
      },
      select: { id: true },
    });

    return !!character;
  }

  /**
   * Buscar personagens com filtros
   */
  static async findWithFilters(filters: CharacterSearchFilters) {
    const where: any = {};

    if (filters.playerId) where.playerId = filters.playerId;
    if (filters.schoolId) where.schoolId = filters.schoolId;
    if (filters.locationId) where.currentLocationId = filters.locationId;
    if (filters.name) {
      where.name = {
        contains: filters.name,
      };
    }
    if (filters.minLevel || filters.maxLevel) {
      where.level = {};
      if (filters.minLevel) where.level.gte = filters.minLevel;
      if (filters.maxLevel) where.level.lte = filters.maxLevel;
    }

    return await prisma.character.findMany({
      where,
      include: {
        player: {
          select: {
            id: true,
            username: true,
          },
        },
        school: {
          select: {
            id: true,
            name: true,
          },
        },
        currentLocation: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: [
        { level: 'desc' },
        { experiencePoints: 'desc' },
      ],
    });
  }

  /**
   * Buscar top personagens por nível
   */
  static async findTopByLevel(limit: number = 10) {
    return await prisma.character.findMany({
      select: {
        id: true,
        name: true,
        level: true,
        experiencePoints: true,
        player: {
          select: {
            username: true,
          },
        },
        school: {
          select: {
            name: true,
          },
        },
      },
      orderBy: [
        { level: 'desc' },
        { experiencePoints: 'desc' },
      ],
      take: limit,
    });
  }

  /**
   * Buscar personagens por localização
   */
  static async findByLocation(locationId: number) {
    return await prisma.character.findMany({
      where: { currentLocationId: locationId },
      select: {
        id: true,
        name: true,
        level: true,
        player: {
          select: {
            username: true,
          },
        },
        school: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        level: 'desc',
      },
    });
  }

  /**
   * Buscar personagens por escola
   */
  static async findBySchool(schoolId: number) {
    return await prisma.character.findMany({
      where: { schoolId },
      select: {
        id: true,
        name: true,
        level: true,
        experiencePoints: true,
        player: {
          select: {
            username: true,
          },
        },
      },
      orderBy: [
        { level: 'desc' },
        { experiencePoints: 'desc' },
      ],
    });
  }

  /**
   * Atualizar último login do personagem
   */
  static async updateLastLogin(id: number) {
    return await prisma.character.update({
      where: { id },
      data: {
        lastLogin: new Date(),
      },
      select: {
        id: true,
        lastLogin: true,
      },
    });
  }

  /**
   * Buscar estatísticas do personagem
   */
  static async getCharacterStats(id: number) {
    return await prisma.character.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        level: true,
        experiencePoints: true,
        gold: true,
        maxHealth: true,
        currentHealth: true,
        createdAt: true,
        _count: {
          select: {
            inventory: true,
            quests: {
              where: {
                status: 'COMPLETED',
              },
            },
            achievements: true,
            problemAttempts: {
              where: {
                isCorrect: true,
              },
            },
            encounters: {
              where: {
                status: 'WON',
              },
            },
          },
        },
      },
    });
  }

  /**
   * Contar total de personagens
   */
  static async countAll() {
    return await prisma.character.count();
  }

  /**
   * Buscar personagens ativos (que fizeram login recentemente)
   */
  static async findActiveCharacters(daysAgo: number = 7) {
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - daysAgo);

    return await prisma.character.findMany({
      where: {
        lastLogin: {
          gte: dateThreshold,
        },
      },
      select: {
        id: true,
        name: true,
        level: true,
        lastLogin: true,
        player: {
          select: {
            username: true,
          },
        },
        school: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        lastLogin: 'desc',
      },
    });
  }
}