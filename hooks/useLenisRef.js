import { useEffect, useRef } from 'react'

export function useLenisRef() {
	const lenisRef = useRef(null)

	useEffect(() => {
		if (typeof window === 'undefined') return undefined

		const poll = () => {
			if (window.__lenis__) {
				lenisRef.current = window.__lenis__
			} else {
				setTimeout(poll, 50)
			}
		}

		poll()
		return undefined
	}, [])

	const scrollTo = (target, options = {}) => {
		let el = target
		if (typeof target === 'string') {
			const selector = target.startsWith('/#') ? target.slice(1) : target
			el = document.querySelector(selector)
		}
		if (!el) return

		if (lenisRef.current) {
			lenisRef.current.scrollTo(el, { offset: -80, duration: 1.2, ...options })
		} else {
			el.scrollIntoView({ behavior: 'smooth' })
		}
	}

	return { lenisRef, scrollTo }
}
