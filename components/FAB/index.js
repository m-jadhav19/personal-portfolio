import React, {useState, useEffect} from 'react'
import {motion, AnimatePresence} from 'framer-motion'
import {Popover} from '@headlessui/react'
import {useTheme} from 'next-themes'

// Custom hook for reliable theme management
const useReliableTheme = () => {
	const {theme, resolvedTheme} = useTheme()
	const [mounted, setMounted] = useState(false)

	useEffect(() => {
		setMounted(true)
	}, [])

	// Always return a valid theme, defaulting to dark
	const currentTheme = mounted ? (resolvedTheme || theme || 'dark') : 'dark'
	
	// Force theme immediately on mount
	useEffect(() => {
		if (mounted) {
			const html = document.documentElement
			const body = document.body
			
			// Force dark mode if that's what we want
			if (currentTheme === 'dark') {
				html.setAttribute('data-theme', 'dark')
				html.classList.add('dark')
				body.classList.add('dark-mode-persist')
				body.classList.remove('light-mode')
				
				// Force CSS variables
				html.style.setProperty('--current-theme', 'dark')
				html.style.setProperty('color-scheme', 'dark')
			} else {
				html.setAttribute('data-theme', 'light')
				html.classList.remove('dark')
				body.classList.remove('dark-mode-persist')
				body.classList.add('light-mode')
				
				// Force CSS variables
				html.style.setProperty('--current-theme', 'light')
				html.style.setProperty('color-scheme', 'light')
			}
		}
	}, [mounted, currentTheme])
	
	return { currentTheme, mounted }
}

const FAB = () => {
	const [selectedTab, setSelectedTab] = useState('Preset')
	const [selectedColor, setSelectedColor] = useState('#339AF0')
	const {currentTheme, mounted} = useReliableTheme()

	// Update Button component colors when color changes
	useEffect(() => {
		if (mounted) {
			// Update CSS custom properties for the selected color
			document.documentElement.style.setProperty('--selected-color', selectedColor)
			document.documentElement.style.setProperty('--selected-color-rgb', hexToRgb(selectedColor))
		}
	}, [selectedColor, mounted])

	const hexToRgb = (hex) => {
		const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
		return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '0, 0, 0'
	}

	const presetColors = [
		'#339AF0', // Azure Blue (Default)
		'#FF6B6B', // Coral Red
		'#51CF66', // Sage Green
		'#845EF7', // Deep Violet
		'#FF922B', // Sunset Orange
		'#F06595', // Rose Pink
		'#20C997', // Teal Mint
		'#FCC419', // Amber Gold
		'#94D82D', // Lime Green
		'#5C7CFA', // Indigo Night
		'#AE3EC9', // Orchid Purple
		'#E03131', // Crimson Red
	]

	const PresetView = () => (
		<motion.div
			initial={{x: 10, opacity: 0}}
			animate={{x: 0, opacity: 1}}
			exit={{x: -10, opacity: 0}}
			transition={{duration: 0.2, type: 'spring', bounce: 0.3}}
			key='preset'
			className='space-y-4'>
			<div className='grid grid-cols-6 gap-2'>
				{presetColors.map((color, index) => (
					<button
						key={index}
						onClick={() => setSelectedColor(color)}
						className={`w-8 h-8 rounded-full border-2 transition-all duration-200 hover:scale-110 ${
							selectedColor === color
								? 'border-white dark:border-black ring-2 ring-white/30 dark:ring-black/30'
								: 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
						}`}
						style={{backgroundColor: color}}
						title={color}
					/>
				))}
			</div>
		</motion.div>
	)

	const CustomView = () => (
		<motion.div
			initial={{x: 10, opacity: 0}}
			animate={{x: 0, opacity: 1}}
			exit={{x: -10, opacity: 0}}
			transition={{duration: 0.2, type: 'spring', bounce: 0.3}}
			key='custom'
			className='space-y-4'>
			<div className='space-y-3'>
				<div className='flex items-center space-x-3'>
					<label className='text-sm font-medium text-black dark:text-white'>Custom Color:</label>
					<input
						type='color'
						value={selectedColor}
						onChange={(e) => setSelectedColor(e.target.value)}
						className='w-12 h-8 rounded border border-gray-300 dark:border-gray-600 cursor-pointer'
					/>
				</div>
				<div className='flex items-center space-x-3'>
					<label className='text-sm font-medium text-black dark:text-white'>HEX:</label>
					<input
						type='text'
						value={selectedColor}
						onChange={(e) => setSelectedColor(e.target.value)}
						className='flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:border-transparent bg-white dark:bg-black text-black dark:text-white'
						placeholder='#000000'
					/>
				</div>
			</div>
		</motion.div>
	)

	if (!mounted) return null

	return (
		<Popover className='fixed bottom-6 right-6 z-50'>
			{({open}) => (
				<>
					<Popover.Button
						className='w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 flex items-center justify-center'
						style={{
							background: currentTheme === 'dark' ? `linear-gradient(135deg, ${selectedColor}20, ${selectedColor}40)` : `linear-gradient(135deg, ${selectedColor}30, ${selectedColor}50)`,
							border: `2px solid ${selectedColor}`,
						}}>
						<svg
							className='w-6 h-6'
							fill='none'
							stroke='currentColor'
							viewBox='0 0 24 24'
							style={{color: currentTheme === 'dark' ? 'white' : '#1a1a1a'}}>
							<path
								strokeLinecap='round'
								strokeLinejoin='round'
								strokeWidth={2}
								d='M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01'
							/>
						</svg>
					</Popover.Button>

					<Popover.Panel
						className={`absolute bottom-16 right-0 w-80 rounded-lg shadow-2xl border p-4 backdrop-blur-3xl ${currentTheme === 'dark' ? 'dark bg-black/80 border-white/10' : 'bg-[#FDFBF7]/90 border-[#1a1a1a]/10'}`}
						style={{
							boxShadow: `0 25px 50px -12px ${selectedColor}30`,
						}}>
						<div className='space-y-4'>
							{/* Tab Navigation */}
							<div
								className='flex space-x-1 rounded-lg liquid-glass-header'
								style={{
									border: `1px solid ${currentTheme === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)'}`,
								}}>
								{['Preset', 'Custom'].map((tab) => (
									<button
										key={tab}
										onClick={() => setSelectedTab(tab)}
										className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-all duration-200 ${selectedTab === tab ? 'shadow-sm' : 'hover:opacity-80'}`}
										style={{
											backgroundColor: selectedTab === tab ? (currentTheme === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)') : 'transparent',
											color: selectedTab === tab ? (currentTheme === 'dark' ? 'white' : 'black') : currentTheme === 'dark' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)',
											border: selectedTab === tab ? `1px solid ${currentTheme === 'dark' ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)'}` : 'none',
										}}>
										{tab}
									</button>
								))}
							</div>

							{/* Content with AnimatePresence */}
							<AnimatePresence mode='wait'>{selectedTab === 'Preset' ? <PresetView /> : <CustomView />}</AnimatePresence>

							{/* Footer with HEX input and confirm button */}
							<div
								className='flex items-center justify-between pt-2'
								style={{
									borderTop: `1px solid ${currentTheme === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)'}`,
								}}>
								<div className='flex items-center space-x-2'>
									<label
										className='text-sm font-medium'
										style={{color: currentTheme === 'dark' ? 'white' : 'black'}}>
										HEX:
									</label>
									<input
										type='text'
										value={selectedColor}
										onChange={(e) => setSelectedColor(e.target.value)}
										className='w-20 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:border-transparent liquid-glass-header'
										style={{
											border: `1px solid ${currentTheme === 'dark' ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)'}`,
											color: currentTheme === 'dark' ? 'white' : 'black',
											boxShadow: `0 4px 12px rgba(var(--selected-color-rgb, 0, 0, 0), 0.15)`,
										}}
									/>
								</div>
								<button
									className='w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-200 liquid-glass-header'
									style={{
										backgroundColor: selectedColor,
										border: `2px solid ${currentTheme === 'dark' ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)'}`,
										boxShadow: `0 4px 12px rgba(var(--selected-color-rgb, 0, 0, 0), 0.3)`,
									}}>
									<svg
										className='w-4 h-4'
										fill='none'
										stroke='currentColor'
										viewBox='0 0 24 24'
										style={{color: currentTheme === 'dark' ? 'black' : 'white'}}>
										<path
											strokeLinecap='round'
											strokeLinejoin='round'
											strokeWidth={2}
											d='M5 13l4 4L19 7'
										/>
									</svg>
								</button>
							</div>
						</div>
					</Popover.Panel>
				</>
			)}
		</Popover>
	)
}

export default FAB
