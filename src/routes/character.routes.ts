/**
 * Character Routes
 * Rotas para endpoints de gerenciamento de personagens
 * 
 * @swagger
 * components:
 *   schemas:
 *     CreateCharacterRequest:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           minLength: 3
 *           maxLength: 50
 *           example: Hermione Granger
 *         schoolId:
 *           type: integer
 *           example: 1
 *           description: ID da escola (opcional)
 *     
 *     UpdateCharacterRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           minLength: 3
 *           maxLength: 50
 *           example: Hermione Jean Granger
 *         schoolId:
 *           type: integer
 *           example: 2
 */

import { Router } from 'express';
import CharacterController from '../controllers/character.controller';
import authMiddleware from '../middlewares/auth.middleware';
import { validateBody, validateParams } from '../middlewares/validation.middleware';
import {
  verifyCharacterOwnership,
  verifyCharacterCreationLimit,
  verifyCharacterNameUniqueness
} from '../middlewares/character-ownership.middleware';
import {
  createCharacterSchema,
  updateCharacterSchema,
  characterIdSchema
} from '../schemas/character.schema';

const router = Router();

// Aplicar middleware de autenticação para todas as rotas de character
router.use(authMiddleware);

/**
 * @swagger
 * /characters:
 *   post:
 *     summary: Criar novo personagem
 *     tags: [Characters]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCharacterRequest'
 *     responses:
 *       201:
 *         description: Personagem criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Character created successfully
 *                 data:
 *                   $ref: '#/components/schemas/Character'
 *       400:
 *         description: Limite de personagens excedido ou nome já existe
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Token inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/', 
  verifyCharacterCreationLimit(),
  verifyCharacterNameUniqueness(),
  validateBody(createCharacterSchema), 
  CharacterController.createCharacter
);

/**
 * @swagger
 * /characters:
 *   get:
 *     summary: Listar personagens do jogador autenticado
 *     tags: [Characters]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de personagens obtida com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Character'
 *       401:
 *         description: Token inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/', CharacterController.getPlayerCharacters);

/**
 * GET /characters/count
 * Obter contagem de personagens do jogador
 */
router.get('/count', CharacterController.getCharacterCount);

/**
 * GET /characters/limits
 * Obter informações sobre limites de personagens
 */
router.get('/limits', CharacterController.getCharacterLimits);

/**
 * POST /characters/check-name
 * Verificar disponibilidade de nome para personagem
 */
router.post('/check-name', CharacterController.checkNameAvailability);

/**
 * GET /characters/:id
 * Obter detalhes de um personagem específico
 */
router.get('/:id', 
  validateParams(characterIdSchema),
  verifyCharacterOwnership(),
  CharacterController.getCharacterDetails
);

/**
 * PUT /characters/:id
 * Atualizar personagem
 */
router.put('/:id', 
  validateParams(characterIdSchema),
  verifyCharacterOwnership(),
  verifyCharacterNameUniqueness('id'),
  validateBody(updateCharacterSchema),
  CharacterController.updateCharacter
);

/**
 * DELETE /characters/:id
 * Deletar personagem
 */
router.delete('/:id', 
  validateParams(characterIdSchema),
  verifyCharacterOwnership(),
  CharacterController.deleteCharacter
);

/**
 * GET /characters/:id/stats
 * Obter estatísticas detalhadas do personagem
 */
router.get('/:id/stats', 
  validateParams(characterIdSchema),
  verifyCharacterOwnership(),
  CharacterController.getCharacterStats
);

/**
 * POST /characters/:id/login
 * Atualizar último login do personagem
 */
router.post('/:id/login', 
  validateParams(characterIdSchema),
  verifyCharacterOwnership(),
  CharacterController.updateLastLogin
);

export default router;