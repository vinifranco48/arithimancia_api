/**
 * Game Controller
 * Controlador para endpoints de mecânicas do jogo
 */

import { Request, Response } from 'express';
import GameService from '../services/game.service';
import { success } from '../utils/response';
import type {
  StartEncounterRequest,
  SolveProblemRequest,
  AcceptQuestRequest,
  CompleteObjectiveRequest,
  UseItemRequest,
  EquipItemRequest,
  QuestSearchQuery,
  PaginationQuery
} from '../schemas/game.schema';

export default class GameController {
  // ===== ENCOUNTER ENDPOINTS =====

  /**
   * POST /game/encounters
   * Iniciar encontro de combate
   */
  static async startEncounter(req: Request, res: Response): Promise<void> {
    const playerId = req.user?.id;
    const characterId = parseInt(req.params.characterId);
    const data: StartEncounterRequest = req.body;

    if (!playerId) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
          timestamp: new Date().toISOString()
        }
      });
      return;
    }

    const encounter = await GameService.startEncounter(characterId, data.monsterId);

    res.status(201).json(success('Encounter started successfully', encounter));
  }

  /**
   * POST /game/encounters/:id/solve
   * Resolver problema em encontro
   */
  static async solveProblem(req: Request, res: Response): Promise<void> {
    const playerId = req.user?.id;
    const encounterId = parseInt(req.params.id);
    const data: SolveProblemRequest = req.body;

    if (!playerId) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
          timestamp: new Date().toISOString()
        }
      });
      return;
    }

    const result = await GameService.solveProblem(encounterId, data.answer, data.timeTaken);

    res.status(200).json(success('Problem solved', result));
  }

  /**
   * POST /game/encounters/:id/flee
   * Fugir de um encontro
   */
  static async fleeEncounter(req: Request, res: Response): Promise<void> {
    const playerId = req.user?.id;
    const encounterId = parseInt(req.params.id);

    if (!playerId) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
          timestamp: new Date().toISOString()
        }
      });
      return;
    }

    const encounter = await GameService.fleeEncounter(encounterId);

    res.status(200).json(success('Fled from encounter', encounter));
  }

  /**
   * GET /game/encounters/active
   * Buscar encontros ativos do personagem
   */
  static async getActiveEncounters(req: Request, res: Response): Promise<void> {
    const playerId = req.user?.id;
    const characterId = parseInt(req.params.characterId);

    if (!playerId) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
          timestamp: new Date().toISOString()
        }
      });
      return;
    }

    const encounters = await GameService.getActiveEncounters(characterId);

    res.status(200).json(success('Active encounters retrieved', encounters));
  }

  // ===== QUEST ENDPOINTS =====

  /**
   * GET /game/quests
   * Buscar missões disponíveis para o personagem
   */
  static async getAvailableQuests(req: Request, res: Response): Promise<void> {
    const playerId = req.user?.id;
    const characterId = parseInt(req.params.characterId);
    const query: QuestSearchQuery = req.query as any;

    if (!playerId) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
          timestamp: new Date().toISOString()
        }
      });
      return;
    }

    const quests = await GameService.getAvailableQuests(characterId);

    res.status(200).json(success('Available quests retrieved', quests));
  }

  /**
   * POST /game/quests/:id/accept
   * Aceitar uma missão
   */
  static async acceptQuest(req: Request, res: Response): Promise<void> {
    const playerId = req.user?.id;
    const characterId = parseInt(req.params.characterId);
    const questId = parseInt(req.params.id);

    if (!playerId) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
          timestamp: new Date().toISOString()
        }
      });
      return;
    }

    const questProgress = await GameService.acceptQuest(characterId, questId);

    res.status(201).json(success('Quest accepted successfully', questProgress));
  }

  /**
   * POST /game/quests/:questId/objectives/:objectiveId/complete
   * Completar objetivo de missão
   */
  static async completeObjective(req: Request, res: Response): Promise<void> {
    const playerId = req.user?.id;
    const characterId = parseInt(req.params.characterId);
    const questId = parseInt(req.params.questId);
    const objectiveId = parseInt(req.params.objectiveId);

    if (!playerId) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
          timestamp: new Date().toISOString()
        }
      });
      return;
    }

    const result = await GameService.completeQuestObjective(characterId, questId, objectiveId);

    res.status(200).json(success('Quest objective completed', result));
  }

  /**
   * GET /game/quests/active
   * Buscar missões ativas do personagem
   */
  static async getActiveQuests(req: Request, res: Response): Promise<void> {
    const playerId = req.user?.id;
    const characterId = parseInt(req.params.characterId);

    if (!playerId) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
          timestamp: new Date().toISOString()
        }
      });
      return;
    }

    const quests = await GameService.getActiveQuests(characterId);

    res.status(200).json(success('Active quests retrieved', quests));
  }

  // ===== INVENTORY ENDPOINTS =====

  /**
   * POST /game/inventory/use
   * Usar item do inventário
   */
  static async useItem(req: Request, res: Response): Promise<void> {
    const playerId = req.user?.id;
    const characterId = parseInt(req.params.characterId);
    const data: UseItemRequest = req.body;

    if (!playerId) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
          timestamp: new Date().toISOString()
        }
      });
      return;
    }

    const result = await GameService.useItem(characterId, data.itemId);

    res.status(200).json(success('Item used successfully', result));
  }

  /**
   * POST /game/inventory/equip
   * Equipar/desequipar item
   */
  static async equipItem(req: Request, res: Response): Promise<void> {
    const playerId = req.user?.id;
    const characterId = parseInt(req.params.characterId);
    const data: EquipItemRequest = req.body;

    if (!playerId) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
          timestamp: new Date().toISOString()
        }
      });
      return;
    }

    const result = await GameService.toggleEquipItem(characterId, data.itemId);

    res.status(200).json(success('Item equipment toggled', result));
  }

  // ===== EXPERIENCE ENDPOINTS =====

  /**
   * GET /game/experience/calculate
   * Calcular experiência necessária para próximo nível
   */
  static async calculateExperience(req: Request, res: Response): Promise<void> {
    const level = parseInt(req.query.level as string) || 1;

    // Fórmula: 100 * level^1.5
    const experienceNeeded = Math.floor(100 * Math.pow(level, 1.5));
    const nextLevelExp = Math.floor(100 * Math.pow(level + 1, 1.5));

    res.status(200).json(success('Experience calculation', {
      currentLevel: level,
      experienceForCurrentLevel: experienceNeeded,
      experienceForNextLevel: nextLevelExp,
      experienceNeededToLevelUp: nextLevelExp - experienceNeeded
    }));
  }

  // ===== GAME DATA ENDPOINTS =====

  /**
   * GET /game/monsters
   * Buscar monstros disponíveis
   */
  static async getMonsters(req: Request, res: Response): Promise<void> {
    const playerId = req.user?.id;
    const characterId = parseInt(req.params.characterId);

    if (!playerId) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
          timestamp: new Date().toISOString()
        }
      });
      return;
    }

    // Para este endpoint, vamos retornar monstros adequados ao nível do personagem
    // Isso requer buscar o personagem primeiro para obter o nível
    const MonsterRepository = (await import('../repositories/monster.repository')).default;
    const CharacterRepository = (await import('../repositories/character.repository')).default;
    
    const character = await CharacterRepository.findById(characterId);
    
    if (!character) {
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Character not found',
          timestamp: new Date().toISOString()
        }
      });
      return;
    }

    const monsters = await MonsterRepository.findSuitableForCharacterLevel(character.level);

    res.status(200).json(success('Monsters retrieved', monsters));
  }

  /**
   * GET /game/problems
   * Buscar problemas disponíveis
   */
  static async getProblems(req: Request, res: Response): Promise<void> {
    const playerId = req.user?.id;
    const characterId = parseInt(req.params.characterId);

    if (!playerId) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
          timestamp: new Date().toISOString()
        }
      });
      return;
    }

    // Para este endpoint, vamos retornar problemas adequados ao nível do personagem
    const ProblemRepository = (await import('../repositories/problem.repository')).default;
    const CharacterRepository = (await import('../repositories/character.repository')).default;
    
    const character = await CharacterRepository.findById(characterId);
    
    if (!character) {
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Character not found',
          timestamp: new Date().toISOString()
        }
      });
      return;
    }

    const problems = await ProblemRepository.findSuitableForCharacterLevel(character.level);

    res.status(200).json(success('Problems retrieved', problems));
  }

  /**
   * GET /game/schools
   * Buscar escolas disponíveis
   */
  static async getSchools(req: Request, res: Response): Promise<void> {
    const SchoolRepository = (await import('../repositories/school.repository')).default;
    
    const schools = await SchoolRepository.findAll();

    res.status(200).json(success('Schools retrieved', schools));
  }

  /**
   * GET /game/items
   * Buscar itens disponíveis (comercializáveis)
   */
  static async getItems(req: Request, res: Response): Promise<void> {
    const ItemRepository = (await import('../repositories/item.repository')).default;
    
    const items = await ItemRepository.findTradeable();

    res.status(200).json(success('Items retrieved', items));
  }

  // ===== STATS ENDPOINTS =====

  /**
   * GET /game/stats/character
   * Buscar estatísticas do personagem
   */
  static async getCharacterStats(req: Request, res: Response): Promise<void> {
    const playerId = req.user?.id;
    const characterId = parseInt(req.params.characterId);

    if (!playerId) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
          timestamp: new Date().toISOString()
        }
      });
      return;
    }

    const CharacterRepository = (await import('../repositories/character.repository')).default;
    
    const stats = await CharacterRepository.getCharacterStats(characterId);

    if (!stats) {
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Character not found',
          timestamp: new Date().toISOString()
        }
      });
      return;
    }

    res.status(200).json(success('Character stats retrieved', stats));
  }

  /**
   * GET /game/leaderboard
   * Buscar ranking de personagens
   */
  static async getLeaderboard(req: Request, res: Response): Promise<void> {
    const limit = parseInt(req.query.limit as string) || 10;
    
    const CharacterRepository = (await import('../repositories/character.repository')).default;
    
    const leaderboard = await CharacterRepository.findTopByLevel(limit);

    res.status(200).json(success('Leaderboard retrieved', leaderboard));
  }
}