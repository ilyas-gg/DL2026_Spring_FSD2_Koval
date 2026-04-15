'use client';
import { useState } from 'react';

export default function Home() {
  const [city, setCity] = useState('');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const getWeather = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:3000/weather?city=${city}`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      alert('Ошибка при получении данных');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 flex flex-col items-center py-10 px-4">
      <h1 className="text-3xl font-bold mb-8 text-blue-600">Weather Meme Mood</h1>
      
      <div className="flex gap-2 mb-10">
        <input 
          type="text" 
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Введите город (например, London)"
          className="p-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 text-black"
        />
        <button 
          onClick={getWeather}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
        >
          {loading ? 'Загрузка...' : 'Узнать настроение'}
        </button>
      </div>

      {data && (
        <div className="bg-white p-6 rounded-2xl shadow-xl max-w-sm w-full text-center">
          <h2 className="text-2xl font-semibold text-gray-800">{data.city}</h2>
          <p className="text-5xl font-bold my-4 text-orange-500">{data.temp}</p>
          <p className="text-gray-500 uppercase tracking-widest mb-6">{data.condition}</p>
          
          <div className="rounded-lg overflow-hidden border-2 border-gray-100">
            <img src={data.meme.url} alt="Weather Meme" className="w-full h-auto" />
          </div>
          <p className="mt-4 italic text-gray-600">"{data.meme.description}"</p>
        </div>
      )}
    </main>
  );
}