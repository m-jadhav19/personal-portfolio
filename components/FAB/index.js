import React, {useState, useEffect, useRef, useCallback} from 'react'
import {motion, AnimatePresence} from 'framer-motion'
import {Popover} from '@headlessui/react'
import {useTheme} from 'next-themes'

// ─── Reliable theme hook ────────────────────────────────────────────────────
const useReliableTheme = () => {
	const {theme, resolvedTheme} = useTheme()
	const [mounted, setMounted] = useState(false)

	useEffect(() => { setMounted(true) }, [])

	const currentTheme = mounted ? (resolvedTheme || theme || 'dark') : 'dark'

	useEffect(() => {
		if (!mounted) return
		const html = document.documentElement
		const body = document.body
		if (currentTheme === 'dark') {
			html.setAttribute('data-theme', 'dark')
			html.classList.add('dark')
			body.classList.add('dark-mode-persist')
			body.classList.remove('light-mode')
			html.style.setProperty('--current-theme', 'dark')
			html.style.setProperty('color-scheme', 'dark')
		} else {
			html.setAttribute('data-theme', 'light')
			html.classList.remove('dark')
			body.classList.remove('dark-mode-persist')
			body.classList.add('light-mode')
			html.style.setProperty('--current-theme', 'light')
			html.style.setProperty('color-scheme', 'light')
		}
	}, [mounted, currentTheme])

	return {currentTheme, mounted}
}

// ─── Color helpers ───────────────────────────────────────────────────────────
const hexToHsv = (hex) => {
	let r = parseInt(hex.slice(1, 3), 16) / 255
	let g = parseInt(hex.slice(3, 5), 16) / 255
	let b = parseInt(hex.slice(5, 7), 16) / 255
	const max = Math.max(r, g, b), min = Math.min(r, g, b)
	const d = max - min
	let h = 0, s = max === 0 ? 0 : d / max, v = max
	if (d !== 0) {
		if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6
		else if (max === g) h = ((b - r) / d + 2) / 6
		else h = ((r - g) / d + 4) / 6
	}
	return {h: h * 360, s, v}
}

const hsvToHex = (h, s, v) => {
	h = h / 360
	let r, g, b
	const i = Math.floor(h * 6)
	const f = h * 6 - i
	const p = v * (1 - s)
	const q = v * (1 - f * s)
	const t = v * (1 - (1 - f) * s)
	switch (i % 6) {
		case 0: r = v; g = t; b = p; break
		case 1: r = q; g = v; b = p; break
		case 2: r = p; g = v; b = t; break
		case 3: r = p; g = q; b = v; break
		case 4: r = t; g = p; b = v; break
		case 5: r = v; g = p; b = q; break
	}
	const toHex = (x) => Math.round(x * 255).toString(16).padStart(2, '0')
	return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

const hexToRgb = (hex) => {
	const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
	return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '0, 0, 0'
}

const isValidHex = (hex) => /^#[0-9A-Fa-f]{6}$/.test(hex)

// ─── Saturation / Brightness canvas picker ───────────────────────────────────
const SBCanvas = ({hue, sat, bri, onChange}) => {
	const canvasRef = useRef(null)
	const [isDragging, setIsDragging] = useState(false)

	const drawCanvas = useCallback(() => {
		const canvas = canvasRef.current
		if (!canvas) return
		const ctx = canvas.getContext('2d')
		const {width: w, height: h} = canvas

		ctx.clearRect(0, 0, w, h)
		ctx.fillStyle = `hsl(${hue}, 100%, 50%)`
		ctx.fillRect(0, 0, w, h)

		const white = ctx.createLinearGradient(0, 0, w, 0)
		white.addColorStop(0, 'rgba(255,255,255,1)')
		white.addColorStop(1, 'rgba(255,255,255,0)')
		ctx.fillStyle = white
		ctx.fillRect(0, 0, w, h)

		const black = ctx.createLinearGradient(0, 0, 0, h)
		black.addColorStop(0, 'rgba(0,0,0,0)')
		black.addColorStop(1, 'rgba(0,0,0,1)')
		ctx.fillStyle = black
		ctx.fillRect(0, 0, w, h)

		const x = sat * w
		const y = (1 - bri) * h
		ctx.beginPath()
		ctx.arc(x, y, 7, 0, Math.PI * 2)
		ctx.strokeStyle = 'white'
		ctx.lineWidth = 2.5
		ctx.stroke()
		ctx.beginPath()
		ctx.arc(x, y, 5, 0, Math.PI * 2)
		ctx.strokeStyle = 'rgba(0,0,0,0.4)'
		ctx.lineWidth = 1.5
		ctx.stroke()
	}, [hue, sat, bri])

	useEffect(() => { drawCanvas() }, [drawCanvas])

	const pick = useCallback((e) => {
		const canvas = canvasRef.current
		if (!canvas) return
		const rect = canvas.getBoundingClientRect()
		const clientX = e.touches ? e.touches[0].clientX : e.clientX
		const clientY = e.touches ? e.touches[0].clientY : e.clientY
		const s = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
		const v = Math.max(0, Math.min(1, 1 - (clientY - rect.top) / rect.height))
		onChange(s, v)
	}, [onChange])

	useEffect(() => {
		const handleMove = (e) => {
			if (isDragging) pick(e)
		}
		const handleUp = () => {
			setIsDragging(false)
		}

		if (isDragging) {
			window.addEventListener('mousemove', handleMove)
			window.addEventListener('mouseup', handleUp)
			window.addEventListener('touchmove', handleMove)
			window.addEventListener('touchend', handleUp)
		}

		return () => {
			window.removeEventListener('mousemove', handleMove)
			window.removeEventListener('mouseup', handleUp)
			window.removeEventListener('touchmove', handleMove)
			window.removeEventListener('touchend', handleUp)
		}
	}, [isDragging, pick])

	return (
		<canvas
			ref={canvasRef}
			width={240}
			height={140}
			className="touch-none"
			style={{width: '100%', height: 140, borderRadius: 8, cursor: 'crosshair', display: 'block'}}
			onMouseDown={(e) => { setIsDragging(true); pick(e) }}
			onTouchStart={(e) => { setIsDragging(true); pick(e) }}
		/>
	)
}

// ─── Hue slider ─────────────────────────────────────────────────────────────
const HueSlider = ({hue, onChange}) => {
	const trackRef = useRef(null)
	const [isDragging, setIsDragging] = useState(false)

	const pick = useCallback((e) => {
		const track = trackRef.current
		if (!track) return
		const rect = track.getBoundingClientRect()
		const clientX = e.touches ? e.touches[0].clientX : e.clientX
		const h = Math.max(0, Math.min(360, ((clientX - rect.left) / rect.width) * 360))
		onChange(h)
	}, [onChange])

	useEffect(() => {
		const handleMove = (e) => {
			if (isDragging) pick(e)
		}
		const handleUp = () => {
			setIsDragging(false)
		}

		if (isDragging) {
			window.addEventListener('mousemove', handleMove)
			window.addEventListener('mouseup', handleUp)
			window.addEventListener('touchmove', handleMove)
			window.addEventListener('touchend', handleUp)
		}

		return () => {
			window.removeEventListener('mousemove', handleMove)
			window.removeEventListener('mouseup', handleUp)
			window.removeEventListener('touchmove', handleMove)
			window.removeEventListener('touchend', handleUp)
		}
	}, [isDragging, pick])

	return (
		<div style={{position: 'relative', height: 14, userSelect: 'none'}}
			ref={trackRef}
			className="touch-none"
			onMouseDown={(e) => { setIsDragging(true); pick(e) }}
			onTouchStart={(e) => { setIsDragging(true); pick(e) }}
		>
			<div style={{
				position: 'absolute', inset: 0,
				borderRadius: 99,
				background: 'linear-gradient(to right, hsl(0,100%,50%), hsl(30,100%,50%), hsl(60,100%,50%), hsl(90,100%,50%), hsl(120,100%,50%), hsl(150,100%,50%), hsl(180,100%,50%), hsl(210,100%,50%), hsl(240,100%,50%), hsl(270,100%,50%), hsl(300,100%,50%), hsl(330,100%,50%), hsl(360,100%,50%))',
				cursor: 'pointer',
			}} />
			<div style={{
				position: 'absolute',
				top: '50%',
				left: `${(hue / 360) * 100}%`,
				transform: 'translate(-50%, -50%)',
				width: 16,
				height: 16,
				borderRadius: '50%',
				background: `hsl(${hue}, 100%, 50%)`,
				border: '2.5px solid white',
				boxShadow: '0 1px 4px rgba(0,0,0,0.4)',
				pointerEvents: 'none',
				transition: 'left 0.05s',
			}} />
		</div>
	)
}

// ─── Preset data ─────────────────────────────────────────────────────────────
const PRESETS = [
	{hex: '#339AF0', name: 'Azure'},
	{hex: '#FF6B6B', name: 'Coral'},
	{hex: '#51CF66', name: 'Sage'},
	{hex: '#845EF7', name: 'Violet'},
	{hex: '#FF922B', name: 'Orange'},
	{hex: '#F06595', name: 'Rose'},
	{hex: '#20C997', name: 'Teal'},
	{hex: '#FCC419', name: 'Amber'},
	{hex: '#94D82D', name: 'Lime'},
	{hex: '#5C7CFA', name: 'Indigo'},
	{hex: '#AE3EC9', name: 'Orchid'},
	{hex: '#E03131', name: 'Crimson'},
]

// ─── FAB ────────────────────────────────────────────────────────────────────
const FAB = () => {
	const [selectedTab, setSelectedTab] = useState('Preset')
	const [selectedColor, setSelectedColor] = useState('#339AF0')
	const [hexInput, setHexInput] = useState('#339AF0')

	// HSV state for the custom picker
	const initHsv = hexToHsv('#339AF0')
	const [hue, setHue] = useState(initHsv.h)
	const [sat, setSat] = useState(initHsv.s)
	const [bri, setBri] = useState(initHsv.v)

	const {currentTheme, mounted} = useReliableTheme()
	const isDark = currentTheme === 'dark'

	// Sync CSS vars whenever selectedColor changes
	useEffect(() => {
		if (!mounted) return
		document.documentElement.style.setProperty('--selected-color', selectedColor)
		document.documentElement.style.setProperty('--selected-color-rgb', hexToRgb(selectedColor))
	}, [selectedColor, mounted])

	// When HSV changes → update selectedColor + hexInput
	const applyHsv = useCallback((h, s, v) => {
		const hex = hsvToHex(h, s, v)
		setSelectedColor(hex)
		setHexInput(hex)
	}, [])

	const handleHueChange = (h) => { setHue(h); applyHsv(h, sat, bri) }
	const handleSBChange = (s, v) => { setSat(s); setBri(v); applyHsv(hue, s, v) }

	const handleHexInput = (val) => {
		setHexInput(val)
		if (isValidHex(val)) {
			setSelectedColor(val)
			const {h, s, v} = hexToHsv(val)
			setHue(h); setSat(s); setBri(v)
		}
	}

	const applyPreset = (hex) => {
		setSelectedColor(hex)
		setHexInput(hex)
		const {h, s, v} = hexToHsv(hex)
		setHue(h); setSat(s); setBri(v)
	}

	// ── Panel style helpers ──
	const panelBg = isDark ? 'rgba(10, 10, 10, 0.92)' : 'rgba(253, 251, 247, 0.94)'
	const borderCol = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
	const textCol = isDark ? '#fafafa' : '#1a1a1a'
	const subCol = isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)'
	const inputBg = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'
	const inputBorder = isDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.18)'
	const tabActiveBg = isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)'
	const tabActiveCol = isDark ? '#fff' : '#111'

	// ── Preset view ──
	const PresetView = () => (
		<motion.div
			key='preset'
			initial={{x: 12, opacity: 0}}
			animate={{x: 0, opacity: 1}}
			exit={{x: -12, opacity: 0}}
			transition={{duration: 0.2, type: 'spring', bounce: 0.3}}
		>
			<div style={{display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8}}>
				{PRESETS.map(({hex, name}) => {
					const active = selectedColor.toLowerCase() === hex.toLowerCase()
					return (
						<motion.button
							key={hex}
							title={`${name} – ${hex}`}
							onClick={() => applyPreset(hex)}
							whileHover={{scale: 1.18, y: -2}}
							whileTap={{scale: 0.9}}
							transition={{type: 'spring', stiffness: 400, damping: 18}}
							style={{
								width: 32,
								height: 32,
								borderRadius: '50%',
								background: hex,
								border: active ? `3px solid ${isDark ? '#fff' : '#000'}` : '2.5px solid transparent',
								outline: active ? `2px solid ${hex}88` : 'none',
								outlineOffset: 2,
								boxShadow: active ? `0 0 0 3px ${hex}44, 0 4px 12px ${hex}66` : `0 2px 6px ${hex}55`,
								cursor: 'pointer',
								position: 'relative',
								transition: 'box-shadow 0.18s, border 0.18s',
							}}
						>
							{active && (
								<motion.div
									initial={{scale: 0, opacity: 0}}
									animate={{scale: 1, opacity: 1}}
									exit={{scale: 0, opacity: 0}}
									style={{
										position: 'absolute', inset: 0,
										display: 'flex', alignItems: 'center', justifyContent: 'center',
										pointerEvents: 'none',
									}}
								>
									<svg width='13' height='13' viewBox='0 0 24 24' fill='none' stroke={isDark ? '#fff' : '#111'} strokeWidth={3} strokeLinecap='round' strokeLinejoin='round'>
										<path d='M5 13l4 4L19 7' />
									</svg>
								</motion.div>
							)}
						</motion.button>
					)
				})}
			</div>
		</motion.div>
	)

	// ── Custom view ──
	const CustomView = () => (
		<motion.div
			key='custom'
			initial={{x: 12, opacity: 0}}
			animate={{x: 0, opacity: 1}}
			exit={{x: -12, opacity: 0}}
			transition={{duration: 0.2, type: 'spring', bounce: 0.3}}
			style={{display: 'flex', flexDirection: 'column', gap: 10}}
		>
			{/* Saturation / Brightness canvas */}
			<SBCanvas
				hue={hue}
				sat={sat}
				bri={bri}
				onChange={handleSBChange}
			/>

			{/* Hue strip */}
			<div style={{padding: '4px 0'}}>
				<HueSlider hue={hue} onChange={handleHueChange} />
			</div>

			{/* Preview swatch + HEX type-in */}
			<div style={{display: 'flex', alignItems: 'center', gap: 10}}>
				<div style={{
					width: 34,
					height: 34,
					borderRadius: 8,
					background: selectedColor,
					border: `2px solid ${isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.2)'}`,
					boxShadow: `0 3px 10px ${selectedColor}55`,
					flexShrink: 0,
					transition: 'background 0.12s, box-shadow 0.12s',
				}} />
				<div style={{flex: 1}}>
					<label style={{display: 'block', fontSize: 10, letterSpacing: '0.06em', textTransform: 'uppercase', color: subCol, marginBottom: 4}}>HEX</label>
					<input
						type='text'
						value={hexInput}
						onChange={(e) => handleHexInput(e.target.value)}
						spellCheck={false}
						style={{
							width: '100%',
							padding: '5px 10px',
							fontSize: 13,
							fontFamily: 'monospace',
							background: inputBg,
							border: `1px solid ${isValidHex(hexInput) ? selectedColor + '66' : '#e03131'}`,
							borderRadius: 8,
							color: textCol,
							outline: 'none',
							transition: 'border-color 0.18s',
						}}
					/>
				</div>
			</div>
		</motion.div>
	)

	if (!mounted) return null

	return (
		<Popover className='fixed bottom-6 right-6 z-50'>
			{({open}) => (
				<>
					{/* FAB trigger button */}
					<Popover.Button
						style={{
							width: 52,
							height: 52,
							borderRadius: '50%',
							background: isDark
								? `linear-gradient(135deg, ${selectedColor}22, ${selectedColor}44)`
								: `linear-gradient(135deg, ${selectedColor}33, ${selectedColor}55)`,
							border: `2px solid ${selectedColor}`,
							boxShadow: open
								? `0 0 0 4px ${selectedColor}33, 0 8px 24px ${selectedColor}55`
								: `0 4px 16px ${selectedColor}44`,
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							cursor: 'pointer',
							transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
							transform: open ? 'scale(1.08) rotate(15deg)' : 'scale(1)',
							outline: 'none',
						}}
					>
						<svg width='22' height='22' fill='none' stroke={isDark ? 'white' : '#1a1a1a'} strokeWidth={2} viewBox='0 0 24 24'>
							<path strokeLinecap='round' strokeLinejoin='round' d='M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01' />
						</svg>
					</Popover.Button>

					<AnimatePresence>
						{open && (
							<Popover.Panel static>
								<motion.div
									initial={{opacity: 0, scale: 0.92, y: 10}}
									animate={{opacity: 1, scale: 1, y: 0}}
									exit={{opacity: 0, scale: 0.92, y: 10}}
									transition={{type: 'spring', stiffness: 380, damping: 28}}
									style={{
										position: 'absolute',
										bottom: 64,
										right: 0,
										width: 272,
										borderRadius: 16,
										background: panelBg,
										border: `1px solid ${borderCol}`,
										boxShadow: `0 24px 60px -8px ${selectedColor}33, 0 8px 32px rgba(0,0,0,0.35)`,
										backdropFilter: 'blur(30px) saturate(180%)',
										WebkitBackdropFilter: 'blur(30px) saturate(180%)',
										padding: 16,
										display: 'flex',
										flexDirection: 'column',
										gap: 14,
									}}
								>
									{/* Header */}
									<div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
										<span style={{fontSize: 12, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', color: subCol}}>Accent Color</span>
										<div style={{
											width: 20,
											height: 20,
											borderRadius: '50%',
											background: selectedColor,
											boxShadow: `0 2px 8px ${selectedColor}66`,
											transition: 'background 0.15s',
										}} />
									</div>

									{/* Tab switcher */}
									<div style={{
										display: 'flex',
										background: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)',
										borderRadius: 10,
										padding: 3,
										gap: 2,
									}}>
										{['Preset', 'Custom'].map((tab) => (
											<motion.button
												key={tab}
												onClick={() => setSelectedTab(tab)}
												whileTap={{scale: 0.96}}
												style={{
													flex: 1,
													padding: '6px 0',
													borderRadius: 8,
													fontSize: 13,
													fontWeight: 500,
													border: 'none',
													cursor: 'pointer',
													background: selectedTab === tab ? tabActiveBg : 'transparent',
													color: selectedTab === tab ? tabActiveCol : subCol,
													outline: 'none',
													transition: 'background 0.18s, color 0.18s',
													boxShadow: selectedTab === tab ? `0 1px 4px rgba(0,0,0,0.12)` : 'none',
												}}
											>
												{tab}
											</motion.button>
										))}
									</div>

									{/* Tab content */}
									<AnimatePresence mode='wait'>
										{selectedTab === 'Preset' ? <PresetView /> : <CustomView />}
									</AnimatePresence>

									{/* Footer: live hex value, color chip */}
									<div style={{
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'space-between',
										paddingTop: 10,
										borderTop: `1px solid ${borderCol}`,
									}}>
										<span style={{fontFamily: 'monospace', fontSize: 13, color: textCol, letterSpacing: '0.04em'}}>{selectedColor.toUpperCase()}</span>
										<div style={{
											width: 28,
											height: 28,
											borderRadius: '50%',
											background: selectedColor,
											border: `2px solid ${isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)'}`,
											boxShadow: `0 3px 10px ${selectedColor}66`,
											transition: 'background 0.12s, box-shadow 0.12s',
										}} />
									</div>
								</motion.div>
							</Popover.Panel>
						)}
					</AnimatePresence>
				</>
			)}
		</Popover>
	)
}

export default FAB
