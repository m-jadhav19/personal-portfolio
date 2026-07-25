export function getFramePath(template, index) {
	const padded = String(index + 1).padStart(4, '0')
	return template.replace('%04d', padded)
}

export function getFrameSet(scrollExperience, isMobile) {
	const key = isMobile ? 'mobile' : 'desktop'
	const set = scrollExperience?.intro?.[key]
	if (!set) return { path: '', count: 0 }
	return { path: set.path, count: set.count }
}

export function progressToFrameIndex(progress, frameCount) {
	if (frameCount <= 1) return 0
	const clamped = Math.min(1, Math.max(0, progress))
	return Math.round(clamped * (frameCount - 1))
}

export function prefersReducedMotion() {
	if (typeof window === 'undefined') return false
	return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function isMobileViewport() {
	if (typeof window === 'undefined') return false
	return window.innerWidth < 768
}
