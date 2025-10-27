import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

export default function SplitScreenTransition({ onComplete }) {
	const containerRef = useRef(null)
	const leftSideRef = useRef(null)
	const rightSideRef = useRef(null)
	const textLeftRef = useRef(null)
	const textRightRef = useRef(null)

	useEffect(() => {
		if (typeof window === 'undefined') return

		const container = containerRef.current
		const leftSide = leftSideRef.current
		const rightSide = rightSideRef.current
		const textLeft = textLeftRef.current
		const textRight = textRightRef.current

		// Set initial states
		gsap.set(container, { opacity: 0 })
		gsap.set(leftSide, { xPercent: -50 })
		gsap.set(rightSide, { xPercent: 50 })
		gsap.set(textLeft, { opacity: 0, y: 20 })
		gsap.set(textRight, { opacity: 0, y: 20 })

		// Create the split screen animation timeline (faster version)
		const tl = gsap.timeline({
			onComplete: () => {
				// Fade out the transition quickly
				gsap.to(container, {
					opacity: 0,
					duration: 0.4,
					ease: 'power2.in',
					onComplete: () => {
						if (onComplete) onComplete()
					}
				})
			}
		})

		// Step 1: Show the container
		tl.to(container, { opacity: 1, duration: 0.3 })

		// Step 2: Split the screen (faster)
		tl.to(leftSide, { xPercent: 0, duration: 0.8, ease: 'power3.out' }, 0)
		tl.to(rightSide, { xPercent: 0, duration: 0.8, ease: 'power3.out' }, 0)

		// Step 3: Text appears on both sides (faster)
		tl.to(textLeft, {
			opacity: 1,
			y: 0,
			duration: 0.6,
			ease: 'power2.out'
		}, 0.3)

		tl.to(textRight, {
			opacity: 1,
			y: 0,
			duration: 0.6,
			ease: 'power2.out'
		}, 0.5)

		// Step 4: Hold for a brief moment
		tl.to({}, { duration: 0.5 })

		// Step 5: Transition to dark mode (slide right side out quickly)
		tl.to(rightSide, { xPercent: 100, duration: 0.8, ease: 'power2.inOut' }, '-=0.3')
		tl.to(textRight, { opacity: 0, y: -30, duration: 0.5, ease: 'power2.in' }, '-=0.8')
		tl.to(textLeft, { opacity: 0, duration: 0.5 }, '-=0.5')
	}, [onComplete])

	return (
		<>
			<style>{`
				.split-transition {
					position: fixed;
					top: 0;
					left: 0;
					width: 100%;
					height: 100%;
					z-index: 10000;
					pointer-events: none;
				}

				.split-side {
					position: absolute;
					width: 50%;
					height: 100%;
					display: flex;
					align-items: center;
					justify-content: center;
					overflow: hidden;
				}

				.split-left {
					left: 0;
					background: #0a0a0a;
					justify-content: flex-end;
					padding-right: 10%;
				}

				.split-right {
					right: 0;
					background: #f5f5f5;
					justify-content: flex-start;
					padding-left: 10%;
				}

				.split-text {
					font-size: 4rem;
					font-weight: bold;
					line-height: 1.2;
					letter-spacing: -0.05em;
				}

				.split-text-light {
					color: #ffffff;
				}

				.split-text-dark {
					color: #000000;
				}

				.split-subtitle {
					position: absolute;
					top: 50%;
					transform: translateY(-50%);
					opacity: 1;
				}

				.subtitle-left {
					right: 10%;
					color: #ffffff;
				}

				.subtitle-right {
					left: 10%;
					color: #000000;
				}

				.main-text {
					font-size: clamp(2.5rem, 7vw, 5rem);
					font-weight: 700;
					line-height: 1.1;
					letter-spacing: -0.02em;
				}

				.sub-text {
					font-size: clamp(0.875rem, 1.5vw, 1.125rem);
					font-weight: 400;
					letter-spacing: 0.15em;
					text-transform: uppercase;
					margin-bottom: 1.5rem;
					opacity: 0.6;
				}
			`}</style>

			<div className="split-transition" ref={containerRef}>
				{/* Dark mode side (left) */}
				<div className="split-side split-left" ref={leftSideRef}>
					<div className="split-subtitle subtitle-left" ref={textLeftRef}>
						<div className="sub-text">Welcome</div>
						<div className="main-text">Mandar Jadhav</div>
					</div>
				</div>

				{/* Light mode side (right) */}
				<div className="split-side split-right" ref={rightSideRef}>
					<div className="split-subtitle subtitle-right" ref={textRightRef}>
						<div className="sub-text">Portfolio</div>
						<div className="main-text" style={{ color: '#000' }}>Frontend Developer</div>
					</div>
				</div>
			</div>
		</>
	)
}
