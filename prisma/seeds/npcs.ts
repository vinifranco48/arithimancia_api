import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const npcsData = [
  // NPCs da Biblioteca de Alexandria Numérica
  {
    id: 1,
    name: 'Bibliotecário Euclides',
    locationId: 1, // Biblioteca de Alexandria Numérica
    schoolId: 2, // Geômetras
    dialogueText: 'Bem-vindo à Biblioteca de Alexandria Numérica! Aqui você encontrará todo o conhecimento matemático do mundo. Posso ajudá-lo a encontrar informações sobre geometria.',
    isMerchant: false
  },
  {
    id: 2,
    name: 'Mercador Fibonacci',
    locationId: 1, // Biblioteca de Alexandria Numérica
    schoolId: null,
    dialogueText: 'Tenho os melhores itens matemáticos da região! Meus preços seguem uma sequência muito especial... 1, 1, 2, 3, 5, 8...',
    isMerchant: true
  },
  
  // NPCs da Praça dos Números Primos
  {
    id: 3,
    name: 'Guardião Eratóstenes',
    locationId: 2, // Praça dos Números Primos
    schoolId: 3, // Primordiais
    dialogueText: 'Sou o guardião desta praça sagrada. Apenas aqueles que compreendem a pureza dos números primos podem passar. Você conhece meu crivo?',
    isMerchant: false
  },
  {
    id: 4,
    name: 'Sábia Hipatia',
    locationId: 2, // Praça dos Números Primos
    schoolId: 1, // Algebristas
    dialogueText: 'Os números primos são os átomos da matemática. Eles não podem ser divididos, apenas compreendidos. Deixe-me ensinar-lhe seus segredos.',
    isMerchant: false
  },
  
  // NPCs do Mercado dos Algoritmos
  {
    id: 5,
    name: 'Comerciante Turing',
    locationId: 8, // Mercado dos Algoritmos
    schoolId: null,
    dialogueText: 'Algoritmos! Tenho algoritmos para todos os problemas! De ordenação a busca, de criptografia a otimização. Qual é o seu problema computacional hoje?',
    isMerchant: true
  },
  {
    id: 6,
    name: 'Mestre Ada',
    locationId: 8, // Mercado dos Algoritmos
    schoolId: 4, // Calculistas
    dialogueText: 'Sou especialista em algoritmos de cálculo. Se você precisa resolver equações diferenciais ou calcular integrais complexas, posso ajudar.',
    isMerchant: false
  },
  
  // NPCs do Laboratório de Probabilidades
  {
    id: 7,
    name: 'Professor Bayes',
    locationId: 6, // Laboratório de Probabilidades
    schoolId: 5, // Estatísticos
    dialogueText: 'A probabilidade é a linguagem da incerteza. Aqui no laboratório, estudamos como prever o imprevisível. Quer aprender sobre distribuições?',
    isMerchant: false
  },
  {
    id: 8,
    name: 'Vendedora de Dados',
    locationId: 6, // Laboratório de Probabilidades
    schoolId: null,
    dialogueText: 'Dados de todas as formas e tamanhos! D4, D6, D8, D12, D20... Até dados com infinitas faces! Perfeitos para seus experimentos probabilísticos.',
    isMerchant: true
  },
  
  // NPCs do Jardim das Séries Convergentes
  {
    id: 9,
    name: 'Jardineiro Cauchy',
    locationId: 10, // Jardim das Séries Convergentes
    schoolId: 4, // Calculistas
    dialogueText: 'Cada série que converge aqui se torna uma flor única. Cuido deste jardim há décadas, observando como a matemática floresce em beleza natural.',
    isMerchant: false
  },
  {
    id: 10,
    name: 'Poeta Matemático',
    locationId: 10, // Jardim das Séries Convergentes
    schoolId: null,
    dialogueText: 'A matemática é poesia pura! Cada equação conta uma história, cada teorema é um verso. Deixe-me recitar para você a balada dos números transcendentais.',
    isMerchant: false
  },
  
  // NPCs Especiais
  {
    id: 11,
    name: 'Oráculo dos Números',
    locationId: 1, // Biblioteca de Alexandria Numérica
    schoolId: null,
    dialogueText: 'Vejo o futuro através dos números... Sua jornada será longa, jovem matemático. Grandes desafios o aguardam, mas também grandes descobertas.',
    isMerchant: false
  },
  {
    id: 12,
    name: 'Ferreiro de Fórmulas',
    locationId: 8, // Mercado dos Algoritmos
    schoolId: null,
    dialogueText: 'Forjo equipamentos matemáticos únicos! Cada item que crio é imbuído com propriedades matemáticas especiais. Traga-me os materiais certos e criarei maravilhas.',
    isMerchant: true
  }
];

export async function seedNPCs() {
  console.log('👥 Seeding NPCs...');
  
  for (const npc of npcsData) {
    await prisma.nPC.upsert({
      where: { id: npc.id },
      update: npc,
      create: npc
    });
  }
  
  console.log(`✅ Seeded ${npcsData.length} NPCs`);
}

export async function cleanNPCs() {
  console.log('🧹 Cleaning NPCs...');
  await prisma.nPC.deleteMany({});
  console.log('✅ NPCs cleaned');
}