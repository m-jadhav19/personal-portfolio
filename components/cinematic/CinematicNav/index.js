import { useState, useEffect } from 'react'
import Link from 'next/link'
import data from '../../../data/portfolio.json'

const anchorLinks = [
	{ label: 'Work', href: '/#work', chapterId: 'work', index: '01' },
	{ label: 'About', href: '/#about', chapterId: 'about', index: '02' },
	{ label: 'Contact', href: '/#contact', chapterId: 'contact', index: '03' },
]

export default function CinematicNav({ onNavigate, activeChapter = 'intro', scrolled = false, className = '' }) {
	const [menuOpen, setMenuOpen] = useState(false)
	const { showResume } = data

	useEffect(() => {
		if (typeof document === 'undefined') return undefined
		document.body.style.overflow = menuOpen ? 'hidden' : ''
		return () => {
			document.body.style.overflow = ''
		}
	}, [menuOpen])

	const handleAnchorClick = (item, e) => {
		if (onNavigate) {
			e.preventDefault()
			onNavigate(item.href)
		}
		setMenuOpen(false)
	}

	const linkClass = (chapterId) => {
		const base = 'cinematic-nav-link'
		return chapterId && activeChapter === chapterId
			? `${base} cinematic-nav-link-active`
			: base
	}

	return (
		<nav
			className={`cinematic-nav fixed top-0 left-0 right-0 z-50 px-4 tablet:px-8 py-4 ${className}`}
			aria-label="Main navigation"
		>
			<div
				className={`cinematic-nav-shell mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-4 py-2.5 tablet:px-5 tablet:py-3 ${
					scrolled ? 'cinematic-nav-shell-scrolled' : ''
				}`}
			>
				<Link href="/" passHref>
					<a className="cinematic-nav-logo font-display text-base tablet:text-lg tracking-tight shrink-0">
						{data.name}
					</a>
				</Link>

				<ul className="cinematic-nav-links hidden tablet:flex items-center gap-1">
					{anchorLinks.map((item) => (
						<li key={item.label}>
							<a
								href={item.href}
								className={linkClass(item.chapterId)}
								onClick={(e) => handleAnchorClick(item, e)}
								aria-current={activeChapter === item.chapterId ? 'true' : undefined}
							>
								{item.label}
							</a>
						</li>
					))}
				</ul>

				<div className="flex items-center gap-2 shrink-0">
					{showResume && (
						<Link href="/resume" passHref>
							<a className="cinematic-btn cinematic-accent-btn hidden tablet:inline-flex !min-h-9 !px-5 !py-2 !text-[0.65rem]">
								Resume
							</a>
						</Link>
					)}

					<button
						type="button"
						className="tablet:hidden cinematic-nav-menu-btn flex items-center justify-center w-10 h-10 rounded-full cinematic-glass-btn"
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
				</div>
			</div>

			<div
				id="cinematic-mobile-menu"
				className={`cinematic-mobile-menu tablet:hidden fixed inset-0 z-40 flex flex-col transition-all duration-300 ${
					menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
				}`}
				aria-hidden={!menuOpen}
			>
				<div
					className="absolute inset-0 bg-[#07080b]/96 backdrop-blur-2xl"
					onClick={() => setMenuOpen(false)}
					aria-hidden="true"
				/>

				<div className="relative z-10 flex flex-1 flex-col justify-between px-8 pb-12 pt-28">
					<ul className="flex flex-col gap-2">
						{anchorLinks.map((item) => (
							<li key={item.label}>
								<a
									href={item.href}
									className={`cinematic-mobile-nav-link group ${
										activeChapter === item.chapterId ? 'cinematic-mobile-nav-link-active' : ''
									}`}
									onClick={(e) => handleAnchorClick(item, e)}
									aria-current={activeChapter === item.chapterId ? 'true' : undefined}
								>
									<span className="cinematic-mobile-nav-index">{item.index}</span>
									<span className="font-display text-4xl font-bold tracking-tight">{item.label}</span>
								</a>
							</li>
						))}
					</ul>

					{showResume && (
						<Link href="/resume" passHref>
							<a
								className="cinematic-btn cinematic-accent-btn w-full"
								onClick={() => setMenuOpen(false)}
							>
								View Resume
							</a>
						</Link>
					)}
				</div>
			</div>
		</nav>
	)
}
