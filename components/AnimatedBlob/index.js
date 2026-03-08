import { useEffect, useRef } from 'react'
import { spline } from '@georgedoescode/spline'
import { createNoise2D } from 'simplex-noise'

export default function AnimatedBlob() {
	const containerRef = useRef(null)
	const pathRef = useRef(null)
	const rootRef = useRef(null)
	const noiseStepRef = useRef(0.005)
	const noise2D = useRef(null)
	const blobVelocity = useRef({ x: 1.5, y: 2.5 })
	const blobPosition = useRef({ x: 0, y: 0 })
	const animationFrameId = useRef(null)
	const frameSkip = useRef(0)
	const hueNoiseOffsetRef = useRef(0)

	// Helper function to map a value from one range to another
	const map = (n, start1, end1, start2, end2) => {
		return ((n - start1) / (end1 - start1)) * (end2 - start2) + start2
	}

	// Wrapper for noise function
	const noise = (x, y) => {
		if (!noise2D.current) return 0
		return noise2D.current(x, y)
	}

	// Create initial points for the blob
	const createPoints = () => {
		const points = []
		const numPoints = 6
		const angleStep = (Math.PI * 2) / numPoints
		const rad = 75

		for (let i = 1; i <= numPoints; i++) {
			const theta = i * angleStep
			const x = 100 + Math.cos(theta) * rad
			const y = 100 + Math.sin(theta) * rad

			points.push({
				x,
				y,
				originX: x,
				originY: y,
				noiseOffsetX: Math.random() * 1000,
				noiseOffsetY: Math.random() * 1000
			})
		}

		return points
	}

	const points = createPoints()

	useEffect(() => {
		const container = containerRef.current
		const path = pathRef.current
		const root = document.documentElement
		rootRef.current = root

		if (!container || !path) return

		// Initialize the noise function
		noise2D.current = createNoise2D()

			// Initialize blob position
		const blobSize = 400 // Approximate size in pixels
		blobPosition.current.x = Math.random() * (window.innerWidth - blobSize) + blobSize / 2
		blobPosition.current.y = Math.random() * (window.innerHeight - blobSize) + blobSize / 2
		container.style.left = blobPosition.current.x + 'px'
		container.style.top = blobPosition.current.y + 'px'
		
		// Enable GPU acceleration
		container.style.transform = 'translateZ(0)'
		container.style.willChange = 'transform'

		const animate = () => {
			if (!container || !path) return

			const windowWidth = window.innerWidth
			const windowHeight = window.innerHeight

			// Update position
			blobPosition.current.x += blobVelocity.current.x
			blobPosition.current.y += blobVelocity.current.y

			// Check boundaries and bounce
			if (blobPosition.current.x <= 0 || blobPosition.current.x >= windowWidth - blobSize) {
				blobVelocity.current.x = -blobVelocity.current.x
				blobPosition.current.x = Math.max(0, Math.min(blobPosition.current.x, windowWidth - blobSize))
			}
			if (blobPosition.current.y <= 0 || blobPosition.current.y >= windowHeight - blobSize) {
				blobVelocity.current.y = -blobVelocity.current.y
				blobPosition.current.y = Math.max(0, Math.min(blobPosition.current.y, windowHeight - blobSize))
			}

			// Update DOM position using transform for better performance
			container.style.transform = `translate(${blobPosition.current.x}px, ${blobPosition.current.y}px) translateZ(0)`

			// Skip expensive blob morphing on some frames for performance
			frameSkip.current++
			if (frameSkip.current % 2 === 0) {
				// Update blob shape animation
				path.setAttribute('d', spline(points, 1, true))

				// Update each point's position based on noise
				for (let i = 0; i < points.length; i++) {
					const point = points[i]
					const nX = noise(point.noiseOffsetX, point.noiseOffsetX)
					const nY = noise(point.noiseOffsetY, point.noiseOffsetY)

					point.x = map(nX, -1, 1, point.originX - 20, point.originX + 20)
					point.y = map(nY, -1, 1, point.originY - 20, point.originY + 20)
					point.noiseOffsetX += noiseStepRef.current
					point.noiseOffsetY += noiseStepRef.current
				}
			}

			// Update colors less frequently for performance
			if (frameSkip.current % 3 === 0) {
				const hueNoise = noise(hueNoiseOffsetRef.current, hueNoiseOffsetRef.current)
				const hue = map(hueNoise, -1, 1, 0, 360)

				if (root) {
					root.style.setProperty('--startColor', `hsl(${hue}, 100%, 75%)`)
					root.style.setProperty('--stopColor', `hsl(${hue + 60}, 100%, 75%)`)
				}

				hueNoiseOffsetRef.current += noiseStepRef.current / 6
			}

			animationFrameId.current = requestAnimationFrame(animate)
		}

		// Start animation
		animationFrameId.current = requestAnimationFrame(animate)

		// Mouse interaction
		const handleMouseOver = () => {
			noiseStepRef.current = 0.01
		}

		const handleMouseLeave = () => {
			noiseStepRef.current = 0.005
		}

		path.addEventListener('mouseover', handleMouseOver)
		path.addEventListener('mouseleave', handleMouseLeave)

		return () => {
			if (animationFrameId.current) {
				cancelAnimationFrame(animationFrameId.current)
			}
			path.removeEventListener('mouseover', handleMouseOver)
			path.removeEventListener('mouseleave', handleMouseLeave)
		}
	}, [])

	return (
		<div className="animated-blob-container" ref={containerRef}>
			<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
				<defs>
					<linearGradient id="blobGradient" gradientTransform="rotate(90)">
						<stop id="gradientStop1" offset="0%" stopColor="var(--startColor)" />
						<stop id="gradientStop2" offset="100%" stopColor="var(--stopColor)" />
					</linearGradient>
				</defs>
				<path ref={pathRef} d="" fill="url('#blobGradient')" />
			</svg>
		</div>
	)
}

