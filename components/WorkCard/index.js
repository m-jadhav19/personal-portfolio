/* eslint-disable @next/next/no-img-element */
import React, { useRef, useCallback, useEffect, useState } from 'react'
import { gsap } from 'gsap'
import { motion } from 'framer-motion'
import { useTheme } from 'next-themes'

const WorkCard = ({ img, name, description, impact, featured = false, url, tags = [], isActive = false, onSwipeLeft, onSwipeRight }) => {
	const innerRef = useRef(null)
	const glareRef = useRef(null)
	const { theme } = useTheme()
	const [mounted, setMounted] = useState(false)
	const [isTouch, setIsTouch] = useState(false)

	useEffect(() => setMounted(true), [])

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
	const isDark = !mounted || theme === 'dark' || (!theme && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches)

	const raf = useRef(null)
	const current = useRef({ rotX: 0, rotY: 0, glareX: 50, glareY: 50 })
	const target  = useRef({ rotX: 0, rotY: 0, glareX: 50, glareY: 50 })

	const cardStyle = {
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
	}

	const startLerp = useCallback(() => {
		if (raf.current || isTouch) return
		const loop = () => {
			const c = current.current
			const t = target.current
			const factor = 0.12

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

	const cardContent = (
		<>
			<div
				ref={glareRef}
				className='absolute inset-0 rounded-2xl pointer-events-none opacity-0'
				style={{ zIndex: 1, transition: 'opacity 0.3s' }}
			/>

			<div className='relative rounded-xl overflow-hidden aspect-[16/10] mb-4 pointer-events-none' style={{ zIndex: 2 }}>
				<img
					alt={name}
					src={img}
					className='w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.33,1,0.68,1)] group-hover:scale-105'
				/>
				{!isTouch && (
					<>
						<div className='absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400 ease-out' />
						<div className='absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-400 ease-out' style={{ zIndex: 3 }}>
							<span
								className='px-4 py-1.5 rounded-full text-white text-xs font-semibold tracking-wide shadow-xl'
								style={{ background: 'var(--selected-color, #339AF0)', backdropFilter: 'blur(8px)' }}
							>
								View Project ↗
							</span>
						</div>
					</>
				)}
			</div>

			<div className='space-y-2' style={{ zIndex: 2, position: 'relative', pointerEvents: 'none' }}>
				<div className='flex items-center gap-2 flex-wrap'>
					<h3
						className='text-lg font-bold tracking-tight'
						style={{ color: isDark ? '#f0f0f0' : '#111', transition: 'color 0.3s' }}
					>
						{name || 'Project Name'}
					</h3>
					{featured && (
						<span className='project-card-tag px-2 py-0.5 text-[10px] font-label uppercase tracking-wider rounded-full'>
							Featured
						</span>
					)}
				</div>
				{impact && (
					<p
						className='text-xs leading-relaxed text-[var(--cinematic-accent,#339AF0)] font-medium'
						style={{ color: isDark ? 'rgba(51, 154, 240, 0.95)' : '#2563eb' }}
					>
						{impact}
					</p>
				)}
				<p
					className='text-xs line-clamp-2 leading-relaxed'
					style={{ color: isDark ? 'rgba(220,220,230,0.78)' : 'rgba(50,50,60,0.65)' }}
				>
					{description || 'Description'}
				</p>

				<div className='flex flex-wrap gap-1.5 pt-1.5'>
					{tags.map((tag, i) => (
						<span
							key={i}
							className='px-2 py-0.5 text-[11px] font-semibold tracking-wider uppercase rounded-md'
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
		</>
	)

	return (
		<motion.div
			onMouseMove={handleMouseMove}
			onMouseEnter={handleMouseEnter}
			onMouseLeave={handleMouseLeave}
			onPanEnd={(e, info) => {
				if (!isTouch) return
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
			{isTouch ? (
				<div
					ref={innerRef}
					className='work-card-inner group block relative no-underline rounded-2xl overflow-hidden p-4'
					style={cardStyle}
				>
					{cardContent}
				</div>
			) : (
				<a
					href={href}
					{...(isExternal && { target: '_blank', rel: 'noopener noreferrer' })}
					ref={innerRef}
					className='work-card-inner group block relative no-underline rounded-2xl overflow-hidden p-4'
					style={cardStyle}
				>
					{cardContent}
				</a>
			)}

			{isTouch && isActive && isExternal && (
				<a
					href={href}
					target='_blank'
					rel='noopener noreferrer'
					className='mt-3 flex items-center justify-center gap-2 w-full min-h-11 px-4 py-3 rounded-lg text-sm font-semibold tracking-wide transition-all duration-300 active:scale-95'
					style={{
						background: 'var(--selected-color, #339AF0)',
						color: '#ffffff',
					}}
				>
					View Project ↗
				</a>
			)}
		</motion.div>
	)
}

export default WorkCard
