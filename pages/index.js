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

	const handleWorkScroll = () => {
		textOne.current.scrollIntoView({behavior: 'smooth'})
	}

	const handleAboutScroll = () => {
		textTwo.current.scrollIntoView({behavior: 'smooth'})
	}

	useGSAP(() => {
		// Enhanced Scroll animations for sections with stagger
		gsap.utils.toArray('.gsap-fade-in').forEach((element, index) => {
			// Set initial state to hidden
			gsap.set(element, { opacity: 0, y: 50 })
			
			gsap.fromTo(element,
				{ opacity: 0, y: 50 },
				{
					opacity: 1,
					y: 0,
					duration: 0.8,
					ease: "power2.out",
					delay: index * 0.1,
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

		// Scale animation on scroll for work cards
		const workCards = document.querySelectorAll('.work-card')
		workCards.forEach((card, index) => {
			gsap.fromTo(card,
				{ scale: 0.9, opacity: 0 },
				{
					scale: 1,
					opacity: 1,
					duration: 0.5,
					ease: "back.out(1.7)",
					delay: index * 0.1,
					scrollTrigger: {
						trigger: card,
						start: "top 85%",
						toggleActions: "play none none none"
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

			{/* Work Section */}
			<div className='gsap-fade-in' ref={textOne}>
				<div className="container mx-auto px-4 py-16">
					<h2 className="section-heading font-space-grotesk">Work.</h2>
					<div className='grid grid-cols-1 tablet:grid-cols-2 laptop:grid-cols-3 gap-6'>
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

			{/* About Section */}
			<div className='gsap-fade-in' ref={textTwo}>
				<div className="container mx-auto px-4 py-16">
					<h2 className="section-heading font-space-grotesk">About.</h2>
					<div className='max-w-4xl mx-auto'>
						<p className='section-body mb-8 font-dm-sans'>{data.aboutParaLine1}</p>
						<p className='section-body font-dm-sans'>{data.aboutParaLine2}</p>
					</div>
				</div>
			</div>

			{/* Contact Section */}
			<div className='gsap-fade-in' ref={textThree}>
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
