import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Github, Award } from 'lucide-react';
import { useEffect } from 'react';
import Image from 'next/image';

export function ProjectModal({ project, onClose }) {
  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (project) {
      // Disable body scroll
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = '0px'; // Prevent layout shift
    } else {
      // Re-enable body scroll
      document.body.style.overflow = 'unset';
      document.body.style.paddingRight = '0px';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
      document.body.style.paddingRight = '0px';
    };
  }, [project]);

  if (!project) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-[#FAFBFB] backdrop-blur-sm max-w-5xl w-full relative overflow-hidden shadow-2xl"
          initial={{ scale: 0.9, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 50 }}
          transition={{ type: 'spring', damping: 25 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            border: '4px solid #4A9FD8',
          }}
        >
          {/* Top Accent Bar */}
          <div className="h-2 bg-gradient-to-r from-[#FDB813] via-[#4A9FD8] to-[#5CC167]" />

          {/* Header */}
          <div className="bg-[#1E293B]/95 px-6 md:px-8 py-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-[#FDB813]" />
              <div className="w-3 h-3 bg-[#4A9FD8]" />
              <div className="w-3 h-3 bg-[#5CC167]" />
              <span className="pixel-font text-[11px] text-white ml-2">
                PROJECT_DETAILS.EXE
              </span>
            </div>
            <motion.button
              onClick={onClose}
              className="text-white hover:text-[#FDB813] transition-colors p-2 hover:bg-white/10 rounded"
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
            >
              <X size={22} />
            </motion.button>
          </div>

          {/* Content */}
          <div className="p-8 md:p-10 max-h-[85vh] overflow-y-auto">
            <div className="flex flex-row md:flex-row gap-10">
              {/* Left: Image */}
              <motion.div
                className="relative"
                initial={{ x: -30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <div className="relative overflow-hidden w-[500px] h-[350px]" style={{ border: '3px solid #4A9FD8' }}>
                  <Image
                    src={project.image}
                    alt={project.title}
                    width={500}
                    height={350}
                    className="w-[500px] h-[350px] object-cover"
                  />
                  {/* Corner Decorations */}
                  <div className="absolute top-0 left-0 w-4 h-4 bg-[#FDB813]" />
                  <div className="absolute top-0 right-0 w-4 h-4 bg-[#FDB813]" />
                  <div className="absolute bottom-0 left-0 w-4 h-4 bg-[#5CC167]" />
                  <div className="absolute bottom-0 right-0 w-4 h-4 bg-[#5CC167]" />
                </div>

                {/* Featured Badge */}
                {project.featured && (
                  <motion.div
                    className="mt-4 bg-[#FDB813] px-4 py-2 inline-flex items-center gap-2"
                    initial={{ scale: 0, rotate: -5 }}
                    animate={{ scale: 1, rotate: -3 }}
                    transition={{ delay: 0.4, type: 'spring' }}
                  >
                    <Award size={16} className="text-[#1B1B1B]" />
                    <span className="pixel-font text-[9px] text-[#1B1B1B]">
                      ⭐ FEATURED PROJECT
                    </span>
                  </motion.div>
                )}
              </motion.div>

              {/* Right: Details */}
              <motion.div
                className="space-y-6"
                initial={{ x: 30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {/* Title */}
                <div>
                  <h2
                    className="pixel-font text-[#1E293B] leading-tight mb-3"
                    style={{
                      fontSize: 'clamp(1.4rem, 3vw, 1.8rem)',
                      textShadow: '2px 2px 0 rgba(74, 159, 216, 0.2)',
                    }}
                  >
                    {project.title}
                  </h2>
                </div>

                {/* Description */}
                <div className="space-y-3">
                  <h3 className="pixel-font text-[10px] text-[#1E293B]/60 tracking-wider">
                    DESCRIPTION
                  </h3>
                  <p className="text-[#1E293B]/80 leading-relaxed text-sm">
                    {project.description}
                  </p>
                  <p className="text-[#1E293B]/70 text-sm leading-relaxed">
                    This project showcases modern web development techniques combined
                    with retro aesthetics, creating a unique user experience that stands
                    out from the crowd.
                  </p>
                </div>

                {/* Technologies */}
                <div className="space-y-3">
                  <h3 className="pixel-font text-[10px] text-[#1E293B]/60 tracking-wider">
                    TECHNOLOGIES
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag, index) => (
                      <motion.span
                        key={tag}
                        className="pixel-font text-[9px] bg-[#4A9FD8] text-white px-4 py-2 shadow-sm"
                        initial={{ scale: 0, rotate: -5 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: 0.5 + index * 0.1, type: 'spring' }}
                        whileHover={{
                          scale: 1.1,
                          backgroundColor: '#FDB813',
                          color: '#1B1B1B',
                        }}
                      >
                        {tag}
                      </motion.span>
                    ))}
                  </div>
                </div>

                {/* Project Stats */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Status', value: 'Complete' },
                    { label: 'Year', value: '2024' },
                    { label: 'Type', value: 'Web App' },
                  ].map((stat, index) => (
                    <motion.div
                      key={stat.label}
                      className="bg-[#4A9FD8]/10 p-3 text-center border border-[#4A9FD8]/30"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                      whileHover={{
                        backgroundColor: 'rgba(74, 159, 216, 0.2)',
                        borderColor: 'rgba(74, 159, 216, 0.6)',
                      }}
                    >
                      <div className="pixel-font text-[8px] text-[#1E293B]/60 mb-1">
                        {stat.label}
                      </div>
                      <div className="pixel-font text-[10px] text-[#4A9FD8]">
                        {stat.value}
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <motion.a
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 pixel-font text-[11px] bg-[#4A9FD8] text-white px-6 py-4 text-center flex items-center justify-center gap-2 shadow-lg"
                    whileHover={{
                      backgroundColor: '#FDB813',
                      color: '#1B1B1B',
                      y: -2,
                      boxShadow: '0 8px 20px rgba(253, 184, 19, 0.4)',
                    }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <ExternalLink size={14} />
                    VIEW LIVE
                  </motion.a>
                  <motion.a
                    href="#"
                    className="flex-1 pixel-font text-[11px] bg-[#1E293B] text-white px-6 py-4 text-center flex items-center justify-center gap-2 shadow-lg"
                    whileHover={{
                      backgroundColor: '#5CC167',
                      y: -2,
                      boxShadow: '0 8px 20px rgba(92, 193, 103, 0.4)',
                    }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Github size={14} />
                    SOURCE
                  </motion.a>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Bottom Accent Bar */}
          <div className="h-2 bg-gradient-to-r from-[#5CC167] via-[#4A9FD8] to-[#FDB813]" />

          {/* Decorative Corner Pixels */}
          <motion.div
            className="absolute top-20 right-4 w-3 h-3 bg-[#FDB813]"
            animate={{
              opacity: [0.5, 1, 0.5],
              scale: [1, 1.2, 1],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <motion.div
            className="absolute bottom-20 left-4 w-3 h-3 bg-[#5CC167]"
            animate={{
              opacity: [0.5, 1, 0.5],
              scale: [1, 1.2, 1],
            }}
            transition={{ duration: 2, repeat: Infinity, delay: 1 }}
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
