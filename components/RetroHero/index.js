import { motion } from 'framer-motion';
import { PixelAvatar } from '../PixelAvatar';
import { useState, useEffect } from 'react';
import { Code2, Palette, Zap, Award } from 'lucide-react';
import data from '../../data/portfolio.json';

export function RetroHero() {
  const [displayedText, setDisplayedText] = useState('');
  const fullText = 'Full Stack Developer';

  useEffect(() => {
    let index = 0;
    const typingInterval = setInterval(() => {
      if (index <= fullText.length) {
        setDisplayedText(fullText.substring(0, index));
        index++;
      } else {
        clearInterval(typingInterval);
      }
    }, 100);

    return () => clearInterval(typingInterval);
  }, []);

  // Calculate total experience from work experience dates
  const calculateExperience = () => {
    const experiences = data.resume.experiences;
    let totalMonths = 0;
    
    experiences.forEach(exp => {
      const [startMonth, startYear] = exp.dates.split(' - ')[0].split(' ');
      const endDate = exp.dates.split(' - ')[1];
      
      const startDate = new Date(`${startMonth} 1, ${startYear}`);
      const endDateObj = endDate === 'Present' ? new Date() : new Date(`${endDate.split(' ')[0]} 1, ${endDate.split(' ')[1]}`);
      
      const diffTime = Math.abs(endDateObj - startDate);
      const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30));
      totalMonths += diffMonths;
    });
    
    const years = Math.floor(totalMonths / 12);
    const months = totalMonths % 12;
    
    if (years > 0 && months > 0) {
      return `${years}.${Math.round(months / 12 * 10)}+ Yrs`;
    } else if (years > 0) {
      return `${years}+ Yrs`;
    } else {
      return `${months}+ Mos`;
    }
  };

  // Map icon names to actual components
  const iconMap = {
    Code2,
    Palette,
    Zap,
    Award
  };

  // Transform stats from portfolio.json
  const stats = data.stats.map(stat => ({
    ...stat,
    icon: iconMap[stat.icon],
    value: stat.label === 'Experience' ? calculateExperience() : stat.value
  }));

  return (
    <section
      id="home"
      className="min-h-screen flex items-center justify-center px-6 relative py-32"
    >
      <div className="max-w-5xl w-full z-10">
        {/* Main Hero Card */}
        <motion.div
          className="bg-[#1E293B]/95 backdrop-blur-sm shadow-2xl overflow-hidden relative"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          style={{
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), 0 0 0 4px #4A9FD8',
          }}
        >
          {/* Decorative top border pixels */}
          <div className="h-2 bg-gradient-to-r from-[#FDB813] via-[#4A9FD8] to-[#5CC167]" />

          <div className="p-14 md:p-12 lg:p-16">
            {/* Top Section: Avatar + Main Content */}
            <div className="flex flex-row lg:flex-row gap-32 items-center mb-12">
              {/* Avatar with Level Badge */}
              <motion.div
                className="flex justify-start lg:justify-start"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="relative">
                  {/* Glow effect */}
                  <div
                    className="absolute -inset-4 blur-2xl opacity-40"
                    style={{
                      background:
                        'radial-gradient(circle, #FFC8DD 0%, #A3D8F4 50%, transparent 70%)',
                    }}
                  />
                  
                  <div className="relative">
                    <PixelAvatar />
                  </div>

                  {/* Level Badge */}
                  <motion.div
                    className="absolute -bottom-3 -right-3 bg-[#FDB813] px-4 py-2 shadow-lg"
                    initial={{ rotate: -8, scale: 0 }}
                    animate={{ rotate: -8, scale: 1 }}
                    transition={{ delay: 0.8, type: 'spring', stiffness: 200 }}
                    style={{
                      boxShadow: '4px 4px 0 rgba(0, 0, 0, 0.2)',
                    }}
                  >
                    <div className="text-left">
                      <div className="pixel-font text-[8px] text-[#1B1B1B]">
                        LVL
                      </div>
                      <div className="pixel-font text-[18px] text-[#1B1B1B] leading-none">
                        99
                      </div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>

              {/* Text Content */}
              <motion.div
                className="space-y-6 text-left lg:text-left"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                {/* Greeting */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <p className="pixel-font text-[12px] text-[#F7F7F7]/80 mb-4">
                    {'>'} Hi, I&apos;m Mandar Jadhav
                    <span className="blinking-cursor">_</span>
                  </p>
                </motion.div>

                {/* Title with Typing Effect */}
                <div>
                  <div className="flex items-center gap-3 justify-center lg:justify-start mb-2">
                    <p
                      className="pixel-font text-[#4A9FD8] leading-tight"
                      style={{
                        fontSize: 'clamp(1.2rem, 3vw, 1.8rem)',
                        textShadow: '0 0 20px rgba(74, 159, 216, 0.4)',
                      }}
                    >
                      {displayedText}
                    </p>
                  </div>
                  <p
                    className="pixel-font text-[#6BB8E8] leading-tight"
                    style={{
                      fontSize: 'clamp(1rem, 2.5vw, 1.5rem)',
                    }}
                  >
                    & UI Enthusiast
                  </p>
                </div>

                {/* Description */}
                <p className="text-[#F7F7F7]/70 max-w-xl mx-auto lg:mx-0 leading-relaxed text-sm">
                  Crafting beautiful, pixel-perfect web experiences with modern
                  technologies. Passionate about clean code and memorable digital
                  interactions.
                </p>

                {/* CTA Button */}
                <div className="pt-2">
                  <motion.button
                    className="pixel-font text-[12px] bg-[#FDB813] text-[#1B1B1B] px-10 py-4 transition-all duration-300 relative group overflow-hidden"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                      boxShadow: '6px 6px 0 rgba(0, 0, 0, 0.2)',
                    }}
                    onClick={() => {
                      const element = document.getElementById('work');
                      element?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    <span className="relative z-10">VIEW WORK</span>
                    <motion.div
                      className="absolute inset-0 bg-[#FDCB3E]"
                      initial={{ x: '-100%' }}
                      whileHover={{ x: 0 }}
                      transition={{ duration: 0.3 }}
                    />
                  </motion.button>
                </div>
              </motion.div>
            </div>

            {/* Divider */}
            <div className="h-[2px] bg-gradient-to-r from-transparent via-[#4A9FD8]/50 to-transparent mb-12" />

            {/* Stats Grid */}
            <div className="flex flex-1 gap-4 justify-around">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={stat.label}
                    className="bg-[#0F172A]/50 backdrop-blur-sm p-6 text-center group transition-all duration-300 w-64"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                    whileHover={{
                      y: -4,
                      boxShadow: `0 4px 20px ${stat.color}40`,
                    }}
                    style={{
                      border: `2px solid ${stat.color}40`,
                    }}
                  >
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    >
                      <Icon
                        size={28}
                        className="mx-auto mb-3"
                        style={{ color: stat.color }}
                      />
                    </motion.div>
                    <div
                      className="pixel-font mb-1"
                      style={{
                        fontSize: 'clamp(20px, 3vw, 28px)',
                        color: stat.color,
                        textShadow: `0 0 10px ${stat.color}60`,
                      }}
                    >
                      {stat.value}
                    </div>
                    <div className="pixel-font text-[9px] text-[#F7F7F7]/50 tracking-wider">
                      {stat.label}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Bottom decorative border */}
          <div className="h-2 bg-gradient-to-r from-[#5CC167] via-[#4A9FD8] to-[#FDB813]" />
        </motion.div>

        {/* Achievement Badge Below */}
        <motion.div
          className="mt-6 flex justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5 }}
        >
          <div
            className="bg-[#1E293B]/90 backdrop-blur-sm px-6 py-3 inline-flex items-center gap-3 shadow-lg"
            style={{
              border: '2px solid #FDB813',
            }}
          >
            <Award size={16} className="text-[#FDB813]" />
            <span className="pixel-font text-[9px] text-[#FDB813]">
              🏆 PORTFOLIO UNLOCKED
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default RetroHero;