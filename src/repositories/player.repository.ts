/**
 * Player Repository
 * Repository para operações de banco de dados relacionadas aos jogadores
 */

import { prisma } from "../config/database";

/**
 * Interfaces para requests
 */
export interface CreatePlayerRequest {
  username: string;
  email: string;
  passwordHash: string;
}

export interface UpdatePlayerRequest {
  username?: string;
  email?: string;
  passwordHash?: string;
  lastLogin?: Date;
}

export default class PlayerRepository {
  /**
   * Buscar todos os jogadores
   */
  static async findAll() {
    return await prisma.player.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true,
        lastLogin: true,
        _count: {
          select: {
            characters: true,
          },
        },
      },
    });
  }

  /**
   * Buscar jogador por email
   */
  static async findByEmail(email: string) {
    return await prisma.player.findUnique({
      where: { email },
      include: {
        characters: {
          select: {
            id: true,
            name: true,
            level: true,
            school: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * Buscar jogador por ID
   */
  static async findById(id: number) {
    return await prisma.player.findUnique({
      where: { id },
      include: {
        characters: {
          select: {
            id: true,
            name: true,
            level: true,
            experiencePoints: true,
            gold: true,
            school: {
              select: {
                name: true,
              },
            },
            currentLocation: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * Buscar jogador por username
   */
  static async findByUsername(username: string) {
    return await prisma.player.findUnique({
      where: { username },
      include: {
        characters: {
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
   * Buscar jogador por email (apenas para autenticação)
   */
  static async findByEmailForAuth(email: string) {
    return await prisma.player.findUnique({
      where: { email },
      select: {
        id: true,
        username: true,
        email: true,
        passwordHash: true,
      },
    });
  }

  /**
   * Criar novo jogador
   */
  static async createPlayer(data: CreatePlayerRequest) {
    return await prisma.player.create({
      data: {
        username: data.username,
        email: data.email,
        passwordHash: data.passwordHash,
      },
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true,
      },
    });
  }

  /**
   * Atualizar jogador
   */
  static async updatePlayer(id: number, data: UpdatePlayerRequest) {
    const updateData: any = {};

    if (data.username !== undefined) updateData.username = data.username;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.passwordHash !== undefined) updateData.passwordHash = data.passwordHash;
    if (data.lastLogin !== undefined) updateData.lastLogin = data.lastLogin;

    return await prisma.player.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true,
        lastLogin: true,
      },
    });
  }

  /**
   * Atualizar último login
   */
  static async updateLastLogin(id: number) {
    return await prisma.player.update({
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
   * Deletar jogador
   */
  static async deletePlayer(id: number) {
    return await prisma.player.delete({
      where: { id },
    });
  }

  /**
   * Verificar se email já existe
   */
  static async emailExists(email: string, excludeId?: number) {
    const where: any = { email };
    
    if (excludeId) {
      where.id = { not: excludeId };
    }

    const player = await prisma.player.findUnique({
      where,
      select: { id: true },
    });

    return !!player;
  }

  /**
   * Verificar se username já existe
   */
  static async usernameExists(username: string, excludeId?: number) {
    const where: any = { username };
    
    if (excludeId) {
      where.id = { not: excludeId };
    }

    const player = await prisma.player.findUnique({
      where,
      select: { id: true },
    });

    return !!player;
  }

  /**
   * Buscar jogadores com estatísticas
   */
  static async findPlayersWithStats() {
    return await prisma.player.findMany({
      select: {
        id: true,
        username: true,
        createdAt: true,
        lastLogin: true,
        characters: {
          select: {
            id: true,
            name: true,
            level: true,
            experiencePoints: true,
            gold: true,
          },
        },
        _count: {
          select: {
            characters: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Buscar top jogadores por experiência total
   */
  static async findTopPlayersByExperience(limit: number = 10) {
    return await prisma.player.findMany({
      select: {
        id: true,
        username: true,
        characters: {
          select: {
            name: true,
            level: true,
            experiencePoints: true,
          },
          orderBy: {
            experiencePoints: 'desc',
          },
        },
      },
      take: limit,
    });
  }

  /**
   * Contar total de jogadores
   */
  static async countPlayers() {
    return await prisma.player.count();
  }

  /**
   * Buscar jogadores ativos (que fizeram login recentemente)
   */
  static async findActivePlayers(daysAgo: number = 7) {
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - daysAgo);

    return await prisma.player.findMany({
      where: {
        lastLogin: {
          gte: dateThreshold,
        },
      },
      select: {
        id: true,
        username: true,
        lastLogin: true,
        _count: {
          select: {
            characters: true,
          },
        },
      },
      orderBy: {
        lastLogin: 'desc',
      },
    });
  }
}