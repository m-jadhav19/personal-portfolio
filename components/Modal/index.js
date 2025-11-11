import React, {useEffect, useState, useCallback} from 'react'
import { createPortal } from 'react-dom'
import {useTheme} from 'next-themes'

const Modal = ({isOpen, onClose, title, description, url, children}) => {
	const {theme} = useTheme()
	const [isAnimating, setIsAnimating] = useState(false)
	const [shouldRender, setShouldRender] = useState(false)
	const [mounted, setMounted] = useState(false)

	useEffect(() => {
		setMounted(true)
	}, [])

	const isDark = mounted && (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches))

	const handleClose = useCallback(() => {
		setIsAnimating(false)
		// Wait for exit animation before calling onClose
		setTimeout(() => {
			onClose()
		}, 300)
	}, [onClose])

	// Handle modal open/close with animations
	useEffect(() => {
		if (isOpen) {
			setShouldRender(true)
			// Start animation after render
			setTimeout(() => setIsAnimating(true), 10)
		} else {
			setIsAnimating(false)
			// Wait for exit animation before unmounting
			setTimeout(() => setShouldRender(false), 300)
		}
	}, [isOpen])

	// Prevent background scrolling when modal is open
	useEffect(() => {
		if (shouldRender) {
			document.body.style.overflow = 'hidden'
			document.documentElement.style.overflow = 'hidden'
		} else {
			document.body.style.overflow = 'unset'
			document.documentElement.style.overflow = 'unset'
		}

		// Cleanup function
		return () => {
			document.body.style.overflow = 'unset'
			document.documentElement.style.overflow = 'unset'
		}
	}, [shouldRender])

	// Handle escape key
	useEffect(() => {
		const handleEscape = (e) => {
			if (e.key === 'Escape' && shouldRender) {
				handleClose()
			}
		}

		if (shouldRender) {
			document.addEventListener('keydown', handleEscape)
		}

		return () => {
			document.removeEventListener('keydown', handleEscape)
		}
	}, [shouldRender, handleClose])

	if (!shouldRender) return null

	// Inline styles to ensure no CSS conflicts - Theme aware
	const headerStyle = {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'space-between',
		padding: '1.5rem',
		borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid rgba(0, 0, 0, 0.1)',
		background: isDark ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.02)',
		flexShrink: 0
	}

	const titleStyle = {
		fontSize: '1.5rem',
		fontWeight: 'bold',
		color: isDark ? 'white' : '#000000',
		margin: 0
	}

	const descriptionStyle = {
		color: isDark ? '#d1d5db' : '#4b5563',
		margin: '0.5rem 0 0 0',
		fontSize: '1rem'
	}

	const actionsStyle = {
		display: 'flex',
		gap: '0.75rem'
	}

	const buttonStyle = {
		padding: '0.75rem 1.5rem',
		borderRadius: '0.5rem',
		fontWeight: '500',
		transition: 'all 0.3s ease',
		border: 'none',
		cursor: 'pointer',
		textDecoration: 'none',
		display: 'inline-block',
		backdropFilter: 'blur(15px)',
		WebkitBackdropFilter: 'blur(15px)',
		position: 'relative',
		overflow: 'hidden'
	}

	const primaryButtonStyle = {
		...buttonStyle,
		background: 'rgba(var(--selected-color-rgb, 0, 205, 172), 0.15)',
		border: '1px solid rgba(var(--selected-color-rgb, 0, 205, 172), 0.4)',
		color: isDark ? 'white' : '#000000',
		textShadow: isDark ? '0 0 10px rgba(var(--selected-color-rgb, 0, 205, 172), 0.5)' : 'none'
	}

	const closeButtonStyle = {
		...buttonStyle,
		background: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',
		border: isDark ? '1px solid rgba(255, 255, 255, 0.3)' : '1px solid rgba(0, 0, 0, 0.2)',
		color: isDark ? '#ffffff' : '#000000',
		textShadow: isDark ? '0 0 10px rgba(255, 255, 255, 0.3)' : 'none',
		width: '48px',
		height: '48px',
		padding: '0',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		fontSize: '1.5rem',
		fontWeight: 'bold'
	}

	const bodyStyle = {
		flex: 1,
		padding: '1.5rem',
		minHeight: 0,
		overflow: 'hidden',
		display: 'flex',
		flexDirection: 'column'
	}

	const iframeStyle = {
		width: '100%',
		height: '100%',
		border: isDark ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid rgba(0, 0, 0, 0.1)',
		borderRadius: '0.5rem',
		background: 'white',
		minHeight: '400px',
		flex: 1
	}

	const modalContent = (
		<div className="modal-overlay-animated">
			{/* Backdrop */}
			<div
				className={`modal-backdrop-animated ${isAnimating ? 'animate-in' : ''}`}
				onClick={handleClose}></div>

			{/* Modal Content */}
			<div className={`modal-content-animated ${isAnimating ? 'animate-in' : ''}`}>
				{/* Modal Header */}
				<div style={headerStyle}>
					<div>
						<h2 style={titleStyle}>{title}</h2>
						<p style={descriptionStyle}>{description}</p>
					</div>
					<div style={actionsStyle}>
						{url && (
							<a
								href={url}
								target='_blank'
								rel='noopener noreferrer'
								style={primaryButtonStyle}>
								Visit Site
							</a>
						)}
						<button
							onClick={handleClose}
							style={closeButtonStyle}>
							✕
						</button>
					</div>
				</div>

				{/* Modal Body */}
				<div style={bodyStyle}>
					{React.cloneElement(children, { style: iframeStyle })}
				</div>
			</div>
		</div>
	)

	// Use portal to render outside normal DOM flow
	return createPortal(modalContent, document.body)
}

export default Modal
