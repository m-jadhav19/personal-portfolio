import { useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import data from '../../../data/portfolio.json'

if (typeof window !== 'undefined') {
	gsap.registerPlugin(ScrollTrigger)
}

export default function ContactChapter() {
	const sectionRef = useRef(null)
	const contentRef = useRef(null)
	const emailLink = data.socials.find((s) => s.title === 'Email')?.link || 'mailto:jadhavmandar44@gmail.com'
	const linkedInLink = data.socials.find((s) => s.title === 'LinkedIn')?.link || '#'

	useGSAP(
		() => {
			const section = sectionRef.current
			const content = contentRef.current
			if (!section || !content) return undefined

			gsap.fromTo(
				content,
				{ opacity: 0, y: 60 },
				{
					opacity: 1,
					y: 0,
					duration: 0.8,
					ease: 'power3.out',
					scrollTrigger: {
						trigger: section,
						start: 'top 80%',
						toggleActions: 'play none none reverse',
					},
				}
			)

			return undefined
		},
		{ scope: sectionRef }
	)

	return (
		<section id="contact" ref={sectionRef} className="contact-chapter py-32 tablet:py-40 px-5 tablet:px-12">
			<div ref={contentRef} className="cinematic-content-panel cinematic-content-panel-centered max-w-3xl mx-auto text-center py-10 tablet:py-14 px-6 tablet:px-12">
				<p className="font-label text-xs uppercase tracking-[0.32em] text-[var(--cinematic-accent)] mb-4">Get In Touch</p>
				<h2 className="font-display text-4xl tablet:text-6xl font-extrabold mb-6">Let&apos;s Build.</h2>
				<p className="text-white/80 text-lg mb-10 max-w-md mx-auto font-body">
					{data.contactTagline}
				</p>
				<div className="flex flex-col tablet:flex-row gap-4 justify-center">
					<a href={emailLink} className="cinematic-btn cinematic-accent-btn">
						Email Me
					</a>
					<a
						href={linkedInLink}
						target="_blank"
						rel="noopener noreferrer"
						className="cinematic-btn cinematic-glass-btn"
					>
						LinkedIn
					</a>
				</div>
			</div>
			<footer className="mt-24 pt-8 border-t border-white/10 text-center text-white/30 text-sm">
				<p>&copy; {new Date().getFullYear()} {data.name}. All rights reserved.</p>
			</footer>
		</section>
	)
}
