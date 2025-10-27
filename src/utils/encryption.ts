import bcrypt from 'bcrypt';

const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS || '12');

export const hashPassword = async (password: string): Promise<string> =>
  await bcrypt.hash(password, SALT_ROUNDS);

export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> =>
  await bcrypt.compare(password, hashedPassword);

export const generateSalt = async (rounds: number = SALT_ROUNDS): Promise<string> =>
  await bcrypt.genSalt(rounds);