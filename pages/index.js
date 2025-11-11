import {useRef, useEffect, useState} from 'react'
import {gsap} from 'gsap'
import {useGSAP} from '@gsap/react'
import {ScrollTrigger} from 'gsap/ScrollTrigger'
import Lenis from '@studio-freight/lenis'
import {useTheme} from 'next-themes'
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
	const {theme} = useTheme()
	const [mounted, setMounted] = useState(false)
	const textOne = useRef()
	const textTwo = useRef()
	const textThree = useRef()
	const textFour = useRef()
	const lenisRef = useRef(null)
	const isManualNavigation = useRef(false)

	useEffect(() => {
		setMounted(true)
	}, [])

	const isDark = mounted && (theme === 'dark' || (!theme && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches))

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
		// Set flag to prevent automatic horizontal scrolling
		isManualNavigation.current = true
		
		if (lenisRef.current && textOne.current) {
			const workSection = textOne.current
			const workCardsContainer = document.querySelector('.work-cards-container')
			
			// Get ScrollTrigger - try multiple ways to find it
			let scrollTrigger = ScrollTrigger.getById('work-horizontal-scroll')
			if (!scrollTrigger) {
				scrollTrigger = window.__workHorizontalScrollTrigger__
			}
			
			// STEP 1: Set flag FIRST, then disable ScrollTrigger
			// This prevents it from activating during scroll
			
			// Disable ScrollTrigger before doing anything
			if (scrollTrigger) {
				scrollTrigger.disable(false)
				scrollTrigger.progress(0)
				
				// Unpin immediately
				if (scrollTrigger.pinnedContainer) {
					gsap.set(scrollTrigger.pinnedContainer, { clearProps: "all" })
				}
				
				// Remove pin spacers
				const allPinSpacers = document.querySelectorAll('.pin-spacer')
				allPinSpacers.forEach(spacer => {
					const sectionInside = spacer.querySelector('.work-section-wrapper')
					if (sectionInside) {
						spacer.remove()
					}
				})
			}
			
			// Reset horizontal position immediately
			if (workCardsContainer) {
				gsap.set(workCardsContainer, { 
					x: 0, 
					immediateRender: true,
					clearProps: "transform"
				})
			}
			
			// Reset all cards
			const cards = workCardsContainer?.querySelectorAll('.work-card')
			if (cards) {
				cards.forEach(card => {
					gsap.set(card, { scale: 1, opacity: 1 })
				})
			}
			
			// STEP 2: Calculate position that keeps section top ABOVE viewport top
			// The ScrollTrigger starts at "top top" - when section.offsetTop === scrollY
			// So we need scrollY < section.offsetTop to prevent activation
			const sectionTop = workSection.offsetTop
			const sectionHeading = workSection.querySelector('.section-heading')
			
			// Find heading position
			let headingTop
			if (sectionHeading) {
				const headingRect = sectionHeading.getBoundingClientRect()
				headingTop = window.scrollY + headingRect.top
			} else {
				// Approximate heading position (inside section, after padding)
				headingTop = sectionTop + 100
			}
			
			// Calculate safe position: heading visible but section top still above viewport
			// We want: scrollY < sectionTop (to prevent trigger)
			// And: heading visible (scrollY + viewportHeight > headingTop)
			const viewportHeight = window.innerHeight
			const maxScrollForHeading = headingTop - viewportHeight + 200 // 200px buffer
			const maxScrollForTrigger = sectionTop - 50 // Stay 50px before trigger
			
			// Target position: show heading but don't trigger ScrollTrigger
			const targetPosition = Math.min(maxScrollForHeading, maxScrollForTrigger)
			
			// STEP 3: Completely disable ScrollTrigger and pause updates
			const st = ScrollTrigger.getById('work-horizontal-scroll')
			
			if (st) {
				// Kill it completely
				st.kill()
			}
			
			// Remove all pin spacers immediately
			const allPinSpacers = document.querySelectorAll('.pin-spacer')
			allPinSpacers.forEach(spacer => {
				const sectionInside = spacer.querySelector('.work-section-wrapper')
				if (sectionInside) {
					spacer.remove()
				}
			})
			
			// Reset horizontal immediately
			if (workCardsContainer) {
				gsap.set(workCardsContainer, { x: 0, clearProps: "transform" })
			}
			
			// Stop Lenis
			if (lenisRef.current) {
				lenisRef.current.stop()
			}
			
			// Calculate final safe scroll position
			// Must be less than sectionTop to prevent ScrollTrigger activation
			let finalSafePosition
			if (sectionHeading) {
				const headingRect = sectionHeading.getBoundingClientRect()
				const headingAbsTop = window.scrollY + headingRect.top
				// Position to show heading but keep section top above viewport
				finalSafePosition = Math.min(headingAbsTop - 120, sectionTop - 100)
			} else {
				finalSafePosition = sectionTop - 150
			}
			
			finalSafePosition = Math.max(0, finalSafePosition)
			
			// Jump to safe position immediately
			window.scrollTo({ top: finalSafePosition, behavior: 'auto' })
			
			// Wait a frame, then smooth scroll to heading
			requestAnimationFrame(() => {
				// Double-check ScrollTrigger is dead
				const checkSt = ScrollTrigger.getById('work-horizontal-scroll')
				if (checkSt) {
					checkSt.kill()
				}
				
				// Reset horizontal position
				if (workCardsContainer) {
					gsap.set(workCardsContainer, { x: 0 })
				}
				
				// Smooth scroll to heading position (still keeping section top above viewport)
				if (lenisRef.current && sectionHeading) {
					lenisRef.current.start()
					
					// Calculate heading position relative to current scroll
					const newHeadingRect = sectionHeading.getBoundingClientRect()
					const newHeadingTop = window.scrollY + newHeadingRect.top
					
					// Final position: show heading but ensure section top stays above viewport
					const headingTarget = newHeadingTop - 120
					const maxSafeScroll = sectionTop - 80 // Stay 80px before trigger
					const safeHeadingPos = Math.min(headingTarget, maxSafeScroll)
					
					lenisRef.current.scrollTo(safeHeadingPos, {
						duration: 0.6,
						offset: 0,
					})
				}
			})
			
			// STEP 4: Recreate ScrollTrigger ONLY when user manually scrolls
			let hasRecreated = false
			
			const recreateOnScroll = () => {
				if (!hasRecreated) {
					hasRecreated = true
					isManualNavigation.current = false
					
					// Clean up listeners
					window.removeEventListener('wheel', recreateOnScroll)
					window.removeEventListener('scroll', recreateOnScroll)
					window.removeEventListener('touchstart', recreateOnScroll)
					if (lenisRef.current) {
						lenisRef.current.off('scroll', recreateOnScroll)
					}
					
					// Recreate ScrollTrigger by calling setup function
					if (window.__setupWorkHorizontalScroll__) {
						setTimeout(() => {
							window.__setupWorkHorizontalScroll__()
							ScrollTrigger.refresh()
						}, 300)
					} else {
						ScrollTrigger.refresh()
					}
				}
			}
			
			// Listen for ANY user interaction to recreate
			window.addEventListener('wheel', recreateOnScroll, { once: true, passive: true })
			window.addEventListener('scroll', recreateOnScroll, { once: true, passive: true })
			window.addEventListener('touchstart', recreateOnScroll, { once: true, passive: true })
			
			if (lenisRef.current) {
				lenisRef.current.on('scroll', recreateOnScroll)
			}
			
			// Fallback: recreate after longer delay if no interaction
			setTimeout(() => {
				if (!hasRecreated) {
					recreateOnScroll()
				}
			}, 5000)
			
		} else if (textOne.current) {
			// Fallback to native scroll
			const scrollTrigger = ScrollTrigger.getById('work-horizontal-scroll')
			const workCardsContainer = document.querySelector('.work-cards-container')
			
			if (scrollTrigger) {
				scrollTrigger.disable()
				scrollTrigger.progress(0)
				if (workCardsContainer) {
					gsap.set(workCardsContainer, { x: 0 })
				}
			}
			
			// Scroll to section heading if available
			const sectionHeading = textOne.current.querySelector('.section-heading')
			const targetElement = sectionHeading || textOne.current
			
			targetElement.scrollIntoView({
				behavior: 'smooth',
				block: 'start'
			})
			
			setTimeout(() => {
				if (scrollTrigger) {
					scrollTrigger.enable()
					ScrollTrigger.refresh()
				}
				isManualNavigation.current = false
			}, 1000)
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
			let horizontalScrollAnimation = null
			
			const setupHorizontalScroll = () => {
				if (cards.length === 0) return
				
				if (horizontalScrollTrigger) {
					horizontalScrollTrigger.kill()
					horizontalScrollTrigger = null
				}
				
				if (horizontalScrollAnimation) {
					horizontalScrollAnimation.kill()
					horizontalScrollAnimation = null
				}
				
				setTimeout(() => {
					const cardWidth = cards[0]?.offsetWidth || 400
					const gap = 24
					const padding = window.innerWidth >= 1024 ? 96 : 64
					const totalWidth = (cardWidth + gap) * cards.length - gap + (padding * 2)
					
					workCardsContainer.style.width = `${totalWidth}px`
					
					const scrollDistance = Math.max(0, totalWidth - window.innerWidth)
					
					horizontalScrollAnimation = gsap.to(workCardsContainer, {
						x: -scrollDistance,
						ease: "none",
						scrollTrigger: {
							id: 'work-horizontal-scroll',
							trigger: workSection,
							start: "top top",
							end: () => `+=${scrollDistance || window.innerHeight}`,
							pin: true,
							pinSpacing: true,
							scrub: 1,
							invalidateOnRefresh: true,
							anticipatePin: 1,
							// Prevent activation if flag is set
							refreshPriority: 1,
							onEnter: (self) => {
								// Prevent activation during manual navigation
								if (isManualNavigation.current) {
									self.disable()
									self.progress(0)
									// Force unpin
									if (self.pinnedContainer) {
										gsap.set(self.pinnedContainer, { clearProps: "all" })
									}
									return false
								}
							},
							onEnterBack: (self) => {
								// Prevent activation during manual navigation
								if (isManualNavigation.current) {
									self.disable()
									self.progress(0)
									// Force unpin
									if (self.pinnedContainer) {
										gsap.set(self.pinnedContainer, { clearProps: "all" })
									}
									return false
								}
							},
							onUpdate: (self) => {
								// Skip updates during manual navigation
								if (isManualNavigation.current) {
									self.disable()
									self.progress(0)
									if (workCardsContainer) {
										gsap.set(workCardsContainer, { x: 0 })
									}
									return
								}
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
								// Reset cards when leaving section
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
								// Reset cards when leaving section backwards
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
					
					horizontalScrollTrigger = horizontalScrollAnimation.scrollTrigger
					
					// Store reference globally for easy access
					window.__workHorizontalScrollTrigger__ = horizontalScrollTrigger
					
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
									color: isDark ? 'white' : '#000000',
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
