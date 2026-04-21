import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const memes = [
  {
    weatherCategory: 'Clear',
    url: 'https://i.imgflip.com/4/39t1o.jpg', // Мем с солнышком
    description: 'Наконец-то солнце!'
  },
  {
    weatherCategory: 'Clouds',
    url: 'https://i.imgflip.com/4/1otk96.jpg', // Мем про облака/грусть
    description: 'Опять пасмурно...'
  },
  {
    weatherCategory: 'Rain',
    url: 'https://i.imgflip.com/4/16i9p.jpg', // Классический мем в дожде
    description: 'Идеальная погода, чтобы грустить'
  }
];

  for (const meme of memes) {
    await prisma.meme.create({ data: meme });
  }

  console.log('✅ База наполнена мемами!');
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());