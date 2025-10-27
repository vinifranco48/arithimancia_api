/**
 * Game Routes
 * Rotas para endpoints de mecânicas do jogo
 */

import { Router } from 'express';
import GameController from '../controllers/game.controller';
import authMiddleware from '../middlewares/auth.middleware';
import { validateBody, validateParams, validateQuery } from '../middlewares/validation.middleware';
import { verifyCharacterOwnershipById } from '../middlewares/character-ownership.middleware';
import {
  startEncounterSchema,
  solveProblemSchema,
  encounterIdSchema,
  questIdSchema,
  useItemSchema,
  equipItemSchema,
  paginationSchema
} from '../schemas/game.schema';
import { z } from 'zod';

const router = Router();

// Aplicar middleware de autenticação para todas as rotas de game
router.use(authMiddleware);

// Schema para validação de characterId nos params
const characterIdParamSchema = z.object({
  characterId: z.string()
    .regex(/^\d+$/, "Character ID deve ser um número")
    .transform((val) => parseInt(val, 10))
    .refine((val) => val > 0, "Character ID deve ser positivo")
});

// ===== ENCOUNTER ROUTES =====

/**
 * POST /game/characters/:characterId/encounters
 * Iniciar encontro de combate
 */
router.post('/characters/:characterId/encounters', 
  validateParams(characterIdParamSchema),
  verifyCharacterOwnershipById(),
  validateBody(startEncounterSchema),
  GameController.startEncounter
);

/**
 * POST /game/encounters/:id/solve
 * Resolver problema em encontro
 */
router.post('/encounters/:id/solve', 
  validateParams(encounterIdSchema),
  validateBody(solveProblemSchema),
  GameController.solveProblem
);

/**
 * POST /game/encounters/:id/flee
 * Fugir de um encontro
 */
router.post('/encounters/:id/flee', 
  validateParams(encounterIdSchema),
  GameController.fleeEncounter
);

/**
 * GET /game/characters/:characterId/encounters/active
 * Buscar encontros ativos do personagem
 */
router.get('/characters/:characterId/encounters/active', 
  validateParams(characterIdParamSchema),
  verifyCharacterOwnershipById(),
  GameController.getActiveEncounters
);

// ===== QUEST ROUTES =====

/**
 * GET /game/characters/:characterId/quests
 * Buscar missões disponíveis para o personagem
 */
router.get('/characters/:characterId/quests', 
  validateParams(characterIdParamSchema),
  verifyCharacterOwnershipById(),
  GameController.getAvailableQuests
);

/**
 * POST /game/characters/:characterId/quests/:id/accept
 * Aceitar uma missão
 */
router.post('/characters/:characterId/quests/:id/accept', 
  validateParams(z.object({
    characterId: z.string().regex(/^\d+$/).transform(val => parseInt(val, 10)),
    id: z.string().regex(/^\d+$/).transform(val => parseInt(val, 10))
  })),
  verifyCharacterOwnershipById(),
  GameController.acceptQuest
);

/**
 * POST /game/characters/:characterId/quests/:questId/objectives/:objectiveId/complete
 * Completar objetivo de missão
 */
router.post('/characters/:characterId/quests/:questId/objectives/:objectiveId/complete', 
  validateParams(z.object({
    characterId: z.string().regex(/^\d+$/).transform(val => parseInt(val, 10)),
    questId: z.string().regex(/^\d+$/).transform(val => parseInt(val, 10)),
    objectiveId: z.string().regex(/^\d+$/).transform(val => parseInt(val, 10))
  })),
  verifyCharacterOwnershipById(),
  GameController.completeObjective
);

/**
 * GET /game/characters/:characterId/quests/active
 * Buscar missões ativas do personagem
 */
router.get('/characters/:characterId/quests/active', 
  validateParams(characterIdParamSchema),
  verifyCharacterOwnershipById(),
  GameController.getActiveQuests
);

// ===== INVENTORY ROUTES =====

/**
 * POST /game/characters/:characterId/inventory/use
 * Usar item do inventário
 */
router.post('/characters/:characterId/inventory/use', 
  validateParams(characterIdParamSchema),
  verifyCharacterOwnershipById(),
  validateBody(useItemSchema),
  GameController.useItem
);

/**
 * POST /game/characters/:characterId/inventory/equip
 * Equipar/desequipar item
 */
router.post('/characters/:characterId/inventory/equip', 
  validateParams(characterIdParamSchema),
  verifyCharacterOwnershipById(),
  validateBody(equipItemSchema),
  GameController.equipItem
);

// ===== EXPERIENCE ROUTES =====

/**
 * GET /game/experience/calculate
 * Calcular experiência necessária para próximo nível
 */
router.get('/experience/calculate', GameController.calculateExperience);

// ===== GAME DATA ROUTES =====

/**
 * GET /game/characters/:characterId/monsters
 * Buscar monstros disponíveis
 */
router.get('/characters/:characterId/monsters', 
  validateParams(characterIdParamSchema),
  verifyCharacterOwnershipById(),
  GameController.getMonsters
);

/**
 * GET /game/characters/:characterId/problems
 * Buscar problemas disponíveis
 */
router.get('/characters/:characterId/problems', 
  validateParams(characterIdParamSchema),
  verifyCharacterOwnershipById(),
  GameController.getProblems
);

/**
 * GET /game/schools
 * Buscar escolas disponíveis
 */
router.get('/schools', GameController.getSchools);

/**
 * GET /game/items
 * Buscar itens disponíveis (comercializáveis)
 */
router.get('/items', GameController.getItems);

// ===== STATS ROUTES =====

/**
 * GET /game/characters/:characterId/stats
 * Buscar estatísticas do personagem
 */
router.get('/characters/:characterId/stats', 
  validateParams(characterIdParamSchema),
  verifyCharacterOwnershipById(),
  GameController.getCharacterStats
);

/**
 * GET /game/leaderboard
 * Buscar ranking de personagens
 */
router.get('/leaderboard', 
  validateQuery(paginationSchema),
  GameController.getLeaderboard
);

export default router;