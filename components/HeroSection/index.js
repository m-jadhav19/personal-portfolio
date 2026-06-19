import { useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import data from '../../data/portfolio.json'
import dynamic from 'next/dynamic'

const Morph = dynamic(() => import('../Morph'), {
	ssr: false,
})
gsap.registerPlugin(ScrollTrigger)

const HeroSection = () => {
	const heroRef = useRef()
	const titleRef = useRef()
	const subtitleRef = useRef()
	const socialsRef = useRef()
	const scrollIndicatorRef = useRef()

	useGSAP(() => {
		const tl = gsap.timeline({ defaults: { ease: 'power4.out' } })

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
			className="relative min-h-[85vh] flex flex-col justify-center px-5 mob:px-6 tablet:px-12 pt-16 pb-12 overflow-hidden"
		>
			{/* Desktop: Morph as backdrop */}
			<div className="absolute inset-y-0 right-0 hidden tablet:flex tablet:w-1/2 laptop:w-[45vw] h-full pointer-events-auto z-0 items-center justify-center opacity-100">
				<Morph />
			</div>

			{/* Text content with mobile scrim */}
			<div className="max-w-4xl z-10 w-full tablet:w-5/6 mx-auto tablet:mx-0 relative pointer-events-none">
				<div className="absolute -inset-x-4 inset-y-0 tablet:hidden bg-gradient-to-b from-[#F3EEE3]/90 via-[#F3EEE3]/70 to-transparent dark:from-black/90 dark:via-black/70 dark:to-transparent pointer-events-none rounded-2xl" />

				<div className="relative">
					<p className="font-geist-mono text-xs tracking-[0.18em] uppercase text-black/40 dark:text-white/40 mb-9 flex items-center gap-3 before:block before:w-7 before:h-px before:bg-current before:opacity-50 pointer-events-auto w-fit">
						{data.headerTaglineThree}
					</p>

					<h1 ref={titleRef} className="mb-8">
						<div className="overflow-hidden">
							<span className="block font-geist font-light text-[clamp(1.5rem,3.5vw,2.4rem)] tracking-tight text-black/50 dark:text-white/50 leading-none mb-1 origin-bottom">
								Hi, I&apos;m
							</span>
						</div>
						<div className="overflow-hidden">
							<span className="block font-instrument italic text-[clamp(3.6rem,9vw,6.8rem)] leading-[0.9] tracking-[-0.025em] text-black dark:text-white origin-bottom pt-1 overflow-hidden">
								{data.headerTaglineTwo}.
							</span>
						</div>
					</h1>

					<div ref={subtitleRef} className="mb-8 space-y-3">
						<div className="overflow-hidden">
							<p className="font-geist font-normal text-[clamp(1rem,2.2vw,1.4rem)] text-black/70 dark:text-white/70 leading-snug break-words">
								{data.headerTaglineThree} — building thoughtful products<br className="hidden tablet:block"/>
								at the intersection of design and engineering.
							</p>
						</div>

						<div className="overflow-hidden flex items-center gap-4 flex-wrap pt-1">
							<span className="font-geist-mono text-xs text-black/40 dark:text-white/40 flex items-center gap-2">
								<span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
								{data.headerTaglineFour}
							</span>
						</div>
					</div>

					<div ref={socialsRef} className="flex gap-2 flex-wrap pointer-events-auto">
						{data.socials.map((social) => (
							<a
								key={social.id}
								href={social.link}
								target={social.title === 'Email' ? '_self' : '_blank'}
								rel="noopener noreferrer"
								aria-label={social.title}
								className="font-geist-mono text-xs tracking-wider flex items-center gap-2 px-4 py-2.5 border border-black/15 dark:border-white/15 rounded-sm text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white hover:border-black/35 dark:hover:border-white/35 hover:bg-black/5 dark:hover:bg-white/5 transition-all duration-300 hover:scale-105 active:scale-95 liquid-glass-btn"
							>
								{social.title === 'Github' && (
									<svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
										<path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
									</svg>
								)}
								{social.title === 'LinkedIn' && (
									<svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
										<path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
									</svg>
								)}
								{social.title === 'Email' && (
									<svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
										<path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.272H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-.904.732-1.636 1.636-1.636h20.728c.904 0 1.636.732 1.636 1.636zM12 13.5L3.818 7.5v-.682c0-.904.732-1.636 1.636-1.636h14.909c.904 0 1.636.732 1.636 1.636v.682L12 13.5z" />
									</svg>
								)}
								<span className="hidden tablet:inline">{social.title}</span>
							</a>
						))}
					</div>
				</div>
			</div>

			{/* Mobile: Morph below text */}
			<div className="relative z-10 w-full flex items-center justify-center mt-8 opacity-60 tablet:hidden pointer-events-auto">
				<Morph />
			</div>

			<div
				ref={scrollIndicatorRef}
				className="absolute bottom-8 left-5 mob:left-6 tablet:left-12 flex items-center gap-3 opacity-40 z-10"
			>
				<div className="w-8 h-px bg-black dark:bg-white" />
				<span className="font-geist-mono text-xs tracking-[0.2em] uppercase text-black/60 dark:text-white/60">scroll</span>
			</div>
		</section>
	)
}

export default HeroSection
