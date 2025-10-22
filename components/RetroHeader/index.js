import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
      
      // Update active section based on scroll position
      const sections = ['home', 'work', 'about', 'contact'];
      const scrollPosition = window.scrollY + 200;
      
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setMobileMenuOpen(false);
    }
  };

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'work', label: 'Work' },
    { id: 'about', label: 'About' },
    { id: 'contact', label: 'Contact' },
  ];

  return (
    <>
      {/* Desktop Navigation */}
      <motion.header
        className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-2xl hidden laptop:block"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.nav
          className="pixel-font text-[10px] bg-white/95 backdrop-blur-sm rounded-full px-6 lg:px-8 py-4 flex items-center justify-center gap-4 lg:gap-8 shadow-lg"
          style={{
            border: '3px solid #4A9FD8',
          }}
          animate={{
            boxShadow: scrolled
              ? '0 8px 30px rgba(74, 159, 216, 0.3)'
              : '0 4px 15px rgba(74, 159, 216, 0.2)',
          }}
        >
          {navLinks.map((link) => (
            <motion.button
              key={link.id}
              onClick={() => scrollToSection(link.id)}
              className={`relative px-3 lg:px-4 py-2 transition-colors duration-300 ${
                activeSection === link.id
                  ? 'text-[#4A9FD8]'
                  : 'text-[#1E293B] hover:text-[#FDB813]'
              }`}
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              {link.label}
              {activeSection === link.id && (
                <motion.div
                  className="absolute -bottom-1 left-0 right-0 h-[3px] bg-[#4A9FD8]"
                  layoutId="activeIndicator"
                  style={{ boxShadow: '0 0 8px rgba(74, 159, 216, 0.6)' }}
                />
              )}
              
              {/* Pixel decoration on hover */}
              <motion.div
                className="absolute -top-1 -right-1 w-2 h-2 bg-[#FDB813]"
                initial={{ opacity: 0, scale: 0 }}
                whileHover={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
              />
            </motion.button>
          ))}
        </motion.nav>
      </motion.header>

      {/* Mobile Navigation */}
      <motion.header
        className="fixed top-0 left-0 right-0 z-50 laptop:hidden bg-white/95 backdrop-blur-sm shadow-lg"
        style={{ borderBottom: '3px solid #4A9FD8' }}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between px-6 py-4">
          <motion.div
            className="pixel-font text-[12px] text-[#4A9FD8]"
            style={{ textShadow: '0 0 10px rgba(74, 159, 216, 0.3)' }}
            whileHover={{ scale: 1.05 }}
          >
            MJ.DEV
          </motion.div>

          <motion.button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-[#1E293B] hover:text-[#4A9FD8] transition-colors"
            whileTap={{ scale: 0.95 }}
            style={{ border: '2px solid #4A9FD8' }}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </motion.button>
        </div>

        {/* Mobile Menu Dropdown */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              className="bg-white/98 backdrop-blur-sm"
              style={{ borderTop: '2px solid #4A9FD8' }}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="px-6 py-4 space-y-2">
                {navLinks.map((link, index) => (
                  <motion.button
                    key={link.id}
                    onClick={() => scrollToSection(link.id)}
                    className={`w-full text-left px-4 py-3 pixel-font text-[11px] transition-all duration-300 ${
                      activeSection === link.id
                        ? 'bg-[#4A9FD8] text-white'
                        : 'bg-[#4A9FD8]/10 text-[#1E293B] hover:bg-[#4A9FD8]/20'
                    }`}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="flex items-center justify-between">
                      {link.label}
                      {activeSection === link.id && (
                        <motion.div
                          className="w-2 h-2 bg-white"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                        />
                      )}
                    </span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>
    </>
  );
}

export default Header;