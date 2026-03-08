import { useRef, useCallback } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import data from '../../data/portfolio.json'
import TypeWriter from '../TypeWriter'

gsap.registerPlugin(ScrollTrigger)

const HeroSection = () => {
	const nameLineRef = useRef()
	const nameRef = useRef()
	const heroContainerRef = useRef()
	const gradientTweenRef = useRef(null)

	const onNameLineEnter = useCallback(() => {
		if (!nameRef.current) return
		gsap.to(nameRef.current, {
			filter: 'drop-shadow(0 0 22px rgba(157, 78, 221, 0.45))',
			duration: 0.4,
		})
	}, [])

	const onNameLineLeave = useCallback(() => {
		if (!nameRef.current) return
		gsap.to(nameRef.current, {
			filter: 'drop-shadow(0 0 14px rgba(157, 78, 221, 0.25))',
			duration: 0.4,
		})
	}, [])

	useGSAP(() => {
		// Gradient position animation — slow liquid shimmer (not color animation)
		if (nameRef.current) {
			gradientTweenRef.current = gsap.to(nameRef.current, {
				backgroundPosition: '300% 50%',
				duration: 8,
				ease: 'none',
				repeat: -1,
			})

			// Pause gradient when hero is scrolled out of view
			ScrollTrigger.create({
				trigger: heroContainerRef.current,
				start: 'top bottom',
				end: 'bottom top',
				onLeave: () => gradientTweenRef.current?.pause(),
				onEnterBack: () => gradientTweenRef.current?.resume(),
			})
		}
	}, [])

	return (
		<div ref={heroContainerRef} className="container mx-auto mb-10">
			<div className="laptop:mt-20 mt-10 px-2 tablet:px-12">
				<div className="mt-5 space-y-4 tablet:space-y-6 laptop:space-y-8">
					{/* First line - Greeting (static) */}
					<h1 className="text-4xl tablet:text-7xl laptop:text-8xl laptopl:text-9xl font-bold w-full laptop:w-4/5 opacity-90 hero-element">
						{data.headerTaglineOne}
					</h1>

					{/* Second line - Name with typewriter + animated gradient */}
					<h1
						ref={nameLineRef}
						className="text-4xl tablet:text-7xl laptop:text-8xl laptopl:text-9xl w-full laptop:w-4/5 font-hero-name hero-element flex flex-wrap items-baseline gap-x-2"
						onMouseEnter={onNameLineEnter}
						onMouseLeave={onNameLineLeave}
					>
						<span ref={nameRef} className="hero-name">
							<TypeWriter
								text={data.headerTaglineTwo}
								speed={70}
								delay={0}
								showCursor={true}
								className="inline"
							/>
						</span>
					</h1>

					{/* Third line - Title (static) */}
					<h1 className="text-3xl tablet:text-6xl laptop:text-7xl laptopl:text-8xl font-bold w-full laptop:w-4/5 hero-element">
						{data.headerTaglineThree}
					</h1>

					{/* Fourth line - Location (static) */}
					<h1 className="text-2xl tablet:text-5xl laptop:text-6xl laptopl:text-7xl font-bold w-full laptop:w-4/5 opacity-70 hero-element">
						{data.headerTaglineFour}
					</h1>
				</div>

				{/* Socials Section */}
				<div className="mt-16 tablet:mt-20 laptop:mt-24 flex flex-wrap gap-4 sm:gap-6 justify-center tablet:justify-start items-center">
					{data.socials.map((social) => (
						<a
							key={social.id}
							href={social.link}
							target={social.title === 'Email' ? '_self' : '_blank'}
							rel="noopener noreferrer"
							className="social-link group flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 hover:scale-[1.02] backdrop-blur-[10px] border border-white/20 hover:border-white/40 flex-shrink-0"
						>
							{social.title === 'Github' && (
								<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
									<path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
								</svg>
							)}
							{social.title === 'LinkedIn' && (
								<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
									<path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
								</svg>
							)}
							{social.title === 'Email' && (
								<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
									<path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.272H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-.904.732-1.636 1.636-1.636h20.728c.904 0 1.636.732 1.636 1.636zM12 13.5L3.818 7.5v-.682c0-.904.732-1.636 1.636-1.636h14.909c.904 0 1.636.732 1.636 1.636v.682L12 13.5z" />
								</svg>
							)}
							<span className="text-lg font-medium">{social.title}</span>
						</a>
					))}
				</div>
			</div>
		</div>
	)
}

export default HeroSection
