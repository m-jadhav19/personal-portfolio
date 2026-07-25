import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import {
	ASCII_SHAPES,
	INTERNAL_SIZE,
	createAsciiState,
	getDisplaySize,
	renderAsciiFrame,
} from '../../../lib/cinematic/asciiRenderer'

const AsciiScrollScene = forwardRef(function AsciiScrollScene({ morphSpeed = 0.06 }, ref) {
	const canvasRef = useRef(null)
	const stateRef = useRef(createAsciiState())
	const rafRef = useRef(null)
	const idleTimerRef = useRef(null)
	const [displaySize, setDisplaySize] = useState(720)

	useImperativeHandle(ref, () => ({
		jumpTo: (index) => {
			const state = stateRef.current
			if (index < 0 || index >= ASCII_SHAPES.length || index === state.currentShape) return
			state.targetShape = index
			state.morphT = 0
			state.morphing = true
		},
		reset: () => {
			const state = stateRef.current
			state.rotX = 0.35
			state.rotY = 0.45
			state.zoom = 1
			state.spinY = ASCII_SHAPES[state.currentShape]?.spin ?? 0.014
			state.spinX = 0
			state.dragVelX = 0
			state.dragVelY = 0
			state.dragging = false
		},
		getShapes: () => ASCII_SHAPES.map((shape) => shape.name),
	}))

	useEffect(() => {
		const updateSize = () => setDisplaySize(getDisplaySize())
		updateSize()
		window.addEventListener('resize', updateSize)
		return () => window.removeEventListener('resize', updateSize)
	}, [])

	useEffect(() => {
		const canvas = canvasRef.current
		if (!canvas) return undefined

		const ctx = canvas.getContext('2d', { alpha: true })
		const state = stateRef.current

		const onPointerDown = (e) => {
			state.dragging = true
			state.dragVelX = 0
			state.dragVelY = 0
			state.lastX = e.clientX
			state.lastY = e.clientY
			canvas.setPointerCapture(e.pointerId)
		}

		const onPointerMove = (e) => {
			if (!state.dragging) return
			const dx = e.clientX - state.lastX
			const dy = e.clientY - state.lastY
			const sens = 0.011
			state.rotY += dx * sens
			state.rotX = Math.max(-1.2, Math.min(1.2, state.rotX + dy * sens))
			state.dragVelY = dx * sens
			state.dragVelX = dy * sens
			state.lastX = e.clientX
			state.lastY = e.clientY
		}

		const onPointerUp = (e) => {
			state.dragging = false
			state.spinY = state.dragVelY
			state.spinX = state.dragVelX
			canvas.releasePointerCapture(e.pointerId)
		}

		const onWheel = (e) => {
			e.preventDefault()
			state.zoom = Math.max(0.65, Math.min(1.45, state.zoom * (e.deltaY > 0 ? 0.94 : 1.06)))
		}

		const onVisibility = () => {
			state.hidden = document.hidden
		}

		canvas.addEventListener('pointerdown', onPointerDown)
		canvas.addEventListener('pointermove', onPointerMove)
		canvas.addEventListener('pointerup', onPointerUp)
		canvas.addEventListener('pointercancel', onPointerUp)
		canvas.addEventListener('wheel', onWheel, { passive: false })
		document.addEventListener('visibilitychange', onVisibility)

		const cycleShape = () => {
			const next = (state.currentShape + 1) % ASCII_SHAPES.length
			state.targetShape = next
			state.morphT = 0
			state.morphing = true
			idleTimerRef.current = window.setTimeout(cycleShape, 3600)
		}
		idleTimerRef.current = window.setTimeout(cycleShape, 3600)

		const loop = () => {
			rafRef.current = requestAnimationFrame(loop)
			if (state.hidden) return

			if (!state.dragging) {
				const spin = ASCII_SHAPES[state.currentShape]?.spin ?? 0.014
				state.spinY += (spin - state.spinY) * 0.015
				state.spinX *= 0.97
				state.rotY += state.spinY
				state.rotX = Math.max(-1.2, Math.min(1.2, state.rotX + state.spinX))
			}

			if (state.morphing && state.morphT < 1) {
				state.morphT += morphSpeed
				if (state.morphT >= 1) {
					state.morphing = false
					state.currentShape = state.targetShape
					state.morphT = 1
				}
			}

			state.frame += 1
			renderAsciiFrame(ctx, state)
		}

		rafRef.current = requestAnimationFrame(loop)

		return () => {
			cancelAnimationFrame(rafRef.current)
			clearTimeout(idleTimerRef.current)
			canvas.removeEventListener('pointerdown', onPointerDown)
			canvas.removeEventListener('pointermove', onPointerMove)
			canvas.removeEventListener('pointerup', onPointerUp)
			canvas.removeEventListener('pointercancel', onPointerUp)
			canvas.removeEventListener('wheel', onWheel)
			document.removeEventListener('visibilitychange', onVisibility)
		}
	}, [morphSpeed])

	return (
		<canvas
			ref={canvasRef}
			width={INTERNAL_SIZE}
			height={INTERNAL_SIZE}
			className="ascii-scroll-canvas block"
			style={{
				width: displaySize,
				height: displaySize,
				imageRendering: 'pixelated',
				touchAction: 'none',
				cursor: 'grab',
			}}
			aria-hidden="true"
		/>
	)
})

export default AsciiScrollScene
