/* eslint-disable @next/next/no-img-element */
import React, { useState, useRef } from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Modal from '../Modal'

// Register ScrollTrigger
if (typeof window !== 'undefined') {
	gsap.registerPlugin(ScrollTrigger)
}

const WorkCard = ({img, name, description, onClick, url, index, project}) => {
	const [isModalOpen, setIsModalOpen] = useState(false)
	const cardRef = useRef()
	const imageRef = useRef()
	const overlayRef = useRef()

	useGSAP(() => {
		// Set initial state
		gsap.set(cardRef.current, {
			opacity: 0,
			y: 60,
			scale: 0.9
		})

		// Animate card entrance with stagger
		gsap.to(cardRef.current, {
			opacity: 1,
			y: 0,
			scale: 1,
			duration: 0.8,
			ease: "power3.out",
			delay: index * 0.1,
			scrollTrigger: {
				trigger: cardRef.current,
				start: "top 85%",
				end: "bottom 15%",
				toggleActions: "play none none reverse"
			},
			onComplete: () => {
				// Fallback: ensure card is visible even if ScrollTrigger fails
				gsap.set(cardRef.current, { opacity: 1, y: 0, scale: 1 })
			}
		})

		// Fallback animation without ScrollTrigger
		setTimeout(() => {
			if (cardRef.current && gsap.getProperty(cardRef.current, "opacity") === 0) {
				gsap.to(cardRef.current, {
					opacity: 1,
					y: 0,
					scale: 1,
					duration: 0.8,
					ease: "power3.out",
					delay: index * 0.1
				})
			}
		}, 1000)

		// Hover animations with scale effect
		const handleMouseEnter = () => {
			gsap.to(cardRef.current, {
				scale: 1.05,
				duration: 0.4,
				ease: "power2.out"
			})
			gsap.to(imageRef.current, {
				scale: 1.1,
				duration: 0.4,
				ease: "power2.out"
			})
			gsap.to(overlayRef.current, {
				opacity: 1,
				duration: 0.3,
				ease: "power2.out"
			})
		}

		const handleMouseLeave = () => {
			gsap.to(cardRef.current, {
				scale: 1,
				duration: 0.4,
				ease: "power2.out"
			})
			gsap.to(imageRef.current, {
				scale: 1,
				duration: 0.4,
				ease: "power2.out"
			})
			gsap.to(overlayRef.current, {
				opacity: 0,
				duration: 0.3,
				ease: "power2.out"
			})
		}

		const cardElement = cardRef.current
		if (cardElement) {
			cardElement.addEventListener('mouseenter', handleMouseEnter)
			cardElement.addEventListener('mouseleave', handleMouseLeave)

			return () => {
				cardElement.removeEventListener('mouseenter', handleMouseEnter)
				cardElement.removeEventListener('mouseleave', handleMouseLeave)
			}
		}
	}, [index])

	const handleCardClick = () => {
		setIsModalOpen(true)
	}

	const closeModal = () => {
		setIsModalOpen(false)
	}

	return (
		<>
			<div
				ref={cardRef}
				className='group cursor-pointer'
				onClick={handleCardClick}
			>
				<div className='relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-0 transition-all duration-500 hover:bg-white/10 hover:border-blue-400/50 hover:shadow-2xl dark:bg-white/5 dark:border-white/10 light:bg-gray-100/80 light:border-gray-300/50'>
					{/* Image Container */}
					<div className='relative overflow-hidden rounded-t-2xl h-48'>
						<img
							ref={imageRef}
							alt={name}
							className='w-full h-full object-cover transition-all duration-500'
							src={img}
						/>
						
						{/* Glassmorphic Overlay */}
						<div 
							ref={overlayRef}
							className='absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent backdrop-blur-sm opacity-0 transition-opacity duration-300 flex items-end p-6'
						>
							<div className='text-white'>
								<h3 className='text-xl font-bold mb-2 font-space-grotesk'>{name ? name : 'Project Name'}</h3>
								<div className='flex flex-wrap gap-2'>
									{project?.technologies?.slice(0, 3).map((tech, idx) => (
										<span key={idx} className='px-2 py-1 bg-blue-500/20 backdrop-blur-sm border border-blue-400/30 rounded-full text-xs font-medium'>
											{tech}
										</span>
									))}
								</div>
							</div>
						</div>
					</div>

					{/* Content */}
					<div className='p-6'>
						<h3 className='text-lg font-bold text-white mb-2 font-space-grotesk'>{name ? name : 'Project Name'}</h3>
						<p className='text-white/70 text-sm leading-relaxed font-dm-sans'>{description ? description : 'Description'}</p>
					</div>
				</div>
			</div>

			{/* Modal */}
			<Modal
				isOpen={isModalOpen}
				onClose={closeModal}
				title={name}
				description={description}
				url={url}
			>
				<iframe
					src={url}
					title={name}
					loading="lazy"
					sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
				/>
			</Modal>
		</>
	)
}

export default WorkCard
