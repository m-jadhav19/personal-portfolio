import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { useTheme } from 'next-themes'

const FluidDitherBackground = () => {
	const containerRef = useRef()
	const { theme, resolvedTheme } = useTheme()

	useEffect(() => {
		if (typeof window === 'undefined') return

		const container = containerRef.current
		if (!container) return

		// Scene Setup
		const scene = new THREE.Scene()
		const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
		const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false })
		renderer.setPixelRatio(window.devicePixelRatio)
		renderer.setSize(window.innerWidth, window.innerHeight)
		container.appendChild(renderer.domElement)

		// Uniforms
		const uniforms = {
			u_time: { value: 1.0 },
			u_resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
			u_mouse: { value: new THREE.Vector2(0, 0) },
			u_isDark: { value: resolvedTheme === 'dark' ? 1.0 : 0.0 },
			u_accentColor: { value: new THREE.Color('#339AF0') }
		}

		// Geometry & Material
		const geometry = new THREE.PlaneGeometry(2, 2)
		const material = new THREE.ShaderMaterial({
			uniforms,
			vertexShader: `
				varying vec2 vUv;
				void main() {
					vUv = uv;
					gl_Position = vec4(position, 1.0);
				}
			`,
			fragmentShader: `
				uniform float u_time;
				uniform vec2 u_resolution;
				uniform vec2 u_mouse;
				uniform float u_isDark;
				uniform vec3 u_accentColor;
				varying vec2 vUv;

				float random(vec2 st) {
					return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
				}

				// Bayer matrix for ordered dithering
				float dither8x8(vec2 position, float brightness) {
					int x = int(mod(position.x, 8.0));
					int y = int(mod(position.y, 8.0));
					int index = x + y * 8;
					float limit = 0.0;

					if (x < 8) {
						if (index == 0) limit = 0.015625; if (index == 1) limit = 0.515625; if (index == 2) limit = 0.140625; if (index == 3) limit = 0.640625;
						if (index == 4) limit = 0.046875; if (index == 5) limit = 0.546875; if (index == 6) limit = 0.171875; if (index == 7) limit = 0.671875;
						if (index == 8) limit = 0.765625; if (index == 9) limit = 0.265625; if (index == 10) limit = 0.890625; if (index == 11) limit = 0.390625;
						if (index == 12) limit = 0.796875; if (index == 13) limit = 0.296875; if (index == 14) limit = 0.921875; if (index == 15) limit = 0.421875;
						if (index == 16) limit = 0.1875; if (index == 17) limit = 0.6875; if (index == 18) limit = 0.0625; if (index == 19) limit = 0.5625;
						if (index == 20) limit = 0.21875; if (index == 21) limit = 0.71875; if (index == 22) limit = 0.09375; if (index == 23) limit = 0.59375;
						if (index == 24) limit = 0.9375; if (index == 25) limit = 0.4375; if (index == 26) limit = 0.8125; if (index == 31) limit = 0.3125;
						if (index == 28) limit = 0.96875; if (index == 29) limit = 0.46875; if (index == 30) limit = 0.84375; if (index == 31) limit = 0.34375;
						if (index == 32) limit = 0.140625; if (index == 33) limit = 0.640625; if (index == 34) limit = 0.015625; if (index == 35) limit = 0.515625;
						if (index == 36) limit = 0.171875; if (index == 37) limit = 0.671875; if (index == 38) limit = 0.046875; if (index == 39) limit = 0.546875;
						if (index == 40) limit = 0.890625; if (index == 41) limit = 0.390625; if (index == 42) limit = 0.765625; if (index == 43) limit = 0.265625;
						if (index == 44) limit = 0.921875; if (index == 45) limit = 0.421875; if (index == 46) limit = 0.796875; if (index == 47) limit = 0.296875;
						if (index == 48) limit = 0.0625; if (index == 49) limit = 0.5625; if (index == 50) limit = 0.1875; if (index == 51) limit = 0.6875;
						if (index == 52) limit = 0.09375; if (index == 53) limit = 0.59375; if (index == 54) limit = 0.21875; if (index == 55) limit = 0.71875;
						if (index == 56) limit = 0.8125; if (index == 57) limit = 0.3125; if (index == 58) limit = 0.9375; if (index == 59) limit = 0.4375;
						if (index == 60) limit = 0.84375; if (index == 61) limit = 0.34375; if (index == 62) limit = 0.96875; if (index == 63) limit = 0.46875;
					}

					return brightness < limit ? 0.0 : 1.0;
				}

				void main() {
					vec2 st = gl_FragCoord.xy / u_resolution.xy;
					st.x *= u_resolution.x / u_resolution.y;

					vec2 mouse = u_mouse / u_resolution.xy;
					mouse.x *= u_resolution.x / u_resolution.y;

					float d = length(st - mouse);
					
					// Fluid-like motion using sine waves
					float f = 0.0;
					vec2 p = st * 3.0;
					f += 0.5 * sin(p.x + u_time * 0.5);
					f += 0.25 * sin(p.y + u_time * 0.3);
					f += 0.125 * sin(p.x + p.y + u_time * 0.7);
					
					// Base color based on theme
					vec3 baseColor = (u_isDark > 0.5) ? vec3(0.02, 0.02, 0.05) : vec3(0.95, 0.93, 0.89);
					vec3 accentColor = u_accentColor;
					
					vec3 color = mix(baseColor, accentColor, f * 0.4 + 0.4);
					
					// Mouse interaction
					float glow = smoothstep(0.4, 0.0, d);
					color += accentColor * glow * 0.3;

					// Apply Dithering
					float brightness = (color.r + color.g + color.b) / 3.0;
					float dithered = dither8x8(gl_FragCoord.xy, brightness);
					
					// Final output with bit-style color
					vec3 finalColor = mix(baseColor, color, dithered);
					
					gl_FragColor = vec4(finalColor, 1.0);
				}
			`,
			transparent: true
		})

		const mesh = new THREE.Mesh(geometry, material)
		scene.add(mesh)

		// Animation
		const animate = () => {
			uniforms.u_time.value += 0.01
			
			// Dynamically update accent color from CSS
			const rootStyle = getComputedStyle(document.documentElement)
			const rgbColor = rootStyle.getPropertyValue('--selected-color-rgb').trim()
			if (rgbColor) {
				const [r, g, b] = rgbColor.split(',').map(c => parseInt(c.trim()) / 255)
				uniforms.u_accentColor.value.setRGB(r, g, b)
			}
			
			renderer.render(scene, camera)
			requestAnimationFrame(animate)
		}
		animate()

		// Interactivity
		const handleMouseMove = (e) => {
			uniforms.u_mouse.value.x = e.clientX
			uniforms.u_mouse.value.y = window.innerHeight - e.clientY // Flip Y for WebGL
		}

		const handleResize = () => {
			renderer.setSize(window.innerWidth, window.innerHeight)
			uniforms.u_resolution.value.set(window.innerWidth, window.innerHeight)
		}

		window.addEventListener('mousemove', handleMouseMove)
		window.addEventListener('resize', handleResize)

		return () => {
			window.removeEventListener('mousemove', handleMouseMove)
			window.removeEventListener('resize', handleResize)
			container.removeChild(renderer.domElement)
			geometry.dispose()
			material.dispose()
			renderer.dispose()
		}
	}, [resolvedTheme])

	return (
		<div
			ref={containerRef}
			className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
			style={{ background: resolvedTheme === 'dark' ? '#000' : '#fff' }}
		/>
	)
}

export default FluidDitherBackground
