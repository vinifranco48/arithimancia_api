/**
 * Character Schema
 * Schemas de validação para personagens
 */

import { z } from "zod";

/**
 * Schema para criação de personagem
 */
export const createCharacterSchema = z.object({
  name: z.string()
    .min(3, "Nome do personagem deve ter no mínimo 3 caracteres")
    .max(50, "Nome do personagem deve ter no máximo 50 caracteres")
    .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, "Nome deve conter apenas letras, espaços, apostrofes e hífens")
    .trim(),
  schoolId: z.number()
    .int("ID da escola deve ser um número inteiro")
    .positive("ID da escola deve ser positivo")
    .optional(),
});

/**
 * Schema para atualização de personagem
 */
export const updateCharacterSchema = z.object({
  name: z.string()
    .min(3, "Nome do personagem deve ter no mínimo 3 caracteres")
    .max(50, "Nome do personagem deve ter no máximo 50 caracteres")
    .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, "Nome deve conter apenas letras, espaços, apostrofes e hífens")
    .trim()
    .optional(),
  schoolId: z.number()
    .int("ID da escola deve ser um número inteiro")
    .positive("ID da escola deve ser positivo")
    .nullable()
    .optional(),
  currentLocationId: z.number()
    .int("ID da localização deve ser um número inteiro")
    .positive("ID da localização deve ser positivo")
    .optional(),
});

/**
 * Schema para parâmetros de ID do personagem
 */
export const characterIdSchema = z.object({
  id: z.string()
    .regex(/^\d+$/, "ID deve ser um número")
    .transform((val) => parseInt(val, 10))
    .refine((val) => val > 0, "ID deve ser positivo"),
});

/**
 * Schema para filtros de busca de personagens
 */
export const characterSearchSchema = z.object({
  playerId: z.string()
    .regex(/^\d+$/, "ID do jogador deve ser um número")
    .transform((val) => parseInt(val, 10))
    .refine((val) => val > 0, "ID do jogador deve ser positivo")
    .optional(),
  schoolId: z.string()
    .regex(/^\d+$/, "ID da escola deve ser um número")
    .transform((val) => parseInt(val, 10))
    .refine((val) => val > 0, "ID da escola deve ser positivo")
    .optional(),
  locationId: z.string()
    .regex(/^\d+$/, "ID da localização deve ser um número")
    .transform((val) => parseInt(val, 10))
    .refine((val) => val > 0, "ID da localização deve ser positivo")
    .optional(),
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
  name: z.string()
    .min(1, "Nome para busca deve ter pelo menos 1 caractere")
    .max(50, "Nome para busca deve ter no máximo 50 caracteres")
    .trim()
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

/**
 * Schema para validação de limite de personagens
 */
export const characterLimitSchema = z.object({
  playerId: z.number()
    .int("ID do jogador deve ser um número inteiro")
    .positive("ID do jogador deve ser positivo"),
  currentCount: z.number()
    .int("Contagem atual deve ser um número inteiro")
    .min(0, "Contagem atual deve ser não negativa"),
  maxLimit: z.number()
    .int("Limite máximo deve ser um número inteiro")
    .positive("Limite máximo deve ser positivo")
    .default(3),
}).refine((data) => data.currentCount < data.maxLimit, {
  message: "Limite máximo de personagens atingido (3 personagens por jogador)",
  path: ["currentCount"],
});

/**
 * Schema para validação de nome único por jogador
 */
export const characterNameUniqueSchema = z.object({
  name: z.string()
    .min(3, "Nome do personagem deve ter no mínimo 3 caracteres")
    .max(50, "Nome do personagem deve ter no máximo 50 caracteres")
    .trim(),
  playerId: z.number()
    .int("ID do jogador deve ser um número inteiro")
    .positive("ID do jogador deve ser positivo"),
  excludeId: z.number()
    .int("ID para exclusão deve ser um número inteiro")
    .positive("ID para exclusão deve ser positivo")
    .optional(),
});

/**
 * Schema para validação de escola
 */
export const schoolSelectionSchema = z.object({
  schoolId: z.number()
    .int("ID da escola deve ser um número inteiro")
    .positive("ID da escola deve ser positivo")
    .nullable(),
});

/**
 * Schema para atualização de stats do personagem (uso interno)
 */
export const updateCharacterStatsSchema = z.object({
  level: z.number()
    .int("Nível deve ser um número inteiro")
    .min(1, "Nível deve ser pelo menos 1")
    .max(100, "Nível máximo é 100")
    .optional(),
  experiencePoints: z.number()
    .int("Pontos de experiência devem ser um número inteiro")
    .min(0, "Pontos de experiência devem ser não negativos")
    .optional(),
  maxHealth: z.number()
    .int("Vida máxima deve ser um número inteiro")
    .min(1, "Vida máxima deve ser pelo menos 1")
    .optional(),
  currentHealth: z.number()
    .int("Vida atual deve ser um número inteiro")
    .min(0, "Vida atual deve ser não negativa")
    .optional(),
  gold: z.number()
    .int("Ouro deve ser um número inteiro")
    .min(0, "Ouro deve ser não negativo")
    .optional(),
}).refine((data) => {
  // Se ambos maxHealth e currentHealth são fornecidos, currentHealth deve ser <= maxHealth
  if (data.maxHealth && data.currentHealth) {
    return data.currentHealth <= data.maxHealth;
  }
  return true;
}, {
  message: "Vida atual não pode ser maior que a vida máxima",
  path: ["currentHealth"],
});

/**
 * Schema para paginação de personagens
 */
export const characterPaginationSchema = z.object({
  page: z.string()
    .optional()
    .default("1")
    .refine((val) => /^\d+$/.test(val), "Página deve ser um número")
    .transform((val) => parseInt(val, 10))
    .refine((val) => val >= 1, "Página deve ser pelo menos 1"),
  limit: z.string()
    .optional()
    .default("10")
    .refine((val) => /^\d+$/.test(val), "Limite deve ser um número")
    .transform((val) => parseInt(val, 10))
    .refine((val) => val >= 1 && val <= 100, "Limite deve ser entre 1 e 100"),
  sortBy: z.enum(["name", "level", "experiencePoints", "createdAt", "lastLogin"])
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"])
    .default("desc"),
});

/**
 * Tipos TypeScript inferidos dos schemas
 */
export type CreateCharacterRequest = z.infer<typeof createCharacterSchema>;
export type UpdateCharacterRequest = z.infer<typeof updateCharacterSchema>;
export type CharacterIdParams = z.infer<typeof characterIdSchema>;
export type CharacterSearchQuery = z.infer<typeof characterSearchSchema>;
export type CharacterLimitValidation = z.infer<typeof characterLimitSchema>;
export type CharacterNameUniqueValidation = z.infer<typeof characterNameUniqueSchema>;
export type SchoolSelectionRequest = z.infer<typeof schoolSelectionSchema>;
export type UpdateCharacterStatsRequest = z.infer<typeof updateCharacterStatsSchema>;
export type CharacterPaginationQuery = z.infer<typeof characterPaginationSchema>;

/**
 * Schema para validação de propriedade do personagem
 */
export const characterOwnershipSchema = z.object({
  characterId: z.number()
    .int("ID do personagem deve ser um número inteiro")
    .positive("ID do personagem deve ser positivo"),
  playerId: z.number()
    .int("ID do jogador deve ser um número inteiro")
    .positive("ID do jogador deve ser positivo"),
});

export type CharacterOwnershipValidation = z.infer<typeof characterOwnershipSchema>;

/**
 * Constantes para validação
 */
export const CHARACTER_CONSTANTS = {
  MAX_CHARACTERS_PER_PLAYER: 3,
  MIN_NAME_LENGTH: 3,
  MAX_NAME_LENGTH: 50,
  MIN_LEVEL: 1,
  MAX_LEVEL: 100,
  DEFAULT_HEALTH: 100,
  DEFAULT_GOLD: 100,
  DEFAULT_LOCATION_ID: 1, // Biblioteca de Alexandria Numérica
} as const;

/**
 * Mensagens de erro personalizadas
 */
export const CHARACTER_ERROR_MESSAGES = {
  NAME_REQUIRED: "Nome do personagem é obrigatório",
  NAME_TOO_SHORT: `Nome deve ter pelo menos ${CHARACTER_CONSTANTS.MIN_NAME_LENGTH} caracteres`,
  NAME_TOO_LONG: `Nome deve ter no máximo ${CHARACTER_CONSTANTS.MAX_NAME_LENGTH} caracteres`,
  NAME_INVALID_FORMAT: "Nome deve conter apenas letras, espaços, apostrofes e hífens",
  NAME_ALREADY_EXISTS: "Já existe um personagem com este nome para este jogador",
  CHARACTER_LIMIT_REACHED: `Limite máximo de ${CHARACTER_CONSTANTS.MAX_CHARACTERS_PER_PLAYER} personagens atingido`,
  CHARACTER_NOT_FOUND: "Personagem não encontrado",
  CHARACTER_NOT_OWNED: "Este personagem não pertence ao jogador atual",
  SCHOOL_INVALID: "Escola selecionada é inválida",
  LOCATION_INVALID: "Localização selecionada é inválida",
  LEVEL_INVALID: "Nível deve estar entre 1 e 100",
  HEALTH_INVALID: "Vida deve ser um valor positivo",
  GOLD_INVALID: "Ouro deve ser um valor não negativo",
} as const;