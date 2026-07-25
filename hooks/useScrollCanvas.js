import { useCallback, useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import FramePreloader from '../components/cinematic/FramePreloader'
import {
	getFrameSet,
	isMobileViewport,
	prefersReducedMotion,
	progressToFrameIndex,
} from '../lib/cinematic/frameUtils'

if (typeof window !== 'undefined') {
	gsap.registerPlugin(ScrollTrigger)
}

export function useScrollCanvas({ scrollExperience, triggerRef, enabled = true }) {
	const canvasRef = useRef(null)
	const preloaderRef = useRef(null)
	const [isReady, setIsReady] = useState(false)
	const [loadProgress, setLoadProgress] = useState(0)
	const currentFrameRef = useRef(0)
	const reducedMotion = useRef(false)

	const drawFrame = useCallback((index) => {
		const canvas = canvasRef.current
		const preloader = preloaderRef.current
		if (!canvas || !preloader) return

		const img = preloader.getFrame(index)
		if (!img) return

		const ctx = canvas.getContext('2d')
		if (!ctx) return

		const { width, height } = canvas
		ctx.clearRect(0, 0, width, height)

		const scale = Math.max(width / img.width, height / img.height)
		const drawW = img.width * scale
		const drawH = img.height * scale
		const x = (width - drawW) / 2
		const y = (height - drawH) / 2

		ctx.drawImage(img, x, y, drawW, drawH)
		currentFrameRef.current = index
	}, [])

	const resizeCanvas = useCallback(() => {
		const canvas = canvasRef.current
		if (!canvas || typeof window === 'undefined') return

		const dpr = Math.min(window.devicePixelRatio || 1, 2)
		canvas.width = window.innerWidth * dpr
		canvas.height = window.innerHeight * dpr
		canvas.style.width = `${window.innerWidth}px`
		canvas.style.height = `${window.innerHeight}px`

		const ctx = canvas.getContext('2d')
		if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

		drawFrame(currentFrameRef.current)
	}, [drawFrame])

	useEffect(() => {
		if (!enabled || !scrollExperience || typeof window === 'undefined') return undefined

		reducedMotion.current = prefersReducedMotion()
		const mobile = isMobileViewport()
		const { path, count } = getFrameSet(scrollExperience, mobile)

		if (!path || count === 0) return undefined

		const preloader = new FramePreloader(path, count)
		preloaderRef.current = preloader

		let cancelled = false
		let scrollTriggerInstance = null

		const init = async () => {
			await preloader.loadInitial(reducedMotion.current ? 1 : 8)
			if (cancelled) return

			setLoadProgress(preloader.getProgress())
			drawFrame(0)
			setIsReady(true)

			if (reducedMotion.current) {
				resizeCanvas()
				return
			}

			const triggerEl = triggerRef?.current
			if (!triggerEl) return

			scrollTriggerInstance = ScrollTrigger.create({
				trigger: triggerEl,
				start: 'top top',
				end: '+=300%',
				pin: true,
				scrub: scrollExperience.chapters?.find((c) => c.id === 'intro')?.scrub ?? 1.2,
				anticipatePin: 1,
				onUpdate: (self) => {
					const index = progressToFrameIndex(self.progress, count)
					drawFrame(index)
					preloader.preloadAround(index, self.direction)
					setLoadProgress(preloader.getProgress())
				},
			})
		}

		resizeCanvas()
		window.addEventListener('resize', resizeCanvas)
		init()

		return () => {
			cancelled = true
			window.removeEventListener('resize', resizeCanvas)
			scrollTriggerInstance?.kill()
			preloader.dispose()
			preloaderRef.current = null
		}
	}, [enabled, scrollExperience, triggerRef, drawFrame, resizeCanvas])

	return { canvasRef, isReady, loadProgress, drawFrame }
}

export default useScrollCanvas
