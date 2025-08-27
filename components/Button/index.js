import React, {useEffect, useState} from 'react'
import {useTheme} from 'next-themes'
import data from '../../data/portfolio.json'

const Button = ({children, type, onClick, classes}) => {
	const {theme} = useTheme()
	const [selectedColor, setSelectedColor] = useState('#00cdac')
	const [isHovered, setIsHovered] = useState(false)

	useEffect(() => {
		document.body.classList.remove('light-mode', 'dark-mode')
		document.body.classList.add(theme === 'dark' ? 'dark-mode' : 'light-mode')
	}, [theme])

	// Get the selected color from CSS custom properties
	useEffect(() => {
		const updateColor = () => {
			const color = getComputedStyle(document.documentElement).getPropertyValue('--selected-color')
			if (color && color.trim()) {
				setSelectedColor(color.trim())
			}
		}

		updateColor()
		// Listen for changes to the CSS custom property
		const observer = new MutationObserver(updateColor)
		observer.observe(document.documentElement, { attributes: true, attributeFilter: ['style'] })
		
		return () => observer.disconnect()
	}, [])

	// Handle click to reset hover state
	const handleClick = (e) => {
		setIsHovered(false)
		if (onClick) onClick(e)
	}

	if (type === 'primary') {
		return (
			<button
				onClick={handleClick}
				type='button'
				className={`text-sm tablet:text-base p-1 laptop:p-2 m-1 laptop:m-2 rounded-lg transition-all duration-300 ease-out first:ml-0 hover:scale-105 active:scale-100 link ${
					data.showCursor && 'cursor-none'
				} ${classes}`}
				style={{
					backgroundColor: selectedColor,
					color: theme === 'dark' ? 'white' : 'black'
				}}>
				{children}
			</button>
		)
	}
	return (
		<button
			onClick={handleClick}
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
			type='button'
			className={`text-sm tablet:text-base p-1 laptop:p-2 m-1 laptop:m-2 rounded-lg flex items-center transition-all ease-out duration-300 hover:scale-105 active:scale-100 tablet:first:ml-0 button-liquid-glass ${
				theme === 'dark' ? 'dark' : ''
			} ${data.showCursor && 'cursor-none'} ${classes} link`}
			style={{
				color: theme === 'dark' ? 'white' : 'black',
				backgroundColor: isHovered ? `${selectedColor}20` : 'transparent',
			}}>
			{children}
		</button>
	)
}

export default Button
