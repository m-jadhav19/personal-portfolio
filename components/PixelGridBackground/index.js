import { useEffect, useRef } from 'react'
import AnimatedBlob from '../AnimatedBlob'

export default function PixelGridBackground() {
	const gridRef = useRef(null)

	useEffect(() => {
		if (typeof window === 'undefined') return

		const grid = gridRef.current
		if (!grid) return

		// Grid click interaction
		const handleClick = (e) => {
			// Create ripple effect
			const ripple = document.createElement('div')
			ripple.classList.add('grid-ripple')
			ripple.style.left = e.clientX + 'px'
			ripple.style.top = e.clientY + 'px'
			document.body.appendChild(ripple)

			setTimeout(() => {
				ripple.remove()
			}, 600)
		}

		grid.addEventListener('click', handleClick)

		return () => {
			grid.removeEventListener('click', handleClick)
		}
	}, [])

	return (
		<div className="pixel-grid-background" ref={gridRef}>
			<div className="grid-container"></div>
			<AnimatedBlob />
		</div>
	)
}

