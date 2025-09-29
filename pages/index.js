import {useRef} from 'react'
import {gsap} from 'gsap'
import {useGSAP} from '@gsap/react'
import {ScrollTrigger} from 'gsap/ScrollTrigger'
import data from '../data/portfolio.json'
import Header from '../components/Header'
import HeroSection from '../components/HeroSection'
import WorkCard from '../components/WorkCard'
import FAB from '../components/FAB'
import CustomCursor from '../components/Cursor'
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

	const handleWorkScroll = () => {
		textOne.current.scrollIntoView({behavior: 'smooth'})
	}

	const handleAboutScroll = () => {
		textTwo.current.scrollIntoView({behavior: 'smooth'})
	}

	useGSAP(() => {
		// Scroll animations for sections
		gsap.utils.toArray('.gsap-fade-in').forEach(element => {
			// Set initial state to hidden
			gsap.set(element, { opacity: 0, y: 50 })
			
			gsap.fromTo(element,
				{ opacity: 0, y: 50 },
				{
					opacity: 1,
					y: 0,
					duration: 0.8,
					ease: "power2.out",
					onStart: () => {
						element.classList.add('gsap-revealed')
					},
					scrollTrigger: {
						trigger: element,
						start: "top 80%",
						end: "bottom 20%",
						toggleActions: "play none none reverse"
					}
				}
			)
		})

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
			
			<div className='gradient-circle'></div>
			<div className='gradient-circle-bottom'></div>

			<Header
				handleWorkScroll={handleWorkScroll}
				handleAboutScroll={handleAboutScroll}
			/>
			
			<HeroSection />

			{/* Work Section */}
			<section id="work" className='gsap-fade-in' ref={textOne}>
				<div className="max-w-7xl mx-auto px-4 py-20">
					<div className="text-center mb-16">
						<h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 font-space-grotesk gradient-text"
							style={{
								background: 'linear-gradient(135deg, #00cdac, #ff6b6b, #4ecdc4)',
								backgroundSize: '400% 400%',
								backgroundClip: 'text',
								WebkitBackgroundClip: 'text',
								WebkitTextFillColor: 'transparent',
								animation: 'gradientShift 8s ease-in-out infinite'
							}}
						>
							Selected Work
						</h2>
						<p className="text-lg md:text-xl text-white/70 font-dm-sans max-w-2xl mx-auto">
							A collection of projects showcasing modern web development and creative solutions
						</p>
					</div>
					
					<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8'>
						{data.projects.map((project, index) => (
							<div key={project.id} className="work-card-wrapper">
								<WorkCard
									img={project.imageSrc}
									name={project.title}
									description={project.description}
									url={project.url}
									index={index}
									project={project}
								/>
							</div>
						))}
					</div>
					
					<div className="text-center mt-16">
						<a
							href="https://github.com/m-jadhav19/"
							target="_blank"
							rel="noopener noreferrer"
							className="inline-flex items-center px-6 py-3 md:px-8 md:py-4 text-base md:text-lg font-semibold text-white rounded-full transition-all duration-300 hover:scale-105 backdrop-blur-[15px] border border-white/20 hover:border-white/40 hover:bg-white/10"
						>
							View More Projects
							<svg className="ml-2 w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
							</svg>
						</a>
					</div>
				</div>
			</section>

			{/* About Section */}
			<section id="about" className='gsap-fade-in' ref={textTwo}>
				<div className="max-w-7xl mx-auto px-4 py-20">
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
						{/* Left Side - Visual */}
						<div className="relative">
							{/* Glowing gradient blob */}
							<div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-full blur-3xl scale-150"></div>
							
							{/* Profile Image Container */}
							<div className="relative z-10 mx-auto w-64 h-64 md:w-80 md:h-80 rounded-full overflow-hidden border-4 border-white/20 backdrop-blur-[10px] bg-white/5">
								<div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center">
									<div className="text-6xl md:text-8xl font-bold text-white opacity-80">MJ</div>
								</div>
							</div>
							
							{/* Floating Elements */}
							<div className="absolute -top-4 -right-4 w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full opacity-60 animate-pulse"></div>
							<div className="absolute -bottom-4 -left-4 w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-green-400 to-blue-500 rounded-full opacity-60 animate-pulse" style={{animationDelay: '1s'}}></div>
						</div>

						{/* Right Side - Content */}
						<div className="space-y-6 md:space-y-8">
							<div>
								<h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 font-space-grotesk gradient-text"
									style={{
										background: 'linear-gradient(135deg, #00cdac, #ff6b6b, #4ecdc4)',
										backgroundSize: '400% 400%',
										backgroundClip: 'text',
										WebkitBackgroundClip: 'text',
										WebkitTextFillColor: 'transparent',
										animation: 'gradientShift 8s ease-in-out infinite'
									}}
								>
									About Me
								</h2>
								<p className="text-lg md:text-xl text-white/90 leading-relaxed font-dm-sans mb-4 md:mb-6">
									{data.aboutParaLine1}
								</p>
								<p className="text-base md:text-lg text-white/80 leading-relaxed font-dm-sans mb-6 md:mb-8">
									{data.aboutParaLine2}
								</p>
							</div>

							{/* Skills */}
							<div>
								<h3 className="text-xl md:text-2xl font-bold text-white mb-4 md:mb-6 font-space-grotesk">Skills & Technologies</h3>
								<div className="flex flex-wrap gap-2 md:gap-3">
									{data.resume.frameworks.map((skill, index) => (
										<span
											key={index}
											className="px-3 py-1.5 md:px-4 md:py-2 bg-white/10 backdrop-blur-[10px] border border-white/20 rounded-full text-sm md:text-base text-white font-medium hover:bg-white/20 transition-all duration-300 hover:scale-105"
										>
											{skill}
										</span>
									))}
									{data.resume.languages.slice(0, 3).map((skill, index) => (
										<span
											key={`lang-${index}`}
											className="px-3 py-1.5 md:px-4 md:py-2 bg-white/10 backdrop-blur-[10px] border border-white/20 rounded-full text-sm md:text-base text-white font-medium hover:bg-white/20 transition-all duration-300 hover:scale-105"
										>
											{skill}
										</span>
									))}
								</div>
							</div>

							{/* CTA */}
							<div className="pt-2 md:pt-4">
								<a
									href="mailto:jadhavmandar44@gmail.com"
									className="inline-flex items-center px-6 py-3 md:px-8 md:py-4 text-base md:text-lg font-semibold text-white rounded-full transition-all duration-300 hover:scale-105 backdrop-blur-[15px] border border-white/20 hover:border-white/40 hover:bg-white/10"
									style={{
										background: 'linear-gradient(135deg, var(--selected-color, #00cdac), #ff6b6b)',
										boxShadow: '0 8px 25px rgba(0, 205, 172, 0.3)'
									}}
								>
									Let&apos;s Work Together
									<svg className="ml-2 w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
									</svg>
								</a>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Contact Section */}
			<section id="contact" className='gsap-fade-in' ref={textThree}>
				<div className="max-w-6xl mx-auto px-4 py-20">
					<div className="text-center max-w-4xl mx-auto">
						<h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 font-space-grotesk gradient-text"
							style={{
								background: 'linear-gradient(135deg, #00cdac, #ff6b6b, #4ecdc4)',
								backgroundSize: '400% 400%',
								backgroundClip: 'text',
								WebkitBackgroundClip: 'text',
								WebkitTextFillColor: 'transparent',
								animation: 'gradientShift 8s ease-in-out infinite'
							}}
						>
							Get In Touch
						</h2>
						<p className="text-lg md:text-xl text-white/80 mb-8 md:mb-12 font-dm-sans max-w-2xl mx-auto">
							Ready to bring your ideas to life? Let&apos;s collaborate on something amazing.
						</p>
						
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-8 md:mb-12">
							{/* Email Card */}
							<div className="group p-6 md:p-8 rounded-2xl bg-white/5 backdrop-blur-[10px] border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105">
								<div className="text-center">
									<div className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 md:mb-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
										<svg className="w-6 h-6 md:w-8 md:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
										</svg>
									</div>
									<h3 className="text-lg md:text-xl font-bold text-white mb-2 md:mb-3 font-space-grotesk">Email</h3>
									<p className="text-sm md:text-base text-white/70 mb-3 md:mb-4 font-dm-sans">Let&apos;s start a conversation</p>
									<a
										href="mailto:jadhavmandar44@gmail.com"
										className="inline-flex items-center px-4 py-2 md:px-6 md:py-3 text-sm md:text-base text-white rounded-full transition-all duration-300 hover:scale-105 backdrop-blur-[15px] border border-white/20 hover:border-white/40 hover:bg-white/10"
									>
										Send Email
										<svg className="ml-2 w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
										</svg>
									</a>
								</div>
							</div>

							{/* LinkedIn Card */}
							<div className="group p-6 md:p-8 rounded-2xl bg-white/5 backdrop-blur-[10px] border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105">
								<div className="text-center">
									<div className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 md:mb-6 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full flex items-center justify-center">
										<svg className="w-6 h-6 md:w-8 md:h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
											<path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
										</svg>
									</div>
									<h3 className="text-lg md:text-xl font-bold text-white mb-2 md:mb-3 font-space-grotesk">LinkedIn</h3>
									<p className="text-sm md:text-base text-white/70 mb-3 md:mb-4 font-dm-sans">Connect professionally</p>
									<a
										href={data.socials.find(social => social.title === 'LinkedIn')?.link || '#'}
										target="_blank"
										rel="noopener noreferrer"
										className="inline-flex items-center px-4 py-2 md:px-6 md:py-3 text-sm md:text-base text-white rounded-full transition-all duration-300 hover:scale-105 backdrop-blur-[15px] border border-white/20 hover:border-white/40 hover:bg-white/10"
									>
										Connect
										<svg className="ml-2 w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
										</svg>
									</a>
								</div>
							</div>
						</div>

						{/* Footer Message */}
						<div className="text-center">
							<p className="text-sm md:text-base text-white/60 font-dm-sans">
								Available for freelance projects and full-time opportunities
							</p>
						</div>
					</div>
				</div>
			</section>

			<FAB />
		</div>
	)
}
