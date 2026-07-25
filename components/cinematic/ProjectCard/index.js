import Image from 'next/image'

export default function ProjectCard({ project, isActive = false }) {
	return (
		<article
			className={`project-card cinematic-glass-panel rounded-2xl overflow-hidden transition-all duration-500 ${
				isActive ? 'project-card-active' : 'project-card-inactive'
			}`}
		>
			<div className="relative aspect-[16/10] w-full overflow-hidden">
				<Image
					src={project.imageSrc}
					alt={project.title}
					layout="fill"
					objectFit="cover"
					className="project-card-image"
				/>
				<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
			</div>
			<div className="p-6 tablet:p-8">
				<h3 className="font-space-grotesk text-2xl tablet:text-3xl font-bold mb-2">{project.title}</h3>
				<p className="text-white/60 text-sm tablet:text-base mb-4 line-clamp-2">{project.description}</p>
				<div className="flex flex-wrap gap-2 mb-6">
					{project.tags.map((tag) => (
						<span key={tag} className="project-card-tag text-xs uppercase tracking-wider px-3 py-1 rounded-full">
							{tag}
						</span>
					))}
				</div>
				<a
					href={project.url}
					target="_blank"
					rel="noopener noreferrer"
					className="cinematic-accent-btn inline-flex items-center gap-2 text-sm uppercase tracking-widest"
				>
					View Project
					<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
					</svg>
				</a>
			</div>
		</article>
	)
}
