import { PrismaClient } from '@prisma/client';
import { seedSchools, cleanSchools } from './seeds/schools';
import { seedLocations, cleanLocations } from './seeds/locations';
import { seedItems, cleanItems } from './seeds/items';
import { seedMonsters, cleanMonsters } from './seeds/monsters';
import { seedProblems, cleanProblems } from './seeds/problems';
import { seedQuests, seedQuestObjectives, cleanQuests } from './seeds/quests';
import { seedNPCs, cleanNPCs } from './seeds/npcs';
import { seedAchievements, cleanAchievements } from './seeds/achievements';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');
  console.log('=====================================');

  try {
    // Connect to database
    await prisma.$connect();
    console.log('✅ Connected to database');

    // Clean existing data (in reverse dependency order)
    console.log('\n🧹 Cleaning existing data...');
    await cleanAchievements();
    await cleanNPCs();
    await cleanQuests(); // This also cleans quest objectives
    await cleanProblems();
    await cleanMonsters();
    await cleanItems();
    await cleanLocations();
    await cleanSchools();

    console.log('\n🌱 Seeding new data...');

    // Seed base data (in dependency order)
    await seedSchools();
    await seedLocations();
    await seedItems();
    await seedMonsters();
    await seedProblems();
    await seedAchievements();
    await seedNPCs();

    // Seed quests and objectives (depends on problems, monsters, items)
    await seedQuests();
    await seedQuestObjectives();

    console.log('\n📊 Verifying seeded data...');

    // Verify data integrity
    const counts = {
      schools: await prisma.school.count(),
      locations: await prisma.location.count(),
      items: await prisma.item.count(),
      monsters: await prisma.monster.count(),
      problems: await prisma.problem.count(),
      quests: await prisma.quest.count(),
      questObjectives: await prisma.questObjective.count(),
      npcs: await prisma.nPC.count(),
      achievements: await prisma.achievement.count()
    };

    console.log('Final record counts:');
    console.log(`  🏫 Schools: ${counts.schools}`);
    console.log(`  🗺️ Locations: ${counts.locations}`);
    console.log(`  🎒 Items: ${counts.items}`);
    console.log(`  👹 Monsters: ${counts.monsters}`);
    console.log(`  🧮 Problems: ${counts.problems}`);
    console.log(`  📜 Quests: ${counts.quests}`);
    console.log(`  🎯 Quest Objectives: ${counts.questObjectives}`);
    console.log(`  👥 NPCs: ${counts.npcs}`);
    console.log(`  🏆 Achievements: ${counts.achievements}`);

    // Validate relationships
    console.log('\n🔍 Validating relationships...');

    // Check if all quest objectives reference valid entities
    const invalidObjectives = await prisma.questObjective.findMany({
      where: {
        OR: [
          {
            AND: [
              { targetProblemId: { not: null } },
              { targetProblem: null }
            ]
          },
          {
            AND: [
              { targetMonsterId: { not: null } },
              { targetMonster: null }
            ]
          },
          {
            AND: [
              { targetItemId: { not: null } },
              { targetItem: null }
            ]
          }
        ]
      }
    });

    if (invalidObjectives.length > 0) {
      console.warn(`⚠️ Found ${invalidObjectives.length} quest objectives with invalid references`);
    } else {
      console.log('✅ All quest objectives have valid references');
    }

    // Check if all NPCs reference valid locations
    const invalidNPCs = await prisma.nPC.findMany({
      where: {
        AND: [
          { locationId: { not: null } },
          { location: null }
        ]
      }
    });

    if (invalidNPCs.length > 0) {
      console.warn(`⚠️ Found ${invalidNPCs.length} NPCs with invalid location references`);
    } else {
      console.log('✅ All NPCs have valid location references');
    }

    console.log('\n=====================================');
    console.log('🎉 Database seeding completed successfully!');
    console.log('=====================================');

  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Execute seeding
main()
  .then(() => {
    console.log('✅ Seeding process finished');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Seeding failed:', error);
    process.exit(1);
  });