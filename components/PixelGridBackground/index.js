import { useEffect, useRef } from 'react'

export default function PixelGridBackground() {
	const gridRef = useRef(null)
	const blobRef = useRef(null)
	const blobVelocity = useRef({ x: 2, y: 2 })
	const colorPhase = useRef(0)
	const animationFrameRef = useRef(null)

	useEffect(() => {
		if (typeof window === 'undefined') return

		const blob = blobRef.current
		if (!blob) return

		// Initial random position
		const startX = Math.random() * (window.innerWidth - 200) + 100
		const startY = Math.random() * (window.innerHeight - 200) + 100
		blob.style.left = startX + 'px'
		blob.style.top = startY + 'px'

		// DVD screensaver animation
		const animateBlob = () => {
			if (!blob) return

			const rect = blob.getBoundingClientRect()
			const windowWidth = window.innerWidth
			const windowHeight = window.innerHeight

			// Check boundaries and bounce
			if (rect.left <= 0 || rect.right >= windowWidth) {
				blobVelocity.current.x = -blobVelocity.current.x
			}
			if (rect.top <= 0 || rect.bottom >= windowHeight) {
				blobVelocity.current.y = -blobVelocity.current.y
			}

			// Update position
			blob.style.left = parseFloat(blob.style.left) + blobVelocity.current.x + 'px'
			blob.style.top = parseFloat(blob.style.top) + blobVelocity.current.y + 'px'

			// Gradually change color using HSL
			colorPhase.current += 0.01
			const hue = (colorPhase.current * 50) % 360
			const saturation = 70 + Math.sin(colorPhase.current * 2) * 30
			const lightness = 50 + Math.sin(colorPhase.current * 1.5) * 20
			
			// Update gradient background color
			const color1 = `hsla(${hue}, ${saturation}%, ${lightness + 20}%, 0.5)`
			const color2 = `hsla(${hue + 30}, ${saturation + 10}%, ${lightness + 10}%, 0.4)`
			const color3 = `hsla(${hue + 60}, ${saturation}, ${lightness}, 0.3)`
			blob.style.background = `radial-gradient(ellipse 150px 100px at center, ${color1}, ${color2}, ${color3}, transparent)`
			
			// Update box shadow for glow effect
			const boxShadow = `0 0 80px hsla(${hue}, ${saturation}%, ${lightness}%, 0.4)`
			blob.style.boxShadow = boxShadow

			animationFrameRef.current = requestAnimationFrame(animateBlob)
		}

		animateBlob()

		// Grid click interaction
		const grid = gridRef.current
		if (grid) {
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
				if (animationFrameRef.current) {
					cancelAnimationFrame(animationFrameRef.current)
				}
			}
		}
	}, [])

	return (
		<div className="pixel-grid-background" ref={gridRef}>
			<div className="grid-container"></div>
			<div className="floating-blob" ref={blobRef}></div>
		</div>
	)
}

