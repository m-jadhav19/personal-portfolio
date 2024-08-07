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

	const {name, showBlog, showResume} = data

	useEffect(() => {
		setMounted(true)
	}, [])

	const renderThemeChanger = () => {
		if (!mounted) return null
		const currentTheme = theme === 'system' ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : theme

		return (
			<Button onClick={() => setTheme(currentTheme === 'dark' ? 'light' : 'dark')}>
				<img
					className='h-6 transition-transform duration-300 transform'
					style={{
						transform: currentTheme === 'dark' ? 'rotate(0deg)' : 'rotate(360deg)',
					}}
					src={`/images/${currentTheme === 'dark' ? 'moon.svg' : 'sun.svg'}`}
				/>
			</Button>
		)
	}

	return (
		<>
			<Popover className='block tablet:hidden mt-5'>
				{({open}) => (
					<>
						<div className='flex items-center justify-between p-2 laptop:p-0'>
							<h1
								onClick={() => router.push('/')}
								className='font-medium p-2 laptop:p-0 link'>
								{name}
							</h1>

							<div className='flex items-center'>
								{data.darkMode && renderThemeChanger()}

								<Popover.Button>
									<img
										className='h-5 transition-transform duration-300 transform'
										style={{
											transform: !open ? 'rotate(0deg)' : 'rotate(360deg)',
										}}
										src={`/images/${!open ? 'menu.svg' : 'cancel.svg'}`}
									/>
								</Popover.Button>
							</div>
						</div>
						<Popover.Panel className={`absolute right-0 z-10 w-11/12 p-4 ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'} shadow-md rounded-md`}>
							{!isBlog ? (
								<div className='grid grid-cols-1'>
									<Button onClick={handleWorkScroll}>Work</Button>
									<Button onClick={handleAboutScroll}>About</Button>
									{showBlog && <Button onClick={() => router.push('/blog')}>Blog</Button>}
									{showResume && <Button onClick={() => window.open('mailto:mjadhav19@outlook.com')}>Resume</Button>}

									<Button onClick={() => window.open('mailto:mjadhav19@outlook.com')}>Contact</Button>
								</div>
							) : (
								<div className='grid grid-cols-1'>
									<Button
										onClick={() => router.push('/')}
										classes='first:ml-1'>
										Home
									</Button>
									{showBlog && <Button onClick={() => router.push('/blog')}>Blog</Button>}
									{showResume && (
										<Button
											onClick={() => router.push('/resume')}
											classes='first:ml-1'>
											Resume
										</Button>
									)}

									<Button onClick={() => window.open('mailto:mjadhav19@outlook.com')}>Contact</Button>
								</div>
							)}
						</Popover.Panel>
					</>
				)}
			</Popover>
			<div className={`mt-10 hidden flex-row items-center justify-between sticky ${theme === 'light' && 'bg-white'} dark:text-white top-0 z-10 tablet:flex`}>
				<h1
					onClick={() => router.push('/')}
					className='font-medium cursor-pointer mob:p-2 laptop:p-0'>
					{name}
				</h1>
				{!isBlog ? (
					<div className='flex'>
						<Button onClick={handleWorkScroll}>Work</Button>
						<Button onClick={handleAboutScroll}>About</Button>
						{showBlog && <Button onClick={() => router.push('/blog')}>Blog</Button>}
						{showResume && (
							<Button
								onClick={() => router.push('/resume')}
								classes='first:ml-1'>
								Resume
							</Button>
						)}

						<Button onClick={() => window.open('mailto:mjadhav19@outlook.com')}>Contact</Button>
						{data.darkMode && renderThemeChanger()}
					</div>
				) : (
					<div className='flex'>
						<Button onClick={() => router.push('/')}>Home</Button>
						{showBlog && <Button onClick={() => router.push('/blog')}>Blog</Button>}
						{showResume && (
							<Button
								onClick={() => router.push('/resume')}
								classes='first:ml-1'>
								Resume
							</Button>
						)}

						<Button onClick={() => window.open('mailto:mjadhav19@outlook.com')}>Contact</Button>

						{data.darkMode && renderThemeChanger()}
					</div>
				)}
			</div>
		</>
	)
}

export default Header
