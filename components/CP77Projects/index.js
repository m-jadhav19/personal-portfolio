import { motion } from 'framer-motion';
import { useState, useMemo, useCallback } from 'react';
import data from '../../data/portfolio.json';

export default function CP77Projects() {
  const [hoveredProject, setHoveredProject] = useState(null);

  // Memoize project data to prevent unnecessary re-renders
  const projects = useMemo(() => data.projects, []);

  // Optimize hover handlers
  const handleProjectHover = useCallback((projectId) => {
    setHoveredProject(projectId);
  }, []);

  const handleProjectLeave = useCallback(() => {
    setHoveredProject(null);
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

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
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
            PROJECTS
          </h2>
          <div className="w-24 h-1 bg-cyber-yellow mx-auto mb-8"></div>
        </motion.div>

        {/* Projects Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {projects.map((project, index) => (
            <motion.div
              key={project.id}
              className="group relative bg-cyber-yellow border-4 border-cyber-black overflow-hidden p-6 transition-all duration-300 hover:bg-cyber-darkYellow"
              variants={cardVariants}
              onHoverStart={() => handleProjectHover(project.id)}
              onHoverEnd={handleProjectLeave}
              whileHover={{ 
                scale: 1.02,
                y: -5
              }}
              transition={{ duration: 0.3 }}
            >
              {/* Project Title - CP77 Style */}
              <h3 className="font-orbitron text-cyber-black text-xl mb-4 font-bold">
                {project.title}
              </h3>

              {/* Project Description - CP77 Style */}
              <p className="font-exo text-cyber-black text-sm mb-6">
                {project.description}
              </p>

              {/* CTA Button - CP77 Style */}
              <motion.a
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-6 py-3 bg-cyber-red text-cyber-white font-orbitron text-sm uppercase rounded-lg hover:bg-red-700 transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                VIEW PROJECT
              </motion.a>

            </motion.div>
          ))}
        </motion.div>

        {/* Platform Availability - CP77 Style */}
        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          viewport={{ once: true }}
        >
          <h3 className="font-orbitron text-cyber-yellow text-2xl mb-8">AVAILABLE ON</h3>
          <div className="flex justify-center items-center gap-8">
            <div className="w-16 h-16 bg-cyber-white rounded-lg flex items-center justify-center border-2 border-cyber-yellow">
              <span className="font-orbitron text-cyber-black text-sm font-bold">WEB</span>
            </div>
            <div className="w-16 h-16 bg-cyber-white rounded-lg flex items-center justify-center border-2 border-cyber-yellow">
              <span className="font-orbitron text-cyber-black text-sm font-bold">MOBILE</span>
            </div>
            <div className="w-16 h-16 bg-cyber-white rounded-lg flex items-center justify-center border-2 border-cyber-yellow">
              <span className="font-orbitron text-cyber-black text-sm font-bold">DESKTOP</span>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
