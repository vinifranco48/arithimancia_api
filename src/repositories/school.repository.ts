/**
 * School Repository
 * Repository para operações de banco de dados relacionadas às escolas de magia
 */

import { prisma } from "../config/database";

/**
 * Interfaces para requests
 */
export interface CreateSchoolRequest {
  name: string;
  description?: string;
  axiom?: string;
  healthBonus?: number;
  startingGold?: number;
}

export interface UpdateSchoolRequest {
  name?: string;
  description?: string;
  axiom?: string;
  healthBonus?: number;
  startingGold?: number;
}

export default class SchoolRepository {
  /**
   * Buscar todas as escolas
   */
  static async findAll() {
    return await prisma.school.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        axiom: true,
        healthBonus: true,
        startingGold: true,
        _count: {
          select: {
            characters: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  /**
   * Buscar escola por ID
   */
  static async findById(id: number) {
    return await prisma.school.findUnique({
      where: { id },
      include: {
        characters: {
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
          orderBy: {
            level: 'desc',
          },
        },
        npcs: {
          select: {
            id: true,
            name: true,
            isMerchant: true,
          },
        },
      },
    });
  }

  /**
   * Buscar escola por nome
   */
  static async findByName(name: string) {
    return await prisma.school.findUnique({
      where: { name },
      select: {
        id: true,
        name: true,
        description: true,
        axiom: true,
        healthBonus: true,
        startingGold: true,
      },
    });
  }

  /**
   * Criar nova escola
   */
  static async createSchool(data: CreateSchoolRequest) {
    return await prisma.school.create({
      data: {
        name: data.name,
        description: data.description,
        axiom: data.axiom,
        healthBonus: data.healthBonus || 0,
        startingGold: data.startingGold || 100,
      },
      select: {
        id: true,
        name: true,
        description: true,
        axiom: true,
        healthBonus: true,
        startingGold: true,
      },
    });
  }

  /**
   * Atualizar escola
   */
  static async updateSchool(id: number, data: UpdateSchoolRequest) {
    const updateData: any = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.axiom !== undefined) updateData.axiom = data.axiom;
    if (data.healthBonus !== undefined) updateData.healthBonus = data.healthBonus;
    if (data.startingGold !== undefined) updateData.startingGold = data.startingGold;

    return await prisma.school.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        description: true,
        axiom: true,
        healthBonus: true,
        startingGold: true,
      },
    });
  }

  /**
   * Deletar escola
   */
  static async deleteSchool(id: number) {
    return await prisma.school.delete({
      where: { id },
    });
  }

  /**
   * Verificar se nome da escola já existe
   */
  static async nameExists(name: string, excludeId?: number) {
    const where: any = { name };
    
    if (excludeId) {
      where.id = { not: excludeId };
    }

    const school = await prisma.school.findUnique({
      where,
      select: { id: true },
    });

    return !!school;
  }

  /**
   * Buscar escolas com estatísticas de personagens
   */
  static async findSchoolsWithStats() {
    return await prisma.school.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        axiom: true,
        healthBonus: true,
        startingGold: true,
        _count: {
          select: {
            characters: true,
          },
        },
        characters: {
          select: {
            level: true,
            experiencePoints: true,
          },
        },
      },
    });
  }

  /**
   * Buscar escola mais popular (com mais personagens)
   */
  static async findMostPopularSchool() {
    return await prisma.school.findFirst({
      select: {
        id: true,
        name: true,
        description: true,
        _count: {
          select: {
            characters: true,
          },
        },
      },
      orderBy: {
        characters: {
          _count: 'desc',
        },
      },
    });
  }

  /**
   * Contar total de escolas
   */
  static async countSchools() {
    return await prisma.school.count();
  }
}