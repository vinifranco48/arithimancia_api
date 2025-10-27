import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const schoolsData = [
  {
    id: 1,
    name: 'Algebristas',
    description: 'Mestres das equações e manipuladores de variáveis. Os Algebristas veem o mundo através de símbolos e relações matemáticas, capazes de resolver os mais complexos sistemas de equações.',
    axiom: 'Toda incógnita tem sua solução',
    healthBonus: 10,
    startingGold: 150
  },
  {
    id: 2,
    name: 'Geômetras',
    description: 'Arquitetos do espaço e guardiões das formas perfeitas. Os Geômetras compreendem as propriedades do espaço e podem manipular dimensões e ângulos com precisão absoluta.',
    axiom: 'A forma revela a verdade',
    healthBonus: 15,
    startingGold: 120
  },
  {
    id: 3,
    name: 'Primordiais',
    description: 'Guardiões dos números primos e dos fundamentos da matemática. Os Primordiais trabalham com os blocos básicos de construção de todos os números, possuindo conhecimento sobre divisibilidade e fatores.',
    axiom: 'No princípio era o número',
    healthBonus: 5,
    startingGold: 200
  },
  {
    id: 4,
    name: 'Calculistas',
    description: 'Mestres das derivadas e integrais, manipuladores do infinitesimal. Os Calculistas compreendem as mudanças e podem prever tendências através do cálculo diferencial e integral.',
    axiom: 'O movimento revela o infinito',
    healthBonus: 8,
    startingGold: 175
  },
  {
    id: 5,
    name: 'Estatísticos',
    description: 'Profetas da probabilidade e intérpretes do acaso. Os Estatísticos podem ler padrões no caos e prever o futuro através da análise de dados e probabilidades.',
    axiom: 'No acaso há ordem',
    healthBonus: 12,
    startingGold: 130
  }
];

export async function seedSchools() {
  console.log('🏫 Seeding schools...');
  
  for (const school of schoolsData) {
    await prisma.school.upsert({
      where: { id: school.id },
      update: school,
      create: school
    });
  }
  
  console.log(`✅ Seeded ${schoolsData.length} schools`);
}

export async function cleanSchools() {
  console.log('🧹 Cleaning schools...');
  await prisma.school.deleteMany({});
  console.log('✅ Schools cleaned');
}