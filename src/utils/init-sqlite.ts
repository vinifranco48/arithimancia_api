/**
 * SQLite Initialization for Lambda
 * Inicializa o banco SQLite no /tmp quando a Lambda inicia
 */

import { PrismaClient } from '@prisma/client';
import { logger } from '../config/logger';
import fs from 'fs';
import path from 'path';

let isInitialized = false;
const prisma = new PrismaClient();

/**
 * Inicializa o banco SQLite no Lambda
 * Cria o schema usando SQL gerado pelo Prisma
 */
export async function initializeSQLite(): Promise<void> {
  if (isInitialized) {
    logger.debug('SQLite already initialized');
    return;
  }

  try {
    const dbPath = process.env.DATABASE_URL?.replace('file:', '') || '/tmp/arithimancia.db';
    logger.info('Initializing SQLite database at:', dbPath);

    // Sempre recriar o banco no Lambda para garantir schema atualizado
    if (fs.existsSync(dbPath)) {
      logger.info('SQLite database file exists, deleting to ensure fresh schema...');
      fs.unlinkSync(dbPath);
      logger.info('Old database deleted');
    }

    // Criar diretório se não existir
    const dbDir = path.dirname(dbPath);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
      logger.info('Created database directory:', dbDir);
    }

    logger.info('Creating database schema...');

    // Executar SQL de criação das tabelas (gerado pelo Prisma)
    await prisma.$executeRawUnsafe(`
      CREATE TABLE "Player" (
        "player_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
        "username" TEXT NOT NULL,
        "email" TEXT NOT NULL,
        "password_hash" TEXT NOT NULL,
        "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "last_login" DATETIME
      );
    `);

    await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX "Player_username_key" ON "Player"("username");`);
    await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX "Player_email_key" ON "Player"("email");`);
    await prisma.$executeRawUnsafe(`CREATE INDEX "Player_email_idx" ON "Player"("email");`);
    await prisma.$executeRawUnsafe(`CREATE INDEX "Player_username_idx" ON "Player"("username");`);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE "School" (
        "school_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
        "name" TEXT NOT NULL,
        "description" TEXT,
        "axiom" TEXT,
        "health_bonus" INTEGER NOT NULL DEFAULT 0,
        "starting_gold" INTEGER NOT NULL DEFAULT 100
      );
    `);

    await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX "School_name_key" ON "School"("name");`);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE "Location" (
        "location_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
        "name" TEXT NOT NULL,
        "description" TEXT,
        "location_type" TEXT,
        "is_safe_zone" BOOLEAN NOT NULL DEFAULT true
      );
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE "Character" (
        "character_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
        "player_id" INTEGER NOT NULL,
        "name" TEXT NOT NULL,
        "level" INTEGER NOT NULL DEFAULT 1,
        "experience_points" INTEGER NOT NULL DEFAULT 0,
        "school_id" INTEGER,
        "current_location_id" INTEGER NOT NULL,
        "max_health" INTEGER NOT NULL DEFAULT 100,
        "current_health" INTEGER NOT NULL DEFAULT 100,
        "gold" INTEGER NOT NULL DEFAULT 0,
        "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "last_login" DATETIME,
        CONSTRAINT "Character_current_location_id_fkey" FOREIGN KEY ("current_location_id") REFERENCES "Location" ("location_id") ON DELETE RESTRICT ON UPDATE CASCADE,
        CONSTRAINT "Character_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "Player" ("player_id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "Character_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School" ("school_id") ON DELETE SET NULL ON UPDATE CASCADE
      );
    `);

    await prisma.$executeRawUnsafe(`CREATE INDEX "Character_player_id_idx" ON "Character"("player_id");`);
    await prisma.$executeRawUnsafe(`CREATE INDEX "Character_current_location_id_idx" ON "Character"("current_location_id");`);
    await prisma.$executeRawUnsafe(`CREATE INDEX "Character_school_id_idx" ON "Character"("school_id");`);

    logger.info('Seeding essential data...');

    // Seed Schools
    await prisma.$executeRawUnsafe(`
      INSERT INTO "School" ("school_id", "name", "description", "axiom", "health_bonus", "starting_gold")
      VALUES 
        (1, 'Academia de Álgebra Arcana', 'Escola especializada em magia algébrica e equações místicas', 'A verdade está nas equações', 10, 100),
        (2, 'Instituto de Geometria Geométrica', 'Escola focada em geometria mágica e formas sagradas', 'As formas revelam o universo', 20, 100),
        (3, 'Colégio de Cálculo Celestial', 'Escola dedicada ao cálculo avançado e limites infinitos', 'O infinito é apenas o começo', 0, 150);
    `);

    // Seed Locations
    await prisma.$executeRawUnsafe(`
      INSERT INTO "Location" ("location_id", "name", "description", "location_type", "is_safe_zone")
      VALUES 
        (1, 'Biblioteca Matemágica', 'Uma vasta biblioteca repleta de livros de matemática mágica', 'LIBRARY', 1),
        (2, 'Floresta dos Números', 'Uma floresta misteriosa onde os números ganham vida', 'FOREST', 0),
        (3, 'Torre das Equações', 'Uma torre alta onde as equações mais complexas são estudadas', 'TOWER', 1);
    `);

    await prisma.$disconnect();

    logger.info('✅ SQLite database initialized successfully');
    isInitialized = true;

  } catch (error) {
    logger.error('Failed to initialize SQLite database:', error);
    throw error;
  }
}
