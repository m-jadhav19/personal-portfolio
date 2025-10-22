import { motion } from 'framer-motion';
import { Github, Linkedin, Twitter, Heart } from 'lucide-react';
import data from '../../data/portfolio.json';

export function RetroFooter() {
  const socialLinks = [
    { 
      icon: Github, 
      url: data.socials.find(s => s.title === 'Github')?.link || 'https://github.com', 
      label: 'GitHub' 
    },
    { 
      icon: Linkedin, 
      url: data.socials.find(s => s.title === 'LinkedIn')?.link || 'https://linkedin.com', 
      label: 'LinkedIn' 
    },
    { icon: Twitter, url: 'https://twitter.com', label: 'Twitter' },
  ];

  return (
    <footer className="relative z-10 bg-[#1E293B]/95 backdrop-blur-sm py-8 px-6" style={{ borderTop: '3px solid #4A9FD8' }}>
      <div className="max-w-6xl mx-auto">
        {/* Top Divider */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 h-[2px] bg-gradient-to-r from-transparent via-[#4A9FD8] to-[#4A9FD8]" />
          <motion.div 
            className="w-3 h-3 bg-[#FDB813]"
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          />
          <motion.div 
            className="w-3 h-3 bg-[#4A9FD8]"
            animate={{ rotate: -360 }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear', delay: 0.5 }}
          />
          <motion.div 
            className="w-3 h-3 bg-[#5CC167]"
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear', delay: 1 }}
          />
          <div className="flex-1 h-[2px] bg-gradient-to-l from-transparent via-[#4A9FD8] to-[#4A9FD8]" />
        </div>

        {/* Main Content */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Copyright */}
          <motion.div 
            className="pixel-font text-[10px] text-white text-center md:text-left"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <p className="flex items-center gap-2 justify-center md:justify-start">
              © 2025 Mandar Jadhav
              <span className="text-[#4A9FD8]">–</span>
              <span className="flex items-center gap-1">
                Crafted in Pixels
                <motion.span
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <Heart size={12} className="text-[#FDB813] fill-[#FDB813]" />
                </motion.span>
              </span>
            </p>
          </motion.div>

          {/* Social Icons */}
          <motion.div 
            className="flex gap-4"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            {socialLinks.map((link, index) => {
              const Icon = link.icon;
              return (
                <motion.a
                  key={link.label}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group p-2 bg-white/10 hover:bg-[#4A9FD8] transition-all duration-300 relative"
                  aria-label={link.label}
                  style={{ border: '2px solid #4A9FD8' }}
                  whileHover={{ 
                    y: -4, 
                    scale: 1.1,
                    boxShadow: '0 8px 20px rgba(74, 159, 216, 0.4)' 
                  }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Icon
                    size={16}
                    className="text-[#4A9FD8] group-hover:text-white transition-colors"
                  />
                  {/* Corner pixel */}
                  <motion.div
                    className="absolute -top-1 -right-1 w-2 h-2 bg-[#FDB813]"
                    initial={{ opacity: 0, scale: 0 }}
                    whileHover={{ opacity: 1, scale: 1 }}
                  />
                </motion.a>
              );
            })}
          </motion.div>
        </div>

        {/* Bottom Text */}
        <motion.div 
          className="mt-6 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <motion.p 
            className="pixel-font text-[8px] text-white/60"
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            PRESS START TO CONTINUE
          </motion.p>
        </motion.div>
      </div>
    </footer>
  );
}

export default RetroFooter;