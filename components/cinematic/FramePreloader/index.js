import { getFramePath } from '../../../lib/cinematic/frameUtils'

const LOOKAHEAD = 5

export class FramePreloader {
	constructor(pathTemplate, frameCount) {
		this.pathTemplate = pathTemplate
		this.frameCount = frameCount
		this.cache = new Map()
		this.loading = new Map()
		this.failed = new Set()
	}

	getFrameUrl(index) {
		return getFramePath(this.pathTemplate, index)
	}

	loadFrame(index) {
		if (index < 0 || index >= this.frameCount) return Promise.resolve(null)
		if (this.cache.has(index)) return Promise.resolve(this.cache.get(index))
		if (this.failed.has(index)) return Promise.resolve(null)
		if (this.loading.has(index)) return this.loading.get(index)

		const promise = new Promise((resolve) => {
			const img = new Image()
			img.decoding = 'async'
			img.onload = () => {
				this.cache.set(index, img)
				this.loading.delete(index)
				resolve(img)
			}
			img.onerror = () => {
				this.failed.add(index)
				this.loading.delete(index)
				resolve(null)
			}
			img.src = this.getFrameUrl(index)
		})

		this.loading.set(index, promise)
		return promise
	}

	async loadInitial(batchSize = 8) {
		const end = Math.min(batchSize, this.frameCount)
		const tasks = []
		for (let i = 0; i < end; i += 1) {
			tasks.push(this.loadFrame(i))
		}
		await Promise.all(tasks)
		return this.getLoadedCount()
	}

	preloadAround(currentIndex, direction = 1) {
		const start = direction >= 0 ? currentIndex + 1 : currentIndex - LOOKAHEAD
		const end = direction >= 0 ? currentIndex + LOOKAHEAD : currentIndex - 1
		const step = direction >= 0 ? 1 : -1

		for (let i = start; direction >= 0 ? i <= end : i >= end; i += step) {
			this.loadFrame(i)
		}
	}

	getFrame(index) {
		return this.cache.get(index) ?? null
	}

	getLoadedCount() {
		return this.cache.size
	}

	getProgress() {
		if (this.frameCount === 0) return 1
		return this.cache.size / this.frameCount
	}

	dispose() {
		this.cache.clear()
		this.loading.clear()
		this.failed.clear()
	}
}

export default FramePreloader
