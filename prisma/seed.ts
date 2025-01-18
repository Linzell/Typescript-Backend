import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  try {
    // Check if users already exist
    const userCount = await prisma.user.count();

    if (userCount === 0) {
      console.log('Seeding database...');

      const users = [
        {
          email: 'admin@example.com',
          name: 'Admin User',
          hashedPassword: await bcrypt.hash('admin123', 10),
        },
        {
          email: 'user@example.com',
          name: 'Regular User',
          hashedPassword: await bcrypt.hash('user123', 10),
        },
      ];

      for (const user of users) {
        await prisma.user.create({
          data: user,
        });
      }

      console.log('Database seeded successfully!');
      console.log('\nTest users created:');
      console.log('- Admin: admin@example.com');
      console.log('- User: user@example.com');
    } else {
      console.log('Database already contains users, skipping seed.');
    }
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
