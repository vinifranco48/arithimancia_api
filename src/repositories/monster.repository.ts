/**
 * Monster Repository
 * Repository para operações de banco de dados relacionadas aos monstros e combate
 */

import { prisma } from "../config/database";

/**
 * Interfaces para requests
 */
export interface CreateMonsterRequest {
  name: string;
  description?: string;
  baseHealth?: number;
  mathematicalConcept?: string;
  difficultyLevel?: number;
  experienceReward?: number;
  goldReward?: number;
}

export interface UpdateMonsterRequest {
  name?: string;
  description?: string;
  baseHealth?: number;
  mathematicalConcept?: string;
  difficultyLevel?: number;
  experienceReward?: number;
  goldReward?: number;
}

export default class MonsterRepository {
  /**
   * Buscar todos os monstros
   */
  static async findAll() {
    return await prisma.monster.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        baseHealth: true,
        mathematicalConcept: true,
        difficultyLevel: true,
        experienceReward: true,
        goldReward: true,
        _count: {
          select: {
            encounters: true,
          },
        },
      },
      orderBy: {
        difficultyLevel: 'asc',
      },
    });
  }

  /**
   * Buscar monstro por ID
   */
  static async findById(id: number) {
    return await prisma.monster.findUnique({
      where: { id },
      include: {
        encounters: {
          select: {
            id: true,
            status: true,
            startedAt: true,
            completedAt: true,
            character: {
              select: {
                name: true,
                level: true,
                player: {
                  select: {
                    username: true,
                  },
                },
              },
            },
          },
          orderBy: {
            startedAt: 'desc',
          },
          take: 10, // Últimos 10 encontros
        },
        questObjectives: {
          select: {
            id: true,
            quest: {
              select: {
                title: true,
              },
            },
          },
        },
        _count: {
          select: {
            encounters: true,
          },
        },
      },
    });
  }

  /**
   * Buscar monstro por nome
   */
  static async findByName(name: string) {
    return await prisma.monster.findUnique({
      where: { name },
      select: {
        id: true,
        name: true,
        description: true,
        baseHealth: true,
        mathematicalConcept: true,
        difficultyLevel: true,
        experienceReward: true,
        goldReward: true,
      },
    });
  }

  /**
   * Buscar monstros por nível de dificuldade
   */
  static async findByDifficultyLevel(difficultyLevel: number) {
    return await prisma.monster.findMany({
      where: { difficultyLevel },
      select: {
        id: true,
        name: true,
        description: true,
        baseHealth: true,
        mathematicalConcept: true,
        difficultyLevel: true,
        experienceReward: true,
        goldReward: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  /**
   * Buscar monstros adequados para o nível do personagem
   */
  static async findSuitableForCharacterLevel(characterLevel: number) {
    // Monstros com dificuldade entre level-1 e level+2
    const minDifficulty = Math.max(1, characterLevel - 1);
    const maxDifficulty = characterLevel + 2;

    return await prisma.monster.findMany({
      where: {
        difficultyLevel: {
          gte: minDifficulty,
          lte: maxDifficulty,
        },
      },
      select: {
        id: true,
        name: true,
        description: true,
        baseHealth: true,
        mathematicalConcept: true,
        difficultyLevel: true,
        experienceReward: true,
        goldReward: true,
      },
      orderBy: {
        difficultyLevel: 'asc',
      },
    });
  }

  /**
   * Buscar monstros por conceito matemático
   */
  static async findByMathematicalConcept(concept: string) {
    return await prisma.monster.findMany({
      where: {
        mathematicalConcept: {
          contains: concept,
        },
      },
      select: {
        id: true,
        name: true,
        description: true,
        baseHealth: true,
        mathematicalConcept: true,
        difficultyLevel: true,
        experienceReward: true,
        goldReward: true,
      },
      orderBy: {
        difficultyLevel: 'asc',
      },
    });
  }

  /**
   * Criar novo monstro
   */
  static async createMonster(data: CreateMonsterRequest) {
    return await prisma.monster.create({
      data: {
        name: data.name,
        description: data.description,
        baseHealth: data.baseHealth || 10,
        mathematicalConcept: data.mathematicalConcept,
        difficultyLevel: data.difficultyLevel || 1,
        experienceReward: data.experienceReward || 10,
        goldReward: data.goldReward || 5,
      },
      select: {
        id: true,
        name: true,
        description: true,
        baseHealth: true,
        mathematicalConcept: true,
        difficultyLevel: true,
        experienceReward: true,
        goldReward: true,
      },
    });
  }

  /**
   * Atualizar monstro
   */
  static async updateMonster(id: number, data: UpdateMonsterRequest) {
    const updateData: any = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.baseHealth !== undefined) updateData.baseHealth = data.baseHealth;
    if (data.mathematicalConcept !== undefined) updateData.mathematicalConcept = data.mathematicalConcept;
    if (data.difficultyLevel !== undefined) updateData.difficultyLevel = data.difficultyLevel;
    if (data.experienceReward !== undefined) updateData.experienceReward = data.experienceReward;
    if (data.goldReward !== undefined) updateData.goldReward = data.goldReward;

    return await prisma.monster.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        description: true,
        baseHealth: true,
        mathematicalConcept: true,
        difficultyLevel: true,
        experienceReward: true,
        goldReward: true,
      },
    });
  }

  /**
   * Deletar monstro
   */
  static async deleteMonster(id: number) {
    return await prisma.monster.delete({
      where: { id },
    });
  }

  /**
   * Verificar se nome do monstro já existe
   */
  static async nameExists(name: string, excludeId?: number) {
    const where: any = { name };
    
    if (excludeId) {
      where.id = { not: excludeId };
    }

    const monster = await prisma.monster.findUnique({
      where,
      select: { id: true },
    });

    return !!monster;
  }

  /**
   * Buscar monstros mais enfrentados
   */
  static async findMostFoughtMonsters(limit: number = 10) {
    return await prisma.monster.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        mathematicalConcept: true,
        difficultyLevel: true,
        _count: {
          select: {
            encounters: true,
          },
        },
      },
      orderBy: {
        encounters: {
          _count: 'desc',
        },
      },
      take: limit,
    });
  }

  /**
   * Buscar estatísticas de vitórias/derrotas por monstro
   */
  static async findMonsterStats(monsterId: number) {
    const encounters = await prisma.encounter.groupBy({
      by: ['status'],
      where: {
        monsterId: monsterId,
      },
      _count: {
        status: true,
      },
    });

    const stats = {
      totalEncounters: 0,
      wins: 0,
      losses: 0,
      inProgress: 0,
      fled: 0,
    };

    encounters.forEach((encounter) => {
      stats.totalEncounters += encounter._count.status;
      
      switch (encounter.status) {
        case 'WON':
          stats.losses += encounter._count.status; // Monstro perdeu
          break;
        case 'LOST':
          stats.wins += encounter._count.status; // Monstro ganhou
          break;
        case 'IN_PROGRESS':
          stats.inProgress += encounter._count.status;
          break;
        case 'FLED':
          stats.fled += encounter._count.status;
          break;
      }
    });

    return stats;
  }

  /**
   * Buscar monstros por faixa de recompensa de experiência
   */
  static async findByExperienceRewardRange(minExp: number, maxExp: number) {
    return await prisma.monster.findMany({
      where: {
        experienceReward: {
          gte: minExp,
          lte: maxExp,
        },
      },
      select: {
        id: true,
        name: true,
        description: true,
        baseHealth: true,
        mathematicalConcept: true,
        difficultyLevel: true,
        experienceReward: true,
        goldReward: true,
      },
      orderBy: {
        experienceReward: 'asc',
      },
    });
  }

  /**
   * Contar total de monstros
   */
  static async countMonsters() {
    return await prisma.monster.count();
  }

  /**
   * Buscar monstros únicos (nunca enfrentados)
   */
  static async findUnfoughtMonsters() {
    return await prisma.monster.findMany({
      where: {
        encounters: {
          none: {},
        },
      },
      select: {
        id: true,
        name: true,
        description: true,
        mathematicalConcept: true,
        difficultyLevel: true,
        experienceReward: true,
        goldReward: true,
      },
      orderBy: {
        difficultyLevel: 'asc',
      },
    });
  }

  /**
   * Buscar monstro aleatório adequado para o nível
   */
  static async findRandomForCharacterLevel(characterLevel: number) {
    const suitableMonsters = await this.findSuitableForCharacterLevel(characterLevel);
    
    if (suitableMonsters.length === 0) {
      return null;
    }

    const randomIndex = Math.floor(Math.random() * suitableMonsters.length);
    return suitableMonsters[randomIndex];
  }
}