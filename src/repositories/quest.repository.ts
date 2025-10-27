/**
 * Quest Repository
 * Repository para operações de banco de dados relacionadas às missões e objetivos
 */

import { prisma } from "../config/database";

/**
 * Interfaces para requests
 */
export interface CreateQuestRequest {
  title: string;
  description?: string;
  questGiverNpcId?: number;
  experienceReward?: number;
  goldReward?: number;
  itemRewardId?: number;
  minLevel?: number;
  isRepeatable?: boolean;
}

export interface UpdateQuestRequest {
  title?: string;
  description?: string;
  questGiverNpcId?: number;
  experienceReward?: number;
  goldReward?: number;
  itemRewardId?: number;
  minLevel?: number;
  isRepeatable?: boolean;
}

export interface CreateQuestObjectiveRequest {
  questId: number;
  description?: string;
  type?: string;
  targetProblemId?: number;
  targetMonsterId?: number;
  targetItemId?: number;
  targetNpcId?: number;
  targetQuantity?: number;
  orderIndex?: number;
}

export interface AcceptQuestRequest {
  characterId: number;
  questId: number;
}

export interface UpdateQuestProgressRequest {
  status?: string;
  currentObjectiveIndex?: number;
  completedAt?: Date;
}

export default class QuestRepository {
  /**
   * Buscar todas as missões
   */
  static async findAll() {
    return await prisma.quest.findMany({
      include: {
        questGiver: {
          select: {
            id: true,
            name: true,
            location: {
              select: {
                name: true,
              },
            },
          },
        },
        itemReward: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
        objectives: {
          select: {
            id: true,
            description: true,
            type: true,
            targetQuantity: true,
            orderIndex: true,
          },
          orderBy: {
            orderIndex: 'asc',
          },
        },
        _count: {
          select: {
            characterQuests: true,
          },
        },
      },
      orderBy: {
        minLevel: 'asc',
      },
    });
  }

  /**
   * Buscar missão por ID
   */
  static async findById(id: number) {
    return await prisma.quest.findUnique({
      where: { id },
      include: {
        questGiver: {
          select: {
            id: true,
            name: true,
            dialogueText: true,
            location: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        itemReward: {
          select: {
            id: true,
            name: true,
            description: true,
            type: true,
            healthBonus: true,
          },
        },
        objectives: {
          include: {
            targetProblem: {
              select: {
                id: true,
                description: true,
                problemType: true,
                difficultyLevel: true,
              },
            },
            targetMonster: {
              select: {
                id: true,
                name: true,
                difficultyLevel: true,
              },
            },
            targetItem: {
              select: {
                id: true,
                name: true,
                type: true,
              },
            },
            targetNpc: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: {
            orderIndex: 'asc',
          },
        },
      },
    });
  }

  /**
   * Buscar missões disponíveis para um personagem
   */
  static async findAvailableForCharacter(characterId: number, characterLevel: number) {
    // Busca missões que o personagem ainda não aceitou e tem nível suficiente
    return await prisma.quest.findMany({
      where: {
        minLevel: {
          lte: characterLevel,
        },
        NOT: {
          characterQuests: {
            some: {
              characterId: characterId,
              status: {
                in: ['ACTIVE', 'COMPLETED'],
              },
            },
          },
        },
      },
      include: {
        questGiver: {
          select: {
            id: true,
            name: true,
            location: {
              select: {
                name: true,
              },
            },
          },
        },
        itemReward: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
        objectives: {
          select: {
            id: true,
            description: true,
            type: true,
            targetQuantity: true,
            orderIndex: true,
          },
          orderBy: {
            orderIndex: 'asc',
          },
        },
      },
      orderBy: {
        minLevel: 'asc',
      },
    });
  }

  /**
   * Buscar missões repetíveis para um personagem
   */
  static async findRepeatableForCharacter(characterId: number, characterLevel: number) {
    return await prisma.quest.findMany({
      where: {
        isRepeatable: true,
        minLevel: {
          lte: characterLevel,
        },
        // Pode incluir missões já completadas se forem repetíveis
        OR: [
          {
            NOT: {
              characterQuests: {
                some: {
                  characterId: characterId,
                },
              },
            },
          },
          {
            characterQuests: {
              some: {
                characterId: characterId,
                status: 'COMPLETED',
              },
            },
          },
        ],
      },
      include: {
        questGiver: {
          select: {
            id: true,
            name: true,
            location: {
              select: {
                name: true,
              },
            },
          },
        },
        itemReward: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
        objectives: {
          select: {
            id: true,
            description: true,
            type: true,
            targetQuantity: true,
            orderIndex: true,
          },
          orderBy: {
            orderIndex: 'asc',
          },
        },
      },
      orderBy: {
        minLevel: 'asc',
      },
    });
  }

  /**
   * Criar nova missão
   */
  static async createQuest(data: CreateQuestRequest) {
    return await prisma.quest.create({
      data: {
        title: data.title,
        description: data.description,
        questGiverNpcId: data.questGiverNpcId,
        experienceReward: data.experienceReward || 50,
        goldReward: data.goldReward || 25,
        itemRewardId: data.itemRewardId,
        minLevel: data.minLevel || 1,
        isRepeatable: data.isRepeatable ?? false,
      },
      include: {
        questGiver: {
          select: {
            id: true,
            name: true,
          },
        },
        itemReward: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
    });
  }

  /**
   * Atualizar missão
   */
  static async updateQuest(id: number, data: UpdateQuestRequest) {
    const updateData: any = {};

    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.questGiverNpcId !== undefined) updateData.questGiverNpcId = data.questGiverNpcId;
    if (data.experienceReward !== undefined) updateData.experienceReward = data.experienceReward;
    if (data.goldReward !== undefined) updateData.goldReward = data.goldReward;
    if (data.itemRewardId !== undefined) updateData.itemRewardId = data.itemRewardId;
    if (data.minLevel !== undefined) updateData.minLevel = data.minLevel;
    if (data.isRepeatable !== undefined) updateData.isRepeatable = data.isRepeatable;

    return await prisma.quest.update({
      where: { id },
      data: updateData,
      include: {
        questGiver: {
          select: {
            id: true,
            name: true,
          },
        },
        itemReward: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
    });
  }

  /**
   * Deletar missão
   */
  static async deleteQuest(id: number) {
    return await prisma.quest.delete({
      where: { id },
    });
  }

  // ===== QUEST OBJECTIVES =====

  /**
   * Buscar objetivos de uma missão
   */
  static async findQuestObjectives(questId: number) {
    return await prisma.questObjective.findMany({
      where: { questId },
      include: {
        targetProblem: {
          select: {
            id: true,
            description: true,
            problemType: true,
            difficultyLevel: true,
          },
        },
        targetMonster: {
          select: {
            id: true,
            name: true,
            difficultyLevel: true,
          },
        },
        targetItem: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
        targetNpc: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        orderIndex: 'asc',
      },
    });
  }

  /**
   * Criar objetivo de missão
   */
  static async createQuestObjective(data: CreateQuestObjectiveRequest) {
    return await prisma.questObjective.create({
      data: {
        questId: data.questId,
        description: data.description,
        type: data.type,
        targetProblemId: data.targetProblemId,
        targetMonsterId: data.targetMonsterId,
        targetItemId: data.targetItemId,
        targetNpcId: data.targetNpcId,
        targetQuantity: data.targetQuantity || 1,
        orderIndex: data.orderIndex || 0,
      },
      include: {
        targetProblem: {
          select: {
            id: true,
            description: true,
            problemType: true,
          },
        },
        targetMonster: {
          select: {
            id: true,
            name: true,
          },
        },
        targetItem: {
          select: {
            id: true,
            name: true,
          },
        },
        targetNpc: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  // ===== CHARACTER QUEST PROGRESS =====

  /**
   * Buscar missões ativas de um personagem
   */
  static async findCharacterActiveQuests(characterId: number) {
    return await prisma.characterQuest.findMany({
      where: {
        characterId,
        status: 'ACTIVE',
      },
      include: {
        quest: {
          include: {
            objectives: {
              orderBy: {
                orderIndex: 'asc',
              },
            },
            questGiver: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        startedAt: 'desc',
      },
    });
  }

  /**
   * Buscar missões completadas de um personagem
   */
  static async findCharacterCompletedQuests(characterId: number) {
    return await prisma.characterQuest.findMany({
      where: {
        characterId,
        status: 'COMPLETED',
      },
      include: {
        quest: {
          select: {
            id: true,
            title: true,
            description: true,
            experienceReward: true,
            goldReward: true,
            itemReward: {
              select: {
                name: true,
                type: true,
              },
            },
          },
        },
      },
      orderBy: {
        completedAt: 'desc',
      },
    });
  }

  /**
   * Buscar progresso específico de uma missão
   */
  static async findCharacterQuestProgress(characterId: number, questId: number) {
    return await prisma.characterQuest.findUnique({
      where: {
        characterId_questId: {
          characterId,
          questId,
        },
      },
      include: {
        quest: {
          include: {
            objectives: {
              orderBy: {
                orderIndex: 'asc',
              },
            },
          },
        },
      },
    });
  }

  /**
   * Aceitar missão (criar progresso)
   */
  static async acceptQuest(data: AcceptQuestRequest) {
    return await prisma.characterQuest.create({
      data: {
        characterId: data.characterId,
        questId: data.questId,
        status: 'ACTIVE',
        currentObjectiveIndex: 0,
      },
      include: {
        quest: {
          include: {
            objectives: {
              orderBy: {
                orderIndex: 'asc',
              },
            },
          },
        },
      },
    });
  }

  /**
   * Atualizar progresso da missão
   */
  static async updateQuestProgress(
    characterId: number,
    questId: number,
    data: UpdateQuestProgressRequest
  ) {
    const updateData: any = {};

    if (data.status !== undefined) updateData.status = data.status;
    if (data.currentObjectiveIndex !== undefined) updateData.currentObjectiveIndex = data.currentObjectiveIndex;
    if (data.completedAt !== undefined) updateData.completedAt = data.completedAt;

    return await prisma.characterQuest.update({
      where: {
        characterId_questId: {
          characterId,
          questId,
        },
      },
      data: updateData,
      include: {
        quest: {
          include: {
            objectives: {
              orderBy: {
                orderIndex: 'asc',
              },
            },
          },
        },
      },
    });
  }

  /**
   * Abandonar missão
   */
  static async abandonQuest(characterId: number, questId: number) {
    return await prisma.characterQuest.update({
      where: {
        characterId_questId: {
          characterId,
          questId,
        },
      },
      data: {
        status: 'ABANDONED',
      },
    });
  }

  /**
   * Completar missão
   */
  static async completeQuest(characterId: number, questId: number) {
    return await prisma.characterQuest.update({
      where: {
        characterId_questId: {
          characterId,
          questId,
        },
      },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
      },
      include: {
        quest: {
          select: {
            id: true,
            title: true,
            experienceReward: true,
            goldReward: true,
            itemRewardId: true,
          },
        },
      },
    });
  }

  /**
   * Contar total de missões
   */
  static async countQuests() {
    return await prisma.quest.count();
  }

  /**
   * Buscar missões mais populares (mais aceitas)
   */
  static async findMostPopularQuests(limit: number = 10) {
    return await prisma.quest.findMany({
      select: {
        id: true,
        title: true,
        description: true,
        minLevel: true,
        experienceReward: true,
        goldReward: true,
        _count: {
          select: {
            characterQuests: true,
          },
        },
      },
      orderBy: {
        characterQuests: {
          _count: 'desc',
        },
      },
      take: limit,
    });
  }
}