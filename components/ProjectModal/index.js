import React, { useRef, useState } from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'

const ProjectModal = ({ isOpen, onClose, project }) => {
	const modalRef = useRef()
	const contentRef = useRef()
	const [currentImageIndex, setCurrentImageIndex] = useState(0)

	useGSAP(() => {
		if (isOpen) {
			// Set initial state
			gsap.set(modalRef.current, {
				opacity: 0,
				scale: 0.8,
				rotationX: 20
			})
			gsap.set(contentRef.current, {
				opacity: 0,
				y: 30
			})

			// Animate modal entrance
			gsap.to(modalRef.current, {
				opacity: 1,
				scale: 1,
				rotationX: 0,
				duration: 0.6,
				ease: "back.out(1.7)"
			})

			// Animate content entrance
			gsap.to(contentRef.current, {
				opacity: 1,
				y: 0,
				duration: 0.8,
				ease: "power3.out",
				delay: 0.2
			})
		} else {
			// Animate modal exit
			gsap.to(modalRef.current, {
				opacity: 0,
				scale: 0.8,
				rotationX: 20,
				duration: 0.4,
				ease: "power2.in"
			})
		}
	}, [isOpen])

	const handleBackdropClick = (e) => {
		if (e.target === e.currentTarget) {
			onClose()
		}
	}

	const nextImage = () => {
		if (project?.images && project.images.length > 1) {
			setCurrentImageIndex((prev) => (prev + 1) % project.images.length)
		}
	}

	const prevImage = () => {
		if (project?.images && project.images.length > 1) {
			setCurrentImageIndex((prev) => (prev - 1 + project.images.length) % project.images.length)
		}
	}

	if (!isOpen) return null

	return (
		<div 
			className="fixed inset-0 z-50 flex items-center justify-center p-4"
			onClick={handleBackdropClick}
		>
			{/* Fullscreen Blur Background */}
			<div className="absolute inset-0 bg-black/80 backdrop-blur-lg"></div>
			
			{/* Modal Content */}
			<div 
				ref={modalRef}
				className="relative w-full max-w-6xl max-h-[90vh] bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl overflow-hidden shadow-2xl"
			>
				{/* Close Button */}
				<button
					onClick={onClose}
					className="absolute top-6 right-6 z-10 w-10 h-10 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all duration-300"
				>
					<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>

				<div ref={contentRef} className="overflow-y-auto max-h-[90vh]">
					{/* Image Carousel */}
					<div className="relative h-80 md:h-96">
						<img
							src={project?.images?.[currentImageIndex] || project?.imageSrc}
							alt={project?.title}
							className="w-full h-full object-cover"
						/>
						
						{/* Image Navigation */}
						{project?.images && project.images.length > 1 && (
							<>
								<button
									onClick={prevImage}
									className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all duration-300"
								>
									<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
									</svg>
								</button>
								<button
									onClick={nextImage}
									className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all duration-300"
								>
									<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
									</svg>
								</button>
								
								{/* Image Indicators */}
								<div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
									{project.images.map((_, index) => (
										<button
											key={index}
											onClick={() => setCurrentImageIndex(index)}
											className={`w-2 h-2 rounded-full transition-all duration-300 ${
												index === currentImageIndex ? 'bg-white' : 'bg-white/40'
											}`}
										/>
									))}
								</div>
							</>
						)}
					</div>

					{/* Content */}
					<div className="p-8">
						{/* Title & Description */}
						<div className="mb-8">
							<h2 className="text-3xl md:text-4xl font-bold text-white mb-4 font-space-grotesk">
								{project?.title || 'Project Title'}
							</h2>
							<p className="text-lg text-white/80 leading-relaxed font-dm-sans mb-6">
								{project?.description || 'Project description goes here...'}
							</p>
							
							{/* Role */}
							{project?.role && (
								<div className="mb-6">
									<h3 className="text-lg font-semibold text-white mb-2 font-space-grotesk">Role</h3>
									<p className="text-white/70 font-dm-sans">{project.role}</p>
								</div>
							)}
						</div>

						{/* Technologies */}
						{project?.technologies && (
							<div className="mb-8">
								<h3 className="text-lg font-semibold text-white mb-4 font-space-grotesk">Technologies Used</h3>
								<div className="flex flex-wrap gap-3">
									{project.technologies.map((tech, index) => (
										<span
											key={index}
											className="px-4 py-2 bg-blue-500/20 backdrop-blur-sm border border-blue-400/30 rounded-full text-white font-medium hover:bg-blue-500/30 transition-all duration-300"
										>
											{tech}
										</span>
									))}
								</div>
							</div>
						)}

						{/* Links */}
						<div className="flex flex-wrap gap-4">
							{project?.liveUrl && (
								<a
									href={project.liveUrl}
									target="_blank"
									rel="noopener noreferrer"
									className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full text-white font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-300 hover:scale-105"
								>
									<svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
									</svg>
									Live Demo
								</a>
							)}
							
							{project?.githubUrl && (
								<a
									href={project.githubUrl}
									target="_blank"
									rel="noopener noreferrer"
									className="inline-flex items-center px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white font-semibold hover:bg-white/20 transition-all duration-300 hover:scale-105"
								>
									<svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
										<path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
									</svg>
									GitHub
								</a>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default ProjectModal
