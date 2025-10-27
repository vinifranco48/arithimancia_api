/**
 * Password Utilities
 * Utilitários para hash e verificação de senhas usando bcrypt
 */

import bcrypt from 'bcrypt';

// Número de salt rounds para bcrypt
const SALT_ROUNDS = 12;

/**
 * Gerar hash da senha
 */
export async function hashPassword(password: string): Promise<string> {
  try {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    const hash = await bcrypt.hash(password, salt);
    return hash;
  } catch (error) {
    throw new Error('Failed to hash password');
  }
}

/**
 * Verificar se senha corresponde ao hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  try {
    return await bcrypt.compare(password, hash);
  } catch (error) {
    throw new Error('Failed to verify password');
  }
}

/**
 * Validar força da senha
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Verificar comprimento mínimo
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  // Verificar comprimento máximo
  if (password.length > 50) {
    errors.push('Password must be no more than 50 characters long');
  }

  // Verificar se contém pelo menos uma letra minúscula
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  // Verificar se contém pelo menos uma letra maiúscula
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  // Verificar se contém pelo menos um número
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  // Verificar se não contém espaços
  if (/\s/.test(password)) {
    errors.push('Password must not contain spaces');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Gerar senha aleatória segura
 */
export function generateSecurePassword(length: number = 12): string {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  
  const allChars = lowercase + uppercase + numbers + symbols;
  
  let password = '';
  
  // Garantir pelo menos um caractere de cada tipo
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];
  
  // Preencher o resto aleatoriamente
  for (let i = 4; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  // Embaralhar a senha
  return password.split('').sort(() => Math.random() - 0.5).join('');
}