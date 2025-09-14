import { motion } from 'framer-motion';
import { useState, useCallback } from 'react';

export default function CP77Navigation({ handleWorkScroll, handleAboutScroll }) {
  const [activeSection, setActiveSection] = useState('home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Optimize scroll handlers
  const handleNavClick = useCallback((sectionId, action) => {
    setActiveSection(sectionId);
    action();
  }, []);

  const navItems = [
    { id: 'home', label: 'HOME', action: () => window.scrollTo({ top: 0, behavior: 'smooth' }) },
    { id: 'work', label: 'WORK', action: handleWorkScroll },
    { id: 'about', label: 'ABOUT', action: handleAboutScroll },
    { id: 'contact', label: 'CONTACT', action: () => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }) },
  ];

  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50 bg-cyber-yellow border-b-4 border-cyber-black"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo - CP77 Style */}
          <motion.div
            className="flex items-center space-x-3"
            whileHover={{ scale: 1.02 }}
          >
            <span className="font-orbitron text-cyber-black text-xl font-bold">
              MANDAR JADHAV
            </span>
          </motion.div>

          {/* Desktop Navigation - CP77 Style */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item, index) => (
              <motion.button
                key={item.id}
                className={`font-exo text-sm uppercase transition-all duration-300 relative text-cyber-black hover:text-cyber-red ${
                  activeSection === item.id ? 'text-cyber-red font-bold' : ''
                }`}
                onClick={() => handleNavClick(item.id, item.action)}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
              >
                {item.label}
                {activeSection === item.id && (
                  <motion.div
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-cyber-red"
                    layoutId="activeIndicator"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                )}
              </motion.button>
            ))}
          </div>

          {/* Social Links - CP77 Style */}
          <div className="hidden md:flex items-center space-x-4">
            <a href="#" className="text-cyber-black hover:text-cyber-red transition-colors">
              <span className="font-exo text-sm">TWITTER</span>
            </a>
            <a href="#" className="text-cyber-black hover:text-cyber-red transition-colors">
              <span className="font-exo text-sm">LINKEDIN</span>
            </a>
            <a href="#" className="text-cyber-black hover:text-cyber-red transition-colors">
              <span className="font-exo text-sm">GITHUB</span>
            </a>
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            className="md:hidden p-2 border border-cyber-yellow bg-cyber-black"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            whileTap={{ scale: 0.95 }}
          >
            <div className="w-6 h-6 flex flex-col justify-center space-y-1">
              <motion.div
                className="w-full h-0.5 bg-cyber-yellow"
                animate={{ rotate: isMenuOpen ? 45 : 0, y: isMenuOpen ? 6 : 0 }}
                transition={{ duration: 0.3 }}
              />
              <motion.div
                className="w-full h-0.5 bg-cyber-yellow"
                animate={{ opacity: isMenuOpen ? 0 : 1 }}
                transition={{ duration: 0.3 }}
              />
              <motion.div
                className="w-full h-0.5 bg-cyber-yellow"
                animate={{ rotate: isMenuOpen ? -45 : 0, y: isMenuOpen ? -6 : 0 }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </motion.button>
        </div>

        {/* Mobile Menu */}
        <motion.div
          className="md:hidden border-t border-cyber-yellow bg-cyber-black/95"
          initial={{ height: 0, opacity: 0 }}
          animate={{ 
            height: isMenuOpen ? 'auto' : 0, 
            opacity: isMenuOpen ? 1 : 0 
          }}
          transition={{ duration: 0.3 }}
        >
          <div className="py-4 space-y-4">
            {navItems.map((item, index) => (
              <motion.button
                key={item.id}
                className={`block w-full text-left font-vt323 text-sm uppercase py-2 px-4 transition-all duration-300 ${
                  activeSection === item.id 
                    ? 'text-cyber-yellow bg-cyber-gray/50 border-l-4 border-cyber-yellow' 
                    : 'text-cyber-cyan hover:text-cyber-yellow hover:bg-cyber-gray/30'
                }`}
                onClick={() => {
                  setActiveSection(item.id);
                  item.action();
                  setIsMenuOpen(false);
                }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: isMenuOpen ? 1 : 0, x: isMenuOpen ? 0 : -20 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                {item.label}
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>

      {/* HUD Decorative Elements */}
      <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyber-cyan"></div>
      <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyber-cyan"></div>
      
      {/* Scanline Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyber-yellow/10 to-transparent animate-scanline pointer-events-none"></div>
    </motion.nav>
  );
}
