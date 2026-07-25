import { useRef, useEffect, useState, useCallback, useMemo } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import data from '../../../data/portfolio.json'
import WorkCard from '../../WorkCard'

if (typeof window !== 'undefined') {
	gsap.registerPlugin(ScrollTrigger)
}

export default function WorkChapter() {
	const sectionRef = useRef(null)
	const headerRef = useRef(null)
	const carouselRef = useRef(null)
	const activeIndexRef = useRef(0)
	const [activeDisplay, setActiveDisplay] = useState(0)
	const carouselSpacingRef = useRef(340)

	const projects = useMemo(
		() => [...data.projects].sort((a, b) => Number(b.featured) - Number(a.featured)),
		[]
	)

	const total = projects.length
	const counterLabel = `${String(activeDisplay + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`
	const activeProject = projects[activeDisplay]

	const getCarouselSpacing = useCallback(() => {
		if (typeof window === 'undefined') return 340
		const card = sectionRef.current?.querySelector('.work-carousel-card')
		if (card?.offsetWidth) {
			return Math.min(340, card.offsetWidth + 24)
		}
		return Math.min(340, Math.max(260, window.innerWidth * 0.85))
	}, [])

	const isMobileViewport = useCallback(() => {
		return typeof window !== 'undefined' && window.innerWidth < 768
	}, [])

	const goToSlide = useCallback((newIndex) => {
		const idx = ((newIndex % total) + total) % total
		const cards = sectionRef.current?.querySelectorAll('.work-carousel-card')
		if (!cards?.length) return

		const spacing = carouselSpacingRef.current
		const mobile = isMobileViewport()

		cards.forEach((card, i) => {
			let diff = i - idx
			while (diff > total / 2) diff -= total
			while (diff < -total / 2) diff += total

			const absDiff = Math.abs(diff)
			const isActive = absDiff < 0.1

			gsap.to(card, {
				x: diff * spacing,
				z: isActive ? 0 : -280 - absDiff * 80,
				rotationY: mobile ? diff * 15 : diff * 40,
				opacity: mobile ? (isActive ? 1 : 0) : Math.max(0.2, 1 - absDiff * 0.35),
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
	}, [total, isMobileViewport])

	const goPrev = useCallback(() => {
		goToSlide(activeIndexRef.current - 1)
	}, [goToSlide])

	const goNext = useCallback(() => {
		goToSlide(activeIndexRef.current + 1)
	}, [goToSlide])

	useEffect(() => {
		const onResize = () => {
			carouselSpacingRef.current = getCarouselSpacing()
			goToSlide(activeIndexRef.current)
		}
		window.addEventListener('resize', onResize)
		return () => window.removeEventListener('resize', onResize)
	}, [getCarouselSpacing, goToSlide])

	useEffect(() => {
		const onKeyDown = (e) => {
			if (!sectionRef.current) return
			if (e.target.closest('input, textarea, select, [contenteditable="true"]')) return

			const rect = sectionRef.current.getBoundingClientRect()
			const inView = rect.top < window.innerHeight * 0.85 && rect.bottom > window.innerHeight * 0.15
			if (!inView) return

			if (e.key === 'ArrowLeft') {
				e.preventDefault()
				goPrev()
			}
			if (e.key === 'ArrowRight') {
				e.preventDefault()
				goNext()
			}
		}

		window.addEventListener('keydown', onKeyDown)
		return () => window.removeEventListener('keydown', onKeyDown)
	}, [goPrev, goNext])

	useGSAP(
		() => {
			carouselSpacingRef.current = getCarouselSpacing()
			requestAnimationFrame(() => goToSlide(0))

			const section = sectionRef.current
			const header = headerRef.current
			const carousel = carouselRef.current
			if (!section) return undefined

			const tl = gsap.timeline({
				scrollTrigger: {
					trigger: section,
					start: 'top 78%',
					toggleActions: 'play none none reverse',
				},
			})

			if (header) {
				tl.fromTo(header, { opacity: 0, y: 48 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' })
			}
			if (carousel) {
				tl.fromTo(
					carousel,
					{ opacity: 0, y: 64, scale: 0.96 },
					{ opacity: 1, y: 0, scale: 1, duration: 0.85, ease: 'power3.out' },
					'-=0.45'
				)
			}

			return undefined
		},
		{ scope: sectionRef, dependencies: [goToSlide, getCarouselSpacing] }
	)

	return (
		<section
			id="work"
			ref={sectionRef}
			className="work-chapter work-section-wrapper relative overflow-hidden py-16 tablet:py-24"
			data-chapter="work"
		>
			<div ref={headerRef} className="px-5 tablet:px-12 pt-4 pb-8 flex items-end justify-between gap-4">
				<div className="cinematic-section-header">
					<p className="font-label text-xs uppercase tracking-[0.32em] text-[var(--cinematic-accent)] mb-2">
						Selected Work
					</p>
					<h2 className="font-display text-4xl tablet:text-6xl font-extrabold">Projects.</h2>
				</div>
				<p className="font-label text-sm text-white/65 tracking-[0.2em] shrink-0" aria-live="polite">
					{counterLabel}
				</p>
			</div>

			{activeProject?.featured && (
				<div className="px-5 tablet:px-12 pb-4">
					<span className="project-card-tag inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-label uppercase tracking-wider">
						<span className="w-1.5 h-1.5 rounded-full bg-[var(--cinematic-accent)]" aria-hidden="true" />
						Featured project
					</span>
				</div>
			)}

			<div
				ref={carouselRef}
				className="relative w-full h-[400px] tablet:h-[480px] max-w-full flex items-center justify-center"
				style={{ perspective: '1100px' }}
				role="region"
				aria-label="Project carousel. Use arrow keys to navigate."
			>
				<button
					type="button"
					onClick={goPrev}
					className="work-carousel-btn absolute left-0 z-30 h-full w-20 tablet:w-32 flex items-center justify-center transition-all duration-300 group/btn hover:bg-white/5 rounded-r-3xl"
					aria-label="Previous project"
				>
					<div className="work-carousel-btn-inner w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 group-hover/btn:scale-110">
						<svg className="w-5 h-5 group-hover/btn:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
						</svg>
					</div>
				</button>

				<div
					className="relative w-full max-w-[calc(100vw-2.5rem)] tablet:max-w-lg h-full flex items-center justify-center pointer-events-none"
					style={{ transformStyle: 'preserve-3d' }}
				>
					{projects.map((project, index) => (
						<div
							key={project.id}
							className="work-carousel-card absolute w-full will-change-transform"
							style={{ transformStyle: 'preserve-3d', opacity: 0 }}
						>
							<WorkCard
								img={project.imageSrc}
								name={project.title}
								description={project.description}
								impact={project.impact}
								featured={project.featured}
								url={project.url}
								tags={project.tags}
								isActive={index === activeDisplay}
								onSwipeLeft={goNext}
								onSwipeRight={goPrev}
							/>
						</div>
					))}
				</div>

				<button
					type="button"
					onClick={goNext}
					className="work-carousel-btn absolute right-0 z-30 h-full w-20 tablet:w-32 flex items-center justify-center transition-all duration-300 group/btn hover:bg-white/5 rounded-l-3xl"
					aria-label="Next project"
				>
					<div className="work-carousel-btn-inner w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 group-hover/btn:scale-110">
						<svg className="w-5 h-5 group-hover/btn:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
						</svg>
					</div>
				</button>
			</div>

			<div className="px-5 tablet:px-12 pb-4 pt-2 text-center">
				<p className="font-label text-[11px] uppercase tracking-[0.2em] text-white/45">
					Arrow keys to navigate
				</p>
			</div>

			<div className="px-5 tablet:px-12 pb-12 pt-2">
				<div className="flex justify-center gap-1">
					{projects.map((project, i) => (
						<button
							key={project.id}
							type="button"
							onClick={() => goToSlide(i)}
							aria-label={`Go to ${project.title}`}
							aria-current={i === activeDisplay ? 'true' : undefined}
							className="min-h-11 min-w-11 flex items-center justify-center rounded-full transition-all duration-300"
						>
							<span
								className={`work-carousel-dot rounded-full transition-all duration-300 block ${
									i === activeDisplay ? 'work-carousel-dot-active' : ''
								} ${project.featured ? 'work-carousel-dot-featured' : ''}`}
							/>
						</button>
					))}
				</div>
			</div>
		</section>
	)
}
