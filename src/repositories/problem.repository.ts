/**
 * Problem Repository
 * Repository para operações de banco de dados relacionadas aos problemas matemáticos
 */

import { prisma } from "../config/database";

/**
 * Interfaces para requests
 */
export interface CreateProblemRequest {
  description: string;
  problemType?: string;
  answer: string;
  difficultyLevel?: number;
  hintText?: string;
  timeLimitSeconds?: number;
  experienceReward?: number;
}

export interface UpdateProblemRequest {
  description?: string;
  problemType?: string;
  answer?: string;
  difficultyLevel?: number;
  hintText?: string;
  timeLimitSeconds?: number;
  experienceReward?: number;
}

export interface CreateProblemAttemptRequest {
  characterId: number;
  problemId: number;
  userAnswer?: string;
  isCorrect: boolean;
  timeTakenSeconds?: number;
}

export default class ProblemRepository {
  /**
   * Buscar todos os problemas
   */
  static async findAll() {
    return await prisma.problem.findMany({
      select: {
        id: true,
        description: true,
        problemType: true,
        difficultyLevel: true,
        hintText: true,
        timeLimitSeconds: true,
        experienceReward: true,
        _count: {
          select: {
            attempts: true,
          },
        },
      },
      orderBy: {
        difficultyLevel: 'asc',
      },
    });
  }

  /**
   * Buscar problema por ID
   */
  static async findById(id: number) {
    return await prisma.problem.findUnique({
      where: { id },
      include: {
        attempts: {
          select: {
            id: true,
            isCorrect: true,
            timeTakenSeconds: true,
            attemptedAt: true,
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
            attemptedAt: 'desc',
          },
          take: 10, // Últimas 10 tentativas
        },
        encounters: {
          select: {
            id: true,
            status: true,
            character: {
              select: {
                name: true,
              },
            },
          },
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
            attempts: true,
          },
        },
      },
    });
  }

  /**
   * Buscar problema por ID (sem resposta - para jogadores)
   */
  static async findByIdForPlayer(id: number) {
    return await prisma.problem.findUnique({
      where: { id },
      select: {
        id: true,
        description: true,
        problemType: true,
        difficultyLevel: true,
        hintText: true,
        timeLimitSeconds: true,
        experienceReward: true,
      },
    });
  }

  /**
   * Buscar problemas por tipo
   */
  static async findByType(problemType: string) {
    return await prisma.problem.findMany({
      where: { problemType },
      select: {
        id: true,
        description: true,
        problemType: true,
        difficultyLevel: true,
        hintText: true,
        timeLimitSeconds: true,
        experienceReward: true,
      },
      orderBy: {
        difficultyLevel: 'asc',
      },
    });
  }

  /**
   * Buscar problemas por nível de dificuldade
   */
  static async findByDifficultyLevel(difficultyLevel: number) {
    return await prisma.problem.findMany({
      where: { difficultyLevel },
      select: {
        id: true,
        description: true,
        problemType: true,
        difficultyLevel: true,
        hintText: true,
        timeLimitSeconds: true,
        experienceReward: true,
      },
      orderBy: {
        problemType: 'asc',
      },
    });
  }

  /**
   * Buscar problemas adequados para o nível do personagem
   */
  static async findSuitableForCharacterLevel(characterLevel: number) {
    // Problemas com dificuldade entre level-1 e level+1
    const minDifficulty = Math.max(1, characterLevel - 1);
    const maxDifficulty = characterLevel + 1;

    return await prisma.problem.findMany({
      where: {
        difficultyLevel: {
          gte: minDifficulty,
          lte: maxDifficulty,
        },
      },
      select: {
        id: true,
        description: true,
        problemType: true,
        difficultyLevel: true,
        hintText: true,
        timeLimitSeconds: true,
        experienceReward: true,
      },
      orderBy: {
        difficultyLevel: 'asc',
      },
    });
  }

  /**
   * Criar novo problema
   */
  static async createProblem(data: CreateProblemRequest) {
    return await prisma.problem.create({
      data: {
        description: data.description,
        problemType: data.problemType,
        answer: data.answer,
        difficultyLevel: data.difficultyLevel || 1,
        hintText: data.hintText,
        timeLimitSeconds: data.timeLimitSeconds,
        experienceReward: data.experienceReward || 5,
      },
      select: {
        id: true,
        description: true,
        problemType: true,
        difficultyLevel: true,
        hintText: true,
        timeLimitSeconds: true,
        experienceReward: true,
      },
    });
  }

  /**
   * Atualizar problema
   */
  static async updateProblem(id: number, data: UpdateProblemRequest) {
    const updateData: any = {};

    if (data.description !== undefined) updateData.description = data.description;
    if (data.problemType !== undefined) updateData.problemType = data.problemType;
    if (data.answer !== undefined) updateData.answer = data.answer;
    if (data.difficultyLevel !== undefined) updateData.difficultyLevel = data.difficultyLevel;
    if (data.hintText !== undefined) updateData.hintText = data.hintText;
    if (data.timeLimitSeconds !== undefined) updateData.timeLimitSeconds = data.timeLimitSeconds;
    if (data.experienceReward !== undefined) updateData.experienceReward = data.experienceReward;

    return await prisma.problem.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        description: true,
        problemType: true,
        difficultyLevel: true,
        hintText: true,
        timeLimitSeconds: true,
        experienceReward: true,
      },
    });
  }

  /**
   * Deletar problema
   */
  static async deleteProblem(id: number) {
    return await prisma.problem.delete({
      where: { id },
    });
  }

  /**
   * Verificar resposta do problema
   */
  static async checkAnswer(problemId: number, userAnswer: string) {
    const problem = await prisma.problem.findUnique({
      where: { id: problemId },
      select: {
        answer: true,
      },
    });

    if (!problem) {
      return null;
    }

    // Normaliza as respostas para comparação (remove espaços, converte para lowercase)
    const normalizedCorrectAnswer = problem.answer.trim().toLowerCase();
    const normalizedUserAnswer = userAnswer.trim().toLowerCase();

    return normalizedCorrectAnswer === normalizedUserAnswer;
  }

  // ===== PROBLEM ATTEMPTS =====

  /**
   * Buscar tentativas de um personagem
   */
  static async findCharacterAttempts(characterId: number) {
    return await prisma.problemAttempt.findMany({
      where: { characterId },
      include: {
        problem: {
          select: {
            id: true,
            description: true,
            problemType: true,
            difficultyLevel: true,
            experienceReward: true,
          },
        },
      },
      orderBy: {
        attemptedAt: 'desc',
      },
    });
  }

  /**
   * Buscar tentativas de um problema específico
   */
  static async findProblemAttempts(problemId: number) {
    return await prisma.problemAttempt.findMany({
      where: { problemId },
      include: {
        character: {
          select: {
            id: true,
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
        attemptedAt: 'desc',
      },
    });
  }

  /**
   * Buscar tentativas de um personagem para um problema específico
   */
  static async findCharacterProblemAttempts(characterId: number, problemId: number) {
    return await prisma.problemAttempt.findMany({
      where: {
        characterId,
        problemId,
      },
      orderBy: {
        attemptedAt: 'desc',
      },
    });
  }

  /**
   * Criar tentativa de problema
   */
  static async createAttempt(data: CreateProblemAttemptRequest) {
    return await prisma.problemAttempt.create({
      data: {
        characterId: data.characterId,
        problemId: data.problemId,
        userAnswer: data.userAnswer,
        isCorrect: data.isCorrect,
        timeTakenSeconds: data.timeTakenSeconds,
      },
      include: {
        problem: {
          select: {
            id: true,
            description: true,
            problemType: true,
            difficultyLevel: true,
            experienceReward: true,
          },
        },
        character: {
          select: {
            id: true,
            name: true,
            level: true,
          },
        },
      },
    });
  }

  /**
   * Buscar estatísticas de um problema
   */
  static async findProblemStats(problemId: number) {
    const attempts = await prisma.problemAttempt.groupBy({
      by: ['isCorrect'],
      where: {
        problemId: problemId,
      },
      _count: {
        isCorrect: true,
      },
      _avg: {
        timeTakenSeconds: true,
      },
    });

    const stats = {
      totalAttempts: 0,
      correctAttempts: 0,
      incorrectAttempts: 0,
      successRate: 0,
      averageTime: 0,
    };

    attempts.forEach((attempt) => {
      stats.totalAttempts += attempt._count.isCorrect;

      if (attempt.isCorrect) {
        stats.correctAttempts += attempt._count.isCorrect;
        stats.averageTime = attempt._avg.timeTakenSeconds || 0;
      } else {
        stats.incorrectAttempts += attempt._count.isCorrect;
      }
    });

    if (stats.totalAttempts > 0) {
      stats.successRate = (stats.correctAttempts / stats.totalAttempts) * 100;
    }

    return stats;
  }

  /**
   * Buscar problemas mais difíceis (menor taxa de sucesso)
   */
  static async findMostDifficultProblems(limit: number = 10) {
    // Esta query é complexa, então vamos fazer de forma simplificada
    const problems = await prisma.problem.findMany({
      select: {
        id: true,
        description: true,
        problemType: true,
        difficultyLevel: true,
        _count: {
          select: {
            attempts: true,
          },
        },
      },
      where: {
        attempts: {
          some: {}, // Apenas problemas que têm tentativas
        },
      },
      take: limit * 3, // Pega mais para filtrar depois
    });

    // Para cada problema, calcula a taxa de sucesso
    const problemsWithStats = await Promise.all(
      problems.map(async (problem) => {
        const stats = await this.findProblemStats(problem.id);
        return {
          ...problem,
          successRate: stats.successRate,
          totalAttempts: stats.totalAttempts,
        };
      })
    );

    // Ordena por taxa de sucesso (menor primeiro) e filtra apenas os que têm tentativas suficientes
    return problemsWithStats
      .filter(p => p.totalAttempts >= 5) // Pelo menos 5 tentativas
      .sort((a, b) => a.successRate - b.successRate)
      .slice(0, limit);
  }

  /**
   * Buscar problema aleatório adequado para o nível
   */
  static async findRandomForCharacterLevel(characterLevel: number) {
    const suitableProblems = await this.findSuitableForCharacterLevel(characterLevel);

    if (suitableProblems.length === 0) {
      return null;
    }

    const randomIndex = Math.floor(Math.random() * suitableProblems.length);
    return suitableProblems[randomIndex];
  }

  /**
   * Contar total de problemas
   */
  static async countProblems() {
    return await prisma.problem.count();
  }

  /**
   * Buscar problemas nunca tentados
   */
  static async findUnattemptedProblems() {
    return await prisma.problem.findMany({
      where: {
        attempts: {
          none: {},
        },
      },
      select: {
        id: true,
        description: true,
        problemType: true,
        difficultyLevel: true,
        experienceReward: true,
      },
      orderBy: {
        difficultyLevel: 'asc',
      },
    });
  }
}