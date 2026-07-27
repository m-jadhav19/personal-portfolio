import { useEffect, useState, useCallback } from 'react'

const KONAMI_CODE = [
  'ArrowUp', 'ArrowUp',
  'ArrowDown', 'ArrowDown',
  'ArrowLeft', 'ArrowRight',
  'ArrowLeft', 'ArrowRight',
  'KeyB', 'KeyA'
]

const KonamiMelt = () => {
  const [isMelting, setIsMelting] = useState(false)
  const [keySequence, setKeySequence] = useState([])

  const triggerMelt = useCallback(() => {
    if (isMelting) return
    setIsMelting(true)

    const style = document.createElement('style')
    style.id = 'konami-melt-styles'
    style.textContent = `
      @keyframes meltDrip {
        0% {
          clip-path: inset(0 0 0 0);
          filter: blur(0px) saturate(1);
          transform: translateY(0) scaleY(1);
        }
        15% {
          filter: blur(0.5px) saturate(1.2);
        }
        30% {
          clip-path: polygon(
            0% 0%, 5% 0%, 5% 8%, 10% 0%, 15% 0%, 15% 12%, 
            20% 0%, 25% 0%, 25% 6%, 30% 0%, 35% 0%, 35% 15%,
            40% 0%, 45% 0%, 45% 10%, 50% 0%, 55% 0%, 55% 18%,
            60% 0%, 65% 0%, 65% 8%, 70% 0%, 75% 0%, 75% 14%,
            80% 0%, 85% 0%, 85% 6%, 90% 0%, 95% 0%, 95% 12%,
            100% 0%, 100% 100%, 0% 100%
          );
          filter: blur(1px) saturate(1.5);
        }
        50% {
          clip-path: polygon(
            0% 0%, 5% 0%, 5% 25%, 10% 0%, 15% 0%, 15% 35%, 
            20% 0%, 25% 0%, 25% 20%, 30% 0%, 35% 0%, 35% 40%,
            40% 0%, 45% 0%, 45% 30%, 50% 0%, 55% 0%, 55% 45%,
            60% 0%, 65% 0%, 65% 25%, 70% 0%, 75% 0%, 75% 38%,
            80% 0%, 85% 0%, 85% 22%, 90% 0%, 95% 0%, 95% 32%,
            100% 0%, 100% 100%, 0% 100%
          );
          filter: blur(2px) saturate(2);
          transform: translateY(5vh) scaleY(1.02);
        }
        70% {
          clip-path: polygon(
            0% 0%, 5% 0%, 5% 55%, 10% 0%, 15% 0%, 15% 70%, 
            20% 0%, 25% 0%, 25% 50%, 30% 0%, 35% 0%, 35% 75%,
            40% 0%, 45% 0%, 45% 60%, 50% 0%, 55% 0%, 55% 80%,
            60% 0%, 65% 0%, 65% 55%, 70% 0%, 75% 0%, 75% 72%,
            80% 0%, 85% 0%, 85% 48%, 90% 0%, 95% 0%, 95% 65%,
            100% 0%, 100% 100%, 0% 100%
          );
          filter: blur(3px) saturate(2.5);
          transform: translateY(15vh) scaleY(1.05);
        }
        85% {
          clip-path: polygon(
            0% 0%, 5% 0%, 5% 85%, 10% 0%, 15% 0%, 15% 95%, 
            20% 0%, 25% 0%, 25% 80%, 30% 0%, 35% 0%, 35% 100%,
            40% 0%, 45% 0%, 45% 88%, 50% 0%, 55% 0%, 55% 100%,
            60% 0%, 65% 0%, 65% 82%, 70% 0%, 75% 0%, 75% 96%,
            80% 0%, 85% 0%, 85% 78%, 90% 0%, 95% 0%, 95% 92%,
            100% 0%, 100% 100%, 0% 100%
          );
          filter: blur(4px) saturate(3);
          transform: translateY(40vh) scaleY(1.1);
        }
        100% {
          clip-path: inset(0 0 100% 0);
          filter: blur(8px) saturate(4);
          transform: translateY(100vh) scaleY(1.2);
          opacity: 0;
        }
      }

      @keyframes colorShift {
        0% { filter: hue-rotate(0deg); }
        25% { filter: hue-rotate(90deg); }
        50% { filter: hue-rotate(180deg); }
        75% { filter: hue-rotate(270deg); }
        100% { filter: hue-rotate(360deg); }
      }

      @keyframes textMelt {
        0% {
          transform: translateY(0) skewY(0deg);
          opacity: 1;
          filter: blur(0);
        }
        50% {
          transform: translateY(20px) skewY(3deg);
          filter: blur(1px);
        }
        100% {
          transform: translateY(100vh) skewY(8deg);
          opacity: 0;
          filter: blur(4px);
        }
      }

      .konami-melting {
        animation: meltDrip 4s cubic-bezier(0.4, 0, 0.2, 1) forwards !important;
      }

      .konami-melting * {
        animation: textMelt 3.5s cubic-bezier(0.4, 0, 0.2, 1) forwards !important;
        animation-delay: calc(var(--melt-delay, 0) * 0.05s) !important;
      }

      .konami-color-shift {
        animation: colorShift 2s linear infinite !important;
      }

      .konami-melt-message {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 99999;
        font-family: 'Space Grotesk', sans-serif;
        font-size: clamp(1.5rem, 5vw, 3rem);
        font-weight: 700;
        color: white;
        text-shadow: 0 0 20px rgba(255, 255, 255, 0.8), 0 0 40px var(--selected-color, #339AF0);
        opacity: 0;
        animation: messageAppear 0.5s ease-out 2s forwards, messagePulse 1s ease-in-out 2.5s infinite;
        pointer-events: none;
        text-align: center;
        padding: 20px;
      }

      @keyframes messageAppear {
        from {
          opacity: 0;
          transform: translate(-50%, -50%) scale(0.5);
        }
        to {
          opacity: 1;
          transform: translate(-50%, -50%) scale(1);
        }
      }

      @keyframes messagePulse {
        0%, 100% {
          text-shadow: 0 0 20px rgba(255, 255, 255, 0.8), 0 0 40px var(--selected-color, #339AF0);
        }
        50% {
          text-shadow: 0 0 40px rgba(255, 255, 255, 1), 0 0 80px var(--selected-color, #339AF0), 0 0 120px var(--selected-color, #339AF0);
        }
      }

      .konami-reset-btn {
        position: fixed;
        bottom: 30px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 100000;
        padding: 12px 32px;
        font-family: 'Space Grotesk', sans-serif;
        font-size: 1rem;
        font-weight: 600;
        color: white;
        background: var(--selected-color, #339AF0);
        border: none;
        border-radius: 9999px;
        cursor: pointer;
        opacity: 0;
        animation: messageAppear 0.5s ease-out 3.5s forwards;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
        box-shadow: 0 4px 20px rgba(var(--selected-color-rgb, 51, 154, 240), 0.4);
      }

      .konami-reset-btn:hover {
        transform: translateX(-50%) scale(1.05);
        box-shadow: 0 6px 30px rgba(var(--selected-color-rgb, 51, 154, 240), 0.6);
      }
    `
    document.head.appendChild(style)

    const message = document.createElement('div')
    message.className = 'konami-melt-message'
    message.innerHTML = '🎮 KONAMI CODE ACTIVATED! 🎮<br><span style="font-size: 0.5em; opacity: 0.8;">The screen is melting...</span>'
    document.body.appendChild(message)

    const resetBtn = document.createElement('button')
    resetBtn.className = 'konami-reset-btn'
    resetBtn.textContent = '🔄 Restore Reality'
    resetBtn.onclick = () => {
      window.location.reload()
    }
    document.body.appendChild(resetBtn)

    const allElements = document.querySelectorAll('body > *:not(.konami-melt-message):not(.konami-reset-btn):not(script):not(style)')
    
    allElements.forEach((el, index) => {
      el.style.setProperty('--melt-delay', index)
      el.classList.add('konami-melting')
      
      const children = el.querySelectorAll('*')
      children.forEach((child, childIndex) => {
        child.style.setProperty('--melt-delay', index + childIndex * 0.5)
      })
    })

    setTimeout(() => {
      document.body.classList.add('konami-color-shift')
    }, 500)

  }, [isMelting])

  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.code
      
      setKeySequence(prev => {
        const newSequence = [...prev, key].slice(-KONAMI_CODE.length)
        
        if (newSequence.length === KONAMI_CODE.length &&
            newSequence.every((k, i) => k === KONAMI_CODE[i])) {
          triggerMelt()
          return []
        }
        
        return newSequence
      })
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [triggerMelt])

  return null
}

export default KonamiMelt
