import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const locationsData = [
  {
    id: 1,
    name: 'Biblioteca de Alexandria Numérica',
    description: 'O coração do conhecimento matemático. Uma vasta biblioteca onde todos os teoremas, fórmulas e descobertas matemáticas são preservados. Aqui, novos aventureiros começam sua jornada.',
    locationType: 'City',
    isSafeZone: true
  },
  {
    id: 2,
    name: 'Praça dos Números Primos',
    description: 'Uma praça circular onde apenas números primos podem ser encontrados. O ar vibra com a energia dos números indivisíveis, e criaturas matemáticas primitivas vagam por aqui.',
    locationType: 'City',
    isSafeZone: true
  },
  {
    id: 3,
    name: 'Floresta das Equações',
    description: 'Uma floresta densa onde as árvores crescem em padrões algébricos. Cada galho representa uma variável, e resolver as equações das árvores pode revelar tesouros escondidos.',
    locationType: 'Wilderness',
    isSafeZone: false
  },
  {
    id: 4,
    name: 'Cavernas da Geometria Sagrada',
    description: 'Cavernas profundas onde as paredes formam figuras geométricas perfeitas. Ecos de teoremas antigos ressoam pelos túneis, e criaturas geométricas guardam segredos ancestrais.',
    locationType: 'Dungeon',
    isSafeZone: false
  },
  {
    id: 5,
    name: 'Torre do Cálculo Infinito',
    description: 'Uma torre que se estende infinitamente para cima, onde cada andar representa um nível diferente de complexidade matemática. Apenas os mais corajosos ousam subir seus degraus.',
    locationType: 'Dungeon',
    isSafeZone: false
  },
  {
    id: 6,
    name: 'Laboratório de Probabilidades',
    description: 'Um laboratório onde experimentos aleatórios acontecem constantemente. Dados gigantes rolam pelo chão, e moedas flutuam no ar, criando um ambiente de pura aleatoriedade.',
    locationType: 'City',
    isSafeZone: true
  },
  {
    id: 7,
    name: 'Deserto das Funções Perdidas',
    description: 'Um vasto deserto onde funções matemáticas esquecidas vagam como miragens. O calor distorce as equações, criando ilusões matemáticas perigosas.',
    locationType: 'Wilderness',
    isSafeZone: false
  },
  {
    id: 8,
    name: 'Mercado dos Algoritmos',
    description: 'Um mercado movimentado onde algoritmos são comercializados como mercadorias. Comerciantes oferecem soluções para problemas complexos em troca de ouro e conhecimento.',
    locationType: 'City',
    isSafeZone: true
  },
  {
    id: 9,
    name: 'Abismo dos Números Irracionais',
    description: 'Um abismo profundo e sem fim, onde números irracionais ecoam eternamente. A própria realidade se torna instável aqui, e apenas os mais preparados podem sobreviver.',
    locationType: 'Dungeon',
    isSafeZone: false
  },
  {
    id: 10,
    name: 'Jardim das Séries Convergentes',
    description: 'Um jardim sereno onde séries matemáticas crescem como flores. Cada série que converge cria uma flor única, e o ar está impregnado com a harmonia dos números.',
    locationType: 'City',
    isSafeZone: true
  }
];

export async function seedLocations() {
  console.log('🗺️ Seeding locations...');
  
  for (const location of locationsData) {
    await prisma.location.upsert({
      where: { id: location.id },
      update: location,
      create: location
    });
  }
  
  console.log(`✅ Seeded ${locationsData.length} locations`);
}

export async function cleanLocations() {
  console.log('🧹 Cleaning locations...');
  await prisma.location.deleteMany({});
  console.log('✅ Locations cleaned');
}