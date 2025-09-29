import {useRef} from 'react'
import {gsap} from 'gsap'
import {useGSAP} from '@gsap/react'
import data from '../../data/portfolio.json'

const HeroSection = () => {
	const heroRef = useRef()
	const tagline1Ref = useRef()
	const tagline2Ref = useRef()
	const tagline3Ref = useRef()
	const tagline4Ref = useRef()
	const ctaRef = useRef()
	const socialsRef = useRef()
	const backgroundBlob1Ref = useRef()
	const backgroundBlob2Ref = useRef()
	const backgroundBlob3Ref = useRef()

	useGSAP(() => {
		// Background blob animations
		gsap.set([backgroundBlob1Ref.current, backgroundBlob2Ref.current, backgroundBlob3Ref.current], {
			opacity: 0.3
		})

		// Continuous blob morphing animation
		gsap.to(backgroundBlob1Ref.current, {
			x: 100,
			y: 50,
			scale: 1.2,
			duration: 8,
			ease: "power2.inOut",
			repeat: -1,
			yoyo: true
		})

		gsap.to(backgroundBlob2Ref.current, {
			x: -80,
			y: -30,
			scale: 0.8,
			duration: 6,
			ease: "power2.inOut",
			repeat: -1,
			yoyo: true
		})

		gsap.to(backgroundBlob3Ref.current, {
			x: 50,
			y: -80,
			scale: 1.1,
			duration: 10,
			ease: "power2.inOut",
			repeat: -1,
			yoyo: true
		})

		// Hero content entrance animation
		const tl = gsap.timeline()
		
		// Hero container entrance
		tl.fromTo(heroRef.current,
			{ opacity: 0 },
			{ 
				opacity: 1, 
				duration: 0.5,
				ease: "power2.out"
			}
		)
		
		// Taglines with staggered entrance
		tl.fromTo(tagline1Ref.current,
			{ opacity: 0, y: 50, rotationX: 90 },
			{ 
				opacity: 1, 
				y: 0, 
				rotationX: 0,
				duration: 1.2,
				ease: "power3.out"
			},
			"+=0.2"
		)
		
		tl.fromTo(tagline2Ref.current,
			{ opacity: 0, y: 50, rotationX: 90 },
			{ 
				opacity: 1, 
				y: 0, 
				rotationX: 0,
				duration: 1.2,
				ease: "power3.out"
			},
			"-=0.8"
		)
		
		tl.fromTo(tagline3Ref.current,
			{ opacity: 0, y: 50, rotationX: 90 },
			{ 
				opacity: 1, 
				y: 0, 
				rotationX: 0,
				duration: 1.2,
				ease: "power3.out"
			},
			"-=0.8"
		)
		
		tl.fromTo(tagline4Ref.current,
			{ opacity: 0, y: 50, rotationX: 90 },
			{ 
				opacity: 1, 
				y: 0, 
				rotationX: 0,
				duration: 1.2,
				ease: "power3.out"
			},
			"-=0.8"
		)

		// CTA button entrance
		tl.fromTo(ctaRef.current,
			{ opacity: 0, scale: 0.8, y: 30 },
			{ 
				opacity: 1, 
				scale: 1,
				y: 0,
				duration: 0.8,
				ease: "back.out(1.7)"
			},
			"-=0.4"
		)

		// Socials entrance
		tl.fromTo(socialsRef.current,
			{ opacity: 0, y: 20 },
			{ 
				opacity: 1, 
				y: 0,
				duration: 0.8,
				ease: "power2.out"
			},
			"-=0.2"
		)

	}, [])

	return (
		<section className="relative min-h-screen flex items-center justify-center overflow-hidden">
			{/* Animated Background Blobs */}
			<div className="absolute inset-0 pointer-events-none overflow-hidden">
				<div
					ref={backgroundBlob1Ref}
					className="absolute top-1/4 left-1/4 w-64 h-64 md:w-96 md:h-96 rounded-full opacity-30"
					style={{
						background: 'linear-gradient(135deg, #00cdac, #ff6b6b)',
						filter: 'blur(60px)'
					}}
				></div>
				<div
					ref={backgroundBlob2Ref}
					className="absolute top-1/3 right-1/4 w-56 h-56 md:w-80 md:h-80 rounded-full opacity-30"
					style={{
						background: 'linear-gradient(135deg, #4ecdc4, #45b7d1)',
						filter: 'blur(60px)'
					}}
				></div>
				<div
					ref={backgroundBlob3Ref}
					className="absolute bottom-1/4 left-1/3 w-48 h-48 md:w-72 md:h-72 rounded-full opacity-30"
					style={{
						background: 'linear-gradient(135deg, #ff6b6b, #4ecdc4)',
						filter: 'blur(60px)'
					}}
				></div>
			</div>

			{/* Hero Content */}
			<div ref={heroRef} className="relative z-10 max-w-7xl mx-auto px-4 py-20">
				<div className="max-w-5xl mx-auto text-center">
					{/* Typography Section */}
					<div className="mb-16">
						<h1
							ref={tagline1Ref}
							className="text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-bold mb-4 font-syne gradient-text"
							style={{
								background: 'linear-gradient(135deg, #00cdac, #ff6b6b, #4ecdc4)',
								backgroundSize: '400% 400%',
								backgroundClip: 'text',
								WebkitBackgroundClip: 'text',
								WebkitTextFillColor: 'transparent',
								animation: 'gradientShift 8s ease-in-out infinite'
							}}
						>
							{data.headerTaglineOne}
						</h1>
						<h1
							ref={tagline2Ref}
							className="text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-bold mb-4 font-outfit text-white"
						>
							{data.headerTaglineTwo}
						</h1>
						<h1
							ref={tagline3Ref}
							className="text-3xl md:text-5xl lg:text-6xl xl:text-7xl font-semibold mb-4 font-outfit text-white/90"
						>
							{data.headerTaglineThree}
						</h1>
						<h1
							ref={tagline4Ref}
							className="text-2xl md:text-4xl lg:text-5xl xl:text-6xl font-medium mb-8 font-outfit text-white/80"
						>
							{data.headerTaglineFour}
						</h1>
					</div>

					{/* CTA Button */}
					<div ref={ctaRef} className="mb-16">
						<a
							href="#work"
							className="inline-flex items-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-full hover:from-blue-700 hover:to-purple-700 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/25"
							style={{
								background: 'linear-gradient(135deg, var(--selected-color, #00cdac), #ff6b6b)',
								boxShadow: '0 8px 25px rgba(0, 205, 172, 0.3)'
							}}
						>
							View My Work
							<svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
							</svg>
						</a>
					</div>

					{/* Social Links */}
					<div ref={socialsRef} className="flex flex-wrap justify-center gap-6">
						{data.socials.map((social) => (
							<a
								key={social.id}
								href={social.link}
								target={social.title === 'Email' ? '_self' : '_blank'}
								rel="noopener noreferrer"
								className="group flex items-center gap-3 px-6 py-3 rounded-full transition-all duration-300 hover:scale-105 backdrop-blur-[15px] border border-white/20 hover:border-white/40 hover:bg-white/10"
							>
								{/* Social Icons */}
								{social.title === 'Github' && (
									<svg className='w-6 h-6' fill='currentColor' viewBox='0 0 24 24'>
										<path d='M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z'/>
									</svg>
								)}
								{social.title === 'LinkedIn' && (
									<svg className='w-6 h-6' fill='currentColor' viewBox='0 0 24 24'>
										<path d='M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z'/>
									</svg>
								)}
								{social.title === 'Email' && (
									<svg className='w-6 h-6' fill='currentColor' viewBox='0 0 24 24'>
										<path d='M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.272H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-.904.732-1.636 1.636-1.636h20.728c.904 0 1.636.732 1.636 1.636zM12 13.5L3.818 7.5v-.682c0-.904.732-1.636 1.636-1.636h14.909c.904 0 1.636.732 1.636 1.636v.682L12 13.5z'/>
									</svg>
								)}
								
								<span className='text-lg font-medium font-dm-sans text-white'>{social.title}</span>
							</a>
						))}
					</div>
				</div>
			</div>
		</section>
	)
}

export default HeroSection