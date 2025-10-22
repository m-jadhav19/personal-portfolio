import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

export function WeatherBackground() {
  const [weather, setWeather] = useState('clear');

  // Mock weather data - cycles through weather types for demo
  // In production, you would fetch from OpenWeather API:
  /*
  const API_KEY = 'YOUR_OPENWEATHER_API_KEY';
  useEffect(() => {
    async function fetchWeather() {
      try {
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=YourCity&appid=${API_KEY}`
        );
        const data = await response.json();
        const weatherMain = data.weather[0].main.toLowerCase();
        
        if (weatherMain.includes('rain')) setWeather('rain');
        else if (weatherMain.includes('cloud')) setWeather('cloud');
        else if (weatherMain.includes('snow')) setWeather('snow');
        else setWeather('clear');
      } catch (error) {
        console.error('Weather fetch error:', error);
      }
    }
    fetchWeather();
  }, []);
  */

  useEffect(() => {
    // Cycle through weather types for demo (every 20 seconds)
    const weatherTypes = ['clear', 'cloud', 'rain', 'snow'];
    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % weatherTypes.length;
      setWeather(weatherTypes[index]);
    }, 20000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Sky - changes based on weather */}
      <div
        className="absolute inset-0 transition-all duration-1000"
        style={{
          background:
            weather === 'clear'
              ? 'linear-gradient(180deg, #4A9FD8 0%, #6BB8E8 100%)'
              : weather === 'cloud'
              ? 'linear-gradient(180deg, #7B9FB8 0%, #95B4C8 100%)'
              : weather === 'rain'
              ? 'linear-gradient(180deg, #5A7A8E 0%, #6A8A9E 100%)'
              : 'linear-gradient(180deg, #B8C8D8 0%, #D8E4F0 100%)',
        }}
      />

      {/* Pixel dot pattern overlay */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `radial-gradient(circle, #2980B9 1px, transparent 1px)`,
          backgroundSize: '8px 8px',
        }}
      />

      {/* Weather Indicator */}
      <motion.div
        className="absolute top-20 right-6 z-50 pixel-font text-[9px] text-[#1B1B1B] bg-white/90 px-4 py-2 shadow-lg"
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        style={{ border: '2px solid #4A9FD8' }}
      >
        Weather: {weather.toUpperCase()}
      </motion.div>

      {/* Sun - only on clear weather */}
      {weather === 'clear' && (
        <motion.div
          className="absolute top-12 left-12"
          initial={{ scale: 0, rotate: 0 }}
          animate={{ scale: 1, rotate: 360 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
        >
          <div className="relative w-20 h-20">
            {/* Sun glow */}
            <div className="absolute inset-0 blur-xl opacity-50 bg-[#FDB813]" />

            {/* Sun core - pixel circle */}
            <div className="relative">
              <div className="flex">
                <div className="w-4 h-4" />
                <div className="w-4 h-4 bg-[#FDB813]" />
                <div className="w-4 h-4 bg-[#FDB813]" />
                <div className="w-4 h-4 bg-[#FDB813]" />
                <div className="w-4 h-4" />
              </div>
              <div className="flex">
                <div className="w-4 h-4 bg-[#FDB813]" />
                <div className="w-4 h-4 bg-[#FDCB3E]" />
                <div className="w-4 h-4 bg-[#FDCB3E]" />
                <div className="w-4 h-4 bg-[#FDCB3E]" />
                <div className="w-4 h-4 bg-[#FDB813]" />
              </div>
              <div className="flex">
                <div className="w-4 h-4 bg-[#FDB813]" />
                <div className="w-4 h-4 bg-[#FDCB3E]" />
                <div className="w-4 h-4 bg-[#FDCB3E]" />
                <div className="w-4 h-4 bg-[#FDCB3E]" />
                <div className="w-4 h-4 bg-[#FDB813]" />
              </div>
              <div className="flex">
                <div className="w-4 h-4 bg-[#FDB813]" />
                <div className="w-4 h-4 bg-[#FDCB3E]" />
                <div className="w-4 h-4 bg-[#FDCB3E]" />
                <div className="w-4 h-4 bg-[#FDCB3E]" />
                <div className="w-4 h-4 bg-[#FDB813]" />
              </div>
              <div className="flex">
                <div className="w-4 h-4" />
                <div className="w-4 h-4 bg-[#FDB813]" />
                <div className="w-4 h-4 bg-[#FDB813]" />
                <div className="w-4 h-4 bg-[#FDB813]" />
                <div className="w-4 h-4" />
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Floating Pixel Clouds */}
      <PixelCloud delay={0} top="15%" left="20%" size="large" opacity={weather === 'cloud' || weather === 'rain' ? 1 : 0.8} />
      <PixelCloud delay={2} top="25%" right="15%" size="medium" opacity={weather === 'cloud' || weather === 'rain' ? 1 : 0.8} />
      <PixelCloud delay={4} top="40%" left="60%" size="small" opacity={weather === 'cloud' || weather === 'rain' ? 1 : 0.8} />
      <PixelCloud delay={1} top="50%" right="40%" size="medium" opacity={weather === 'cloud' || weather === 'rain' ? 1 : 0.8} />
      
      {weather === 'cloud' && (
        <>
          <PixelCloud delay={3} top="35%" left="10%" size="large" opacity={1} />
          <PixelCloud delay={5} top="45%" right="20%" size="large" opacity={1} />
        </>
      )}

      {/* Rain particles */}
      {weather === 'rain' && <RainEffect />}

      {/* Snow particles */}
      {weather === 'snow' && <SnowEffect />}

      {/* Pixel Grass Layers - Bottom */}
      <div className="absolute bottom-0 left-0 right-0">
        {/* Dark grass layer */}
        <div className="relative h-16">
          <div className="absolute bottom-0 left-0 right-0 flex">
            {Array.from({ length: 100 }).map((_, i) => (
              <div
                key={i}
                className="flex-1 bg-[#2D8C3C]"
                style={{
                  height: `${48 + Math.random() * 16}px`,
                }}
              />
            ))}
          </div>
        </div>

        {/* Medium grass layer */}
        <div className="relative h-12 -mt-8">
          <div className="absolute bottom-0 left-0 right-0 flex">
            {Array.from({ length: 100 }).map((_, i) => (
              <div
                key={i}
                className="flex-1 bg-[#3FA84C]"
                style={{
                  height: `${40 + Math.random() * 12}px`,
                }}
              />
            ))}
          </div>
        </div>

        {/* Light grass layer */}
        <div className="relative h-8 -mt-6">
          <div className="absolute bottom-0 left-0 right-0 flex">
            {Array.from({ length: 100 }).map((_, i) => (
              <div
                key={i}
                className="flex-1 bg-[#5CC167]"
                style={{
                  height: `${28 + Math.random() * 12}px`,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function PixelCloud({
  delay,
  top,
  left,
  right,
  size,
  opacity = 0.9,
}) {
  const sizeMap = {
    small: { w: 12, h: 8 },
    medium: { w: 16, h: 12 },
    large: { w: 24, h: 16 },
  };

  const { w, h } = sizeMap[size];

  return (
    <motion.div
      className="absolute"
      style={{ top, left, right, opacity }}
      animate={{
        x: [0, 30, 0],
        y: [0, -10, 0],
      }}
      transition={{
        duration: 8 + delay,
        repeat: Infinity,
        ease: 'easeInOut',
        delay,
      }}
    >
      <div className="relative">
        <svg width={w * 4} height={h * 4} viewBox={`0 0 ${w * 4} ${h * 4}`}>
          <rect x={8} y={12} width={4} height={4} fill="#FFFFFF" />
          <rect x={12} y={8} width={4} height={4} fill="#FFFFFF" />
          <rect x={16} y={8} width={4} height={4} fill="#FFFFFF" />
          <rect x={20} y={4} width={4} height={4} fill="#FFFFFF" />
          <rect x={24} y={4} width={4} height={4} fill="#FFFFFF" />
          <rect x={28} y={4} width={4} height={4} fill="#FFFFFF" />
          <rect x={32} y={8} width={4} height={4} fill="#FFFFFF" />
          <rect x={36} y={8} width={4} height={4} fill="#FFFFFF" />
          <rect x={40} y={12} width={4} height={4} fill="#FFFFFF" />

          <rect x={4} y={16} width={4} height={4} fill="#FFFFFF" />
          <rect x={8} y={16} width={4} height={4} fill="#F2F2F2" />
          <rect x={12} y={12} width={4} height={4} fill="#F2F2F2" />
          <rect x={16} y={12} width={4} height={4} fill="#F2F2F2" />
          <rect x={20} y={8} width={4} height={4} fill="#F2F2F2" />
          <rect x={24} y={8} width={4} height={4} fill="#F2F2F2" />
          <rect x={28} y={8} width={4} height={4} fill="#F2F2F2" />
          <rect x={32} y={12} width={4} height={4} fill="#F2F2F2" />
          <rect x={36} y={12} width={4} height={4} fill="#F2F2F2" />
          <rect x={40} y={16} width={4} height={4} fill="#F2F2F2" />
          <rect x={44} y={16} width={4} height={4} fill="#FFFFFF" />

          <rect x={8} y={20} width={4} height={4} fill="#FFFFFF" />
          <rect x={12} y={16} width={4} height={4} fill="#F2F2F2" />
          <rect x={16} y={16} width={4} height={4} fill="#E8E8E8" />
          <rect x={20} y={12} width={4} height={4} fill="#E8E8E8" />
          <rect x={24} y={12} width={4} height={4} fill="#E8E8E8" />
          <rect x={28} y={12} width={4} height={4} fill="#E8E8E8" />
          <rect x={32} y={16} width={4} height={4} fill="#E8E8E8" />
          <rect x={36} y={16} width={4} height={4} fill="#F2F2F2" />
          <rect x={40} y={20} width={4} height={4} fill="#FFFFFF" />

          <rect x={12} y={20} width={4} height={4} fill="#E8E8E8" />
          <rect x={16} y={20} width={4} height={4} fill="#D8D8D8" />
          <rect x={20} y={16} width={4} height={4} fill="#D8D8D8" />
          <rect x={24} y={16} width={4} height={4} fill="#D8D8D8" />
          <rect x={28} y={16} width={4} height={4} fill="#D8D8D8" />
          <rect x={32} y={20} width={4} height={4} fill="#D8D8D8" />
          <rect x={36} y={20} width={4} height={4} fill="#E8E8E8" />
        </svg>
      </div>
    </motion.div>
  );
}

function RainEffect() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {Array.from({ length: 50 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 bg-[#4A9FD8]"
          style={{
            left: `${Math.random() * 100}%`,
            height: `${20 + Math.random() * 20}px`,
          }}
          animate={{
            y: ['0vh', '100vh'],
          }}
          transition={{
            duration: 0.5 + Math.random() * 0.5,
            repeat: Infinity,
            delay: Math.random() * 2,
            ease: 'linear',
          }}
        />
      ))}
    </div>
  );
}

function SnowEffect() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {Array.from({ length: 40 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-white"
          style={{
            left: `${Math.random() * 100}%`,
          }}
          animate={{
            y: ['0vh', '100vh'],
            x: [0, Math.random() * 100 - 50],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 3,
            ease: 'linear',
          }}
        />
      ))}
    </div>
  );
}

export default WeatherBackground;