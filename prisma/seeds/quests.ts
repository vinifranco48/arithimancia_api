import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const questsData = [
  // Quests Iniciais
  {
    id: 1,
    title: 'Primeiros Passos na Arithimancia',
    description: 'Bem-vindo à Biblioteca de Alexandria Numérica! Para começar sua jornada, você deve demonstrar suas habilidades básicas resolvendo alguns problemas simples.',
    questGiverNpcId: null, // Sistema automático
    experienceReward: 50,
    goldReward: 25,
    itemRewardId: 1, // Crivo de Eratóstenes
    minLevel: 1,
    isRepeatable: false
  },
  {
    id: 2,
    title: 'O Mistério dos Números Primos',
    description: 'Os números primos estão se comportando de forma estranha na Praça dos Números Primos. Investigue e resolva problemas relacionados a números primos.',
    questGiverNpcId: null,
    experienceReward: 75,
    goldReward: 40,
    itemRewardId: 4, // Poção de Clareza Mental
    minLevel: 2,
    isRepeatable: false
  },
  {
    id: 3,
    title: 'Explorando a Floresta das Equações',
    description: 'A Floresta das Equações esconde segredos algébricos. Aventure-se e resolva as equações das árvores mágicas.',
    questGiverNpcId: null,
    experienceReward: 100,
    goldReward: 60,
    itemRewardId: 2, // Compasso Dourado
    minLevel: 3,
    isRepeatable: false
  },
  {
    id: 4,
    title: 'Geometria Sagrada',
    description: 'As Cavernas da Geometria Sagrada guardam conhecimentos antigos. Desvende os mistérios geométricos para acessar seus tesouros.',
    questGiverNpcId: null,
    experienceReward: 150,
    goldReward: 80,
    itemRewardId: 3, // Régua da Proporção Áurea
    minLevel: 4,
    isRepeatable: false
  },
  {
    id: 5,
    title: 'O Desafio do Cálculo',
    description: 'A Torre do Cálculo Infinito desafia os mais corajosos. Suba seus degraus resolvendo problemas de cálculo diferencial e integral.',
    questGiverNpcId: null,
    experienceReward: 200,
    goldReward: 120,
    itemRewardId: 7, // Manto dos Algebristas
    minLevel: 6,
    isRepeatable: false
  },
  
  // Quests de Coleta
  {
    id: 6,
    title: 'Coletando Fragmentos do Conhecimento',
    description: 'Fragmentos de teoremas antigos estão espalhados pelo mundo. Colete-os para reconstituir conhecimentos perdidos.',
    questGiverNpcId: null,
    experienceReward: 80,
    goldReward: 50,
    itemRewardId: 10, // Fragmento do Teorema Perdido
    minLevel: 3,
    isRepeatable: true
  },
  {
    id: 7,
    title: 'A Busca pelos Cristais de Conhecimento',
    description: 'Cristais de conhecimento puro são raros e valiosos. Encontre-os derrotando criaturas matemáticas poderosas.',
    questGiverNpcId: null,
    experienceReward: 120,
    goldReward: 75,
    itemRewardId: 12, // Cristal de Conhecimento
    minLevel: 5,
    isRepeatable: true
  },
  
  // Quests de Combate
  {
    id: 8,
    title: 'Exterminador de Zeros',
    description: 'Zeros Absolutos estão se multiplicando e ameaçando drenar toda a matemática do mundo. Derrote-os antes que seja tarde!',
    questGiverNpcId: null,
    experienceReward: 60,
    goldReward: 30,
    itemRewardId: 5, // Elixir da Concentração
    minLevel: 1,
    isRepeatable: true
  },
  {
    id: 9,
    title: 'Caçador de Fractais',
    description: 'Fractais Parasitas estão infectando a realidade matemática. Use seu conhecimento para detê-los.',
    questGiverNpcId: null,
    experienceReward: 300,
    goldReward: 150,
    itemRewardId: 13, // Calculadora Arcana
    minLevel: 8,
    isRepeatable: true
  },
  
  // Quest Épica
  {
    id: 10,
    title: 'O Teorema Perdido de Arithimancia',
    description: 'Um teorema fundamental da Arithimancia foi perdido há séculos. Reúna pistas, derrote guardiões poderosos e resolva os maiores mistérios matemáticos para recuperá-lo.',
    questGiverNpcId: null,
    experienceReward: 500,
    goldReward: 300,
    itemRewardId: 15, // Esfera da Geometria Perfeita
    minLevel: 10,
    isRepeatable: false
  }
];

export const questObjectivesData = [
  // Quest 1: Primeiros Passos na Arithimancia
  {
    id: 1,
    questId: 1,
    description: 'Resolva 3 problemas de aritmética básica',
    type: 'SOLVE',
    targetProblemId: 1,
    targetMonsterId: null,
    targetItemId: null,
    targetNpcId: null,
    targetQuantity: 3,
    orderIndex: 1
  },
  
  // Quest 2: O Mistério dos Números Primos
  {
    id: 2,
    questId: 2,
    description: 'Resolva o problema dos números primos',
    type: 'SOLVE',
    targetProblemId: 4,
    targetMonsterId: null,
    targetItemId: null,
    targetNpcId: null,
    targetQuantity: 1,
    orderIndex: 1
  },
  {
    id: 3,
    questId: 2,
    description: 'Derrote 2 Números Negativos Rebeldes',
    type: 'DEFEAT',
    targetProblemId: null,
    targetMonsterId: 2,
    targetItemId: null,
    targetNpcId: null,
    targetQuantity: 2,
    orderIndex: 2
  },
  
  // Quest 3: Explorando a Floresta das Equações
  {
    id: 4,
    questId: 3,
    description: 'Resolva uma equação algébrica básica',
    type: 'SOLVE',
    targetProblemId: 5,
    targetMonsterId: null,
    targetItemId: null,
    targetNpcId: null,
    targetQuantity: 1,
    orderIndex: 1
  },
  {
    id: 5,
    questId: 3,
    description: 'Derrote uma Fração Instável',
    type: 'DEFEAT',
    targetProblemId: null,
    targetMonsterId: 3,
    targetItemId: null,
    targetNpcId: null,
    targetQuantity: 1,
    orderIndex: 2
  },
  
  // Quest 4: Geometria Sagrada
  {
    id: 6,
    questId: 4,
    description: 'Resolva problemas de geometria',
    type: 'SOLVE',
    targetProblemId: 6,
    targetMonsterId: null,
    targetItemId: null,
    targetNpcId: null,
    targetQuantity: 2,
    orderIndex: 1
  },
  {
    id: 7,
    questId: 4,
    description: 'Derrote um Triângulo Impossível',
    type: 'DEFEAT',
    targetProblemId: null,
    targetMonsterId: 5,
    targetItemId: null,
    targetNpcId: null,
    targetQuantity: 1,
    orderIndex: 2
  },
  
  // Quest 5: O Desafio do Cálculo
  {
    id: 8,
    questId: 5,
    description: 'Resolva um problema de derivadas',
    type: 'SOLVE',
    targetProblemId: 11,
    targetMonsterId: null,
    targetItemId: null,
    targetNpcId: null,
    targetQuantity: 1,
    orderIndex: 1
  },
  {
    id: 9,
    questId: 5,
    description: 'Resolva um problema de integrais',
    type: 'SOLVE',
    targetProblemId: 12,
    targetMonsterId: null,
    targetItemId: null,
    targetNpcId: null,
    targetQuantity: 1,
    orderIndex: 2
  },
  {
    id: 10,
    questId: 5,
    description: 'Derrote uma Derivada Descontrolada',
    type: 'DEFEAT',
    targetProblemId: null,
    targetMonsterId: 7,
    targetItemId: null,
    targetNpcId: null,
    targetQuantity: 1,
    orderIndex: 3
  },
  
  // Quest 6: Coletando Fragmentos do Conhecimento
  {
    id: 11,
    questId: 6,
    description: 'Colete fragmentos de teoremas',
    type: 'FETCH',
    targetProblemId: null,
    targetMonsterId: null,
    targetItemId: 10,
    targetNpcId: null,
    targetQuantity: 3,
    orderIndex: 1
  },
  
  // Quest 7: A Busca pelos Cristais de Conhecimento
  {
    id: 12,
    questId: 7,
    description: 'Obtenha cristais de conhecimento',
    type: 'FETCH',
    targetProblemId: null,
    targetMonsterId: null,
    targetItemId: 12,
    targetNpcId: null,
    targetQuantity: 2,
    orderIndex: 1
  },
  
  // Quest 8: Exterminador de Zeros
  {
    id: 13,
    questId: 8,
    description: 'Derrote Zeros Absolutos',
    type: 'DEFEAT',
    targetProblemId: null,
    targetMonsterId: 1,
    targetItemId: null,
    targetNpcId: null,
    targetQuantity: 5,
    orderIndex: 1
  },
  
  // Quest 9: Caçador de Fractais
  {
    id: 14,
    questId: 9,
    description: 'Derrote Fractais Parasitas',
    type: 'DEFEAT',
    targetProblemId: null,
    targetMonsterId: 10,
    targetItemId: null,
    targetNpcId: null,
    targetQuantity: 3,
    orderIndex: 1
  },
  
  // Quest 10: O Teorema Perdido de Arithimancia
  {
    id: 15,
    questId: 10,
    description: 'Resolva o paradoxo de Russell',
    type: 'SOLVE',
    targetProblemId: 16,
    targetMonsterId: null,
    targetItemId: null,
    targetNpcId: null,
    targetQuantity: 1,
    orderIndex: 1
  },
  {
    id: 16,
    questId: 10,
    description: 'Derrote o Paradoxo de Russell Encarnado',
    type: 'DEFEAT',
    targetProblemId: null,
    targetMonsterId: 14,
    targetItemId: null,
    targetNpcId: null,
    targetQuantity: 1,
    orderIndex: 2
  },
  {
    id: 17,
    questId: 10,
    description: 'Resolva a Hipótese de Riemann',
    type: 'SOLVE',
    targetProblemId: 20,
    targetMonsterId: null,
    targetItemId: null,
    targetNpcId: null,
    targetQuantity: 1,
    orderIndex: 3
  },
  {
    id: 18,
    questId: 10,
    description: 'Derrote a Hipótese de Riemann Não Resolvida',
    type: 'DEFEAT',
    targetProblemId: null,
    targetMonsterId: 15,
    targetItemId: null,
    targetNpcId: null,
    targetQuantity: 1,
    orderIndex: 4
  }
];

export async function seedQuests() {
  console.log('📜 Seeding quests...');
  
  for (const quest of questsData) {
    await prisma.quest.upsert({
      where: { id: quest.id },
      update: quest,
      create: quest
    });
  }
  
  console.log(`✅ Seeded ${questsData.length} quests`);
}

export async function seedQuestObjectives() {
  console.log('🎯 Seeding quest objectives...');
  
  for (const objective of questObjectivesData) {
    await prisma.questObjective.upsert({
      where: { id: objective.id },
      update: objective,
      create: objective
    });
  }
  
  console.log(`✅ Seeded ${questObjectivesData.length} quest objectives`);
}

export async function cleanQuests() {
  console.log('🧹 Cleaning quest objectives...');
  await prisma.questObjective.deleteMany({});
  console.log('🧹 Cleaning quests...');
  await prisma.quest.deleteMany({});
  console.log('✅ Quests cleaned');
}