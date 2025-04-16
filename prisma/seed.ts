// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';
import { genSalt, hash } from 'bcrypt';

// Initialize Prisma Client without any options
const prisma = new PrismaClient();

async function generatePasswordHash(plainPassword: string) {
  const salt = await genSalt(10);
  return hash(plainPassword, salt);
}

async function main() {
  try {
    // Create roles
    console.log('Creating roles...');
    await prisma.role.createMany({
      data: [
        { name: 'Admin' },
        { name: 'PowerUser' },
        { name: 'User' },
      ],
      skipDuplicates: true,
    });

    // Get the User role
    console.log('Finding User role...');
    const userRole = await prisma.role.findFirst({
      where: { name: 'User' },
    });

    if (!userRole) {
      throw new Error('User role not found');
    }

    // Create users
    console.log('Creating users...');
    const users = [];
    for (let i = 0; i < 10; i++) {
      users.push({
        name: faker.person.fullName(),
        email: faker.internet.email(),
        roleId: userRole.id,
        password: await generatePasswordHash('pass@123'),
      });
    }

    await prisma.user.createMany({
      data: users,
      skipDuplicates: true,
    });

    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  });
