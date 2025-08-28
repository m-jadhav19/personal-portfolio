import React, {useEffect} from 'react'
import { createPortal } from 'react-dom'

const Modal = ({isOpen, onClose, title, description, url, children}) => {
	// Prevent background scrolling when modal is open
	useEffect(() => {
		if (isOpen) {
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
	}, [isOpen])

	// Handle escape key
	useEffect(() => {
		const handleEscape = (e) => {
			if (e.key === 'Escape' && isOpen) {
				onClose()
			}
		}

		if (isOpen) {
			document.addEventListener('keydown', handleEscape)
		}

		return () => {
			document.removeEventListener('keydown', handleEscape)
		}
	}, [isOpen, onClose])

	if (!isOpen) return null

	// Inline styles to ensure no CSS conflicts
	const overlayStyle = {
		position: 'fixed',
		top: 0,
		left: 0,
		width: '100vw',
		height: '100vh',
		zIndex: 9999,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		padding: '20px',
		boxSizing: 'border-box'
	}

	const backdropStyle = {
		position: 'absolute',
		top: 0,
		left: 0,
		width: '100%',
		height: '100%',
		background: 'rgba(0, 0, 0, 0.7)',
		backdropFilter: 'blur(8px)',
		WebkitBackdropFilter: 'blur(8px)'
	}

	const modalStyle = {
		position: 'relative',
		width: '90vw',
		maxWidth: '1200px',
		height: '80vh',
		background: 'rgba(255, 255, 255, 0.1)',
		backdropFilter: 'blur(20px)',
		WebkitBackdropFilter: 'blur(20px)',
		border: '1px solid rgba(255, 255, 255, 0.2)',
		borderRadius: '1rem',
		boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
		overflow: 'hidden',
		display: 'flex',
		flexDirection: 'column',
		zIndex: 10000
	}

	const headerStyle = {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'space-between',
		padding: '1.5rem',
		borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
		background: 'rgba(0, 0, 0, 0.2)',
		flexShrink: 0
	}

	const titleStyle = {
		fontSize: '1.5rem',
		fontWeight: 'bold',
		color: 'white',
		margin: 0
	}

	const descriptionStyle = {
		color: '#d1d5db',
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
		color: 'var(--selected-color, #00cdac)',
		textShadow: '0 0 10px rgba(var(--selected-color-rgb, 0, 205, 172), 0.5)'
	}

	const closeButtonStyle = {
		...buttonStyle,
		background: 'rgba(255, 255, 255, 0.08)',
		border: '1px solid rgba(255, 255, 255, 0.3)',
		color: '#ffffff',
		textShadow: '0 0 10px rgba(255, 255, 255, 0.3)',
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
		border: '1px solid rgba(255, 255, 255, 0.2)',
		borderRadius: '0.5rem',
		background: 'white',
		minHeight: '400px',
		flex: 1
	}

	const modalContent = (
		<div style={overlayStyle}>
			{/* Backdrop */}
			<div
				style={backdropStyle}
				onClick={onClose}></div>

			{/* Modal Content */}
			<div style={modalStyle}>
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
							onClick={onClose}
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
