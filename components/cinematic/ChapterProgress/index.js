import { useEffect, useState } from 'react'
import { CHAPTERS } from '../../../hooks/useChapterSpy'

export default function ChapterProgress({ onNavigate, activeChapter = 'intro' }) {
	const [progress, setProgress] = useState(0)

	useEffect(() => {
		if (typeof window === 'undefined') return undefined

		const update = () => {
			const max = document.documentElement.scrollHeight - window.innerHeight
			if (max <= 0) {
				setProgress(0)
				return
			}
			setProgress(window.scrollY / max)
		}

		update()
		window.addEventListener('scroll', update, { passive: true })
		return () => window.removeEventListener('scroll', update)
	}, [])

	const handleChapterClick = (href, e) => {
		if (onNavigate) {
			e.preventDefault()
			onNavigate(href)
		}
	}

	return (
		<div
			className="chapter-progress fixed right-5 tablet:right-8 top-1/2 -translate-y-1/2 z-40 hidden laptop:flex flex-col items-end gap-5"
			aria-label="Page sections"
		>
			<div className="flex flex-col items-end gap-3">
				{CHAPTERS.map(({ id, label, href }) => (
					<a
						key={id}
						href={href}
						onClick={(e) => handleChapterClick(href, e)}
						className={`chapter-progress-link group flex items-center gap-3 transition-colors ${
							activeChapter === id ? 'chapter-progress-link-active' : ''
						}`}
						aria-current={activeChapter === id ? 'true' : undefined}
					>
						<span className="font-label text-[10px] uppercase tracking-[0.25em] opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
							{label}
						</span>
						<span className={`chapter-progress-dot block rounded-full transition-all duration-300 ${
							activeChapter === id ? 'chapter-progress-dot-active' : ''
						}`} />
					</a>
				))}
			</div>

			<div className="w-px h-24 bg-white/10 relative mt-1" aria-hidden="true">
				<div
					className="absolute top-0 left-0 w-full bg-[var(--cinematic-accent)] transition-[height] duration-150"
					style={{ height: `${progress * 100}%` }}
				/>
			</div>
		</div>
	)
}
