import { useEffect, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
	gsap.registerPlugin(ScrollTrigger)
}

export default function ChapterProgress() {
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

	return (
		<div className="chapter-progress fixed right-5 tablet:right-8 top-1/2 -translate-y-1/2 z-40 hidden laptop:block" aria-hidden="true">
			<div className="w-px h-32 bg-white/10 relative">
				<div
					className="absolute top-0 left-0 w-full bg-[var(--cinematic-accent)] transition-[height] duration-150"
					style={{ height: `${progress * 100}%` }}
				/>
			</div>
		</div>
	)
}
