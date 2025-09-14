import { motion } from 'framer-motion';
import { useState, useMemo, useCallback } from 'react';
import data from '../../data/portfolio.json';

export default function CyberpunkAbout() {
  const [activeSkill, setActiveSkill] = useState(null);

  // Memoize skills data
  const skills = useMemo(() => [
    { name: 'React', level: 90, color: 'cyan' },
    { name: 'Next.js', level: 85, color: 'yellow' },
    { name: 'Three.js', level: 80, color: 'magenta' },
    { name: 'Vue.js', level: 75, color: 'cyan' },
    { name: 'JavaScript', level: 95, color: 'yellow' },
    { name: 'TailwindCSS', level: 90, color: 'magenta' },
    { name: 'GSAP', level: 70, color: 'cyan' },
    { name: 'Figma', level: 85, color: 'yellow' },
  ], []);

  // Optimize skill hover handlers
  const handleSkillHover = useCallback((skillName) => {
    setActiveSkill(skillName);
  }, []);

  const handleSkillLeave = useCallback(() => {
    setActiveSkill(null);
  }, []);


  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  return (
    <section className="py-24 px-6 bg-cyber-black relative overflow-hidden">
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header - CP77 Style */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="font-orbitron text-5xl md:text-6xl text-cyber-yellow mb-8">
            ABOUT
          </h2>
          <div className="w-24 h-1 bg-cyber-yellow mx-auto mb-8"></div>
        </motion.div>

        <motion.div
          className="max-w-4xl mx-auto text-center"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {/* About Content - CP77 Style */}
          <motion.div
            className="bg-cyber-yellow border-4 border-cyber-black p-8 mb-8"
            variants={itemVariants}
          >
            <h3 className="font-orbitron text-cyber-black text-2xl mb-6 font-bold">DEVELOPER PROFILE</h3>
            <div className="space-y-4 text-left">
              <p className="font-exo text-cyber-black text-lg leading-relaxed">
                {data.aboutParaLine1}
              </p>
              <p className="font-exo text-cyber-black text-lg leading-relaxed">
                {data.aboutParaLine2}
              </p>
              <p className="font-exo text-cyber-black text-lg leading-relaxed">
                {data.aboutParaLine3}
              </p>
            </div>
          </motion.div>

          {/* Skills Section - CP77 Style */}
          <motion.div
            className="bg-cyber-yellow border-4 border-cyber-black p-8"
            variants={itemVariants}
          >
            <h3 className="font-orbitron text-cyber-black text-2xl mb-6 font-bold">TECHNICAL SKILLS</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {skills.map((skill, index) => (
                <motion.div
                  key={skill.name}
                  className="bg-cyber-black border-2 border-cyber-black p-4 text-center hover:border-cyber-red transition-all duration-300"
                  onHoverStart={() => handleSkillHover(skill.name)}
                  onHoverEnd={handleSkillLeave}
                  whileHover={{ scale: 1.05 }}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <span className="font-exo text-cyber-yellow text-sm font-bold">{skill.name}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
