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
									background: `linear-gradient(135deg, var(--selected-color, #00cdac)20, var(--selected-color, #00cdac)40)`,
									borderColor: `var(--selected-color, #00cdac)`,
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
	)
}
