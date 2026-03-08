import React, { useState, useEffect, useRef } from 'react'

const TypeWriter = ({
	text = '',
	speed = 60,
	delay = 0,
	showCursor = true,
	cursorChar = '|',
	className = '',
	as: Component = 'span',
	...rest
}) => {
	const [displayText, setDisplayText] = useState('')
	const [reduceMotion, setReduceMotion] = useState(false)
	const indexRef = useRef(0)
	const timeoutRef = useRef(null)
	const delayRef = useRef(delay)

	useEffect(() => {
		const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
		if (prefersReducedMotion) {
			setReduceMotion(true)
			setDisplayText(text)
			return
		}

		indexRef.current = 0
		setDisplayText('')

		const runAfterDelay = () => {
			if (indexRef.current < text.length) {
				setDisplayText(text.slice(0, indexRef.current + 1))
				indexRef.current += 1
				timeoutRef.current = setTimeout(runAfterDelay, speed)
			}
		}

		if (delay > 0) {
			delayRef.current = setTimeout(runAfterDelay, delay)
		} else {
			runAfterDelay()
		}

		return () => {
			if (timeoutRef.current) clearTimeout(timeoutRef.current)
			if (delayRef.current) clearTimeout(delayRef.current)
		}
	}, [text, speed, delay])

	if (reduceMotion) {
		return (
			<Component className={className} {...rest}>
				{text}
			</Component>
		)
	}

	const isComplete = displayText.length >= text.length

	return (
		<Component className={className} {...rest}>
			{displayText}
			{showCursor && !isComplete && (
				<span className="typewriter-cursor" aria-hidden="true">
					{cursorChar}
				</span>
			)}
		</Component>
	)
}

export default TypeWriter
