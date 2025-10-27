/**
 * Game Schema
 * Schemas de validação para mecânicas do jogo (combate, missões, itens)
 */

import { z } from "zod";

// ===== ENCOUNTER SCHEMAS =====

/**
 * Schema para iniciar encontro de combate
 */
export const startEncounterSchema = z.object({
  monsterId: z.number()
    .int("ID do monstro deve ser um número inteiro")
    .positive("ID do monstro deve ser positivo")
    .optional(),
});

/**
 * Schema para resolver problema em encontro
 */
export const solveProblemSchema = z.object({
  answer: z.string()
    .min(1, "Resposta é obrigatória")
    .max(255, "Resposta deve ter no máximo 255 caracteres")
    .trim(),
  timeTaken: z.number()
    .int("Tempo deve ser um número inteiro")
    .min(0, "Tempo deve ser não negativo")
    .max(3600, "Tempo máximo é 1 hora (3600 segundos)")
    .optional(),
});

/**
 * Schema para parâmetros de ID do encontro
 */
export const encounterIdSchema = z.object({
  id: z.string()
    .regex(/^\d+$/, "ID deve ser um número")
    .transform((val) => parseInt(val, 10))
    .refine((val) => val > 0, "ID deve ser positivo"),
});

// ===== QUEST SCHEMAS =====

/**
 * Schema para aceitar missão
 */
export const acceptQuestSchema = z.object({
  questId: z.number()
    .int("ID da missão deve ser um número inteiro")
    .positive("ID da missão deve ser positivo"),
});

/**
 * Schema para parâmetros de ID da missão
 */
export const questIdSchema = z.object({
  id: z.string()
    .regex(/^\d+$/, "ID deve ser um número")
    .transform((val) => parseInt(val, 10))
    .refine((val) => val > 0, "ID deve ser positivo"),
});

/**
 * Schema para completar objetivo de missão
 */
export const completeObjectiveSchema = z.object({
  objectiveId: z.number()
    .int("ID do objetivo deve ser um número inteiro")
    .positive("ID do objetivo deve ser positivo"),
});

/**
 * Schema para abandonar missão
 */
export const abandonQuestSchema = z.object({
  questId: z.number()
    .int("ID da missão deve ser um número inteiro")
    .positive("ID da missão deve ser positivo"),
});

/**
 * Schema para filtros de busca de missões
 */
export const questSearchSchema = z.object({
  minLevel: z.string()
    .regex(/^\d+$/, "Nível mínimo deve ser um número")
    .transform((val) => parseInt(val, 10))
    .refine((val) => val >= 1, "Nível mínimo deve ser pelo menos 1")
    .optional(),
  maxLevel: z.string()
    .regex(/^\d+$/, "Nível máximo deve ser um número")
    .transform((val) => parseInt(val, 10))
    .refine((val) => val >= 1, "Nível máximo deve ser pelo menos 1")
    .optional(),
  isRepeatable: z.string()
    .transform((val) => val === 'true')
    .optional(),
  status: z.enum(['ACTIVE', 'COMPLETED', 'FAILED', 'ABANDONED'])
    .optional(),
}).refine((data) => {
  // Se ambos minLevel e maxLevel são fornecidos, minLevel deve ser <= maxLevel
  if (data.minLevel && data.maxLevel) {
    return data.minLevel <= data.maxLevel;
  }
  return true;
}, {
  message: "Nível mínimo deve ser menor ou igual ao nível máximo",
  path: ["minLevel"],
});

// ===== INVENTORY SCHEMAS =====

/**
 * Schema para usar item do inventário
 */
export const useItemSchema = z.object({
  itemId: z.number()
    .int("ID do item deve ser um número inteiro")
    .positive("ID do item deve ser positivo"),
  quantity: z.number()
    .int("Quantidade deve ser um número inteiro")
    .min(1, "Quantidade deve ser pelo menos 1")
    .max(99, "Quantidade máxima é 99")
    .default(1)
    .optional(),
});

/**
 * Schema para equipar/desequipar item
 */
export const equipItemSchema = z.object({
  itemId: z.number()
    .int("ID do item deve ser um número inteiro")
    .positive("ID do item deve ser positivo"),
});

/**
 * Schema para parâmetros de ID do item
 */
export const itemIdSchema = z.object({
  id: z.string()
    .regex(/^\d+$/, "ID deve ser um número")
    .transform((val) => parseInt(val, 10))
    .refine((val) => val > 0, "ID deve ser positivo"),
});

/**
 * Schema para adicionar item ao inventário (uso interno)
 */
export const addToInventorySchema = z.object({
  itemId: z.number()
    .int("ID do item deve ser um número inteiro")
    .positive("ID do item deve ser positivo"),
  quantity: z.number()
    .int("Quantidade deve ser um número inteiro")
    .min(1, "Quantidade deve ser pelo menos 1")
    .max(999, "Quantidade máxima é 999")
    .default(1),
});

// ===== PROBLEM SCHEMAS =====

/**
 * Schema para resposta de problema
 */
export const problemAnswerSchema = z.object({
  answer: z.string()
    .min(1, "Resposta é obrigatória")
    .max(255, "Resposta deve ter no máximo 255 caracteres")
    .trim(),
});

/**
 * Schema para parâmetros de ID do problema
 */
export const problemIdSchema = z.object({
  id: z.string()
    .regex(/^\d+$/, "ID deve ser um número")
    .transform((val) => parseInt(val, 10))
    .refine((val) => val > 0, "ID deve ser positivo"),
});

/**
 * Schema para filtros de busca de problemas
 */
export const problemSearchSchema = z.object({
  problemType: z.string()
    .min(1, "Tipo do problema deve ter pelo menos 1 caractere")
    .max(100, "Tipo do problema deve ter no máximo 100 caracteres")
    .optional(),
  difficultyLevel: z.string()
    .regex(/^\d+$/, "Nível de dificuldade deve ser um número")
    .transform((val) => parseInt(val, 10))
    .refine((val) => val >= 1, "Nível de dificuldade deve ser pelo menos 1")
    .optional(),
  minDifficulty: z.string()
    .regex(/^\d+$/, "Dificuldade mínima deve ser um número")
    .transform((val) => parseInt(val, 10))
    .refine((val) => val >= 1, "Dificuldade mínima deve ser pelo menos 1")
    .optional(),
  maxDifficulty: z.string()
    .regex(/^\d+$/, "Dificuldade máxima deve ser um número")
    .transform((val) => parseInt(val, 10))
    .refine((val) => val >= 1, "Dificuldade máxima deve ser pelo menos 1")
    .optional(),
}).refine((data) => {
  // Se ambos minDifficulty e maxDifficulty são fornecidos, min deve ser <= max
  if (data.minDifficulty && data.maxDifficulty) {
    return data.minDifficulty <= data.maxDifficulty;
  }
  return true;
}, {
  message: "Dificuldade mínima deve ser menor ou igual à dificuldade máxima",
  path: ["minDifficulty"],
});

// ===== MONSTER SCHEMAS =====

/**
 * Schema para parâmetros de ID do monstro
 */
export const monsterIdSchema = z.object({
  id: z.string()
    .regex(/^\d+$/, "ID deve ser um número")
    .transform((val) => parseInt(val, 10))
    .refine((val) => val > 0, "ID deve ser positivo"),
});

/**
 * Schema para filtros de busca de monstros
 */
export const monsterSearchSchema = z.object({
  difficultyLevel: z.string()
    .regex(/^\d+$/, "Nível de dificuldade deve ser um número")
    .transform((val) => parseInt(val, 10))
    .refine((val) => val >= 1, "Nível de dificuldade deve ser pelo menos 1")
    .optional(),
  minDifficulty: z.string()
    .regex(/^\d+$/, "Dificuldade mínima deve ser um número")
    .transform((val) => parseInt(val, 10))
    .refine((val) => val >= 1, "Dificuldade mínima deve ser pelo menos 1")
    .optional(),
  maxDifficulty: z.string()
    .regex(/^\d+$/, "Dificuldade máxima deve ser um número")
    .transform((val) => parseInt(val, 10))
    .refine((val) => val >= 1, "Dificuldade máxima deve ser pelo menos 1")
    .optional(),
  mathematicalConcept: z.string()
    .min(1, "Conceito matemático deve ter pelo menos 1 caractere")
    .max(255, "Conceito matemático deve ter no máximo 255 caracteres")
    .optional(),
}).refine((data) => {
  // Se ambos minDifficulty e maxDifficulty são fornecidos, min deve ser <= max
  if (data.minDifficulty && data.maxDifficulty) {
    return data.minDifficulty <= data.maxDifficulty;
  }
  return true;
}, {
  message: "Dificuldade mínima deve ser menor ou igual à dificuldade máxima",
  path: ["minDifficulty"],
});

// ===== EXPERIENCE SCHEMAS =====

/**
 * Schema para ganho de experiência (uso interno)
 */
export const gainExperienceSchema = z.object({
  characterId: z.number()
    .int("ID do personagem deve ser um número inteiro")
    .positive("ID do personagem deve ser positivo"),
  amount: z.number()
    .int("Quantidade de experiência deve ser um número inteiro")
    .min(1, "Quantidade de experiência deve ser pelo menos 1")
    .max(10000, "Quantidade máxima de experiência é 10000"),
});

// ===== PAGINATION SCHEMAS =====

/**
 * Schema para paginação geral
 */
export const paginationSchema = z.object({
  page: z.string()
    .regex(/^\d+$/, "Página deve ser um número")
    .default("1")
    .transform((val) => parseInt(val, 10))
    .refine((val) => val >= 1, "Página deve ser pelo menos 1"),
  limit: z.string()
    .regex(/^\d+$/, "Limite deve ser um número")
    .default("10")
    .transform((val) => parseInt(val, 10))
    .refine((val) => val >= 1 && val <= 100, "Limite deve ser entre 1 e 100"),
});

// ===== GAME STATS SCHEMAS =====

/**
 * Schema para filtros de estatísticas
 */
export const gameStatsSchema = z.object({
  period: z.enum(['day', 'week', 'month', 'year', 'all'])
    .default('week'),
  characterId: z.string()
    .regex(/^\d+$/, "ID do personagem deve ser um número")
    .transform((val) => parseInt(val, 10))
    .refine((val) => val > 0, "ID do personagem deve ser positivo")
    .optional(),
});

// ===== VALIDATION HELPERS =====

/**
 * Schema para validação de propriedade de personagem
 */
export const characterOwnershipGameSchema = z.object({
  characterId: z.number()
    .int("ID do personagem deve ser um número inteiro")
    .positive("ID do personagem deve ser positivo"),
  playerId: z.number()
    .int("ID do jogador deve ser um número inteiro")
    .positive("ID do jogador deve ser positivo"),
});

/**
 * Schema para validação de status de encontro
 */
export const encounterStatusSchema = z.enum(['IN_PROGRESS', 'WON', 'LOST', 'FLED']);

/**
 * Schema para validação de status de missão
 */
export const questStatusSchema = z.enum(['ACTIVE', 'COMPLETED', 'FAILED', 'ABANDONED']);

/**
 * Schema para validação de tipo de objetivo de missão
 */
export const questObjectiveTypeSchema = z.enum(['SOLVE', 'DEFEAT', 'FETCH', 'TALK']);

/**
 * Tipos TypeScript inferidos dos schemas
 */
export type StartEncounterRequest = z.infer<typeof startEncounterSchema>;
export type SolveProblemRequest = z.infer<typeof solveProblemSchema>;
export type EncounterIdParams = z.infer<typeof encounterIdSchema>;
export type AcceptQuestRequest = z.infer<typeof acceptQuestSchema>;
export type QuestIdParams = z.infer<typeof questIdSchema>;
export type CompleteObjectiveRequest = z.infer<typeof completeObjectiveSchema>;
export type AbandonQuestRequest = z.infer<typeof abandonQuestSchema>;
export type QuestSearchQuery = z.infer<typeof questSearchSchema>;
export type UseItemRequest = z.infer<typeof useItemSchema>;
export type EquipItemRequest = z.infer<typeof equipItemSchema>;
export type ItemIdParams = z.infer<typeof itemIdSchema>;
export type AddToInventoryRequest = z.infer<typeof addToInventorySchema>;
export type ProblemAnswerRequest = z.infer<typeof problemAnswerSchema>;
export type ProblemIdParams = z.infer<typeof problemIdSchema>;
export type ProblemSearchQuery = z.infer<typeof problemSearchSchema>;
export type MonsterIdParams = z.infer<typeof monsterIdSchema>;
export type MonsterSearchQuery = z.infer<typeof monsterSearchSchema>;
export type GainExperienceRequest = z.infer<typeof gainExperienceSchema>;
export type PaginationQuery = z.infer<typeof paginationSchema>;
export type GameStatsQuery = z.infer<typeof gameStatsSchema>;
export type CharacterOwnershipGameValidation = z.infer<typeof characterOwnershipGameSchema>;
export type EncounterStatus = z.infer<typeof encounterStatusSchema>;
export type QuestStatus = z.infer<typeof questStatusSchema>;
export type QuestObjectiveType = z.infer<typeof questObjectiveTypeSchema>;

/**
 * Constantes para validação do jogo
 */
export const GAME_CONSTANTS = {
  MAX_ANSWER_LENGTH: 255,
  MAX_TIME_LIMIT: 3600, // 1 hora em segundos
  MAX_INVENTORY_QUANTITY: 999,
  MAX_USE_QUANTITY: 99,
  MAX_EXPERIENCE_GAIN: 10000,
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
} as const;

/**
 * Mensagens de erro personalizadas para o jogo
 */
export const GAME_ERROR_MESSAGES = {
  // Encounter errors
  ENCOUNTER_NOT_FOUND: "Encontro não encontrado",
  ENCOUNTER_ALREADY_FINISHED: "Este encontro já foi finalizado",
  MONSTER_NOT_FOUND: "Monstro não encontrado",
  NO_SUITABLE_MONSTER: "Nenhum monstro adequado encontrado para seu nível",
  NO_SUITABLE_PROBLEM: "Nenhum problema adequado encontrado para seu nível",
  
  // Quest errors
  QUEST_NOT_FOUND: "Missão não encontrada",
  QUEST_ALREADY_ACCEPTED: "Você já aceitou esta missão",
  QUEST_NOT_REPEATABLE: "Esta missão não pode ser repetida",
  QUEST_LEVEL_TOO_LOW: "Nível insuficiente para esta missão",
  QUEST_NOT_ACTIVE: "Esta missão não está ativa",
  OBJECTIVE_NOT_CURRENT: "Este não é o próximo objetivo da missão",
  
  // Item errors
  ITEM_NOT_FOUND: "Item não encontrado",
  ITEM_NOT_IN_INVENTORY: "Item não encontrado no inventário",
  ITEM_NOT_CONSUMABLE: "Este item não pode ser consumido",
  ITEM_NOT_EQUIPABLE: "Este item não pode ser equipado",
  ITEM_INSUFFICIENT_QUANTITY: "Quantidade insuficiente do item",
  
  // Problem errors
  PROBLEM_NOT_FOUND: "Problema não encontrado",
  ANSWER_REQUIRED: "Resposta é obrigatória",
  ANSWER_TOO_LONG: "Resposta muito longa",
  
  // Character errors
  CHARACTER_NOT_FOUND: "Personagem não encontrado",
  CHARACTER_NOT_OWNED: "Este personagem não pertence ao jogador atual",
  CHARACTER_HEALTH_FULL: "Vida já está no máximo",
  
  // General errors
  INVALID_ID: "ID inválido",
  INVALID_PARAMETERS: "Parâmetros inválidos",
  INSUFFICIENT_LEVEL: "Nível insuficiente",
  INSUFFICIENT_GOLD: "Ouro insuficiente",
} as const;