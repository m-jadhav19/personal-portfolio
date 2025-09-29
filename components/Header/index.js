import {Popover} from '@headlessui/react'
import {useTheme} from 'next-themes'
import {useRouter} from 'next/router'
import React, {useEffect, useState, useRef} from 'react'
import {gsap} from 'gsap'
import {useGSAP} from '@gsap/react'
import Button from '../Button'

import data from '../../data/portfolio.json'
import Image from 'next/image'

const Header = ({handleWorkScroll, handleAboutScroll, isBlog}) => {
	const router = useRouter()
	const {theme, setTheme} = useTheme()
	const [mounted, setMounted] = useState(false)
	const [activeLink, setActiveLink] = useState('')
	const headerRef = useRef()
	const navLinksRef = useRef([])

	const {name, showBlog, showResume} = data

	useEffect(() => {
		setMounted(true)
	}, [])

	useGSAP(() => {
		// Header entrance animation
		gsap.fromTo(headerRef.current, 
			{ opacity: 0, y: -20 },
			{ 
				opacity: 1, 
				y: 0, 
				duration: 0.8,
				ease: "power2.out",
				delay: 0.2
			}
		)

		// Nav links stagger animation
		gsap.fromTo(navLinksRef.current,
			{ opacity: 0, y: -10 },
			{
				opacity: 1,
				y: 0,
				duration: 0.6,
				ease: "power2.out",
				stagger: 0.1,
				delay: 0.4
			}
		)
	}, [])

	const renderThemeChanger = () => {
		if (!mounted) return null
		const currentTheme = theme === 'system' ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : theme

		return (
			<Button onClick={() => setTheme(currentTheme === 'dark' ? 'light' : 'dark')}>
				<div
					className='h-6 w-6 transition-transform duration-300 transform'
					style={{
						transform: currentTheme === 'dark' ? 'rotate(0deg)' : 'rotate(360deg)',
						color: 'var(--selected-color, #00cdac)'
					}}>
					{currentTheme === 'dark' ? (
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
							<path fillRule="evenodd" d="M9.528 1.718a.75.75 0 0 1 .162.819A8.97 8.97 0 0 0 9 6a9 9 0 0 0 9 9 8.97 8.97 0 0 0 3.463-.69.75.75 0 0 1 .981.98 10.503 10.503 0 0 1-9.694 6.46c-5.799 0-10.5-4.7-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 0 1 .818.162Z" clipRule="evenodd" />
						</svg>
					) : (
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
							<path d="M12 2.25a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-1.5 0V3a.75.75 0 0 1 .75-.75ZM7.5 12a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM18.894 6.166a.75.75 0 0 0-1.06-1.06l-1.591 1.59a.75.75 0 1 0 1.06 1.061l1.591-1.59ZM21.75 12a.75.75 0 0 1-.75.75h-2.25a.75.75 0 0 1 0-1.5H21a.75.75 0 0 1 .75.75ZM17.834 18.894a.75.75 0 0 0 1.06-1.06l-1.59-1.591a.75.75 0 1 0-1.061 1.06l1.59 1.591ZM12 18a.75.75 0 0 1 .75.75V21a.75.75 0 0 1-1.5 0v-2.25A.75.75 0 0 1 12 18ZM7.758 17.303a.75.75 0 0 0-1.061-1.06l-1.591 1.59a.75.75 0 0 0 1.06 1.061l1.591-1.59ZM6 12a.75.75 0 0 1-.75.75H3a.75.75 0 0 1 0-1.5h2.25A.75.75 0 0 1 6 12ZM6.697 7.757a.75.75 0 0 0 1.06-1.06l-1.59-1.591a.75.75 0 0 0-1.061 1.06l1.59 1.591Z" />
						</svg>
					)}
				</div>
			</Button>
		)
	}

	const handleNavClick = (linkName, action) => {
		setActiveLink(linkName)
		action()
		
		// Animate underline
		gsap.fromTo(`.nav-underline-${linkName}`,
			{ scaleX: 0 },
			{ scaleX: 1, duration: 0.3, ease: "power2.out" }
		)
	}

	return (
		<>
			{/* Mobile Header - Pill Style */}
			<Popover className='block tablet:hidden'>
				{({open}) => (
					<>
						<div 
							ref={headerRef}
							className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-50 pill-header-mobile ${theme === 'dark' ? 'dark' : ''}`}
							style={{
								backdropFilter: 'blur(20px)',
								background: 'rgba(255, 255, 255, 0.08)',
								border: '1px solid rgba(255, 255, 255, 0.18)',
								borderRadius: '50px',
								padding: '8px 16px',
								boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
								maxWidth: '200px',
								width: 'auto'
							}}
						>
							<div className='flex items-center justify-between gap-3'>
								<h1
									onClick={() => router.push('/')}
									className='logo-code font-fira-code text-sm font-bold cursor-pointer'
									style={{ color: 'var(--selected-color, #00cdac)' }}>
									&lt;/MJ&gt;
								</h1>

								<div className='flex items-center gap-1'>
									{data.darkMode && (
										<div className="scale-75">
											{renderThemeChanger()}
										</div>
									)}

									<Popover.Button>
										<div
											className='h-5 w-5 transition-transform duration-300 transform'
											style={{
												transform: !open ? 'rotate(0deg)' : 'rotate(360deg)',
												color: 'var(--selected-color, #00cdac)'
											}}>
											{!open ? (
												<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
													<path fillRule="evenodd" d="M3 5.25a.75.75 0 0 1 .75-.75h16.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 5.25Zm0 4.5A.75.75 0 0 1 3.75 9h16.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 9.75Zm0 4.5a.75.75 0 0 1 .75-.75h16.5a.75.75 0 0 1 0 1.5H3.75a.75.75 0 0 1-.75-.75Zm0 4.5a.75.75 0 0 1 .75-.75h16.5a.75.75 0 0 1 0 1.5H3.75a.75.75 0 0 1-.75-.75Z" clipRule="evenodd" />
												</svg>
											) : (
												<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
													<path fillRule="evenodd" d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
												</svg>
											)}
										</div>
									</Popover.Button>
								</div>
							</div>
						</div>
						<Popover.Panel className={`fixed top-20 left-1/2 transform -translate-x-1/2 z-40 w-72 p-4 pill-header-mobile ${theme === 'dark' ? 'dark' : ''} shadow-md rounded-2xl`}
							style={{
								backdropFilter: 'blur(20px)',
								background: 'rgba(255, 255, 255, 0.08)',
								border: '1px solid rgba(255, 255, 255, 0.18)',
								boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
							}}
						>
							{!isBlog ? (
								<div className='grid grid-cols-1 gap-2'>
									<Button onClick={() => handleNavClick('work', handleWorkScroll)}>Work</Button>
									<Button onClick={() => handleNavClick('about', handleAboutScroll)}>About</Button>
									{showBlog && <Button onClick={() => router.push('/blog')}>Blog</Button>}
									{showResume && <Button onClick={() => window.open('mailto:jadhavmandar44@gmail.com')}>Resume</Button>}
									<Button onClick={() => window.open('mailto:jadhavmandar44@gmail.com')}>Contact</Button>
								</div>
							) : (
								<div className='grid grid-cols-1 gap-2'>
									<Button onClick={() => router.push('/')}>Home</Button>
									{showBlog && <Button onClick={() => router.push('/blog')}>Blog</Button>}
									{showResume && <Button onClick={() => router.push('/resume')}>Resume</Button>}
									<Button onClick={() => window.open('mailto:jadhavmandar44@gmail.com')}>Contact</Button>
								</div>
							)}
						</Popover.Panel>
					</>
				)}
			</Popover>

			{/* Desktop Header - Pill Style */}
			<div 
				ref={headerRef}
				className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-50 hidden tablet:flex items-center gap-4 pill-header-desktop ${theme === 'dark' ? 'dark' : ''}`}
				style={{
					backdropFilter: 'blur(20px)',
					background: 'rgba(255, 255, 255, 0.08)',
					border: '1px solid rgba(255, 255, 255, 0.18)',
					borderRadius: '50px',
					padding: '8px 20px',
					boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
					maxWidth: 'fit-content',
					width: 'auto'
				}}
			>
				<h1
					onClick={() => router.push('/')}
					className='logo-code font-fira-code text-lg font-bold cursor-pointer'
					style={{ color: 'var(--selected-color, #00cdac)' }}>
					&lt;/MJ&gt;
				</h1>

				{!isBlog ? (
					<div className='flex items-center gap-0'>
						<button
							ref={el => navLinksRef.current[0] = el}
							onClick={() => handleNavClick('work', handleWorkScroll)}
							className='nav-link relative px-3 py-2 text-xs font-medium transition-all duration-300 hover:text-white'
						>
							Work
							<div className={`nav-underline-work absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-white to-transparent transform origin-left`}></div>
						</button>
						<button
							ref={el => navLinksRef.current[1] = el}
							onClick={() => handleNavClick('about', handleAboutScroll)}
							className='nav-link relative px-3 py-2 text-xs font-medium transition-all duration-300 hover:text-white'
						>
							About
							<div className={`nav-underline-about absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-white to-transparent transform origin-left`}></div>
						</button>
						{showBlog && (
							<button
								ref={el => navLinksRef.current[2] = el}
								onClick={() => router.push('/blog')}
								className='nav-link relative px-3 py-2 text-xs font-medium transition-all duration-300 hover:text-white'
							>
								Blog
								<div className={`nav-underline-blog absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-white to-transparent transform origin-left`}></div>
							</button>
						)}
						{showResume && (
							<button
								ref={el => navLinksRef.current[3] = el}
								onClick={() => router.push('/resume')}
								className='nav-link relative px-3 py-2 text-xs font-medium transition-all duration-300 hover:text-white'
							>
								Resume
								<div className={`nav-underline-resume absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-white to-transparent transform origin-left`}></div>
							</button>
						)}
						<button
							ref={el => navLinksRef.current[4] = el}
							onClick={() => window.open('mailto:jadhavmandar44@gmail.com')}
							className='nav-link relative px-3 py-2 text-xs font-medium transition-all duration-300 hover:text-white'
						>
							Contact
							<div className={`nav-underline-contact absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-white to-transparent transform origin-left`}></div>
						</button>
						{data.darkMode && (
							<div className="scale-75 ml-2">
								{renderThemeChanger()}
							</div>
						)}
					</div>
				) : (
					<div className='flex items-center gap-0'>
						<button
							ref={el => navLinksRef.current[0] = el}
							onClick={() => router.push('/')}
							className='nav-link relative px-3 py-2 text-xs font-medium transition-all duration-300 hover:text-white'
						>
							Home
							<div className={`nav-underline-home absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-white to-transparent transform origin-left`}></div>
						</button>
						{showBlog && (
							<button
								ref={el => navLinksRef.current[1] = el}
								onClick={() => router.push('/blog')}
								className='nav-link relative px-3 py-2 text-xs font-medium transition-all duration-300 hover:text-white'
							>
								Blog
								<div className={`nav-underline-blog absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-white to-transparent transform origin-left`}></div>
							</button>
						)}
						{showResume && (
							<button
								ref={el => navLinksRef.current[2] = el}
								onClick={() => router.push('/resume')}
								className='nav-link relative px-3 py-2 text-xs font-medium transition-all duration-300 hover:text-white'
							>
								Resume
								<div className={`nav-underline-resume absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-white to-transparent transform origin-left`}></div>
							</button>
						)}
						<button
							ref={el => navLinksRef.current[3] = el}
							onClick={() => window.open('mailto:jadhavmandar44@gmail.com')}
							className='nav-link relative px-3 py-2 text-xs font-medium transition-all duration-300 hover:text-white'
						>
							Contact
							<div className={`nav-underline-contact absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-white to-transparent transform origin-left`}></div>
						</button>
						{data.darkMode && (
							<div className="scale-75 ml-2">
								{renderThemeChanger()}
							</div>
						)}
					</div>
				)}
			</div>
		</>
	)
}

export default Header
