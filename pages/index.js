import {useRef, useEffect} from 'react'
import {gsap} from 'gsap'
import {useGSAP} from '@gsap/react'
import {ScrollTrigger} from 'gsap/ScrollTrigger'
import Lenis from '@studio-freight/lenis'
import data from '../data/portfolio.json'
import Header from '../components/Header'
import HeroSection from '../components/HeroSection'
import WorkCard from '../components/WorkCard'
import FAB from '../components/FAB'
import CustomCursor from '../components/Cursor'
import PixelGridBackground from '../components/PixelGridBackground'
import Head from 'next/head'
import Footer from '../components/Footer'
import Socials from '../components/Socials'

// Register GSAP plugins
if (typeof window !== 'undefined') {
	gsap.registerPlugin(ScrollTrigger)
}

export default function Home() {
	const textOne = useRef()
	const textTwo = useRef()
	const textThree = useRef()
	const textFour = useRef()
	const lenisRef = useRef(null)

	// Access Lenis instance for smooth scrolling
	useEffect(() => {
		if (typeof window !== 'undefined') {
			// Access the global Lenis instance created in _app.js
			const getLenis = () => {
				if (window.__lenis__) {
					lenisRef.current = window.__lenis__
				} else {
					// Retry after a short delay if not ready yet
					setTimeout(getLenis, 50)
				}
			}
			getLenis()
		}
	}, [])

	const handleWorkScroll = () => {
		if (lenisRef.current && textOne.current) {
			lenisRef.current.scrollTo(textOne.current, {
				offset: -100,
				duration: 1.5,
			})
		} else if (textOne.current) {
			// Fallback to native scroll
			textOne.current.scrollIntoView({behavior: 'smooth'})
		}
	}

	const handleAboutScroll = () => {
		if (lenisRef.current && textTwo.current) {
			lenisRef.current.scrollTo(textTwo.current, {
				offset: -100,
				duration: 1.5,
			})
		} else if (textTwo.current) {
			// Fallback to native scroll
			textTwo.current.scrollIntoView({behavior: 'smooth'})
		}
	}

	useGSAP(() => {
		// Enhanced scroll parallax for hero section
		const heroElements = document.querySelectorAll('.hero-element')
		heroElements.forEach(element => {
			gsap.fromTo(element,
				{ y: 0 },
				{
					y: 100,
					ease: "none",
					scrollTrigger: {
						trigger: element,
						start: "top bottom",
						end: "bottom top",
						scrub: true
					}
				}
			)
		})

		// Rotating gradient text animation
		const gradientTexts = document.querySelectorAll('.gradient-text')
		gradientTexts.forEach(text => {
			gsap.to(text, {
				backgroundPosition: "200% center",
				ease: "none",
				scrollTrigger: {
					trigger: text,
					start: "top bottom",
					end: "bottom top",
					scrub: true
				}
			})
		})

		// Horizontal Scroll for Work Section
		const workSection = document.querySelector('.work-section-wrapper')
		const workCardsContainer = document.querySelector('.work-cards-container')
		
		if (workSection && workCardsContainer) {
			const cards = workCardsContainer.querySelectorAll('.work-card')
			let horizontalScrollTrigger = null
			
			const setupHorizontalScroll = () => {
				if (cards.length === 0) return
				
				if (horizontalScrollTrigger) {
					horizontalScrollTrigger.kill()
					horizontalScrollTrigger = null
				}
				
				setTimeout(() => {
					const cardWidth = cards[0]?.offsetWidth || 400
					const gap = 24
					const padding = window.innerWidth >= 1024 ? 96 : 64
					const totalWidth = (cardWidth + gap) * cards.length - gap + (padding * 2)
					
					workCardsContainer.style.width = `${totalWidth}px`
					
					const scrollDistance = Math.max(0, totalWidth - window.innerWidth)
					
					const horizontalScroll = gsap.to(workCardsContainer, {
						x: -scrollDistance,
						ease: "none",
						scrollTrigger: {
							trigger: workSection,
							start: "top top",
							end: () => `+=${scrollDistance || window.innerHeight}`,
							pin: true,
							pinSpacing: true,
							scrub: 1,
							invalidateOnRefresh: true,
							anticipatePin: 1,
							onUpdate: (self) => {
								const progress = self.progress
								cards.forEach((card, index) => {
									const cardCenter = (index + 0.5) / cards.length
									const distance = Math.abs(progress - cardCenter)
									const visibility = Math.max(0.4, 1 - distance * 2)
									
									gsap.to(card, {
										scale: 0.85 + (visibility * 0.15),
										opacity: visibility,
										duration: 0.1,
										ease: "none"
									})
								})
							},
							onLeave: () => {
								cards.forEach((card) => {
									gsap.to(card, {
										scale: 1,
										opacity: 1,
										duration: 0.3,
										ease: "power2.out"
									})
								})
							},
							onLeaveBack: () => {
								cards.forEach((card) => {
									gsap.to(card, {
										scale: 1,
										opacity: 1,
										duration: 0.3,
										ease: "power2.out"
									})
								})
							}
						}
					})
					
					horizontalScrollTrigger = horizontalScroll.scrollTrigger
					ScrollTrigger.refresh()
				}, 200)
			}
			
			setupHorizontalScroll()
			
			let resizeTimeout
			const handleResize = () => {
				clearTimeout(resizeTimeout)
				resizeTimeout = setTimeout(() => {
					setupHorizontalScroll()
					ScrollTrigger.refresh()
				}, 250)
			}
			
			window.addEventListener('resize', handleResize)
			
			gsap.utils.toArray(cards).forEach((card, index) => {
				gsap.set(card, { scale: 0.9, opacity: 0.6, x: 20 })
			})
			
			// Refresh ScrollTrigger after horizontal scroll is set up
			setTimeout(() => {
				ScrollTrigger.refresh()
			}, 500)
		}

		// Smooth fade-in for About section
		const aboutSection = document.querySelector('.about-section')
		if (aboutSection) {
			// Ensure section is visible by default
			gsap.set(aboutSection, { opacity: 1, y: 0 })
			
			// Wait for ScrollTrigger to be fully initialized
			setTimeout(() => {
				gsap.fromTo(aboutSection,
					{ opacity: 0, y: 60 },
					{
						opacity: 1,
						y: 0,
						duration: 1,
						ease: "power3.out",
						scrollTrigger: {
							trigger: aboutSection,
							start: "top 85%",
							end: "bottom 20%",
							toggleActions: "play none none reverse",
							refreshPriority: -1,
						}
					}
				)
				
				// Force refresh
				ScrollTrigger.refresh()
			}, 600)
		}

		// Smooth fade-in for Contact section
		const contactSection = document.querySelector('.contact-section')
		if (contactSection) {
			// Set initial state
			gsap.set(contactSection, { opacity: 0, y: 60 })
			
			gsap.to(contactSection, {
				opacity: 1,
				y: 0,
				duration: 1,
				ease: "power3.out",
				scrollTrigger: {
					trigger: contactSection,
					start: "top 80%",
					toggleActions: "play none none reverse"
				}
			})
		}

		// Liquid cursor effect
		const handleMouseMove = (e) => {
			document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`)
			document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`)
		}

		document.addEventListener('mousemove', handleMouseMove)

		return () => {
			document.removeEventListener('mousemove', handleMouseMove)
		}
	}, [])

	return (
		<div className={`relative ${data.showCursor && 'cursor-none'}`}>
			<Head>
				<title>{data.name}</title>
			</Head>
			{data.showCursor && <CustomCursor />}
			
			{/* Pixel Grid Background with floating blob */}
			<PixelGridBackground />
			
			<div className='gradient-circle'></div>
			<div className='gradient-circle-bottom'></div>
			
			{/* Content wrapper with proper z-index */}
			<div className='relative z-10'>

			<Header
				handleWorkScroll={handleWorkScroll}
				handleAboutScroll={handleAboutScroll}
			/>
			
			<HeroSection />

			{/* Work Section with Horizontal Scroll */}
			<div className='work-section-wrapper' ref={textOne}>
				<div className="work-section-inner">
					<div className="container mx-auto px-4 py-16">
						<h2 className="section-heading font-space-grotesk mb-8">Work.</h2>
					</div>
					<div className='work-cards-horizontal-scroll'>
						<div className='work-cards-container'>
							{data.projects.map((project, index) => (
								<WorkCard
									key={project.id}
									img={project.imageSrc}
									name={project.title}
									description={project.description}
									url={project.url}
								/>
							))}
						</div>
					</div>
				</div>
			</div>

			{/* About Section */}
			<div className='about-section' ref={textTwo}>
				<div className="container mx-auto px-4 py-16">
					<h2 className="section-heading font-space-grotesk">About.</h2>
					<div className='max-w-4xl mx-auto'>
						<p className='section-body mb-8 font-dm-sans'>{data.aboutParaLine1}</p>
						<p className='section-body font-dm-sans'>{data.aboutParaLine2}</p>
					</div>
				</div>
			</div>

			{/* Contact Section */}
			<div className='contact-section' ref={textThree}>
				<div className="container mx-auto px-4 py-16">
					<h2 className="section-heading font-space-grotesk">Contact.</h2>
					<div className='text-center max-w-2xl mx-auto'>
						<p className='section-body mb-8 font-dm-sans'>Let&apos;s work together on your next project.</p>
						<div className='flex flex-col tablet:flex-row gap-4 justify-center'>
							<a
								href={`mailto:${data.email}`}
								className='px-8 py-4 rounded-lg transition-all duration-300 font-medium font-dm-sans relative overflow-hidden backdrop-blur-[15px] border-2 hover:scale-105 hover:shadow-2xl'
								style={{
									background: `linear-gradient(135deg, var(--selected-color, #339AF0)20, var(--selected-color, #339AF0)40)`,
									borderColor: `var(--selected-color, #339AF0)`,
									color: 'white',
									boxShadow: `0 8px 25px rgba(var(--selected-color-rgb, 0, 0, 0), 0.3)`,
								}}
							>
								Get In Touch
							</a>
							<a
								href={data.socials.find(social => social.title === 'LinkedIn')?.link || '#'}
								target='_blank'
								rel='noopener noreferrer'
								className='contact-btn-secondary liquid-glass-btn px-8 py-4 rounded-lg transition-all duration-300 font-medium font-dm-sans'
							>
								LinkedIn
							</a>
						</div>
					</div>
				</div>
			</div>

			<FAB />
			</div>
		</div>
	)
}
