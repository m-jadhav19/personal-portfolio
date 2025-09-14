import {useRef, useCallback} from 'react'
import {gsap} from 'gsap'
import {useGSAP} from '@gsap/react'
import {ScrollTrigger} from 'gsap/ScrollTrigger'
import data from '../data/portfolio.json'
import CP77Navigation from '../components/CP77Navigation'
import CyberpunkHero from '../components/CyberpunkHero'
import CP77Projects from '../components/CP77Projects'
import CyberpunkAbout from '../components/CyberpunkAbout'
import CyberpunkContact from '../components/CyberpunkContact'
import FAB from '../components/FAB'
import CustomCursor from '../components/Cursor'
import Head from 'next/head'

// Register GSAP plugins
if (typeof window !== 'undefined') {
	gsap.registerPlugin(ScrollTrigger)
}

export default function Home() {
	const projectsRef = useRef()
	const aboutRef = useRef()
	const contactRef = useRef()

	// Optimize scroll handlers with useCallback
	const handleWorkScroll = useCallback(() => {
		projectsRef.current?.scrollIntoView({behavior: 'smooth'})
	}, [])

	const handleAboutScroll = useCallback(() => {
		aboutRef.current?.scrollIntoView({behavior: 'smooth'})
	}, [])

	const handleContactScroll = useCallback(() => {
		contactRef.current?.scrollIntoView({behavior: 'smooth'})
	}, [])

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
		<div className={`relative bg-cyber-black min-h-screen ${data.showCursor && 'cursor-none'}`}>
			<Head>
				<title>{data.name} - Cyberpunk Portfolio</title>
				<meta name="description" content="Mandar Jadhav - Frontend Developer with Cyberpunk 2077 inspired portfolio" />
			</Head>
			{data.showCursor && <CustomCursor />}

			{/* Cyberpunk Navigation */}
			<CP77Navigation
				handleWorkScroll={handleWorkScroll}
				handleAboutScroll={handleAboutScroll}
			/>
			
			{/* Cyberpunk Hero Section */}
			<CyberpunkHero />

			{/* Projects Section */}
			<div ref={projectsRef}>
				<CP77Projects />
			</div>

			{/* About Section */}
			<div ref={aboutRef}>
				<CyberpunkAbout />
			</div>

			{/* Contact Section */}
			<div ref={contactRef}>
				<CyberpunkContact />
			</div>

			<FAB />
		</div>
	)
}
