/* eslint-disable @next/next/no-img-element */
import React, { useRef, useCallback, useEffect, useState } from 'react'
import { gsap } from 'gsap'
import { motion } from 'framer-motion'
import { useTheme } from 'next-themes'

const WorkCard = ({ img, name, description, url, tags = [], onSwipeLeft, onSwipeRight }) => {
	// Keep the tilt on a separate inner ref so the carousel's 3D
	// positioning of the outer wrapper never conflicts.
	const innerRef = useRef(null)
	const glareRef = useRef(null)
	const { theme } = useTheme()
	const [mounted, setMounted] = useState(false)
	const [isTouch, setIsTouch] = useState(false)
	const [isTapped, setIsTapped] = useState(false)
	const tapTimeoutRef = useRef(null)

	useEffect(() => setMounted(true), [])

	// Detect touch devices
	useEffect(() => {
		const checkTouch = () => {
			setIsTouch(('ontouchstart' in window) || (navigator.maxTouchPoints > 0))
		}
		checkTouch()
		window.addEventListener('resize', checkTouch)
		return () => window.removeEventListener('resize', checkTouch)
	}, [])

	const href = url || '#'
	const isExternal = href !== '#'
	// Only evaluate after mount — avoids undefined theme on first render
	const isDark = !mounted || theme === 'dark' || (!theme && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches)

	const raf = useRef(null)
	const current = useRef({ rotX: 0, rotY: 0, glareX: 50, glareY: 50 })
	const target  = useRef({ rotX: 0, rotY: 0, glareX: 50, glareY: 50 })

	// Lerp-based smooth tilt — runs in requestAnimationFrame
	const startLerp = useCallback(() => {
		if (raf.current || isTouch) return // Disable 3D tilt lerp on mobile
		const loop = () => {
			const c = current.current
			const t = target.current
			const factor = 0.12 // lower = more inertia

			c.rotX   += (t.rotX   - c.rotX)   * factor
			c.rotY   += (t.rotY   - c.rotY)   * factor
			c.glareX += (t.glareX - c.glareX) * factor
			c.glareY += (t.glareY - c.glareY) * factor

			if (innerRef.current) {
				gsap.set(innerRef.current, {
					rotationX: c.rotX,
					rotationY: c.rotY,
					transformPerspective: 900,
					transformOrigin: 'center center',
				})
			}

			if (glareRef.current) {
				gsap.set(glareRef.current, {
					background: `radial-gradient(circle at ${c.glareX}% ${c.glareY}%, rgba(255,255,255,${isDark ? 0.12 : 0.22}) 0%, transparent 60%)`,
					opacity: 1,
				})
			}

			// Stop the loop once settled
			const settled =
				Math.abs(t.rotX - c.rotX) < 0.01 &&
				Math.abs(t.rotY - c.rotY) < 0.01

			if (!settled) {
				raf.current = requestAnimationFrame(loop)
			} else {
				raf.current = null
			}
		}
		raf.current = requestAnimationFrame(loop)
	}, [isDark, isTouch])

	const handleMouseMove = (e) => {
		if (isTouch || !innerRef.current) return
		const rect = innerRef.current.getBoundingClientRect()
		const x = e.clientX - rect.left
		const y = e.clientY - rect.top
		const cx = rect.width  / 2
		const cy = rect.height / 2
		// Gentle tilt: ±8 degrees max
		target.current.rotX   = -((y - cy) / cy) * 8
		target.current.rotY   =  ((x - cx) / cx) * 8
		target.current.glareX = (x / rect.width)  * 100
		target.current.glareY = (y / rect.height) * 100
		startLerp()
	}

	const handleMouseEnter = () => {
		if (isTouch) return
		if (innerRef.current) {
			gsap.to(innerRef.current, {
				scale: 1.03,
				duration: 0.5,
				ease: 'power2.out',
			})
		}
		if (glareRef.current) {
			gsap.to(glareRef.current, { opacity: 1, duration: 0.3 })
		}
	}

	const handleMouseLeave = () => {
		if (isTouch) return
		// Smoothly reset the targets
		target.current = { rotX: 0, rotY: 0, glareX: 50, glareY: 50 }
		startLerp()

		if (innerRef.current) {
			gsap.to(innerRef.current, {
				scale: 1,
				duration: 0.7,
				ease: 'power3.out',
			})
		}
		if (glareRef.current) {
			gsap.to(glareRef.current, { opacity: 0, duration: 0.5 })
		}
	}

	const handleClick = (e) => {
		// If on a mouse device, just act as a normal link
		if (!isTouch) return

		// On mobile, block the default link behavior
		e.preventDefault()

		if (isTapped) {
			// Second tap: Follow the link
			if (isExternal) {
				window.open(href, '_blank', 'noopener,noreferrer')
			} else {
				window.location.href = href
			}
			setIsTapped(false)
			if (tapTimeoutRef.current) clearTimeout(tapTimeoutRef.current)
		} else {
			// First tap: Show action state
			setIsTapped(true)
			
			// Reset back to untapped state after 3 seconds
			if (tapTimeoutRef.current) clearTimeout(tapTimeoutRef.current)
			tapTimeoutRef.current = setTimeout(() => {
				setIsTapped(false)
			}, 3000)
		}
	}

	return (
		<motion.div
			onMouseMove={handleMouseMove}
			onMouseEnter={handleMouseEnter}
			onMouseLeave={handleMouseLeave}
			onPanEnd={(e, info) => {
				if (!isTouch) return
				// Thresholds: distance > 50px OR velocity > 500px/s
				const threshold = 50
				const velocityThreshold = 500
				
				if (Math.abs(info.offset.x) > threshold || Math.abs(info.velocity.x) > velocityThreshold) {
					if (info.offset.x < -threshold || info.velocity.x < -velocityThreshold) {
						onSwipeLeft?.()
					} else if (info.offset.x > threshold || info.velocity.x > velocityThreshold) {
						onSwipeRight?.()
					}
				}
			}}
			className='work-card-outer block'
			style={{ perspective: '900px', touchAction: 'pan-y' }}
		>
			{/* Inner wrapper — tilt target */}
			<a
				href={href}
				onClick={handleClick}
				{...(isExternal && !isTouch && { target: '_blank', rel: 'noopener noreferrer' })}
				ref={innerRef}
				className={`work-card-inner group block relative no-underline rounded-2xl overflow-hidden p-4 ${isTapped ? 'is-tapped' : ''}`}
				style={{
					transformStyle: 'preserve-3d',
					willChange: 'transform',
					background: isDark
						? 'rgba(15, 15, 20, 0.7)'
						: 'rgba(255, 255, 255, 0.75)',
					backdropFilter: 'blur(16px)',
					WebkitBackdropFilter: 'blur(16px)',
					border: isDark
						? '1px solid rgba(255, 255, 255, 0.08)'
						: '1px solid rgba(0, 0, 0, 0.06)',
					boxShadow: isDark
						? '0 20px 60px rgba(0,0,0,0.5), 0 4px 16px rgba(0,0,0,0.3)'
						: '0 20px 60px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.06)',
				}}
			>
				{/* Glare overlay */}
				<div
					ref={glareRef}
					className='absolute inset-0 rounded-2xl pointer-events-none opacity-0'
					style={{ zIndex: 1, transition: 'opacity 0.3s' }}
				/>

				{/* Image */}
				<div className='relative rounded-xl overflow-hidden aspect-[16/10] mb-4 pointer-events-none' style={{ zIndex: 2 }}>
					<img
						alt={name}
						src={img}
						className='w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.33,1,0.68,1)] group-hover:scale-105 group-[.is-tapped]:scale-105'
					/>
					{/* Dark overlay on hover/tap via CSS class on parent */}
					<div
						className='absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 group-[.is-tapped]:opacity-100 transition-opacity duration-400 ease-out'
					/>
					{/* Visit label */}
					<div
						className='absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 group-[.is-tapped]:opacity-100 transition-opacity duration-400 ease-out'
						style={{ zIndex: 3 }}
					>
						<span
							className='px-4 py-1.5 rounded-full text-white text-xs font-semibold tracking-wide shadow-xl'
							style={{ background: 'var(--selected-color, #339AF0)', backdropFilter: 'blur(8px)' }}
						>
							{isTouch ? (isTapped ? 'Tap again to open ↗' : 'View Project') : 'View Project ↗'}
						</span>
					</div>
				</div>

				{/* Text */}
				<div className='space-y-2' style={{ zIndex: 2, position: 'relative', pointerEvents: 'none' }}>
					<h3
						className='text-lg font-bold tracking-tight'
						style={{
							color: isDark ? '#f0f0f0' : '#111',
							transition: 'color 0.3s',
						}}
					>
						{name || 'Project Name'}
					</h3>
					<p
						className='text-xs line-clamp-2 leading-relaxed'
						style={{ color: isDark ? 'rgba(200,200,210,0.7)' : 'rgba(50,50,60,0.65)' }}
					>
						{description || 'Description'}
					</p>

					<div className='flex flex-wrap gap-1.5 pt-1.5'>
						{tags.map((tag, i) => (
							<span
								key={i}
								className='px-2 py-0.5 text-[9px] font-semibold tracking-wider uppercase rounded-md'
								style={{
									background: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)',
									border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
									color: isDark ? 'rgba(200,200,210,0.7)' : 'rgba(50,50,60,0.65)',
								}}
							>
								{tag}
							</span>
						))}
					</div>
				</div>
			</a>
		</motion.div>
	)
}

export default WorkCard
