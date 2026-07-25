import { useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import data from '../../../data/portfolio.json'

if (typeof window !== 'undefined') {
	gsap.registerPlugin(ScrollTrigger)
}

export default function AboutChapter() {
	const sectionRef = useRef(null)
	const panelRef = useRef(null)
	const stats = data.stats

	useGSAP(
		() => {
			const section = sectionRef.current
			const panel = panelRef.current
			if (!section || !panel) return undefined

			gsap.fromTo(
				panel,
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
		<section id="about" ref={sectionRef} className="about-chapter relative py-16 tablet:py-24 px-5 tablet:px-12">
			<div className="cinematic-section-header mb-10 tablet:mb-14 max-w-4xl">
				<p className="font-label text-xs uppercase tracking-[0.32em] text-[var(--cinematic-accent)] mb-2">About Me</p>
				<h2 className="font-display text-4xl tablet:text-6xl font-extrabold">About.</h2>
			</div>

			<div ref={panelRef} className="about-chapter-panel cinematic-content-panel max-w-4xl p-6 tablet:p-10">
				<div className="space-y-4 text-white/85 leading-relaxed font-body text-[1.05rem] mb-10">
					<p>{data.aboutParaLine1}</p>
					{data.aboutParaLine2 && <p>{data.aboutParaLine2}</p>}
				</div>

				{data.featuredSkills?.length > 0 && (
					<div className="mb-10">
						<p className="font-label text-xs uppercase tracking-[0.32em] text-[var(--cinematic-accent)] mb-4">Skills</p>
						<div className="flex flex-wrap gap-2">
							{data.featuredSkills.map((skill) => (
								<span
									key={skill.name}
									className="project-card-tag px-3 py-1.5 rounded-full text-[11px] font-label uppercase tracking-wider"
								>
									{skill.name}
								</span>
							))}
						</div>
					</div>
				)}

				{stats && (
					<div className="flex flex-wrap gap-4">
						<div className="about-stat-chip">
							<span className="block font-display text-2xl tablet:text-3xl font-extrabold text-[var(--cinematic-accent)]">
								{stats.yearsExperience}
							</span>
							<span className="text-[11px] text-white/55 uppercase tracking-wider font-label">Years</span>
						</div>
						<div className="about-stat-chip">
							<span className="block font-display text-2xl tablet:text-3xl font-extrabold text-[var(--cinematic-accent)]">
								{stats.projectsCompleted}
							</span>
							<span className="text-[11px] text-white/55 uppercase tracking-wider font-label">Projects</span>
						</div>
						{stats.technologiesMastered && (
							<div className="about-stat-chip">
								<span className="block font-display text-2xl tablet:text-3xl font-extrabold text-[var(--cinematic-accent)]">
									{stats.technologiesMastered}
								</span>
								<span className="text-[11px] text-white/55 uppercase tracking-wider font-label">Technologies</span>
							</div>
						)}
					</div>
				)}
			</div>
		</section>
	)
}
