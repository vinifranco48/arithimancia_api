import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const problemsData = [
  // Problemas Básicos (Nível 1-2)
  {
    id: 1,
    description: 'Qual é o resultado de 7 + 5?',
    problemType: 'Aritmética Básica',
    answer: '12',
    difficultyLevel: 1,
    hintText: 'Some os dois números.',
    timeLimitSeconds: 30,
    experienceReward: 5
  },
  {
    id: 2,
    description: 'Qual é o resultado de 15 - 8?',
    problemType: 'Aritmética Básica',
    answer: '7',
    difficultyLevel: 1,
    hintText: 'Subtraia o segundo número do primeiro.',
    timeLimitSeconds: 30,
    experienceReward: 5
  },
  {
    id: 3,
    description: 'Qual é o resultado de 6 × 4?',
    problemType: 'Aritmética Básica',
    answer: '24',
    difficultyLevel: 1,
    hintText: 'Multiplique os dois números.',
    timeLimitSeconds: 45,
    experienceReward: 8
  },
  {
    id: 4,
    description: 'Qual é o próximo número primo após 7?',
    problemType: 'Números Primos',
    answer: '11',
    difficultyLevel: 2,
    hintText: 'Um número primo só é divisível por 1 e por ele mesmo.',
    timeLimitSeconds: 60,
    experienceReward: 10
  },
  {
    id: 5,
    description: 'Resolva a equação: x + 3 = 10',
    problemType: 'Álgebra Básica',
    answer: '7',
    difficultyLevel: 2,
    hintText: 'Isole a variável x.',
    timeLimitSeconds: 90,
    experienceReward: 12
  },
  
  // Problemas Intermediários (Nível 3-5)
  {
    id: 6,
    description: 'Qual é a área de um triângulo com base 8 e altura 6?',
    problemType: 'Geometria',
    answer: '24',
    difficultyLevel: 3,
    hintText: 'Área = (base × altura) ÷ 2',
    timeLimitSeconds: 120,
    experienceReward: 15
  },
  {
    id: 7,
    description: 'Resolva a equação quadrática: x² - 5x + 6 = 0',
    problemType: 'Equações Quadráticas',
    answer: '2,3',
    difficultyLevel: 4,
    hintText: 'Use a fórmula de Bhaskara ou fatoração.',
    timeLimitSeconds: 180,
    experienceReward: 20
  },
  {
    id: 8,
    description: 'Qual é o valor de log₂(8)?',
    problemType: 'Logaritmos',
    answer: '3',
    difficultyLevel: 4,
    hintText: '2 elevado a que potência resulta em 8?',
    timeLimitSeconds: 120,
    experienceReward: 18
  },
  {
    id: 9,
    description: 'Calcule a soma dos ângulos internos de um hexágono.',
    problemType: 'Geometria',
    answer: '720',
    difficultyLevel: 3,
    hintText: 'Use a fórmula (n-2) × 180°, onde n é o número de lados.',
    timeLimitSeconds: 150,
    experienceReward: 16
  },
  {
    id: 10,
    description: 'Qual é o 8º termo da sequência de Fibonacci?',
    problemType: 'Sequências',
    answer: '21',
    difficultyLevel: 4,
    hintText: 'A sequência começa com 1, 1 e cada termo é a soma dos dois anteriores.',
    timeLimitSeconds: 180,
    experienceReward: 22
  },
  
  // Problemas Avançados (Nível 6-8)
  {
    id: 11,
    description: 'Calcule a derivada de f(x) = 3x² + 2x - 1',
    problemType: 'Cálculo Diferencial',
    answer: '6x+2',
    difficultyLevel: 6,
    hintText: 'Use as regras de derivação para polinômios.',
    timeLimitSeconds: 240,
    experienceReward: 30
  },
  {
    id: 12,
    description: 'Calcule a integral de ∫(2x + 3)dx',
    problemType: 'Cálculo Integral',
    answer: 'x²+3x+C',
    difficultyLevel: 6,
    hintText: 'Use as regras básicas de integração.',
    timeLimitSeconds: 240,
    experienceReward: 30
  },
  {
    id: 13,
    description: 'Resolva o sistema: 2x + y = 7 e x - y = 2',
    problemType: 'Sistemas Lineares',
    answer: 'x=3,y=1',
    difficultyLevel: 5,
    hintText: 'Use substituição ou eliminação.',
    timeLimitSeconds: 300,
    experienceReward: 25
  },
  {
    id: 14,
    description: 'Qual é o determinante da matriz [[2,1],[3,4]]?',
    problemType: 'Álgebra Linear',
    answer: '5',
    difficultyLevel: 6,
    hintText: 'Para matriz 2x2: ad - bc',
    timeLimitSeconds: 180,
    experienceReward: 28
  },
  {
    id: 15,
    description: 'Calcule lim(x→0) (sin(x)/x)',
    problemType: 'Limites',
    answer: '1',
    difficultyLevel: 7,
    hintText: 'Este é um limite fundamental trigonométrico.',
    timeLimitSeconds: 300,
    experienceReward: 35
  },
  
  // Problemas Épicos (Nível 9-10)
  {
    id: 16,
    description: 'Prove que √2 é irracional (escreva "irracional")',
    problemType: 'Demonstrações',
    answer: 'irracional',
    difficultyLevel: 9,
    hintText: 'Use prova por contradição.',
    timeLimitSeconds: 600,
    experienceReward: 50
  },
  {
    id: 17,
    description: 'Qual é a dimensão fractal da Curva de Koch?',
    problemType: 'Geometria Fractal',
    answer: '1.26',
    difficultyLevel: 10,
    hintText: 'Use a fórmula log(N)/log(r), onde N=4 e r=3.',
    timeLimitSeconds: 480,
    experienceReward: 60
  },
  {
    id: 18,
    description: 'Resolva a equação diferencial: dy/dx = y',
    problemType: 'Equações Diferenciais',
    answer: 'y=Ce^x',
    difficultyLevel: 8,
    hintText: 'Esta é uma equação diferencial separável.',
    timeLimitSeconds: 420,
    experienceReward: 45
  },
  {
    id: 19,
    description: 'Qual é o valor de e^(iπ) + 1?',
    problemType: 'Números Complexos',
    answer: '0',
    difficultyLevel: 9,
    hintText: 'Esta é a famosa identidade de Euler.',
    timeLimitSeconds: 300,
    experienceReward: 55
  },
  {
    id: 20,
    description: 'Quantos zeros tem a função zeta de Riemann no intervalo crítico?',
    problemType: 'Teoria dos Números',
    answer: 'infinitos',
    difficultyLevel: 10,
    hintText: 'Esta é uma das questões mais profundas da matemática.',
    timeLimitSeconds: 600,
    experienceReward: 100
  }
];

export async function seedProblems() {
  console.log('🧮 Seeding problems...');
  
  for (const problem of problemsData) {
    await prisma.problem.upsert({
      where: { id: problem.id },
      update: problem,
      create: problem
    });
  }
  
  console.log(`✅ Seeded ${problemsData.length} problems`);
}

export async function cleanProblems() {
  console.log('🧹 Cleaning problems...');
  await prisma.problem.deleteMany({});
  console.log('✅ Problems cleaned');
}