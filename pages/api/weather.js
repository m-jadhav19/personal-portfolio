// Lightweight weather proxy with 30 min in-memory cache
// Expects either ?lat=&lon= or ?city=

let cache = new Map()

function getCacheKey(query) {
	if (query.lat && query.lon) return `geo:${query.lat},${query.lon}`
	if (query.city) return `city:${query.city.toLowerCase()}`
	return `city:pune`
}

function isFresh(entry) {
	if (!entry) return false
	const THIRTY_MIN = 30 * 60 * 1000
	return Date.now() - entry.timestamp < THIRTY_MIN
}

export default async function handler(req, res) {
	try {
		const {lat, lon, city} = req.query || {}
		const key = getCacheKey(req.query || {})
		const cached = cache.get(key)
		if (isFresh(cached)) {
			res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=1800')
			return res.status(200).json(cached.payload)
		}

		const apiKey = "ea4a5b9cb95627f0aa09579220c991b2"
		if (!apiKey) {
			return res.status(200).json({
				condition: 'clear',
				isNight: false,
				city: city || 'Pune',
				temp: 300,
				note: 'No API key configured; returning fallback clear weather'
			})
		}

		const search = lat && lon
			? `lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}`
			: `q=${encodeURIComponent(city || 'Pune')}`

		const url = `https://api.openweathermap.org/data/2.5/weather?${search}&appid=${apiKey}`
		const resp = await fetch(url)
		if (!resp.ok) throw new Error(`Weather fetch failed ${resp.status}`)
		const data = await resp.json()

		const main = (data.weather?.[0]?.main || 'Clear').toLowerCase()
		const icon = data.weather?.[0]?.icon || '01d'
		const isNight = icon.endsWith('n') || (() => {
			const now = Math.floor(Date.now() / 1000)
			const sunrise = data.sys?.sunrise || 0
			const sunset = data.sys?.sunset || 0
			return now < sunrise || now > sunset
		})()

		const payload = {
			weather: main,
			condition: main,
			isNight,
			city: data.name,
			temp: data.main?.temp,
			icon,
			// Keep raw small to avoid sending large payloads
		}

		cache.set(key, {timestamp: Date.now(), payload})
		res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=1800')
		return res.status(200).json(payload)
	} catch (err) {
		return res.status(200).json({ condition: 'clear', isNight: false, error: err?.message })
	}
}


