import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const monstersData = [
  // Criaturas Básicas (Nível 1-2)
  {
    id: 1,
    name: 'Zero Absoluto',
    description: 'Uma criatura sombria que representa o vazio matemático. Absorve números e os transforma em nada.',
    baseHealth: 15,
    mathematicalConcept: 'Conceito de Zero',
    difficultyLevel: 1,
    experienceReward: 10,
    goldReward: 5
  },
  {
    id: 2,
    name: 'Número Negativo Rebelde',
    description: 'Um número que se recusa a seguir as regras da matemática positiva. Constantemente tenta inverter operações.',
    baseHealth: 12,
    mathematicalConcept: 'Números Negativos',
    difficultyLevel: 1,
    experienceReward: 8,
    goldReward: 4
  },
  {
    id: 3,
    name: 'Fração Instável',
    description: 'Uma fração que não consegue se decidir entre numerador e denominador. Muda constantemente de forma.',
    baseHealth: 18,
    mathematicalConcept: 'Frações',
    difficultyLevel: 2,
    experienceReward: 15,
    goldReward: 8
  },
  
  // Criaturas Intermediárias (Nível 3-5)
  {
    id: 4,
    name: 'Equação Quadrática Furiosa',
    description: 'Uma equação de segundo grau que perdeu suas raízes. Ataca com parábolas distorcidas e discriminantes negativos.',
    baseHealth: 25,
    mathematicalConcept: 'Equações Quadráticas',
    difficultyLevel: 3,
    experienceReward: 25,
    goldReward: 12
  },
  {
    id: 5,
    name: 'Triângulo Impossível',
    description: 'Um triângulo que viola as leis da geometria euclidiana. Seus ângulos somam mais de 180 graus.',
    baseHealth: 30,
    mathematicalConcept: 'Geometria Euclidiana',
    difficultyLevel: 4,
    experienceReward: 35,
    goldReward: 18
  },
  {
    id: 6,
    name: 'Logaritmo Sombrio',
    description: 'Um logaritmo que perdeu sua base. Vaga pelas dimensões matemáticas procurando por sua identidade.',
    baseHealth: 28,
    mathematicalConcept: 'Logaritmos',
    difficultyLevel: 4,
    experienceReward: 30,
    goldReward: 15
  },
  
  // Criaturas Avançadas (Nível 6-8)
  {
    id: 7,
    name: 'Derivada Descontrolada',
    description: 'Uma derivada que não para de derivar. Cria ondas de mudança instantânea que distorcem a realidade.',
    baseHealth: 40,
    mathematicalConcept: 'Cálculo Diferencial',
    difficultyLevel: 6,
    experienceReward: 50,
    goldReward: 25
  },
  {
    id: 8,
    name: 'Integral Infinita',
    description: 'Uma integral que se recusa a convergir. Acumula área infinitamente, criando buracos no espaço-tempo.',
    baseHealth: 45,
    mathematicalConcept: 'Cálculo Integral',
    difficultyLevel: 7,
    experienceReward: 60,
    goldReward: 30
  },
  {
    id: 9,
    name: 'Matriz Singular',
    description: 'Uma matriz que perdeu sua capacidade de inversão. Transforma vetores em dimensões inexistentes.',
    baseHealth: 35,
    mathematicalConcept: 'Álgebra Linear',
    difficultyLevel: 6,
    experienceReward: 45,
    goldReward: 22
  },
  
  // Criaturas Épicas (Nível 9-10)
  {
    id: 10,
    name: 'Fractal Parasita',
    description: 'Uma criatura que se replica infinitamente em escalas menores. Cada parte contém o todo, criando complexidade infinita.',
    baseHealth: 60,
    mathematicalConcept: 'Geometria Fractal',
    difficultyLevel: 9,
    experienceReward: 80,
    goldReward: 40
  },
  {
    id: 11,
    name: 'Número Imaginário Materializado',
    description: 'Um número imaginário que ganhou forma física. Existe em dimensões perpendiculares à realidade.',
    baseHealth: 50,
    mathematicalConcept: 'Números Complexos',
    difficultyLevel: 8,
    experienceReward: 70,
    goldReward: 35
  },
  {
    id: 12,
    name: 'Teorema Não Demonstrado',
    description: 'Um teorema que existe mas nunca foi provado. Sua verdade é incerta, tornando-o extremamente perigoso.',
    baseHealth: 55,
    mathematicalConcept: 'Lógica Matemática',
    difficultyLevel: 9,
    experienceReward: 75,
    goldReward: 38
  },
  
  // Criaturas Lendárias (Nível 10+)
  {
    id: 13,
    name: 'Infinito Devorador',
    description: 'Uma entidade que representa o conceito de infinito. Consome números, funções e até mesmo outros conceitos matemáticos.',
    baseHealth: 100,
    mathematicalConcept: 'Teoria dos Conjuntos Infinitos',
    difficultyLevel: 10,
    experienceReward: 150,
    goldReward: 75
  },
  {
    id: 14,
    name: 'Paradoxo de Russell Encarnado',
    description: 'A manifestação física do famoso paradoxo. Sua existência questiona os fundamentos da lógica matemática.',
    baseHealth: 80,
    mathematicalConcept: 'Paradoxos Lógicos',
    difficultyLevel: 10,
    experienceReward: 120,
    goldReward: 60
  },
  {
    id: 15,
    name: 'Hipótese de Riemann Não Resolvida',
    description: 'Uma das maiores questões não resolvidas da matemática ganhou vida. Sua solução pode alterar toda a matemática.',
    baseHealth: 120,
    mathematicalConcept: 'Teoria dos Números',
    difficultyLevel: 10,
    experienceReward: 200,
    goldReward: 100
  }
];

export async function seedMonsters() {
  console.log('👹 Seeding monsters...');
  
  for (const monster of monstersData) {
    await prisma.monster.upsert({
      where: { id: monster.id },
      update: monster,
      create: monster
    });
  }
  
  console.log(`✅ Seeded ${monstersData.length} monsters`);
}

export async function cleanMonsters() {
  console.log('🧹 Cleaning monsters...');
  await prisma.monster.deleteMany({});
  console.log('✅ Monsters cleaned');
}