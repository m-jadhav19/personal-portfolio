import { useRef, useEffect, useState, useCallback } from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useTheme } from 'next-themes'
import data from '../data/portfolio.json'
import Header from '../components/Header'
import HeroSection from '../components/HeroSection'
import WorkCard from '../components/WorkCard'
import FAB from '../components/FAB'
import CustomCursor from '../components/Cursor'
import FluidDitherBackground from '../components/FluidDitherBackground'
import Head from 'next/head'
import Footer from '../components/Footer'

// Register GSAP plugins once at module level
if (typeof window !== 'undefined') {
	gsap.registerPlugin(ScrollTrigger)
}

export default function Home() {
	const { theme } = useTheme()
	const [mounted, setMounted] = useState(false)
	
	// Section refs for programmatic scrolling
	const workSectionRef = useRef(null)
	const aboutSectionRef = useRef(null)

	// Carousel state — use a ref for the index so GSAP callbacks
	// always see the latest value WITHOUT triggering re-renders/re-runs.
	const activeIndexRef = useRef(0)
	const [activeDisplay, setActiveDisplay] = useState(0) // display-only (buttons)
	const autoPlayTimerRef = useRef(null)
	const isHoveringCarousel = useRef(false)

	// Lenis ref
	const lenisRef = useRef(null)

	useEffect(() => {
		setMounted(true)
	}, [])

	const isDark = mounted && (theme === 'dark' || (!theme && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches))

	// Grab the Lenis instance set up in _app.js
	useEffect(() => {
		if (typeof window === 'undefined') return
		const poll = () => {
			if (window.__lenis__) {
				lenisRef.current = window.__lenis__
			} else {
				setTimeout(poll, 50)
			}
		}
		poll()
	}, [])

	// ─── Navigation helpers ───────────────────────────────────────────────────
	const handleWorkScroll = () => {
		const target = workSectionRef.current
		if (!target) return
		if (lenisRef.current) {
			lenisRef.current.scrollTo(target, { offset: -80, duration: 1.2 })
		} else {
			target.scrollIntoView({ behavior: 'smooth' })
		}
	}

	const handleAboutScroll = () => {
		const target = aboutSectionRef.current
		if (!target) return
		if (lenisRef.current) {
			lenisRef.current.scrollTo(target, { offset: -80, duration: 1.2 })
		} else {
			target.scrollIntoView({ behavior: 'smooth' })
		}
	}

	// ─── Carousel logic ───────────────────────────────────────────────────────
	// Core GSAP-only carousel updater — no React state involved.
	// This is safe to call from timers, GSAP, and button handlers.
	const goToSlide = useCallback((newIndex) => {
		const total = data.projects.length
		const idx = ((newIndex % total) + total) % total // safe modulo

		const cards = document.querySelectorAll('.work-carousel-card')
		if (!cards.length) return

		cards.forEach((card, i) => {
			let diff = i - idx
			while (diff > total / 2) diff -= total
			while (diff < -total / 2) diff += total

			const absDiff = Math.abs(diff)
			const isActive = absDiff < 0.1

			gsap.to(card, {
				x: diff * 340,
				z: isActive ? 0 : -280 - absDiff * 80,
				rotationY: diff * 40,
				opacity: Math.max(0, 1 - absDiff * 0.45),
				scale: isActive ? 1 : Math.max(0.5, 0.82 - absDiff * 0.05),
				duration: 0.75,
				ease: 'power3.out',
				pointerEvents: isActive ? 'auto' : 'none',
				zIndex: Math.round(100 - absDiff * 10),
				overwrite: true,
			})
		})

		activeIndexRef.current = idx
		setActiveDisplay(idx)
	}, [])

	const goPrev = useCallback(() => {
		goToSlide(activeIndexRef.current - 1)
	}, [goToSlide])

	const goNext = useCallback(() => {
		goToSlide(activeIndexRef.current + 1)
	}, [goToSlide])

	// Auto-play
	const stopAutoPlay = useCallback(() => {
		if (autoPlayTimerRef.current) {
			clearInterval(autoPlayTimerRef.current)
			autoPlayTimerRef.current = null
		}
	}, [])

	const startAutoPlay = useCallback(() => {
		stopAutoPlay()
		autoPlayTimerRef.current = setInterval(() => {
			if (!isHoveringCarousel.current) {
				goToSlide(activeIndexRef.current + 1)
			}
		}, 4500)
	}, [goToSlide, stopAutoPlay])

	// Mount auto-play once — independent of any state changes
	useEffect(() => {
		startAutoPlay()
		return () => stopAutoPlay()
	}, [startAutoPlay, stopAutoPlay])

	// ─── GSAP Animations (one-time setup) ────────────────────────────────────
	// IMPORTANT: empty dependency array [] so this NEVER re-runs on state changes.
	useGSAP(() => {
		// Hero parallax
		document.querySelectorAll('.hero-element').forEach(el => {
			gsap.fromTo(el,
				{ y: 0 },
				{
					y: 80,
					ease: 'none',
					scrollTrigger: {
						trigger: el,
						start: 'top bottom',
						end: 'bottom top',
						scrub: true,
					},
				}
			)
		})

		// Gradient text shimmer on scroll
		document.querySelectorAll('.gradient-text').forEach(el => {
			gsap.to(el, {
				backgroundPosition: '200% center',
				ease: 'none',
				scrollTrigger: {
					trigger: el,
					start: 'top bottom',
					end: 'bottom top',
					scrub: true,
				},
			})
		})

		// About section fade-in
		const about = document.querySelector('.about-section')
		if (about) {
			gsap.fromTo(about, { opacity: 0, y: 50 }, {
				opacity: 1, y: 0, duration: 1,
				ease: 'power3.out',
				scrollTrigger: {
					trigger: about,
					start: 'top 85%',
					toggleActions: 'play none none reverse',
				},
			})
		}

		// Contact section fade-in
		const contact = document.querySelector('.contact-section')
		if (contact) {
			gsap.fromTo(contact, { opacity: 0, y: 50 }, {
				opacity: 1, y: 0, duration: 1,
				ease: 'power3.out',
				scrollTrigger: {
					trigger: contact,
					start: 'top 80%',
					toggleActions: 'play none none reverse',
				},
			})
		}

		// Mouse-position custom cursor helper
		const onMouseMove = (e) => {
			document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`)
			document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`)
		}
		document.addEventListener('mousemove', onMouseMove)

		// Initial carousel positioning (no animation)
		const initCards = document.querySelectorAll('.work-carousel-card')
		const total = initCards.length
		initCards.forEach((card, i) => {
			const diff = i - 0
			const absDiff = Math.abs(diff)
			const isActive = absDiff < 0.1
			gsap.set(card, {
				x: diff * 340,
				z: isActive ? 0 : -280 - absDiff * 80,
				rotationY: diff * 40,
				opacity: Math.max(0, 1 - absDiff * 0.45),
				scale: isActive ? 1 : Math.max(0.5, 0.82 - absDiff * 0.05),
				pointerEvents: isActive ? 'auto' : 'none',
				zIndex: Math.round(100 - absDiff * 10),
			})
		})

		return () => {
			document.removeEventListener('mousemove', onMouseMove)
		}
	}, []) // ← empty array: set up once, never torn down by state changes

	// ─── JSX ─────────────────────────────────────────────────────────────────
	const total = data.projects.length

	return (
		<div className={`relative ${data.showCursor && 'cursor-none'}`}>
			<Head>
				<title>{data.name}</title>
			</Head>

			{data.showCursor && <CustomCursor />}
			<FluidDitherBackground />

			<div className='relative z-10'>
				<Header
					handleWorkScroll={handleWorkScroll}
					handleAboutScroll={handleAboutScroll}
				/>

				{/* Hero */}
				<div>
					<HeroSection />
				</div>

				{/* ── Work Section ───────────────────────────────────────── */}
				<div className='work-section-wrapper' ref={workSectionRef}>
					<div className='container mx-auto px-16 py-10'>
						{/* Title */}
						<h2 className='section-heading font-space-grotesk mb-6'>Work.</h2>

						{/* 3-D Carousel stage — large click zones at edges */}
						<div
							className='relative h-[460px] flex items-center'
							style={{ perspective: '1100px' }}
							onMouseEnter={() => { isHoveringCarousel.current = true }}
							onMouseLeave={() => { isHoveringCarousel.current = false }}
						>
							{/* Prev button — tall click zone on far left */}
							<button
								onClick={goPrev}
								className='absolute left-0 z-20 h-full w-14 flex items-center justify-center transition-all duration-300 group/btn hover:bg-white/5 rounded-xl'
								aria-label='Previous project'
							>
								<div
									className='w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-300 group-hover/btn:scale-110'
									style={{ borderColor: 'var(--selected-color, #339AF0)' }}
								>
									<svg className='w-5 h-5 group-hover/btn:-translate-x-0.5 transition-transform' fill='none' stroke='currentColor' viewBox='0 0 24 24' style={{ color: 'var(--selected-color, #339AF0)' }}>
										<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 19l-7-7 7-7' />
									</svg>
								</div>
							</button>

							{/* Cards */}
							<div
								className='relative w-full max-w-lg mx-auto h-full flex items-center justify-center'
								style={{ transformStyle: 'preserve-3d' }}
							>
								{data.projects.map((project, index) => (
									<div
										key={index}
										className='work-carousel-card absolute w-full will-change-transform'
										style={{ transformStyle: 'preserve-3d', opacity: 0 }}
									>
										<WorkCard
											img={project.imageSrc}
											name={project.title}
											description={project.description}
											url={project.url}
											tags={project.tags}
										/>
									</div>
								))}
							</div>

							{/* Next button — tall click zone on far right */}
							<button
								onClick={goNext}
								className='absolute right-0 z-20 h-full w-14 flex items-center justify-center transition-all duration-300 group/btn hover:bg-white/5 rounded-xl'
								aria-label='Next project'
							>
								<div
									className='w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-300 group-hover/btn:scale-110'
									style={{ borderColor: 'var(--selected-color, #339AF0)' }}
								>
									<svg className='w-5 h-5 group-hover/btn:translate-x-0.5 transition-transform' fill='none' stroke='currentColor' viewBox='0 0 24 24' style={{ color: 'var(--selected-color, #339AF0)' }}>
										<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5l7 7-7 7' />
									</svg>
								</div>
							</button>
						</div>

						{/* Dot indicators — centered below */}
						<div className='flex justify-center gap-2 mt-6'>
							{Array.from({ length: total }).map((_, i) => (
								<button
									key={i}
									onClick={() => goToSlide(i)}
									className='rounded-full transition-all duration-300'
									style={{
										width:  i === activeDisplay ? '20px' : '8px',
										height: '8px',
										background: i === activeDisplay
											? 'var(--selected-color, #339AF0)'
											: 'rgba(128,128,128,0.4)',
									}}
								/>
							))}
						</div>
					</div>
				</div>

				{/* ── About Section ──────────────────────────────────────── */}
				<div className='about-section' ref={aboutSectionRef}>
					<div className='container mx-auto px-4 py-10'>
						<h2 className='section-heading font-space-grotesk'>About.</h2>
						<div className='max-w-4xl mx-auto'>
							<p className='section-body mb-6 font-dm-sans'>{data.aboutParaLine1}</p>
							<p className='section-body font-dm-sans'>{data.aboutParaLine2}</p>
						</div>
					</div>
				</div>

				{/* ── Contact Section ────────────────────────────────────── */}
				<div className='contact-section'>
					<div className='container mx-auto px-4 py-10 text-center'>
						<h2 className='section-heading font-space-grotesk'>Contact.</h2>
						<div className='max-w-2xl mx-auto'>
							<p className='section-body mb-6 font-dm-sans'>Let&apos;s work together on your next project.</p>
							<div className='flex flex-col tablet:flex-row gap-4 justify-center'>
								<a
									href={`mailto:${data.email}`}
									className='px-8 py-4 rounded-lg transition-all duration-300 font-medium font-dm-sans border-2 hover:scale-105 hover:shadow-2xl'
									style={{
										background: 'var(--selected-color, #339AF0)20',
										borderColor: 'var(--selected-color, #339AF0)',
										color: isDark ? 'white' : '#1a1a1a',
										boxShadow: '0 8px 25px rgba(var(--selected-color-rgb, 51, 154, 240), 0.3)',
									}}
								>
									Get In Touch
								</a>
								<a
									href={data.socials?.find(s => s.title === 'LinkedIn')?.link || '#'}
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

				<Footer />
				<FAB />
			</div>
		</div>
	)
}
