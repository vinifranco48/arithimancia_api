/**
 * Item Repository
 * Repository para operações de banco de dados relacionadas aos itens e inventário
 */

import { prisma } from "../config/database";

/**
 * Interfaces para requests
 */
export interface CreateItemRequest {
  name: string;
  description?: string;
  type?: string;
  healthBonus?: number;
  price?: number;
  isTradeable?: boolean;
  isConsumable?: boolean;
}

export interface UpdateItemRequest {
  name?: string;
  description?: string;
  type?: string;
  healthBonus?: number;
  price?: number;
  isTradeable?: boolean;
  isConsumable?: boolean;
}

export interface AddToInventoryRequest {
  characterId: number;
  itemId: number;
  quantity?: number;
}

export interface UpdateInventoryRequest {
  quantity?: number;
  isEquipped?: boolean;
}

export default class ItemRepository {
  /**
   * Buscar todos os itens
   */
  static async findAll() {
    return await prisma.item.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        type: true,
        healthBonus: true,
        price: true,
        isTradeable: true,
        isConsumable: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  /**
   * Buscar item por ID
   */
  static async findById(id: number) {
    return await prisma.item.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            inventory: true,
          },
        },
      },
    });
  }

  /**
   * Buscar item por nome
   */
  static async findByName(name: string) {
    return await prisma.item.findUnique({
      where: { name },
      select: {
        id: true,
        name: true,
        description: true,
        type: true,
        healthBonus: true,
        price: true,
        isTradeable: true,
        isConsumable: true,
      },
    });
  }

  /**
   * Buscar itens por tipo
   */
  static async findByType(type: string) {
    return await prisma.item.findMany({
      where: { type },
      select: {
        id: true,
        name: true,
        description: true,
        type: true,
        healthBonus: true,
        price: true,
        isTradeable: true,
        isConsumable: true,
      },
      orderBy: {
        price: 'asc',
      },
    });
  }

  /**
   * Buscar itens comercializáveis
   */
  static async findTradeable() {
    return await prisma.item.findMany({
      where: { isTradeable: true },
      select: {
        id: true,
        name: true,
        description: true,
        type: true,
        healthBonus: true,
        price: true,
        isConsumable: true,
      },
      orderBy: {
        price: 'asc',
      },
    });
  }

  /**
   * Criar novo item
   */
  static async createItem(data: CreateItemRequest) {
    return await prisma.item.create({
      data: {
        name: data.name,
        description: data.description,
        type: data.type,
        healthBonus: data.healthBonus || 0,
        price: data.price || 0,
        isTradeable: data.isTradeable ?? true,
        isConsumable: data.isConsumable ?? false,
      },
      select: {
        id: true,
        name: true,
        description: true,
        type: true,
        healthBonus: true,
        price: true,
        isTradeable: true,
        isConsumable: true,
      },
    });
  }

  /**
   * Atualizar item
   */
  static async updateItem(id: number, data: UpdateItemRequest) {
    const updateData: any = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.type !== undefined) updateData.type = data.type;
    if (data.healthBonus !== undefined) updateData.healthBonus = data.healthBonus;
    if (data.price !== undefined) updateData.price = data.price;
    if (data.isTradeable !== undefined) updateData.isTradeable = data.isTradeable;
    if (data.isConsumable !== undefined) updateData.isConsumable = data.isConsumable;

    return await prisma.item.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        description: true,
        type: true,
        healthBonus: true,
        price: true,
        isTradeable: true,
        isConsumable: true,
      },
    });
  }

  /**
   * Deletar item
   */
  static async deleteItem(id: number) {
    return await prisma.item.delete({
      where: { id },
    });
  }

  /**
   * Verificar se nome do item já existe
   */
  static async nameExists(name: string, excludeId?: number) {
    const where: any = { name };
    
    if (excludeId) {
      where.id = { not: excludeId };
    }

    const item = await prisma.item.findUnique({
      where,
      select: { id: true },
    });

    return !!item;
  }

  // ===== INVENTORY OPERATIONS =====

  /**
   * Buscar inventário de um personagem
   */
  static async findCharacterInventory(characterId: number) {
    return await prisma.inventory.findMany({
      where: { characterId },
      include: {
        item: {
          select: {
            id: true,
            name: true,
            description: true,
            type: true,
            healthBonus: true,
            price: true,
            isTradeable: true,
            isConsumable: true,
          },
        },
      },
      orderBy: {
        acquiredAt: 'desc',
      },
    });
  }

  /**
   * Buscar item específico no inventário
   */
  static async findInventoryItem(characterId: number, itemId: number) {
    return await prisma.inventory.findUnique({
      where: {
        characterId_itemId: {
          characterId,
          itemId,
        },
      },
      include: {
        item: {
          select: {
            id: true,
            name: true,
            description: true,
            type: true,
            healthBonus: true,
            price: true,
            isTradeable: true,
            isConsumable: true,
          },
        },
      },
    });
  }

  /**
   * Buscar itens equipados de um personagem
   */
  static async findEquippedItems(characterId: number) {
    return await prisma.inventory.findMany({
      where: {
        characterId,
        isEquipped: true,
      },
      include: {
        item: {
          select: {
            id: true,
            name: true,
            description: true,
            type: true,
            healthBonus: true,
            isConsumable: true,
          },
        },
      },
    });
  }

  /**
   * Adicionar item ao inventário
   */
  static async addToInventory(data: AddToInventoryRequest) {
    const existingItem = await this.findInventoryItem(data.characterId, data.itemId);

    if (existingItem) {
      // Se o item já existe, aumenta a quantidade
      return await prisma.inventory.update({
        where: {
          characterId_itemId: {
            characterId: data.characterId,
            itemId: data.itemId,
          },
        },
        data: {
          quantity: existingItem.quantity + (data.quantity || 1),
        },
        include: {
          item: true,
        },
      });
    } else {
      // Se não existe, cria novo registro
      return await prisma.inventory.create({
        data: {
          characterId: data.characterId,
          itemId: data.itemId,
          quantity: data.quantity || 1,
        },
        include: {
          item: true,
        },
      });
    }
  }

  /**
   * Atualizar item no inventário
   */
  static async updateInventoryItem(
    characterId: number,
    itemId: number,
    data: UpdateInventoryRequest
  ) {
    const updateData: any = {};

    if (data.quantity !== undefined) updateData.quantity = data.quantity;
    if (data.isEquipped !== undefined) updateData.isEquipped = data.isEquipped;

    return await prisma.inventory.update({
      where: {
        characterId_itemId: {
          characterId,
          itemId,
        },
      },
      data: updateData,
      include: {
        item: true,
      },
    });
  }

  /**
   * Remover item do inventário
   */
  static async removeFromInventory(characterId: number, itemId: number, quantity?: number) {
    const existingItem = await this.findInventoryItem(characterId, itemId);

    if (!existingItem) {
      return null;
    }

    if (quantity && quantity < existingItem.quantity) {
      // Reduz a quantidade
      return await prisma.inventory.update({
        where: {
          characterId_itemId: {
            characterId,
            itemId,
          },
        },
        data: {
          quantity: existingItem.quantity - quantity,
        },
        include: {
          item: true,
        },
      });
    } else {
      // Remove completamente
      return await prisma.inventory.delete({
        where: {
          characterId_itemId: {
            characterId,
            itemId,
          },
        },
        include: {
          item: true,
        },
      });
    }
  }

  /**
   * Equipar/desequipar item
   */
  static async toggleEquipItem(characterId: number, itemId: number) {
    const inventoryItem = await this.findInventoryItem(characterId, itemId);

    if (!inventoryItem) {
      return null;
    }

    return await prisma.inventory.update({
      where: {
        characterId_itemId: {
          characterId,
          itemId,
        },
      },
      data: {
        isEquipped: !inventoryItem.isEquipped,
      },
      include: {
        item: true,
      },
    });
  }

  /**
   * Contar total de itens
   */
  static async countItems() {
    return await prisma.item.count();
  }

  /**
   * Buscar itens mais populares (mais presentes em inventários)
   */
  static async findMostPopularItems(limit: number = 10) {
    return await prisma.item.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        type: true,
        price: true,
        _count: {
          select: {
            inventory: true,
          },
        },
      },
      orderBy: {
        inventory: {
          _count: 'desc',
        },
      },
      take: limit,
    });
  }
}