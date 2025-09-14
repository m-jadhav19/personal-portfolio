import { motion } from 'framer-motion';
import { useState, useMemo, useCallback } from 'react';
import data from '../../data/portfolio.json';

export default function CyberpunkContact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Memoize terminal output to prevent unnecessary re-renders
  const initialTerminalOutput = useMemo(() => [
    '> SYSTEM INITIALIZED',
    '> CONTACT TERMINAL READY',
    '> AWAITING INPUT...'
  ], []);
  
  const [terminalOutput, setTerminalOutput] = useState(initialTerminalOutput);

  // Optimize input change handler
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  // Optimize form submission
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate terminal processing with optimized updates
    const processingMessages = [
      '> PROCESSING REQUEST...',
      '> VALIDATING INPUT DATA...',
      '> CONNECTING TO SERVER...',
      '> MESSAGE TRANSMITTED SUCCESSFULLY!',
      '> THANK YOU FOR YOUR MESSAGE',
      '> SYSTEM READY FOR NEXT INPUT'
    ];
    
    // Batch state updates
    setTimeout(() => {
      setTerminalOutput(prev => [...prev, ...processingMessages]);
      setIsSubmitting(false);
      setFormData({ name: '', email: '', message: '' });
    }, 1000);
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
    hidden: { opacity: 0, y: 30 },
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
      {/* Background Elements */}
      <div className="absolute inset-0 cyberpunk-grid opacity-10"></div>
      
      {/* Circuit Pattern */}
      <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <linearGradient id="contactCircuitGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fcee09" stopOpacity="0.3" />
            <stop offset="50%" stopColor="#00f6ff" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#ff00ff" stopOpacity="0.3" />
          </linearGradient>
        </defs>
        <path
          d="M0,10 Q25,5 50,10 T100,10 M0,30 Q25,25 50,30 T100,30 M0,50 Q25,45 50,50 T100,50 M0,70 Q25,65 50,70 T100,70 M0,90 Q25,85 50,90 T100,90"
          stroke="url(#contactCircuitGradient)"
          strokeWidth="0.2"
          fill="none"
          className="circuit-line"
        />
      </svg>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Section Header - CP77 Style */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="font-orbitron text-5xl md:text-6xl text-cyber-yellow mb-8">
            CONTACT
          </h2>
          <div className="w-24 h-1 bg-cyber-yellow mx-auto mb-8"></div>
        </motion.div>

        <motion.div
          className="max-w-4xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {/* Contact Form - CP77 Style */}
          <motion.div
            className="bg-cyber-yellow border-4 border-cyber-black p-8"
            variants={itemVariants}
          >
            <h3 className="font-orbitron text-cyber-black text-2xl mb-6 font-bold">GET IN TOUCH</h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Field */}
              <div>
                <label className="block font-exo text-cyber-black text-sm mb-2 font-bold">
                  NAME
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full p-4 bg-cyber-white border-2 border-cyber-black text-cyber-black font-exo focus:outline-none focus:border-cyber-red transition-all duration-300"
                  placeholder="Your Name"
                />
              </div>

              {/* Email Field */}
              <div>
                <label className="block font-exo text-cyber-black text-sm mb-2 font-bold">
                  EMAIL
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full p-4 bg-cyber-white border-2 border-cyber-black text-cyber-black font-exo focus:outline-none focus:border-cyber-red transition-all duration-300"
                  placeholder="your.email@example.com"
                />
              </div>

              {/* Message Field */}
              <div>
                <label className="block font-exo text-cyber-black text-sm mb-2 font-bold">
                  MESSAGE
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows="5"
                  className="w-full p-4 bg-cyber-white border-2 border-cyber-black text-cyber-black font-exo focus:outline-none focus:border-cyber-red transition-all duration-300 resize-none"
                  placeholder="Your Message"
                />
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-8 py-4 font-orbitron uppercase bg-cyber-red text-cyber-white rounded-lg hover:bg-red-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isSubmitting ? 'SENDING...' : 'SEND MESSAGE'}
              </motion.button>
            </form>

            {/* Contact Info */}
            <div className="mt-8 pt-6 border-t-2 border-cyber-black">
              <h4 className="font-orbitron text-cyber-black text-lg mb-4 font-bold">CONTACT INFO</h4>
              <div className="space-y-2">
                <p className="font-exo text-cyber-black">
                  <span className="font-bold">Email:</span> {data.socials.find(s => s.title === 'Email')?.link.replace('mailto:', '')}
                </p>
                <p className="font-exo text-cyber-black">
                  <span className="font-bold">Status:</span> Available for collaboration
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
