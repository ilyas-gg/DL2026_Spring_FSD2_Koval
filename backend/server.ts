import Fastify from 'fastify';
import axios from 'axios';
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import cors from '@fastify/cors';
import Redis from 'ioredis';

// Загружаем переменные из .env
dotenv.config();

const fastify = Fastify({ logger: true });
const prisma = new PrismaClient();

// Подключаем Redis (убедись, что Docker запущен)
const redis = new Redis({
  host: 'localhost',
  port: 6379,
});

// РЕГИСТРИРУЕМ CORS: без этого фронтенд на порту 3001 не сможет сделать запрос
await fastify.register(cors, {
  origin: true, // В учебных целях разрешаем всем, для продакшена пишут адрес фронтенда
});

// Типизация для запроса
interface WeatherQuery {
  city: string;
}

// Главный роут для проверки
fastify.get('/', async () => {
  return { status: 'OK', message: 'Weather Meme API is active' };
});

// Основная логика: Погода + Мем
fastify.get('/weather', async (request, reply) => {
  const { city } = request.query as WeatherQuery;

  if (!city) {
    return reply.code(400).send({ error: 'City name is required' });
  }

  try {
    // 1. Пытаемся найти данные в кэше Redis
    const cachedData = await redis.get(city.toLowerCase());
    if (cachedData) {
      console.log(`--- [Redis] Данные для ${city} взяты из кэша ---`);
      return JSON.parse(cachedData);
    }

    // 2. Если в кэше нет — идем в OpenWeatherMap
    const apiKey = process.env.WEATHER_API_KEY;
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
    
    const weatherRes = await axios.get(weatherUrl);
    const temp = weatherRes.data.main.temp;
    const condition = weatherRes.data.weather[0].main; // Например: 'Clear', 'Rain', 'Clouds'

    // 3. Ищем мем в базе PostgreSQL через Prisma
    const meme = await prisma.meme.findFirst({
      where: { weatherCategory: condition },
    });

    // Формируем финальный объект
    const responseData = {
      city: weatherRes.data.name,
      temp: `${Math.round(temp)}°C`,
      condition: condition,
      meme: meme || { 
        url: 'https://via.placeholder.com/300', 
        description: 'Мем для такой погоды еще не завезли' 
      }
    };

    // 4. Сохраняем результат в Redis на 10 минут (600 секунд)
    await redis.set(city.toLowerCase(), JSON.stringify(responseData), 'EX', 600);

    return responseData;

  } catch (error: any) {
    fastify.log.error(error);
    return reply.code(error.response?.status || 500).send({ 
      error: 'Ошибка при получении данных',
      details: error.response?.data?.message || error.message 
    });
  }
});

// Запуск сервера
const start = async () => {
  try {
    await fastify.listen({ port: 3000, host: '0.0.0.0' });
    console.log('🚀 Бэкенд запущен на http://localhost:3000');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();