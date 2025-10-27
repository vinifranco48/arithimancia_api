/**
 * Express Type Extensions
 * Extensões de tipos para Express.js
 */

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        username: string;
        email: string;
      };
    }
  }
}

export {};