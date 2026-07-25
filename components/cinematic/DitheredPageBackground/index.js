import { useRef } from 'react'
import dynamic from 'next/dynamic'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { getMorphScrollTransform, getMorphShapeIndex } from '../../../lib/cinematic/morphTransform'

const AsciiScrollScene = dynamic(() => import('../AsciiScrollScene'), { ssr: false })

if (typeof window !== 'undefined') {
	gsap.registerPlugin(ScrollTrigger)
}

function applyMorphTransform(morphWrap, glow, transform) {
	if (morphWrap) {
		gsap.set(morphWrap, {
			x: `${transform.xVw}vw`,
			y: `${transform.yVh}vh`,
			rotate: transform.rotate,
			scale: transform.scale,
		})
	}
	if (glow) {
		gsap.set(glow, {
			opacity: transform.glowOpacity,
			scale: transform.glowScale,
			x: `${transform.xVw}vw`,
			y: `${transform.yVh}vh`,
		})
	}
}

export default function DitheredPageBackground({ pageRef }) {
	const bgRef = useRef(null)
	const morphWrapRef = useRef(null)
	const glowRef = useRef(null)
	const sceneRef = useRef(null)
	const lastShapeRef = useRef(-1)
	const wasAtRestRef = useRef(true)

	useGSAP(
		() => {
			const page = pageRef?.current
			if (!page) return undefined

			applyMorphTransform(morphWrapRef.current, glowRef.current, getMorphScrollTransform(0))

			const ctx = gsap.context(() => {
				ScrollTrigger.create({
					trigger: page,
					start: 'top top',
					end: 'bottom bottom',
					scrub: 0.85,
					onUpdate: (self) => {
						const progress = self.progress
						applyMorphTransform(
							morphWrapRef.current,
							glowRef.current,
							getMorphScrollTransform(progress)
						)

						const atRest = progress <= 0.02 || progress >= 0.98
						if (atRest && !wasAtRestRef.current && sceneRef.current?.reset) {
							sceneRef.current.reset()
						}
						wasAtRestRef.current = atRest

						const shapes = sceneRef.current?.getShapes?.() ?? []
						if (shapes.length && sceneRef.current?.jumpTo) {
							const idx = getMorphShapeIndex(progress, shapes.length)
							if (idx !== lastShapeRef.current) {
								lastShapeRef.current = idx
								sceneRef.current.jumpTo(idx)
							}
						}
					},
				})
			}, bgRef)

			return () => ctx.revert()
		},
		{ scope: bgRef, dependencies: [pageRef] }
	)

	return (
		<div
			ref={bgRef}
			className="dithered-page-bg fixed inset-0 z-0 overflow-hidden pointer-events-none"
			aria-hidden="true"
		>
			<div
				ref={glowRef}
				className="dithered-page-glow absolute top-[42%] left-[62%] -translate-x-1/2 -translate-y-1/2 w-[min(120vw,1200px)] h-[min(120vw,1200px)] rounded-full will-change-transform"
				style={{
					background: 'radial-gradient(circle, rgba(var(--cinematic-accent-rgb), 0.5) 0%, rgba(var(--cinematic-accent-rgb), 0.14) 40%, transparent 72%)',
					filter: 'blur(90px)',
				}}
			/>

			<div className="dithered-page-morph-anchor absolute inset-0">
				<div
					ref={morphWrapRef}
					className="dithered-page-morph absolute top-[42%] left-[62%] -translate-x-1/2 -translate-y-1/2 flex items-center justify-center will-change-transform pointer-events-auto"
				>
					<div className="dithered-page-morph-ring" aria-hidden="true" />
					<AsciiScrollScene ref={sceneRef} morphSpeed={0.065} />
				</div>
			</div>

			<div className="dithered-page-scrim-left absolute inset-0" />
			<div className="dithered-page-scrim-vignette absolute inset-0" />
		</div>
	)
}
