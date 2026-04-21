import Fastify from 'fastify';
import axios from 'axios';
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import cors from '@fastify/cors';
import { Redis } from 'ioredis';

// 1. Настройка окружения
dotenv.config();

const fastify = Fastify({ logger: true });
const prisma = new PrismaClient();

const redis = new Redis({
  host: '127.0.0.1', 
  port: 6379,
  lazyConnect: true, 
});

redis.on('error', (err: any) => {
  console.warn('Redis connection error. Working without cache.');
});

// 3. Регистрация CORS (обязательно для связи с фронтендом)
await fastify.register(cors, {
  origin: true, 
});

// Типизация для запроса города
interface WeatherQuery {
  city: string;
}

// 4. Основной маршрут
fastify.get('/weather', async (request, reply) => {
  const { city } = request.query as WeatherQuery;

  if (!city) {
    return reply.code(400).send({ error: 'City is required' });
  }

  try {
    const cityKey = city.toLowerCase().trim();

    // Пытаемся взять данные из кэша Redis
    const cached = await redis.get(cityKey);
    if (cached) {
      fastify.log.info('Данные получены из Redis кэша');
      return JSON.parse(cached);
    }

    // Если в кэше нет — идем в OpenWeatherMap API
    const apiKey = process.env.WEATHER_API_KEY;
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${cityKey}&appid=${apiKey}&units=metric`;
    
    const weatherRes = await axios.get(weatherUrl);
    const temp = Math.round(weatherRes.data.main.temp);
    const condition = weatherRes.data.weather[0].main; // Например: Clear, Clouds, Rain

    // Ищем подходящий мем в PostgreSQL через Prisma
    const meme = await prisma.meme.findFirst({
      where: { weatherCategory: condition },
    });

    // Формируем объект ответа
    const result = {
      city: weatherRes.data.name,
      temp: `${temp}°C`,
      condition: condition,
      meme: meme || { 
        url: 'https://via.placeholder.com/300', 
        description: 'Мем для такой погоды еще не добавлен' 
      }
    };

    // Сохраняем в Redis на 10 минут (600 секунд)
    await redis.set(cityKey, JSON.stringify(result), 'EX', 600);

    return result;

  } catch (error: any) {
    fastify.log.error(error);
    return reply.code(error.response?.status || 500).send({ 
      error: 'City not found or API error',
      details: error.response?.data?.message || error.message 
    });
  }
});

// Вспомогательный роут для проверки работоспособности
fastify.get('/', async () => {
  return { status: 'OK', message: 'Backend is running' };
});

// 5. Запуск сервера
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