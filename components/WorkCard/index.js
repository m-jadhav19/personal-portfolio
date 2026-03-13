/* eslint-disable @next/next/no-img-element */
import React, { useRef, useCallback, useEffect, useState } from 'react'
import { gsap } from 'gsap'
import { useTheme } from 'next-themes'

const WorkCard = ({ img, name, description, url, tags = [] }) => {
	// Keep the tilt on a separate inner ref so the carousel's 3D
	// positioning of the outer wrapper never conflicts.
	const innerRef = useRef(null)
	const glareRef = useRef(null)
	const { theme } = useTheme()
	const [mounted, setMounted] = useState(false)
	useEffect(() => setMounted(true), [])

	const href = url || '#'
	const isExternal = href !== '#'
	// Only evaluate after mount — avoids undefined theme on first render
	const isDark = !mounted || theme === 'dark' || (!theme && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches)

	const raf = useRef(null)
	const current = useRef({ rotX: 0, rotY: 0, glareX: 50, glareY: 50 })
	const target  = useRef({ rotX: 0, rotY: 0, glareX: 50, glareY: 50 })

	// Lerp-based smooth tilt — runs in requestAnimationFrame
	const startLerp = useCallback(() => {
		if (raf.current) return
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
	}, [isDark])

	const handleMouseMove = (e) => {
		if (!innerRef.current) return
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

	return (
		<div
			onMouseMove={handleMouseMove}
			onMouseEnter={handleMouseEnter}
			onMouseLeave={handleMouseLeave}
			className='work-card-outer block'
			style={{ perspective: '900px' }}
		>
			{/* Inner wrapper — tilt target */}
			<a
				href={href}
				{...(isExternal && { target: '_blank', rel: 'noopener noreferrer' })}
				ref={innerRef}
				className='work-card-inner group block relative no-underline rounded-2xl overflow-hidden p-4'
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
						className='w-full h-full object-cover'
						style={{ transition: 'transform 0.6s cubic-bezier(0.33,1,0.68,1)' }}
					/>
					{/* Dark overlay on hover via CSS class on parent */}
					<div
						className='absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100'
						style={{ transition: 'opacity 0.4s ease' }}
					/>
					{/* Visit label */}
					<div
						className='absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100'
						style={{ transition: 'opacity 0.4s ease', zIndex: 3 }}
					>
						<span
							className='px-4 py-1.5 rounded-full text-white text-xs font-semibold tracking-wide'
							style={{ background: 'var(--selected-color, #339AF0)', backdropFilter: 'blur(8px)' }}
						>
							View Project ↗
						</span>
					</div>
				</div>

				{/* Text */}
				<div className='space-y-2' style={{ zIndex: 2, position: 'relative' }}>
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
		</div>
	)
}

export default WorkCard
