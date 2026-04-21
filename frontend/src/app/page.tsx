'use client';
import { useState } from 'react';

export default function Home() {
  const [city, setCity] = useState('');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const getWeather = async () => {
    if (!city) return;
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
    // Фон с глубоким градиентом
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col items-center py-12 px-4 text-white">
      
      <div className="max-w-md w-full text-center">
        <h1 className="text-4xl font-extrabold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
          Weather Meme Mood
        </h1>
        <p className="text-slate-400 mb-10">Узнай погоду и получи порцию юмора</p>
        
        {/* Поле ввода и кнопка */}
        <div className="flex flex-col gap-3 mb-12">
          <input 
            type="text" 
            value={city}
            onChange={(e) => setCity(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && getWeather()}
            placeholder="Введите город..."
            className="w-full p-4 bg-slate-800/50 border border-slate-700 rounded-2xl backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-white placeholder-slate-500"
          />
          <button 
            onClick={getWeather}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-900/20 transition-all active:scale-95"
          >
            {loading ? 'Ищем тучи...' : 'Узнать настроение'}
          </button>
        </div>

        {/* Карточка с результатом */}
        {data && (
          <div className="relative group">
            {/* Свечение сзади карточки */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl blur opacity-30 group-hover:opacity-50 transition duration-1000"></div>
            
            <div className="relative bg-slate-900/80 border border-slate-700/50 backdrop-blur-xl p-8 rounded-3xl shadow-2xl">
              <h2 className="text-3xl font-bold text-white mb-1">{data.city}</h2>
              <p className="text-slate-400 uppercase text-xs tracking-widest mb-4">{data.condition}</p>
              
              <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-orange-400 to-red-600 mb-6">
                {data.temp}
              </div>
              
              <div className="rounded-xl overflow-hidden border border-slate-700 bg-slate-800">
                <img 
                  src={data.meme.url} 
                  alt="Weather Meme" 
                  className="w-full h-auto object-cover"
                  referrerPolicy="no-referrer" 
                />
              </div>
              
              <p className="mt-6 text-lg italic text-slate-300 leading-relaxed">
                "{data.meme.description}"
              </p>
            </div>
          </div>
        )}
      </div>

      <footer className="mt-auto text-slate-500 text-sm">
        Fullstack Meme App 2026
      </footer>
    </main>
  );
}