/**
 * Auth Service
 * Serviço de autenticação com registro, login, refresh e logout
 */

import PlayerRepository from '../repositories/player.repository';
import { hashPassword, verifyPassword } from '../utils/password';
import { generateTokenPair, verifyRefreshToken, TokenResponse } from '../utils/jwt';
import { blacklistToken } from '../utils/token-blacklist';
import { ConflictException } from '../exceptions/conflict';
import { UnauthorizedException } from '../exceptions/unauthorized';
import { BadRequestException } from '../exceptions/bad-request';
import { NotFoundException } from '../exceptions/not-found';
import type { 
  LoginRequest, 
  RegisterRequest, 
  RefreshTokenRequest 
} from '../schemas/auth.schema';

// Interface para resposta de autenticação
export interface AuthResponse {
  player: {
    id: number;
    username: string;
    email: string;
    createdAt: Date;
  };
  tokens: TokenResponse;
}

// Interface para dados do player autenticado
export interface AuthenticatedPlayer {
  id: number;
  username: string;
  email: string;
}

export default class AuthService {
  /**
   * Registrar novo jogador
   */
  static async register(data: RegisterRequest): Promise<AuthResponse> {
    const { username, email, password } = data;

    // Verificar se email já existe
    const emailExists = await PlayerRepository.emailExists(email);
    if (emailExists) {
      throw new ConflictException('Email already registered', 'EMAIL_EXISTS');
    }

    // Verificar se username já existe
    const usernameExists = await PlayerRepository.usernameExists(username);
    if (usernameExists) {
      throw new ConflictException('Username already taken', 'USERNAME_EXISTS');
    }

    try {
      // Hash da senha
      const passwordHash = await hashPassword(password);

      // Criar jogador
      const player = await PlayerRepository.createPlayer({
        username,
        email,
        passwordHash
      });

      // Gerar tokens
      const tokens = generateTokenPair({
        playerId: player.id,
        username: player.username,
        email: player.email
      });

      // Atualizar último login
      await PlayerRepository.updateLastLogin(player.id);

      return {
        player: {
          id: player.id,
          username: player.username,
          email: player.email,
          createdAt: player.createdAt
        },
        tokens
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException('Failed to register player', 'REGISTRATION_FAILED');
    }
  }

  /**
   * Login do jogador
   */
  static async login(data: LoginRequest): Promise<AuthResponse> {
    const { login, password } = data;

    try {
      // Buscar jogador por email ou username
      let player = await PlayerRepository.findByEmailForAuth(login);
      
      if (!player) {
        player = await PlayerRepository.findByUsername(login);
        if (player) {
          // Se encontrou por username, buscar dados completos para auth
          const fullPlayer = await PlayerRepository.findByEmailForAuth(player.email);
          player = fullPlayer;
        }
      }

      if (!player) {
        throw new UnauthorizedException('Invalid credentials', 'INVALID_CREDENTIALS');
      }

      // Verificar senha
      const isPasswordValid = await verifyPassword(password, player.passwordHash);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials', 'INVALID_CREDENTIALS');
      }

      // Gerar tokens
      const tokens = generateTokenPair({
        playerId: player.id,
        username: player.username,
        email: player.email
      });

      // Atualizar último login
      await PlayerRepository.updateLastLogin(player.id);

      // Buscar dados completos do player para resposta
      const fullPlayer = await PlayerRepository.findById(player.id);
      if (!fullPlayer) {
        throw new NotFoundException('Player not found', 'PLAYER_NOT_FOUND');
      }

      return {
        player: {
          id: fullPlayer.id,
          username: fullPlayer.username,
          email: fullPlayer.email,
          createdAt: fullPlayer.createdAt
        },
        tokens
      };
    } catch (error) {
      if (error instanceof UnauthorizedException || error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Login failed', 'LOGIN_FAILED');
    }
  }

  /**
   * Refresh token
   */
  static async refreshToken(data: RefreshTokenRequest): Promise<TokenResponse> {
    const { refreshToken } = data;

    try {
      // Verificar refresh token
      const payload = verifyRefreshToken(refreshToken);

      // Verificar se jogador ainda existe
      const player = await PlayerRepository.findById(payload.playerId);
      if (!player) {
        throw new UnauthorizedException('Player not found', 'PLAYER_NOT_FOUND');
      }

      // Gerar novos tokens
      const tokens = generateTokenPair({
        playerId: player.id,
        username: player.username,
        email: player.email
      });

      // Invalidar refresh token antigo
      blacklistToken(refreshToken);

      return tokens;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new BadRequestException('Token refresh failed', 'REFRESH_FAILED');
    }
  }

  /**
   * Logout do jogador
   */
  static async logout(playerId: number, accessToken?: string, refreshToken?: string): Promise<void> {
    try {
      // Verificar se jogador existe
      const player = await PlayerRepository.findById(playerId);
      if (!player) {
        throw new NotFoundException('Player not found', 'PLAYER_NOT_FOUND');
      }

      // Adicionar tokens à blacklist se fornecidos
      if (accessToken) {
        blacklistToken(accessToken);
      }
      
      if (refreshToken) {
        blacklistToken(refreshToken);
      }

      // Aqui poderia invalidar todas as sessões do usuário se necessário
      // Por exemplo, incrementar um campo "tokenVersion" no banco de dados
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Logout failed', 'LOGOUT_FAILED');
    }
  }

  /**
   * Verificar se jogador existe e está ativo
   */
  static async verifyPlayer(playerId: number): Promise<AuthenticatedPlayer> {
    const player = await PlayerRepository.findById(playerId);
    
    if (!player) {
      throw new UnauthorizedException('Player not found', 'PLAYER_NOT_FOUND');
    }

    return {
      id: player.id,
      username: player.username,
      email: player.email
    };
  }

  /**
   * Validar credenciais sem fazer login
   */
  static async validateCredentials(login: string, password: string): Promise<boolean> {
    try {
      // Buscar jogador por email ou username
      let player = await PlayerRepository.findByEmailForAuth(login);
      
      if (!player) {
        player = await PlayerRepository.findByUsername(login);
        if (player) {
          const fullPlayer = await PlayerRepository.findByEmailForAuth(player.email);
          player = fullPlayer;
        }
      }

      if (!player) {
        return false;
      }

      // Verificar senha
      return await verifyPassword(password, player.passwordHash);
    } catch {
      return false;
    }
  }

  /**
   * Verificar disponibilidade de email
   */
  static async checkEmailAvailability(email: string): Promise<boolean> {
    return !(await PlayerRepository.emailExists(email));
  }

  /**
   * Verificar disponibilidade de username
   */
  static async checkUsernameAvailability(username: string): Promise<boolean> {
    return !(await PlayerRepository.usernameExists(username));
  }
}