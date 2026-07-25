import { useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import data from '../../../data/portfolio.json'
import ProjectCard from '../ProjectCard'

if (typeof window !== 'undefined') {
	gsap.registerPlugin(ScrollTrigger)
}

export default function ProjectRail({ sectionRef }) {
	const railRef = useRef(null)
	const trackRef = useRef(null)
	const projects = data.projects

	useGSAP(
		() => {
			const section = sectionRef?.current
			const track = trackRef.current
			if (!section || !track) return undefined

			const mobile = window.innerWidth < 768
			const scrollDistance = track.scrollWidth - window.innerWidth

			if (scrollDistance <= 0) return undefined

			gsap.to(track, {
				x: () => -(track.scrollWidth - window.innerWidth),
				ease: 'none',
				scrollTrigger: {
					trigger: section,
					start: 'top top',
					end: () => `+=${scrollDistance + window.innerHeight * 0.5}`,
					pin: true,
					scrub: mobile ? 1 : 0.8,
					anticipatePin: 1,
					invalidateOnRefresh: true,
				},
			})

			return undefined
		},
		{ scope: railRef, dependencies: [sectionRef] }
	)

	return (
		<div ref={railRef} id="work" className="project-rail relative min-h-screen bg-[#0a0a0a]">
			<div className="sticky top-0 h-screen flex flex-col justify-center overflow-hidden">
				<div className="px-5 tablet:px-12 mb-8 tablet:mb-12">
					<p className="font-geist-mono text-xs uppercase tracking-[0.3em] text-white/40 mb-2">Selected Work</p>
					<h2 className="font-space-grotesk text-4xl tablet:text-6xl font-bold">Projects.</h2>
				</div>
				<div className="overflow-hidden">
					<div
						ref={trackRef}
						className="project-rail-track flex gap-6 tablet:gap-10 px-5 tablet:px-12 will-change-transform"
					>
						{projects.map((project, index) => (
							<div
								key={project.id}
								className="project-rail-item shrink-0 w-[85vw] tablet:w-[480px] laptop:w-[560px]"
							>
								<ProjectCard project={project} isActive />
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	)
}
