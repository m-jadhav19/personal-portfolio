import { useState } from 'react';
import { motion } from 'framer-motion';
import { ProjectModal } from '../ProjectModal';
import { ImageWithFallback } from '../ImageWithFallback';
import { ExternalLink, Star } from 'lucide-react';
import data from '../../data/portfolio.json';

export function RetroWork() {
  const [selectedProject, setSelectedProject] = useState(null);

  // Transform portfolio data to match the expected format
  const projects = data.projects.map((project, index) => ({
    id: project.id,
    title: project.title,
    description: project.description,
    image: project.imageSrc,
    tags: getProjectTags(project.title, project.description),
    link: project.url,
    featured: index < 2, // Make first 2 projects featured
  }));

  // Helper function to generate tags based on project title and description
  function getProjectTags(title, description) {
    const tags = [];
    const text = `${title} ${description}`.toLowerCase();
    
    if (text.includes('three.js') || text.includes('3d')) tags.push('Three.js');
    if (text.includes('react')) tags.push('React');
    if (text.includes('next.js')) tags.push('Next.js');
    if (text.includes('vue')) tags.push('Vue.js');
    if (text.includes('javascript')) tags.push('JavaScript');
    if (text.includes('fabric')) tags.push('Fabric.js');
    if (text.includes('maptiler') || text.includes('map')) tags.push('Maps');
    if (text.includes('tailwind')) tags.push('Tailwind CSS');
    if (text.includes('css')) tags.push('CSS');
    if (text.includes('html')) tags.push('HTML');
    if (text.includes('web app') || text.includes('web application')) tags.push('Web App');
    
    // Default tags if none found
    if (tags.length === 0) {
      tags.push('Web Development', 'Frontend');
    }
    
    return tags.slice(0, 3); // Limit to 3 tags
  }

  return (
    <section id="work" className="min-h-screen py-24 px-6 relative z-0">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="inline-block mb-4"
            whileHover={{ scale: 1.05 }}
          >
            <h2
              className="pixel-font text-[#1E293B] leading-relaxed"
              style={{
                fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
                textShadow: '3px 3px 0 rgba(74, 159, 216, 0.3)',
              }}
            >
              Featured Work
            </h2>
          </motion.div>
          <p className="text-[#1E293B]/70 max-w-2xl mx-auto leading-relaxed">
            A collection of pixel-perfect creations showcasing my passion for retro design and modern development
          </p>
        </motion.div>

        {/* Project Grid */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, index) => (
            <motion.div
              key={project.id}
              className="group cursor-pointer"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              onClick={() => setSelectedProject(project)}
            >
              {/* Card Container */}
              <motion.div
                className="bg-white/95 backdrop-blur-sm overflow-hidden relative h-full flex flex-col shadow-lg min-h-[400px]"
                whileHover={{
                  y: -8,
                  boxShadow: '0 12px 30px rgba(0, 0, 0, 0.15)',
                }}
                transition={{ duration: 0.3 }}
                style={{
                  border: '3px solid #4A9FD8',
                }}
              >
                {/* Featured Badge */}
                {project.featured && (
                  <motion.div
                    className="absolute top-3 right-3 z-10 bg-[#FDB813] px-3 py-1 flex items-center gap-1 shadow-md"
                    initial={{ rotate: 0 }}
                    whileHover={{ rotate: -5, scale: 1.1 }}
                  >
                    <Star size={12} className="text-[#1B1B1B] fill-[#1B1B1B]" />
                    <span className="pixel-font text-[8px] text-[#1B1B1B]">FEATURED</span>
                  </motion.div>
                )}

                {/* Image Section */}
                <div className="relative h-48 overflow-hidden flex-shrink-0">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.4 }}
                    className="h-full"
                  >
                    <ImageWithFallback
                      src={project.image}
                      alt={project.title}
                      className="w-full h-full object-cover"
                    />
                  </motion.div>
                  
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1E293B]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* View Project Button on Hover */}
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    initial={{ scale: 0.8 }}
                    whileHover={{ scale: 1 }}
                  >
                    <div className="bg-[#4A9FD8] px-6 py-3 flex items-center gap-2 shadow-lg">
                      <ExternalLink size={14} className="text-white" />
                      <span className="pixel-font text-[10px] text-white">VIEW PROJECT</span>
                    </div>
                  </motion.div>

                  {/* Pixel Corner Decoration */}
                  <div className="absolute top-0 left-0 w-4 h-4 bg-[#FDB813]" />
                  <div className="absolute bottom-0 right-0 w-4 h-4 bg-[#5CC167]" />
                </div>

                {/* Content Section */}
                <div className="p-6 flex-1 flex flex-col">
                  <h3
                    className="pixel-font text-[#1E293B] mb-3 leading-relaxed group-hover:text-[#4A9FD8] transition-colors duration-300"
                    style={{
                      fontSize: 'clamp(0.85rem, 2vw, 1.05rem)',
                    }}
                  >
                    {project.title}
                  </h3>

                  <p className="text-[#1E293B]/70 text-sm line-clamp-3 mb-4 flex-1 leading-relaxed">
                    {project.description}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag) => (
                      <motion.span
                        key={tag}
                        className="pixel-font text-[8px] bg-[#4A9FD8]/10 text-[#4A9FD8] px-3 py-1 border border-[#4A9FD8]/30"
                        whileHover={{
                          backgroundColor: 'rgba(74, 159, 216, 0.2)',
                          borderColor: 'rgba(74, 159, 216, 0.6)',
                        }}
                      >
                        {tag}
                      </motion.span>
                    ))}
                  </div>
                </div>

                {/* Bottom Border Accent */}
                <div className="h-1 bg-gradient-to-r from-[#FDB813] via-[#4A9FD8] to-[#5CC167]" />
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Project Modal */}
      <ProjectModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
      />
    </section>
  );
}

export default RetroWork;