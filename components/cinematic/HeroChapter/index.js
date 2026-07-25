import Link from 'next/link'
import data from '../../../data/portfolio.json'

const SocialIcon = ({ title }) => {
	const className = 'w-4 h-4 shrink-0'

	if (title === 'Github') {
		return (
			<svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
				<path d="M12 2C6.477 2 2 6.484 2 12.021c0 4.428 2.865 8.178 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.021C22 6.484 17.522 2 12 2z" />
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

export default function HeroChapter({ onNavigate }) {
	const handleViewWork = (e) => {
		e.preventDefault()
		onNavigate?.('/#work')
	}

	return (
		<div className="hero-chapter relative z-20 min-h-screen flex flex-col justify-center px-5 tablet:px-12 pointer-events-none">
			<div className="hero-chapter-content cinematic-content-panel cinematic-content-panel-hero max-w-xl tablet:max-w-lg laptop:max-w-xl pointer-events-auto">
				<p className="hero-chapter-eyebrow font-label text-xs uppercase tracking-[0.32em] text-[var(--cinematic-accent)] mb-2">
					{data.headerTaglineOne}
				</p>
				<h1 className="hero-chapter-title font-display text-5xl tablet:text-7xl laptop:text-[5.5rem] font-extrabold leading-[0.95] mb-4">
					{data.headerTaglineTwo}
				</h1>
				<p className="hero-chapter-subtitle font-body text-xl tablet:text-2xl text-white/85 mb-2 font-light">
					{data.headerTaglineThree}
				</p>
				{data.headerTaglineFour && (
					<p className="font-label text-xs uppercase tracking-[0.2em] text-white/45 mb-6">
						{data.headerTaglineFour}
					</p>
				)}

				<div className="flex flex-wrap gap-3 mb-6">
					<Link
						href="/#work"
						onClick={handleViewWork}
						className="cinematic-btn cinematic-accent-btn"
					>
						View Work
					</Link>
					{data.showResume && (
						<Link href="/resume" className="cinematic-btn cinematic-glass-btn">
							Resume
						</Link>
					)}
				</div>

				<div className="flex items-center gap-3">
					{data.socials.map((social) => (
						<a
							key={social.id}
							href={social.link}
							{...(social.title !== 'Email' ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
							className="cinematic-btn cinematic-glass-btn cinematic-btn--icon"
							aria-label={social.title}
						>
							<SocialIcon title={social.title} />
						</a>
					))}
				</div>
			</div>

			<div className="hero-scroll-cue absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none" aria-hidden="true">
				<span className="font-label text-[10px] uppercase tracking-[0.28em] text-white/35">Scroll</span>
				<svg className="w-4 h-4 text-white/35 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
				</svg>
			</div>
		</div>
	)
}
