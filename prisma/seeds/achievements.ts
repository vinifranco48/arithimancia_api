import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const achievementsData = [
  // Achievements de Combate
  {
    id: 1,
    name: 'Primeiro Sangue',
    description: 'Derrote sua primeira criatura matemática',
    category: 'Combat',
    requirementType: 'MONSTERS_DEFEATED',
    requirementCount: 1,
    experienceReward: 10,
    titleReward: 'Iniciante'
  },
  {
    id: 2,
    name: 'Exterminador',
    description: 'Derrote 10 criaturas matemáticas',
    category: 'Combat',
    requirementType: 'MONSTERS_DEFEATED',
    requirementCount: 10,
    experienceReward: 50,
    titleReward: 'Caçador'
  },
  {
    id: 3,
    name: 'Lenda Viva',
    description: 'Derrote 100 criaturas matemáticas',
    category: 'Combat',
    requirementType: 'MONSTERS_DEFEATED',
    requirementCount: 100,
    experienceReward: 200,
    titleReward: 'Lenda'
  },
  
  // Achievements de Resolução de Problemas
  {
    id: 4,
    name: 'Primeiro Cálculo',
    description: 'Resolva seu primeiro problema matemático',
    category: 'Problem Solving',
    requirementType: 'PROBLEMS_SOLVED',
    requirementCount: 1,
    experienceReward: 5,
    titleReward: 'Aprendiz'
  },
  {
    id: 5,
    name: 'Mente Brilhante',
    description: 'Resolva 25 problemas matemáticos',
    category: 'Problem Solving',
    requirementType: 'PROBLEMS_SOLVED',
    requirementCount: 25,
    experienceReward: 75,
    titleReward: 'Pensador'
  },
  {
    id: 6,
    name: 'Gênio Matemático',
    description: 'Resolva 100 problemas matemáticos',
    category: 'Problem Solving',
    requirementType: 'PROBLEMS_SOLVED',
    requirementCount: 100,
    experienceReward: 300,
    titleReward: 'Gênio'
  },
  
  // Achievements de Exploração
  {
    id: 7,
    name: 'Primeiro Passo',
    description: 'Visite sua primeira localização',
    category: 'Exploration',
    requirementType: 'LOCATIONS_VISITED',
    requirementCount: 1,
    experienceReward: 10,
    titleReward: 'Explorador Novato'
  },
  {
    id: 8,
    name: 'Andarilho',
    description: 'Visite 5 localizações diferentes',
    category: 'Exploration',
    requirementType: 'LOCATIONS_VISITED',
    requirementCount: 5,
    experienceReward: 50,
    titleReward: 'Andarilho'
  },
  {
    id: 9,
    name: 'Mestre Explorador',
    description: 'Visite todas as 10 localizações',
    category: 'Exploration',
    requirementType: 'LOCATIONS_VISITED',
    requirementCount: 10,
    experienceReward: 150,
    titleReward: 'Mestre Explorador'
  },
  
  // Achievements de Quests
  {
    id: 10,
    name: 'Primeira Missão',
    description: 'Complete sua primeira quest',
    category: 'Quests',
    requirementType: 'QUESTS_COMPLETED',
    requirementCount: 1,
    experienceReward: 25,
    titleReward: 'Aventureiro'
  },
  {
    id: 11,
    name: 'Herói em Ascensão',
    description: 'Complete 5 quests',
    category: 'Quests',
    requirementType: 'QUESTS_COMPLETED',
    requirementCount: 5,
    experienceReward: 100,
    titleReward: 'Herói'
  },
  {
    id: 12,
    name: 'Campeão de Arithimancia',
    description: 'Complete 10 quests',
    category: 'Quests',
    requirementType: 'QUESTS_COMPLETED',
    requirementCount: 10,
    experienceReward: 250,
    titleReward: 'Campeão'
  },
  
  // Achievements de Coleção
  {
    id: 13,
    name: 'Colecionador Iniciante',
    description: 'Colete 5 itens diferentes',
    category: 'Collection',
    requirementType: 'ITEMS_COLLECTED',
    requirementCount: 5,
    experienceReward: 30,
    titleReward: 'Colecionador'
  },
  {
    id: 14,
    name: 'Acumulador',
    description: 'Colete 15 itens diferentes',
    category: 'Collection',
    requirementType: 'ITEMS_COLLECTED',
    requirementCount: 15,
    experienceReward: 100,
    titleReward: 'Acumulador'
  },
  {
    id: 15,
    name: 'Mestre Colecionador',
    description: 'Colete todos os itens disponíveis',
    category: 'Collection',
    requirementType: 'ITEMS_COLLECTED',
    requirementCount: 15, // Total de itens únicos
    experienceReward: 200,
    titleReward: 'Mestre Colecionador'
  },
  
  // Achievements Especiais
  {
    id: 16,
    name: 'Escolhido da Escola',
    description: 'Escolha uma escola de magia',
    category: 'Social',
    requirementType: 'SCHOOL_JOINED',
    requirementCount: 1,
    experienceReward: 50,
    titleReward: 'Estudante'
  },
  {
    id: 17,
    name: 'Milionário',
    description: 'Acumule 1000 moedas de ouro',
    category: 'Economic',
    requirementType: 'GOLD_ACCUMULATED',
    requirementCount: 1000,
    experienceReward: 100,
    titleReward: 'Milionário'
  },
  {
    id: 18,
    name: 'Velocista Mental',
    description: 'Resolva um problema em menos de 10 segundos',
    category: 'Speed',
    requirementType: 'FAST_SOLVE',
    requirementCount: 1,
    experienceReward: 75,
    titleReward: 'Velocista'
  },
  {
    id: 19,
    name: 'Perfeccionista',
    description: 'Resolva 10 problemas consecutivos sem errar',
    category: 'Accuracy',
    requirementType: 'PERFECT_STREAK',
    requirementCount: 10,
    experienceReward: 150,
    titleReward: 'Perfeccionista'
  },
  {
    id: 20,
    name: 'Lenda de Arithimancia',
    description: 'Alcance o nível máximo (10)',
    category: 'Progression',
    requirementType: 'LEVEL_REACHED',
    requirementCount: 10,
    experienceReward: 500,
    titleReward: 'Lenda de Arithimancia'
  }
];

export async function seedAchievements() {
  console.log('🏆 Seeding achievements...');
  
  for (const achievement of achievementsData) {
    await prisma.achievement.upsert({
      where: { id: achievement.id },
      update: achievement,
      create: achievement
    });
  }
  
  console.log(`✅ Seeded ${achievementsData.length} achievements`);
}

export async function cleanAchievements() {
  console.log('🧹 Cleaning achievements...');
  await prisma.achievement.deleteMany({});
  console.log('✅ Achievements cleaned');
}