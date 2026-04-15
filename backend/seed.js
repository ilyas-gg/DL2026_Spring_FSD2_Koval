import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const memes = [
    {
      weatherCategory: 'Clear',
      url: 'https://i.pinimg.com/originals/de/63/0e/de630e95646f827a5146c9a35e76a029.jpg',
      description: 'Наконец-то солнце, можно выходить из пещеры'
    },
    {
      weatherCategory: 'Clouds',
      url: 'https://memepedia.ru/wp-content/uploads/2019/07/pasmurno-mem-1.jpg',
      description: 'Опять серое небо, типичный понедельник'
    },
    {
      weatherCategory: 'Rain',
      url: 'https://vsememy.ru/kartinki/wp-content/uploads/2023/04/1681216895_kartinki-vsememy-ru-p-prikolnie-kartinki-pro-dozhd-i-nastroenie-30.jpg',
      description: 'Я иду по лужам, а в душе — слезы'
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