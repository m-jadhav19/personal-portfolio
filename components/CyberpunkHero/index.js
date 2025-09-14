import { motion } from 'framer-motion';
import { useState, useEffect, useMemo } from 'react';

export default function CyberpunkHero() {
  const [glitchActive, setGlitchActive] = useState(false);

  // Optimize glitch effect - reduce frequency
  useEffect(() => {
    const interval = setInterval(() => {
      setGlitchActive(true);
      setTimeout(() => setGlitchActive(false), 200);
    }, 8000); // Reduced frequency

    return () => clearInterval(interval);
  }, []);

  // Memoize expensive calculations
  const floatingElements = useMemo(() => [
    { id: 1, color: 'cyan', delay: 0, duration: 3 },
    { id: 2, color: 'magenta', delay: 0.5, duration: 2.5 },
    { id: 3, color: 'yellow', delay: 1, duration: 4 },
  ], []);

  return (
    <section className="relative min-h-screen bg-cyber-black overflow-hidden">
      {/* CP77 Website Style Layout */}
      <div className="relative h-screen flex flex-col">
        {/* Top Black Border */}
        <div className="h-8 bg-cyber-black"></div>
        
        {/* Main Yellow Content Area */}
        <div className="flex-1 bg-cyber-yellow relative">
          {/* Left and Right Black Borders */}
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-cyber-black"></div>
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-cyber-black"></div>
          
          {/* Main Content */}
          <div className="relative h-full flex items-center px-16">
            {/* Left Side - Text Content */}
            <div className="flex-1 z-10">
              {/* Header */}
              <div className="mb-8">
                <h2 className="font-orbitron text-lg text-cyber-black mb-4">MANDAR JADHAV</h2>
                <div className="w-16 h-1 bg-cyber-black mb-6"></div>
              </div>
              
              {/* Main Title */}
              <motion.h1
                className="font-orbitron text-6xl md:text-8xl lg:text-9xl text-cyber-black mb-8 leading-tight"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 1, ease: "easeOut" }}
                style={{
                  fontWeight: 900,
                  letterSpacing: '-0.02em',
                  lineHeight: '0.9'
                }}
              >
                FRONTEND<br />DEVELOPER
              </motion.h1>
              
              {/* Subtitle */}
              <motion.div
                className="mb-8"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
              >
                <p className="font-exo text-lg text-cyber-black">
                  CREATING IMMERSIVE DIGITAL EXPERIENCES
                </p>
              </motion.div>
              
              {/* CTA Button */}
              <motion.button
                className="px-8 py-4 bg-cyber-red text-cyber-white font-orbitron text-lg uppercase rounded-lg hover:bg-red-700 transition-all duration-300"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                VIEW PROJECTS
              </motion.button>
            </div>
            
            {/* Right Side - Character/Avatar Area */}
            <div className="flex-1 flex justify-center items-center relative">
              {/* Placeholder for character image */}
              <motion.div
                className="w-80 h-96 bg-cyber-black rounded-lg flex items-center justify-center relative overflow-hidden"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 1, delay: 0.4 }}
              >
                {/* Character placeholder with cyberpunk styling */}
                <div className="text-center">
                  <div className="w-32 h-32 border-4 border-cyber-yellow rounded-full mx-auto mb-4 flex items-center justify-center bg-cyber-gray">
                    <span className="font-orbitron text-4xl text-cyber-yellow">MJ</span>
                  </div>
                  <p className="font-exo text-cyber-yellow text-sm">DEVELOPER_AVATAR</p>
                </div>
                
                {/* Cyberpunk effects */}
                <div className="absolute top-4 left-4 w-2 h-2 bg-cyber-yellow rounded-full animate-pulse"></div>
                <div className="absolute top-4 right-4 w-2 h-2 bg-cyber-yellow rounded-full animate-pulse"></div>
                <div className="absolute bottom-4 left-4 w-2 h-2 bg-cyber-yellow rounded-full animate-pulse"></div>
                <div className="absolute bottom-4 right-4 w-2 h-2 bg-cyber-yellow rounded-full animate-pulse"></div>
              </motion.div>
            </div>
          </div>
        </div>
        
        {/* Bottom Black Border */}
        <div className="h-8 bg-cyber-black"></div>
      </div>
    </section>
  );
}
