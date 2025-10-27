import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const itemsData = [
  // Artefatos Básicos
  {
    id: 1,
    name: 'Crivo de Eratóstenes',
    description: 'Um antigo artefato que permite identificar números primos com facilidade. Brilha com uma luz dourada quando próximo de números primos.',
    type: 'Artefato',
    healthBonus: 5,
    price: 100,
    isTradeable: true,
    isConsumable: false
  },
  {
    id: 2,
    name: 'Compasso Dourado',
    description: 'Um compasso mágico que sempre desenha círculos perfeitos. Essencial para qualquer Geômetra que se preze.',
    type: 'Artefato',
    healthBonus: 8,
    price: 150,
    isTradeable: true,
    isConsumable: false
  },
  {
    id: 3,
    name: 'Régua da Proporção Áurea',
    description: 'Uma régua que mede automaticamente a proporção áurea em qualquer objeto. Revela a beleza matemática oculta no mundo.',
    type: 'Artefato',
    healthBonus: 10,
    price: 200,
    isTradeable: true,
    isConsumable: false
  },
  
  // Consumíveis
  {
    id: 4,
    name: 'Poção de Clareza Mental',
    description: 'Uma poção que clareia a mente e melhora a capacidade de resolver problemas matemáticos complexos.',
    type: 'Consumível',
    healthBonus: 0,
    price: 50,
    isTradeable: true,
    isConsumable: true
  },
  {
    id: 5,
    name: 'Elixir da Concentração',
    description: 'Um elixir que aumenta temporariamente a concentração, permitindo resolver problemas mais rapidamente.',
    type: 'Consumível',
    healthBonus: 0,
    price: 75,
    isTradeable: true,
    isConsumable: true
  },
  {
    id: 6,
    name: 'Tônico de Recuperação',
    description: 'Um tônico que restaura a saúde e energia mental após batalhas matemáticas intensas.',
    type: 'Consumível',
    healthBonus: 25,
    price: 80,
    isTradeable: true,
    isConsumable: true
  },
  
  // Equipamentos
  {
    id: 7,
    name: 'Manto dos Algebristas',
    description: 'Um manto tecido com fórmulas algébricas. Oferece proteção contra ataques baseados em equações.',
    type: 'Equipamento',
    healthBonus: 15,
    price: 300,
    isTradeable: true,
    isConsumable: false
  },
  {
    id: 8,
    name: 'Anel do Número Pi',
    description: 'Um anel gravado com os primeiros 100 dígitos de π. Concede proteção contra ataques circulares.',
    type: 'Equipamento',
    healthBonus: 12,
    price: 250,
    isTradeable: true,
    isConsumable: false
  },
  {
    id: 9,
    name: 'Amuleto da Sequência de Fibonacci',
    description: 'Um amuleto que pulsa no ritmo da sequência de Fibonacci. Oferece proteção natural e regeneração.',
    type: 'Equipamento',
    healthBonus: 20,
    price: 400,
    isTradeable: true,
    isConsumable: false
  },
  
  // Itens de Quest
  {
    id: 10,
    name: 'Fragmento do Teorema Perdido',
    description: 'Um fragmento de um teorema matemático perdido. Parece vibrar com energia antiga.',
    type: 'Quest',
    healthBonus: 0,
    price: 0,
    isTradeable: false,
    isConsumable: false
  },
  {
    id: 11,
    name: 'Chave da Câmara dos Números',
    description: 'Uma chave ornamentada com símbolos matemáticos. Abre portas que apenas números podem revelar.',
    type: 'Quest',
    healthBonus: 0,
    price: 0,
    isTradeable: false,
    isConsumable: false
  },
  {
    id: 12,
    name: 'Cristal de Conhecimento',
    description: 'Um cristal que armazena conhecimento matemático puro. Brilha intensamente quando próximo de sabedoria.',
    type: 'Quest',
    healthBonus: 0,
    price: 0,
    isTradeable: false,
    isConsumable: false
  },
  
  // Itens Avançados
  {
    id: 13,
    name: 'Calculadora Arcana',
    description: 'Uma calculadora mágica capaz de realizar cálculos impossíveis. Sussurra as respostas no ouvido do usuário.',
    type: 'Artefato',
    healthBonus: 25,
    price: 500,
    isTradeable: true,
    isConsumable: false
  },
  {
    id: 14,
    name: 'Livro dos Teoremas Infinitos',
    description: 'Um livro que contém teoremas que se escrevem sozinhos. Suas páginas nunca terminam.',
    type: 'Artefato',
    healthBonus: 30,
    price: 750,
    isTradeable: true,
    isConsumable: false
  },
  {
    id: 15,
    name: 'Esfera da Geometria Perfeita',
    description: 'Uma esfera matematicamente perfeita que desafia as leis da física. Concede compreensão profunda do espaço.',
    type: 'Artefato',
    healthBonus: 35,
    price: 1000,
    isTradeable: true,
    isConsumable: false
  }
];

export async function seedItems() {
  console.log('🎒 Seeding items...');
  
  for (const item of itemsData) {
    await prisma.item.upsert({
      where: { id: item.id },
      update: item,
      create: item
    });
  }
  
  console.log(`✅ Seeded ${itemsData.length} items`);
}

export async function cleanItems() {
  console.log('🧹 Cleaning items...');
  await prisma.item.deleteMany({});
  console.log('✅ Items cleaned');
}