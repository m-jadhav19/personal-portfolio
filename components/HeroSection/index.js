import { useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import data from '../../data/portfolio.json'

gsap.registerPlugin(ScrollTrigger)

const HeroSection = () => {
	const heroRef = useRef()
	const titleRef = useRef()
	const subtitleRef = useRef()
	const socialsRef = useRef()
	const scrollIndicatorRef = useRef()

	useGSAP(() => {
		const tl = gsap.timeline({ defaults: { ease: 'power4.out' } })

		// Sophisticated staggered reveal
		tl.fromTo(titleRef.current.children,
			{ y: 60, opacity: 0, rotationX: -30 },
			{ y: 0, opacity: 1, rotationX: 0, duration: 1.2, stagger: 0.15, transformPerspective: 600 }
		)
		.fromTo(subtitleRef.current.children,
			{ y: 30, opacity: 0 },
			{ y: 0, opacity: 1, duration: 1, stagger: 0.1 },
			"-=0.6"
		)
		.fromTo(socialsRef.current.children,
			{ scale: 0.8, opacity: 0 },
			{ scale: 1, opacity: 1, duration: 0.8, stagger: 0.05, ease: 'back.out(1.5)' },
			"-=0.6"
		)
		.fromTo(scrollIndicatorRef.current,
			{ opacity: 0, y: -20 },
			{ opacity: 0.6, y: 0, duration: 1 },
			"-=0.4"
		)

		// Parallax out on scroll
		gsap.to([titleRef.current, subtitleRef.current, socialsRef.current], {
			y: -80,
			opacity: 0,
			scale: 0.95,
			scrollTrigger: {
				trigger: heroRef.current,
				start: "top top",
				end: "bottom top",
				scrub: 1,
			}
		})
	}, [])

	return (
		<section 
			ref={heroRef} 
			className="relative min-h-[85vh] flex flex-col justify-center items-center overflow-hidden pt-12 pb-8 px-4 tablet:px-12"
		>
			<div className="container mx-auto z-10 flex flex-col items-center tablet:items-start max-w-6xl">
				{/* Main Content - Typography */}
				<div className="w-full laptop:w-5/6">
					<h1 ref={titleRef} className="font-space-grotesk text-5xl tablet:text-7xl laptop:text-[5.5rem] font-bold leading-[1.1] tracking-tight mb-8">
						<div className="overflow-hidden pb-2"><div className="origin-bottom">Hi, I&apos;m</div></div>
						<div className="overflow-hidden pb-2"><div className="origin-bottom text-[var(--selected-color,#339AF0)]">{data.name}.</div></div>
					</h1>
					
					<div ref={subtitleRef} className="space-y-4 font-dm-sans mb-12">
						<h2 className="text-xl tablet:text-3xl font-medium tracking-wide" style={{ color: 'var(--foreground)' }}>
							<div className="overflow-hidden"><div className="opacity-90">{data.headerTaglineThree}</div></div>
						</h2>
						<div className="text-base tablet:text-lg max-w-2xl leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
							<div className="overflow-hidden"><div className="opacity-80">{data.headerTaglineTwo} {data.headerTaglineFour}</div></div>
						</div>
					</div>

					<div ref={socialsRef} className="flex flex-wrap gap-4">
						{data.socials.map((social) => (
							<a
								key={social.id}
								href={social.link}
								target={social.title === 'Email' ? '_self' : '_blank'}
								rel="noopener noreferrer"
								className="group flex items-center justify-center w-12 h-12 rounded-full border border-current/10 hover:border-[var(--selected-color,#339AF0)] hover:bg-[var(--selected-color,#339AF0)]/10 transition-all duration-300 hover:scale-110 active:scale-95"
								title={social.title}
								style={{ color: 'var(--muted-foreground)' }}
							>
								{/* Only colored on group hover */}
								<span className="group-hover:text-[var(--selected-color,#339AF0)] transition-colors duration-300">
									{social.title === 'Github' && (
										<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
											<path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
										</svg>
									)}
									{social.title === 'LinkedIn' && (
										<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
											<path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
										</svg>
									)}
									{social.title === 'Email' && (
										<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
											<path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.272H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-.904.732-1.636 1.636-1.636h20.728c.904 0 1.636.732 1.636 1.636zM12 13.5L3.818 7.5v-.682c0-.904.732-1.636 1.636-1.636h14.909c.904 0 1.636.732 1.636 1.636v.682L12 13.5z" />
										</svg>
									)}
								</span>
							</a>
						))}
					</div>
				</div>
			</div>

			{/* Scroll Indicator */}
			<div 
				ref={scrollIndicatorRef}
				className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 opacity-60"
			>
				<span className="text-[10px] uppercase tracking-[0.3em] font-medium opacity-60 font-space-grotesk" style={{ color: 'var(--foreground)' }}>Scroll to explore</span>
				<div className="w-px h-12 bg-gradient-to-b from-[var(--selected-color)] to-transparent" />
			</div>
		</section>
	)
}

export default HeroSection

