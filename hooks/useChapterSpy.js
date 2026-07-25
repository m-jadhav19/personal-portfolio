import { useEffect, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
	gsap.registerPlugin(ScrollTrigger)
}

export const CHAPTERS = [
	{ id: 'intro', label: 'Intro', href: '/' },
	{ id: 'work', label: 'Work', href: '/#work' },
	{ id: 'about', label: 'About', href: '/#about' },
	{ id: 'contact', label: 'Contact', href: '/#contact' },
]

function getChapterElement(id) {
	if (id === 'intro') return document.querySelector('.intro-chapter')
	return document.getElementById(id)
}

export function useChapterSpy() {
	const [activeChapter, setActiveChapter] = useState('intro')
	const [scrolled, setScrolled] = useState(false)

	useEffect(() => {
		if (typeof window === 'undefined') return undefined

		const updateScrolled = () => {
			setScrolled(window.scrollY > 32)
		}

		updateScrolled()
		window.addEventListener('scroll', updateScrolled, { passive: true })

		const triggers = CHAPTERS.map(({ id }) => {
			const el = getChapterElement(id)
			if (!el) return null

			return ScrollTrigger.create({
				trigger: el,
				start: 'top 55%',
				end: 'bottom 45%',
				onEnter: () => setActiveChapter(id),
				onEnterBack: () => setActiveChapter(id),
			})
		}).filter(Boolean)

		return () => {
			window.removeEventListener('scroll', updateScrolled)
			triggers.forEach((trigger) => trigger.kill())
		}
	}, [])

	return { activeChapter, scrolled }
}
