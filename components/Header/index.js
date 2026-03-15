import {Popover} from '@headlessui/react'
import {useTheme} from 'next-themes'
import {useRouter} from 'next/router'
import React, {useEffect, useState} from 'react'
import Button from '../Button'

import data from '../../data/portfolio.json'

const Header = ({handleWorkScroll, handleAboutScroll, isBlog}) => {
	const router = useRouter()
	const {theme, setTheme} = useTheme()
	const [mounted, setMounted] = useState(false)
	const [scrolled, setScrolled] = useState(false)

	const {name, showBlog, showResume} = data

	useEffect(() => {
		setMounted(true)
		const handleScroll = () => setScrolled(window.scrollY > 20)
		window.addEventListener('scroll', handleScroll, {passive: true})
		return () => window.removeEventListener('scroll', handleScroll)
	}, [])

	const isDark = mounted
		? theme === 'system'
			? window.matchMedia('(prefers-color-scheme: dark)').matches
			: theme === 'dark'
		: false

	const pillClass = `glass-header-pill ${isDark ? 'glass-dark' : 'glass-light'} ${scrolled ? 'glass-scrolled' : ''}`

	const renderThemeChanger = () => {
		if (!mounted) return null
		return (
			<Button onClick={() => setTheme(isDark ? 'light' : 'dark')}>
				<div
					className='h-6 w-6 transition-transform duration-300 transform'
					style={{
						transform: isDark ? 'rotate(0deg)' : 'rotate(360deg)',
						color: 'var(--selected-color, #339AF0)'
					}}>
					{isDark ? (
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

	return (
		<>
			{/* ── Mobile ── */}
			<Popover className='block tablet:hidden px-3 mt-3 sticky top-3 z-50'>
				{({open}) => (
					<>
						<div className={`${pillClass} flex items-center justify-between px-6 py-2`}>
							<h1
								onClick={() => router.push('/')}
								className='logo-code liquid-glass-logo font-fira-code text-xl font-bold p-2 laptop:p-0 link cursor-pointer'
								style={{color: 'var(--selected-color, #339AF0)'}}>
								&lt;/MJ&gt;
							</h1>
							<div className='flex items-center'>
								{data.darkMode && renderThemeChanger()}
								<Popover.Button>
									<div
										className='h-6 w-6 my-auto transition-transform duration-300 transform'
										style={{
											transform: !open ? 'rotate(0deg)' : 'rotate(360deg)',
											color: 'var(--selected-color, #339AF0)'
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

						<Popover.Panel className={`absolute right-3 mt-2 w-48 glass-dropdown ${isDark ? 'glass-dark' : 'glass-light'} rounded-2xl overflow-hidden shadow-xl`}>
							<div className='flex flex-col py-2'>
								{!isBlog ? (
									<>
										<Button onClick={handleWorkScroll} useSelectedColor={true}>Work</Button>
										<Button onClick={handleAboutScroll} useSelectedColor={true}>About</Button>
										{showBlog && <Button onClick={() => router.push('/blog')}>Blog</Button>}
										{showResume && <Button onClick={() => router.push('/resume')}>Resume</Button>}
										<Button onClick={() => window.open('mailto:jadhavmandar44@gmail.com')} useSelectedColor={true}>Contact</Button>
									</>
								) : (
									<>
										<Button onClick={() => router.push('/')} useSelectedColor={true}>Home</Button>
										{showBlog && <Button onClick={() => router.push('/blog')}>Blog</Button>}
										{showResume && <Button onClick={() => router.push('/resume')}>Resume</Button>}
										<Button onClick={() => window.open('mailto:jadhavmandar44@gmail.com')} useSelectedColor={true}>Contact</Button>
									</>
								)}
							</div>
						</Popover.Panel>
					</>
				)}
			</Popover>

			{/* ── Desktop ── */}
			<div className={`${pillClass} hidden tablet:flex items-center justify-between mt-6 mx-auto sticky top-4 z-50 px-6 py-1`}>
				<h1
					onClick={() => router.push('/')}
					className='logo-code liquid-glass-logo font-fira-code text-2xl font-bold cursor-pointer ml-2'
					style={{color: 'var(--selected-color, #339AF0)'}}>
					&lt;/MJ&gt;
				</h1>

				<div className='flex items-center gap-1.5 font-[550]'>
					{!isBlog ? (
						<>
							<Button onClick={handleWorkScroll} useSelectedColor={true}>Work</Button>
							<Button onClick={handleAboutScroll} useSelectedColor={true}>About</Button>
							{showBlog && <Button onClick={() => router.push('/blog')}>Blog</Button>}
							{showResume && <Button onClick={() => router.push('/resume')}>Resume</Button>}
							<Button onClick={() => window.open('mailto:jadhavmandar44@gmail.com')} useSelectedColor={true}>Contact</Button>
						</>
					) : (
						<>
							<Button onClick={() => router.push('/')} useSelectedColor={true}>Home</Button>
							{showBlog && <Button onClick={() => router.push('/blog')}>Blog</Button>}
							{showResume && <Button onClick={() => router.push('/resume')}>Resume</Button>}
							<Button onClick={() => window.open('mailto:jadhavmandar44@gmail.com')} useSelectedColor={true}>Contact</Button>
						</>
					)}
					{data.darkMode && (
						<div className="border-l border-white/10 ml-2 pl-2">
							{renderThemeChanger()}
						</div>
					)}
				</div>
			</div>
		</>
	)
}

export default Header