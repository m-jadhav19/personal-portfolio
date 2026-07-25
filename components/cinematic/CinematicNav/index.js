import { useState, useEffect } from 'react'
import Link from 'next/link'
import data from '../../../data/portfolio.json'

const navItems = [
	{ label: 'Work', href: '/#work', type: 'anchor' },
	{ label: 'About', href: '/#about', type: 'anchor' },
	{ label: 'Contact', href: '/#contact', type: 'anchor' },
	{ label: 'Resume', href: '/resume', type: 'link' },
	{ label: 'Blog', href: '/blog', type: 'link' },
]

export default function CinematicNav({ onNavigate, className = '' }) {
	const [menuOpen, setMenuOpen] = useState(false)

	useEffect(() => {
		if (typeof document === 'undefined') return undefined
		document.body.style.overflow = menuOpen ? 'hidden' : ''
		return () => {
			document.body.style.overflow = ''
		}
	}, [menuOpen])

	const handleClick = (item, e) => {
		if (item.type === 'anchor' && onNavigate) {
			e.preventDefault()
			onNavigate(item.href)
		}
		setMenuOpen(false)
	}

	const linkClass = 'cinematic-nav-link text-sm uppercase tracking-widest'

	return (
		<nav
			className={`cinematic-nav fixed top-0 left-0 right-0 z-50 px-5 tablet:px-10 py-5 flex items-center justify-between ${className}`}
			aria-label="Main navigation"
		>
			<Link href="/" className="cinematic-nav-logo font-display text-lg tracking-tight">
				{data.name}
			</Link>

			<button
				type="button"
				className="tablet:hidden cinematic-nav-menu-btn cinematic-btn cinematic-glass-btn cinematic-btn--icon"
				onClick={() => setMenuOpen((open) => !open)}
				aria-expanded={menuOpen}
				aria-controls="cinematic-mobile-menu"
				aria-label={menuOpen ? 'Close menu' : 'Open menu'}
			>
				{menuOpen ? (
					<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
					</svg>
				) : (
					<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
					</svg>
				)}
			</button>

			<ul className="hidden tablet:flex items-center gap-6 tablet:gap-8">
				{navItems.map((item) => (
					<li key={item.label}>
						{item.type === 'link' ? (
							<Link href={item.href} className={linkClass}>
								{item.label}
							</Link>
						) : (
							<a
								href={item.href}
								className={linkClass}
								onClick={(e) => handleClick(item, e)}
							>
								{item.label}
							</a>
						)}
					</li>
				))}
			</ul>

			<div
				id="cinematic-mobile-menu"
				className={`cinematic-mobile-menu tablet:hidden fixed inset-0 z-40 flex flex-col items-center justify-center gap-8 transition-all duration-300 ${
					menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
				}`}
				aria-hidden={!menuOpen}
			>
				<div
					className="absolute inset-0 bg-[#0a0a0a]/95 backdrop-blur-xl"
					onClick={() => setMenuOpen(false)}
					aria-hidden="true"
				/>
				<ul className="relative z-10 flex flex-col items-center gap-6">
					{navItems.map((item) => (
						<li key={item.label}>
							{item.type === 'link' ? (
								<Link
									href={item.href}
									className="font-display text-3xl font-bold text-white/90 hover:text-[var(--cinematic-accent)] transition-colors"
									onClick={() => setMenuOpen(false)}
								>
									{item.label}
								</Link>
							) : (
								<a
									href={item.href}
									className="font-display text-3xl font-bold text-white/90 hover:text-[var(--cinematic-accent)] transition-colors"
									onClick={(e) => handleClick(item, e)}
								>
									{item.label}
								</a>
							)}
						</li>
					))}
				</ul>
			</div>
		</nav>
	)
}
