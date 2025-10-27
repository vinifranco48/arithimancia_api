/**
 * Auth Schema
 * Schemas de validação para autenticação de jogadores
 */

import { z } from "zod";

/**
 * Schema para login de jogador
 * Pode usar email ou username para fazer login
 */
export const loginSchema = z.object({
  login: z.string()
    .min(1, "Login é obrigatório")
    .max(255, "Login deve ter no máximo 255 caracteres"),
  password: z.string()
    .min(1, "Senha é obrigatória")
    .max(255, "Senha deve ter no máximo 255 caracteres"),
});

/**
 * Schema para registro de novo jogador
 * Baseado no modelo Player do schema Prisma
 */
export const registerSchema = z.object({
  username: z.string()
    .min(3, "Username deve ter no mínimo 3 caracteres")
    .max(255, "Username deve ter no máximo 255 caracteres")
    .regex(/^[a-zA-Z0-9_-]+$/, "Username deve conter apenas letras, números, _ e -"),
  email: z.string()
    .email("Digite um email válido")
    .min(1, "Email é obrigatório")
    .max(255, "Email deve ter no máximo 255 caracteres"),
  password: z.string()
    .min(8, "Senha deve ter no mínimo 8 caracteres")
    .max(50, "Senha deve ter no máximo 50 caracteres")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Senha deve conter ao menos uma letra minúscula, uma maiúscula e um número"),
  passwordConfirmation: z.string()
    .min(8, "Confirmação de senha deve ter no mínimo 8 caracteres")
    .max(50, "Confirmação de senha deve ter no máximo 50 caracteres"),
}).refine((data) => data.password === data.passwordConfirmation, {
  message: "As senhas devem ser iguais",
  path: ["passwordConfirmation"],
});

/**
 * Schema para atualização de perfil do jogador
 */
export const updateProfileSchema = z.object({
  username: z.string()
    .min(3, "Username deve ter no mínimo 3 caracteres")
    .max(255, "Username deve ter no máximo 255 caracteres")
    .regex(/^[a-zA-Z0-9_-]+$/, "Username deve conter apenas letras, números, _ e -")
    .optional(),
  email: z.string()
    .email("Digite um email válido")
    .max(255, "Email deve ter no máximo 255 caracteres")
    .optional(),
  oldPassword: z.string()
    .min(8, "Senha antiga deve ter no mínimo 8 caracteres")
    .max(50, "Senha antiga deve ter no máximo 50 caracteres")
    .optional(),
  password: z.string()
    .min(8, "Nova senha deve ter no mínimo 8 caracteres")
    .max(50, "Nova senha deve ter no máximo 50 caracteres")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Nova senha deve conter ao menos uma letra minúscula, uma maiúscula e um número")
    .optional(),
  passwordConfirmation: z.string()
    .min(8, "Confirmação de senha deve ter no mínimo 8 caracteres")
    .max(50, "Confirmação de senha deve ter no máximo 50 caracteres")
    .optional(),
}).refine((data) => {
  // Se está tentando alterar senha, deve fornecer senha antiga
  if (data.password && !data.oldPassword) {
    return false;
  }
  return true;
}, {
  message: "Senha antiga é obrigatória para alterar a senha",
  path: ["oldPassword"],
}).refine((data) => {
  // Se forneceu nova senha ou confirmação, ambas devem ser iguais
  if (data.password || data.passwordConfirmation) {
    return data.password === data.passwordConfirmation;
  }
  return true;
}, {
  message: "As senhas devem ser iguais",
  path: ["passwordConfirmation"],
});

/**
 * Schema para recuperação de senha
 */
export const forgotPasswordSchema = z.object({
  email: z.string()
    .email("Digite um email válido")
    .min(1, "Email é obrigatório")
    .max(255, "Email deve ter no máximo 255 caracteres"),
});

/**
 * Schema para redefinir senha
 */
export const resetPasswordSchema = z.object({
  token: z.string()
    .min(1, "Token é obrigatório"),
  password: z.string()
    .min(8, "Nova senha deve ter no mínimo 8 caracteres")
    .max(50, "Nova senha deve ter no máximo 50 caracteres")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Nova senha deve conter ao menos uma letra minúscula, uma maiúscula e um número"),
  passwordConfirmation: z.string()
    .min(8, "Confirmação de senha deve ter no mínimo 8 caracteres")
    .max(50, "Confirmação de senha deve ter no máximo 50 caracteres"),
}).refine((data) => data.password === data.passwordConfirmation, {
  message: "As senhas devem ser iguais",
  path: ["passwordConfirmation"],
});

/**
 * Schema para verificação de email
 */
export const verifyEmailSchema = z.object({
  token: z.string()
    .min(1, "Token é obrigatório"),
});

/**
 * Schema para refresh token
 */
export const refreshTokenSchema = z.object({
  refreshToken: z.string()
    .min(1, "Refresh token é obrigatório"),
});

/**
 * Tipos TypeScript inferidos dos schemas
 */
export type LoginRequest = z.infer<typeof loginSchema>;
export type RegisterRequest = z.infer<typeof registerSchema>;
export type UpdateProfileRequest = z.infer<typeof updateProfileSchema>;
export type ForgotPasswordRequest = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordRequest = z.infer<typeof resetPasswordSchema>;
export type VerifyEmailRequest = z.infer<typeof verifyEmailSchema>;
export type RefreshTokenRequest = z.infer<typeof refreshTokenSchema>;

/**
 * Schema para validação de username disponível
 */
export const checkUsernameSchema = z.object({
  username: z.string()
    .min(3, "Username deve ter no mínimo 3 caracteres")
    .max(255, "Username deve ter no máximo 255 caracteres")
    .regex(/^[a-zA-Z0-9_-]+$/, "Username deve conter apenas letras, números, _ e -"),
});

/**
 * Schema para validação de email disponível
 */
export const checkEmailSchema = z.object({
  email: z.string()
    .email("Digite um email válido")
    .max(255, "Email deve ter no máximo 255 caracteres"),
});

export type CheckUsernameRequest = z.infer<typeof checkUsernameSchema>;
export type CheckEmailRequest = z.infer<typeof checkEmailSchema>;