/**
 * Game Service
 * Serviço para lógica de negócio relacionada às mecânicas do jogo
 */

import CharacterRepository from "../repositories/character.repository";
import MonsterRepository from "../repositories/monster.repository";
import ProblemRepository from "../repositories/problem.repository";
import QuestRepository from "../repositories/quest.repository";
import ItemRepository from "../repositories/item.repository";
import { prisma } from "../config/database";
import { NotFoundException } from "../exceptions/not-found";
import { BadRequestException } from "../exceptions/bad-request";
import { ConflictException } from "../exceptions/conflict";

/**
 * Interfaces para responses
 */
export interface LevelUpResult {
  leveledUp: boolean;
  newLevel?: number;
  oldLevel: number;
  experienceGained: number;
  totalExperience: number;
  healthIncrease?: number;
}

export interface EncounterResult {
  success: boolean;
  experienceGained: number;
  goldGained: number;
  levelUpResult?: LevelUpResult;
  encounter: any;
}

export interface QuestProgress {
  questCompleted: boolean;
  objectiveCompleted: boolean;
  experienceGained: number;
  goldGained: number;
  itemReward?: any;
  levelUpResult?: LevelUpResult;
}

export interface ItemUseResult {
  success: boolean;
  healthRestored?: number;
  effectApplied?: string;
  itemConsumed: boolean;
  remainingQuantity: number;
}

export default class GameService {
  /**
   * Calcular experiência necessária para o próximo nível
   */
  private static calculateExperienceForLevel(level: number): number {
    // Fórmula: 100 * level^1.5
    return Math.floor(100 * Math.pow(level, 1.5));
  }

  /**
   * Verificar se personagem deve subir de nível
   */
  private static shouldLevelUp(currentExp: number, currentLevel: number): boolean {
    const expNeeded = this.calculateExperienceForLevel(currentLevel + 1);
    return currentExp >= expNeeded;
  }

  /**
   * Calcular aumento de vida por nível
   */
  private static calculateHealthIncrease(newLevel: number): number {
    // +20 HP por nível + bônus da escola se houver
    return 20;
  }

  /**
   * Ganhar experiência e processar level up automático
   */
  static async gainExperience(characterId: number, amount: number): Promise<LevelUpResult> {
    const character = await CharacterRepository.findById(characterId);
    
    if (!character) {
      throw new NotFoundException("Personagem não encontrado", "CHARACTER_NOT_FOUND");
    }

    const oldLevel = character.level;
    const oldExp = character.experiencePoints;
    const newExp = oldExp + amount;

    let newLevel = oldLevel;
    let totalHealthIncrease = 0;

    // Verifica se deve subir de nível (pode subir múltiplos níveis)
    while (this.shouldLevelUp(newExp, newLevel)) {
      newLevel++;
      totalHealthIncrease += this.calculateHealthIncrease(newLevel);
    }

    const leveledUp = newLevel > oldLevel;

    // Atualiza o personagem
    const updateData: any = {
      experiencePoints: newExp,
    };

    if (leveledUp) {
      updateData.level = newLevel;
      updateData.maxHealth = character.maxHealth + totalHealthIncrease;
      updateData.currentHealth = character.currentHealth + totalHealthIncrease; // Cura ao subir de nível
    }

    await CharacterRepository.update(characterId, updateData);

    return {
      leveledUp,
      newLevel: leveledUp ? newLevel : undefined,
      oldLevel,
      experienceGained: amount,
      totalExperience: newExp,
      healthIncrease: leveledUp ? totalHealthIncrease : undefined,
    };
  }

  /**
   * Iniciar encontro de combate
   */
  static async startEncounter(characterId: number, monsterId?: number) {
    const character = await CharacterRepository.findById(characterId);
    
    if (!character) {
      throw new NotFoundException("Personagem não encontrado", "CHARACTER_NOT_FOUND");
    }

    // Se não especificou monstro, escolhe um aleatório adequado ao nível
    let monster;
    if (monsterId) {
      monster = await MonsterRepository.findById(monsterId);
      if (!monster) {
        throw new NotFoundException("Monstro não encontrado", "MONSTER_NOT_FOUND");
      }
    } else {
      monster = await MonsterRepository.findRandomForCharacterLevel(character.level);
      if (!monster) {
        throw new BadRequestException("Nenhum monstro adequado encontrado para seu nível", "NO_SUITABLE_MONSTER");
      }
    }

    // Escolhe um problema adequado ao nível do personagem
    const problem = await ProblemRepository.findRandomForCharacterLevel(character.level);
    
    if (!problem) {
      throw new BadRequestException("Nenhum problema adequado encontrado para seu nível", "NO_SUITABLE_PROBLEM");
    }

    // Cria o encontro
    const encounter = await prisma.encounter.create({
      data: {
        characterId: character.id,
        monsterId: monster.id,
        problemId: problem.id,
        status: 'IN_PROGRESS',
        monsterCurrentHealth: monster.baseHealth,
        characterHealthAtStart: character.currentHealth,
      },
      include: {
        monster: {
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
        },
        problem: {
          select: {
            id: true,
            description: true,
            problemType: true,
            difficultyLevel: true,
            hintText: true,
            timeLimitSeconds: true,
            experienceReward: true,
          },
        },
        character: {
          select: {
            id: true,
            name: true,
            level: true,
            currentHealth: true,
            maxHealth: true,
          },
        },
      },
    });

    return encounter;
  }

  /**
   * Resolver problema em um encontro
   */
  static async solveProblem(encounterId: number, answer: string, timeTaken?: number): Promise<EncounterResult> {
    const encounter = await prisma.encounter.findUnique({
      where: { id: encounterId },
      include: {
        character: true,
        monster: true,
        problem: true,
      },
    });

    if (!encounter) {
      throw new NotFoundException("Encontro não encontrado", "ENCOUNTER_NOT_FOUND");
    }

    if (encounter.status !== 'IN_PROGRESS') {
      throw new BadRequestException("Este encontro já foi finalizado", "ENCOUNTER_ALREADY_FINISHED");
    }

    // Verifica a resposta
    const isCorrect = await ProblemRepository.checkAnswer(encounter.problemId!, answer);
    
    if (isCorrect === null) {
      throw new BadRequestException("Problema não encontrado", "PROBLEM_NOT_FOUND");
    }

    // Registra a tentativa
    await ProblemRepository.createAttempt({
      characterId: encounter.characterId,
      problemId: encounter.problemId!,
      userAnswer: answer,
      isCorrect,
      timeTakenSeconds: timeTaken,
    });

    let experienceGained = 0;
    let goldGained = 0;
    let encounterStatus = 'IN_PROGRESS';

    if (isCorrect) {
      // Resposta correta - personagem vence
      experienceGained = encounter.monster.experienceReward + (encounter.problem?.experienceReward || 0);
      goldGained = encounter.monster.goldReward;
      encounterStatus = 'WON';

      // Atualiza gold do personagem
      await CharacterRepository.update(encounter.characterId, {
        gold: encounter.character.gold + goldGained,
      });
    } else {
      // Resposta incorreta - personagem perde
      encounterStatus = 'LOST';
      
      // Personagem perde vida (25% da vida máxima)
      const healthLoss = Math.floor(encounter.character.maxHealth * 0.25);
      const newHealth = Math.max(1, encounter.character.currentHealth - healthLoss); // Mínimo 1 HP
      
      await CharacterRepository.update(encounter.characterId, {
        currentHealth: newHealth,
      });
    }

    // Atualiza o encontro
    const updatedEncounter = await prisma.encounter.update({
      where: { id: encounterId },
      data: {
        status: encounterStatus,
        completedAt: new Date(),
      },
      include: {
        character: true,
        monster: true,
        problem: true,
      },
    });

    // Processa ganho de experiência se houver
    let levelUpResult: LevelUpResult | undefined;
    if (experienceGained > 0) {
      levelUpResult = await this.gainExperience(encounter.characterId, experienceGained);
    }

    return {
      success: isCorrect,
      experienceGained,
      goldGained,
      levelUpResult,
      encounter: updatedEncounter,
    };
  }

  /**
   * Buscar missões disponíveis para um personagem
   */
  static async getAvailableQuests(characterId: number) {
    const character = await CharacterRepository.findById(characterId);
    
    if (!character) {
      throw new NotFoundException("Personagem não encontrado", "CHARACTER_NOT_FOUND");
    }

    return await QuestRepository.findAvailableForCharacter(characterId, character.level);
  }

  /**
   * Aceitar uma missão
   */
  static async acceptQuest(characterId: number, questId: number) {
    const character = await CharacterRepository.findById(characterId);
    
    if (!character) {
      throw new NotFoundException("Personagem não encontrado", "CHARACTER_NOT_FOUND");
    }

    const quest = await QuestRepository.findById(questId);
    
    if (!quest) {
      throw new NotFoundException("Missão não encontrada", "QUEST_NOT_FOUND");
    }

    // Verifica se o personagem tem nível suficiente
    if (character.level < quest.minLevel) {
      throw new BadRequestException(`Nível mínimo necessário: ${quest.minLevel}`, "INSUFFICIENT_LEVEL");
    }

    // Verifica se já não aceitou esta missão
    const existingProgress = await QuestRepository.findCharacterQuestProgress(characterId, questId);
    
    if (existingProgress && existingProgress.status === 'ACTIVE') {
      throw new ConflictException("Você já aceitou esta missão", "QUEST_ALREADY_ACCEPTED");
    }

    if (existingProgress && existingProgress.status === 'COMPLETED' && !quest.isRepeatable) {
      throw new ConflictException("Esta missão não pode ser repetida", "QUEST_NOT_REPEATABLE");
    }

    return await QuestRepository.acceptQuest({ characterId, questId });
  }

  /**
   * Completar objetivo de missão
   */
  static async completeQuestObjective(
    characterId: number, 
    questId: number, 
    objectiveId: number
  ): Promise<QuestProgress> {
    const questProgress = await QuestRepository.findCharacterQuestProgress(characterId, questId);
    
    if (!questProgress) {
      throw new NotFoundException("Progresso da missão não encontrado", "QUEST_PROGRESS_NOT_FOUND");
    }

    if (questProgress.status !== 'ACTIVE') {
      throw new BadRequestException("Esta missão não está ativa", "QUEST_NOT_ACTIVE");
    }

    const quest = questProgress.quest;
    const objectives = quest.objectives;
    const currentObjective = objectives[questProgress.currentObjectiveIndex];

    if (!currentObjective || currentObjective.id !== objectiveId) {
      throw new BadRequestException("Este não é o próximo objetivo da missão", "INVALID_OBJECTIVE");
    }

    let experienceGained = 0;
    let goldGained = 0;
    let itemReward = null;
    let questCompleted = false;

    // Avança para o próximo objetivo
    const nextObjectiveIndex = questProgress.currentObjectiveIndex + 1;
    const isLastObjective = nextObjectiveIndex >= objectives.length;

    if (isLastObjective) {
      // Missão completada
      questCompleted = true;
      experienceGained = quest.experienceReward;
      goldGained = quest.goldReward;

      // Atualiza gold do personagem
      const character = await CharacterRepository.findById(characterId);
      if (character) {
        await CharacterRepository.update(characterId, {
          gold: character.gold + goldGained,
        });
      }

      // Adiciona item de recompensa se houver
      if (quest.itemRewardId) {
        await ItemRepository.addToInventory({
          characterId,
          itemId: quest.itemRewardId,
          quantity: 1,
        });
        
        itemReward = await ItemRepository.findById(quest.itemRewardId);
      }

      // Marca missão como completada
      await QuestRepository.completeQuest(characterId, questId);
    } else {
      // Avança para próximo objetivo
      await QuestRepository.updateQuestProgress(characterId, questId, {
        currentObjectiveIndex: nextObjectiveIndex,
      });
    }

    // Processa ganho de experiência se houver
    let levelUpResult: LevelUpResult | undefined;
    if (experienceGained > 0) {
      levelUpResult = await this.gainExperience(characterId, experienceGained);
    }

    return {
      questCompleted,
      objectiveCompleted: true,
      experienceGained,
      goldGained,
      itemReward,
      levelUpResult,
    };
  }

  /**
   * Usar item do inventário
   */
  static async useItem(characterId: number, itemId: number): Promise<ItemUseResult> {
    const inventoryItem = await ItemRepository.findInventoryItem(characterId, itemId);
    
    if (!inventoryItem) {
      throw new NotFoundException("Item não encontrado no inventário", "ITEM_NOT_IN_INVENTORY");
    }

    const item = inventoryItem.item;
    
    if (!item.isConsumable) {
      throw new BadRequestException("Este item não pode ser consumido", "ITEM_NOT_CONSUMABLE");
    }

    const character = await CharacterRepository.findById(characterId);
    
    if (!character) {
      throw new NotFoundException("Personagem não encontrado", "CHARACTER_NOT_FOUND");
    }

    let healthRestored = 0;
    let effectApplied = "";

    // Aplica efeitos do item baseado no tipo
    if (item.type === "Consumível") {
      if (item.healthBonus > 0) {
        // Item de cura
        const maxHeal = character.maxHealth - character.currentHealth;
        healthRestored = Math.min(item.healthBonus, maxHeal);
        
        if (healthRestored > 0) {
          await CharacterRepository.update(characterId, {
            currentHealth: character.currentHealth + healthRestored,
          });
          effectApplied = `Restaurou ${healthRestored} pontos de vida`;
        } else {
          effectApplied = "Vida já está no máximo";
        }
      }
    }

    // Remove uma unidade do item
    const newQuantity = inventoryItem.quantity - 1;
    let itemConsumed = false;

    if (newQuantity <= 0) {
      // Remove completamente do inventário
      await ItemRepository.removeFromInventory(characterId, itemId);
      itemConsumed = true;
    } else {
      // Reduz a quantidade
      await ItemRepository.updateInventoryItem(characterId, itemId, {
        quantity: newQuantity,
      });
    }

    return {
      success: true,
      healthRestored: healthRestored > 0 ? healthRestored : undefined,
      effectApplied,
      itemConsumed,
      remainingQuantity: itemConsumed ? 0 : newQuantity,
    };
  }

  /**
   * Equipar/desequipar item
   */
  static async toggleEquipItem(characterId: number, itemId: number) {
    const inventoryItem = await ItemRepository.findInventoryItem(characterId, itemId);
    
    if (!inventoryItem) {
      throw new NotFoundException("Item não encontrado no inventário", "ITEM_NOT_IN_INVENTORY");
    }

    const item = inventoryItem.item;
    
    if (item.type !== "Equipamento") {
      throw new BadRequestException("Este item não pode ser equipado", "ITEM_NOT_EQUIPMENT");
    }

    return await ItemRepository.toggleEquipItem(characterId, itemId);
  }

  /**
   * Buscar missões ativas do personagem
   */
  static async getActiveQuests(characterId: number) {
    const character = await CharacterRepository.findById(characterId);
    
    if (!character) {
      throw new NotFoundException("Personagem não encontrado", "CHARACTER_NOT_FOUND");
    }

    return await QuestRepository.findCharacterActiveQuests(characterId);
  }

  /**
   * Buscar encontros ativos do personagem
   */
  static async getActiveEncounters(characterId: number) {
    const character = await CharacterRepository.findById(characterId);
    
    if (!character) {
      throw new NotFoundException("Personagem não encontrado", "CHARACTER_NOT_FOUND");
    }

    return await prisma.encounter.findMany({
      where: {
        characterId,
        status: 'IN_PROGRESS',
      },
      include: {
        monster: {
          select: {
            id: true,
            name: true,
            description: true,
            mathematicalConcept: true,
            difficultyLevel: true,
          },
        },
        problem: {
          select: {
            id: true,
            description: true,
            problemType: true,
            difficultyLevel: true,
            hintText: true,
            timeLimitSeconds: true,
          },
        },
      },
      orderBy: {
        startedAt: 'desc',
      },
    });
  }

  /**
   * Fugir de um encontro
   */
  static async fleeEncounter(encounterId: number) {
    const encounter = await prisma.encounter.findUnique({
      where: { id: encounterId },
      include: {
        character: true,
      },
    });

    if (!encounter) {
      throw new NotFoundException("Encontro não encontrado", "ENCOUNTER_NOT_FOUND");
    }

    if (encounter.status !== 'IN_PROGRESS') {
      throw new BadRequestException("Este encontro já foi finalizado", "ENCOUNTER_ALREADY_FINISHED");
    }

    // Personagem perde um pouco de vida ao fugir (10% da vida máxima)
    const healthLoss = Math.floor(encounter.character.maxHealth * 0.1);
    const newHealth = Math.max(1, encounter.character.currentHealth - healthLoss);
    
    await CharacterRepository.update(encounter.characterId, {
      currentHealth: newHealth,
    });

    // Atualiza o encontro
    return await prisma.encounter.update({
      where: { id: encounterId },
      data: {
        status: 'FLED',
        completedAt: new Date(),
      },
      include: {
        character: true,
        monster: true,
      },
    });
  }
}