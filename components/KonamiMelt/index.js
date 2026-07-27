import { useEffect, useState, useCallback, useRef } from 'react'
import { gsap } from 'gsap'

const KONAMI_CODE = [
  'ArrowUp', 'ArrowUp',
  'ArrowDown', 'ArrowDown',
  'ArrowLeft', 'ArrowRight',
  'ArrowLeft', 'ArrowRight',
  'KeyB', 'KeyA'
]

const KonamiMelt = () => {
  const [isMelting, setIsMelting] = useState(false)
  const keySequenceRef = useRef([])
  const timelineRef = useRef(null)

  const triggerMelt = useCallback(() => {
    if (isMelting) return
    setIsMelting(true)

    const tl = gsap.timeline()
    timelineRef.current = tl

    // Create message element
    const message = document.createElement('div')
    message.id = 'konami-message'
    message.innerHTML = `
      <div style="text-align: center; padding: 20px;">
        <h2 style="font-family: 'Space Grotesk', sans-serif; font-size: clamp(1.5rem, 5vw, 3rem); font-weight: 700; color: white; margin-bottom: 16px;">
          🎮 KONAMI CODE ACTIVATED! 🎮
        </h2>
        <p style="font-family: 'Space Grotesk', sans-serif; font-size: 1.2rem; color: rgba(255,255,255,0.8);">
          The screen is melting away...
        </p>
      </div>
    `
    message.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) scale(0.5);
      z-index: 99999;
      opacity: 0;
      pointer-events: none;
      text-shadow: 0 0 20px rgba(255, 255, 255, 0.8), 0 0 40px var(--selected-color, #339AF0);
    `
    document.body.appendChild(message)

    // Create reset button
    const resetBtn = document.createElement('button')
    resetBtn.id = 'konami-reset'
    resetBtn.textContent = '🔄 Restore Reality'
    resetBtn.style.cssText = `
      position: fixed;
      bottom: 30px;
      left: 50%;
      transform: translateX(-50%) scale(0.8);
      z-index: 100000;
      padding: 16px 40px;
      font-family: 'Space Grotesk', sans-serif;
      font-size: 1.1rem;
      font-weight: 600;
      color: white;
      background: var(--selected-color, #339AF0);
      border: none;
      border-radius: 9999px;
      cursor: pointer;
      opacity: 0;
      box-shadow: 0 4px 30px rgba(var(--selected-color-rgb, 51, 154, 240), 0.5);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    `
    resetBtn.onmouseenter = () => {
      gsap.to(resetBtn, { scale: 1.05, duration: 0.2 })
    }
    resetBtn.onmouseleave = () => {
      gsap.to(resetBtn, { scale: 1, duration: 0.2 })
    }
    resetBtn.onclick = () => window.location.reload()
    document.body.appendChild(resetBtn)

    // Create drip overlay elements
    const dripCount = 15
    const drips = []
    for (let i = 0; i < dripCount; i++) {
      const drip = document.createElement('div')
      drip.className = 'konami-drip'
      drip.style.cssText = `
        position: fixed;
        top: 0;
        left: ${(i / dripCount) * 100}%;
        width: ${100 / dripCount + 2}%;
        height: 0;
        background: linear-gradient(
          180deg,
          transparent 0%,
          rgba(var(--selected-color-rgb, 51, 154, 240), 0.2) 30%,
          rgba(var(--selected-color-rgb, 51, 154, 240), 0.5) 60%,
          rgba(0, 0, 0, 0.9) 100%
        );
        z-index: 9998;
        pointer-events: none;
      `
      document.body.appendChild(drip)
      drips.push(drip)
    }

    // Get page elements
    const pageElements = document.querySelectorAll('body > *:not(#konami-message):not(#konami-reset):not(.konami-drip):not(script):not(style)')
    const textElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, a, button, li, img')

    // Show message with GSAP
    tl.to(message, {
      opacity: 1,
      scale: 1,
      duration: 0.6,
      ease: 'back.out(1.7)'
    }, 0)

    // Animate drips falling with staggered random timing
    tl.to(drips, {
      height: '120vh',
      duration: 2.5,
      ease: 'power2.in',
      stagger: {
        each: 0.08,
        from: 'random'
      }
    }, 0.3)

    // Text elements melt - blur, skew, fall
    tl.to(textElements, {
      y: () => gsap.utils.random(80, 300),
      opacity: 0,
      filter: 'blur(6px)',
      skewY: () => gsap.utils.random(-8, 8),
      rotationZ: () => gsap.utils.random(-3, 3),
      duration: 2,
      ease: 'power2.in',
      stagger: {
        each: 0.015,
        from: 'random'
      }
    }, 0.2)

    // Main page sections - clip-path melt effect
    pageElements.forEach((el, index) => {
      gsap.set(el, { transformOrigin: 'top center' })
      
      // Phase 1: Start dripping with clip-path
      tl.to(el, {
        clipPath: () => {
          const points = []
          for (let i = 0; i <= 10; i++) {
            const x = i * 10
            const y = Math.random() * 40 + 10
            points.push(`${x}% ${y}%`)
          }
          return `polygon(0% 0%, ${points.join(', ')}, 100% 0%, 100% 100%, 0% 100%)`
        },
        y: 30 + index * 15,
        scaleY: 1.05,
        filter: 'blur(1px) saturate(1.5)',
        duration: 1.2,
        ease: 'power1.in'
      }, 0.1 + index * 0.08)

      // Phase 2: Complete melt
      tl.to(el, {
        clipPath: 'polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)',
        y: '100vh',
        scaleY: 1.3,
        filter: 'blur(10px) saturate(3)',
        opacity: 0,
        duration: 1.8,
        ease: 'power3.in'
      }, 1.2 + index * 0.05)
    })

    // Color shift on body background
    tl.to(document.body, {
      backgroundColor: '#000',
      duration: 2.5
    }, 0.3)

    // Pulsing glow on message
    tl.to(message, {
      textShadow: '0 0 40px rgba(255, 255, 255, 1), 0 0 80px var(--selected-color, #339AF0), 0 0 120px var(--selected-color, #339AF0)',
      repeat: -1,
      yoyo: true,
      duration: 1,
      ease: 'sine.inOut'
    }, 1)

    // Show reset button
    tl.to(resetBtn, {
      opacity: 1,
      scale: 1,
      duration: 0.5,
      ease: 'back.out(1.7)'
    }, 3)

    // Clean up drips
    tl.call(() => {
      drips.forEach(drip => {
        gsap.to(drip, {
          opacity: 0,
          duration: 1,
          onComplete: () => drip.remove()
        })
      })
    }, [], 4)

  }, [isMelting])

  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.code
      
      keySequenceRef.current = [...keySequenceRef.current, key].slice(-KONAMI_CODE.length)
      
      if (keySequenceRef.current.length === KONAMI_CODE.length &&
          keySequenceRef.current.every((k, i) => k === KONAMI_CODE[i])) {
        triggerMelt()
        keySequenceRef.current = []
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [triggerMelt])

  // Cleanup timeline on unmount
  useEffect(() => {
    return () => {
      if (timelineRef.current) {
        timelineRef.current.kill()
      }
    }
  }, [])

  return null
}

export default KonamiMelt
