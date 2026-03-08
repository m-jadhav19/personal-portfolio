import { useEffect, useRef } from 'react'
import { useTheme } from 'next-themes'

const PARTICLE_COUNT = 80
const MAX_RADIUS = 2
const DRIFT = 0.3

function ParticleBackground() {
	const canvasRef = useRef(null)
	const animationRef = useRef(null)
	const particlesRef = useRef([])
	const { theme, resolvedTheme } = useTheme()

	useEffect(() => {
		const canvas = canvasRef.current
		if (!canvas) return

		const ctx = canvas.getContext('2d')
		let width = window.innerWidth
		let height = window.innerHeight

		const setSize = () => {
			width = window.innerWidth
			height = window.innerHeight
			canvas.width = width
			canvas.height = height
			canvas.style.width = width + 'px'
			canvas.style.height = height + 'px'
		}

		const createParticles = () => {
			const isDark =
				typeof document !== 'undefined' &&
				(document.documentElement.getAttribute('data-theme') === 'dark' ||
					document.documentElement.classList.contains('dark') ||
					window.matchMedia('(prefers-color-scheme: dark)').matches)
			const baseColor = isDark ? '255' : '0'
			return Array.from({ length: PARTICLE_COUNT }, () => ({
				x: Math.random() * width,
				y: Math.random() * height,
				vx: (Math.random() - 0.5) * DRIFT,
				vy: (Math.random() - 0.5) * DRIFT,
				radius: Math.random() * MAX_RADIUS + 0.5,
				opacity: 0.15 + Math.random() * 0.25,
				color: `rgba(${baseColor}, ${baseColor}, ${baseColor}`,
			}))
		}

		setSize()
		particlesRef.current = createParticles()

		const animate = () => {
			if (!ctx || !canvas) return
			ctx.clearRect(0, 0, width, height)

			particlesRef.current.forEach((p) => {
				p.x += p.vx
				p.y += p.vy
				if (p.x < 0 || p.x > width) p.vx *= -1
				if (p.y < 0 || p.y > height) p.vy *= -1
				p.x = Math.max(0, Math.min(width, p.x))
				p.y = Math.max(0, Math.min(height, p.y))

				ctx.beginPath()
				ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
				ctx.fillStyle = `${p.color}, ${p.opacity})`
				ctx.fill()
			})

			animationRef.current = requestAnimationFrame(animate)
		}

		animate()

		const handleResize = () => {
			setSize()
			particlesRef.current = createParticles()
		}

		window.addEventListener('resize', handleResize)
		return () => {
			window.removeEventListener('resize', handleResize)
			if (animationRef.current) cancelAnimationFrame(animationRef.current)
		}
	}, [theme, resolvedTheme])

	return (
		<div className="particle-background" aria-hidden="true">
			<canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
		</div>
	)
}

export default ParticleBackground
