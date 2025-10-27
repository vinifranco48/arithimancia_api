/**
 * Player Routes
 * Rotas para endpoints de gerenciamento de jogadores
 */

import { Router } from 'express';
import PlayerController from '../controllers/player.controller';
import authMiddleware from '../middlewares/auth.middleware';
import { validateBody } from '../middlewares/validation.middleware';
import {
  updateProfileSchema,
  checkUsernameSchema,
  checkEmailSchema
} from '../schemas/auth.schema';

const router = Router();

// Aplicar middleware de autenticação para todas as rotas de player
router.use(authMiddleware);

/**
 * GET /players/profile
 * Obter perfil completo do jogador autenticado
 */
router.get('/profile', PlayerController.getProfile);

/**
 * PUT /players/profile
 * Atualizar perfil do jogador autenticado
 */
router.put('/profile', validateBody(updateProfileSchema), PlayerController.updateProfile);

/**
 * PUT /players/password
 * Alterar senha do jogador autenticado
 */
router.put('/password', validateBody(updateProfileSchema), PlayerController.changePassword);

/**
 * GET /players/stats
 * Obter estatísticas do jogador autenticado
 */
router.get('/stats', PlayerController.getPlayerStats);

/**
 * DELETE /players/account
 * Deletar conta do jogador autenticado
 */
router.delete('/account', PlayerController.deleteAccount);

/**
 * GET /players/characters
 * Obter resumo dos personagens do jogador autenticado
 */
router.get('/characters', PlayerController.getCharacterSummaries);

/**
 * POST /players/check-username
 * Verificar disponibilidade de username (para atualização de perfil)
 */
router.post('/check-username', validateBody(checkUsernameSchema), PlayerController.checkUsernameAvailability);

/**
 * POST /players/check-email
 * Verificar disponibilidade de email (para atualização de perfil)
 */
router.post('/check-email', validateBody(checkEmailSchema), PlayerController.checkEmailAvailability);

export default router;