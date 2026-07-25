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

const SocialIcon = ({ title }) => {
	const className = 'w-[18px] h-[18px] shrink-0'

	if (title === 'Github') {
		return (
			<svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
				<path d="M12 2C6.477 2 2 6.484 2 12.021c0 4.428 2.865 8.178 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.021C22 6.484 17.522 2 12 2z" />
			</svg>
		)
	}

	if (title === 'LinkedIn') {
		return (
			<svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
				<path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
			</svg>
		)
	}

	return (
		<svg className={className} fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24" aria-hidden="true">
			<path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
		</svg>
	)
}

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

					<div ref={socialsRef} className="flex flex-col mob:flex-row mob:flex-wrap items-start mob:items-center gap-3 mob:gap-x-6 mob:gap-y-3 pointer-events-auto pt-1">
						{data.socials.map((social) => (
							<a
								key={social.id}
								href={social.link}
								target={social.title === 'Email' ? '_self' : '_blank'}
								rel="noopener noreferrer"
								aria-label={social.title}
								className="hero-social-link group inline-flex items-center gap-3 min-h-11 w-full mob:w-auto py-1 active:scale-[0.98]"
							>
								<span className="hero-social-icon flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-black/15 dark:border-white/15 bg-black/[0.03] dark:bg-white/[0.06] text-black/60 dark:text-white/60">
									<SocialIcon title={social.title} />
								</span>
								<span className="hero-social-label font-geist-mono text-xs tracking-[0.12em] uppercase text-black/50 dark:text-white/50">
									{social.title}
								</span>
								<span className="hero-social-arrow text-sm leading-none" aria-hidden="true">↗</span>
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
