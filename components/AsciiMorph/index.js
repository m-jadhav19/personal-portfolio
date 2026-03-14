// components/AsciiMorph.jsx
import { useEffect, useRef, useState } from 'react'

const shapes = [
  { name: "creative", art: `
      .--------.      
    /          \\    
   |   CODE     |   
   |   ART      |    
    \\          /    
      '--------'      
  ` },
  { name: "product", art: `
     __________       
    |  ______  |      
    | |      | |      
    | |______| |      
    |__________|      
     /________\\       
  ` },
  { name: "impact", art: `
          /\\          
         /  \\         
        |    |        
        |    |        
       /|    |\\       
      /_|____|_\\      
  ` },
  { name: "growth", art: `
         _  _         
       (_\\/_ )        
      (_(_@_)_)       
       (_/\\_ )        
         |  |         
  ` },
  { name: "logic", art: `
     .--------.       
    /  /    \\  \\      
   |  | (  ) |  |     
    \\  \\____/  /      
     '--------'       
  ` },
  { name: "vision", art: `
      .--------.      
     /   ____   \\     
    |   (____)   |    
     \\  \\____/  /     
      '--------'      
  ` },
]

const GLITCH = '▓▒░█▄▀■□'

function interpolate(a, b, t) {
  const maxLen = Math.max(a.length, b.length)
  const pa = a.padEnd(maxLen, ' ')
  const pb = b.padEnd(maxLen, ' ')
  return pb.split('').map((cb, i) => {
    const ca = pa[i] || ' '
    if (ca === cb) return ca
    const r = Math.random()
    if (t < 0.5) return r < t * 2.5 ? GLITCH[Math.floor(Math.random() * GLITCH.length)] : ca
    return r < (t - 0.5) * 2.5 ? cb : GLITCH[Math.floor(Math.random() * GLITCH.length)]
  }).join('')
}

export default function AsciiMorph() {
  const [display, setDisplay] = useState(shapes[0].art)
  const [label, setLabel]     = useState(shapes[0].name)
  const [active, setActive]   = useState(0)
  const currentIdx = useRef(0)
  const morphing   = useRef(false)

  function goTo(idx) {
    if (morphing.current || idx === currentIdx.current) return
    morphing.current = true
    setActive(idx)
    setLabel(shapes[idx].name)

    const from = shapes[currentIdx.current].art
    const to   = shapes[idx].art
    let step   = 0
    const STEPS = 22

    const timer = setInterval(() => {
      step++
      const t = step / STEPS
      setDisplay(interpolate(from, to, t))
      if (step >= STEPS) {
        clearInterval(timer)
        setDisplay(to)
        currentIdx.current = idx
        morphing.current = false
      }
    }, 38)
  }

  useEffect(() => {
    let i = 1
    const id = setInterval(() => {
      goTo(i)
      i = (i + 1) % shapes.length
    }, 3200)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="hidden laptop:flex flex-col items-center justify-center">
      <pre className="font-geist-mono text-[12px] leading-[1.35] text-black/80 dark:text-white/80 select-none min-h-[260px] flex items-center">
        {display}
      </pre>

      <span className="font-geist-mono text-[10px] tracking-[0.2em] uppercase text-black/30 dark:text-white/30 mt-4">
        {label}
      </span>

      <div className="flex gap-2 mt-4">
        {shapes.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`w-1.5 h-1.5 rounded-full border transition-all duration-300 ${
              active === i
                ? 'bg-black dark:bg-white border-black dark:border-white'
                : 'border-black/20 dark:border-white/20'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
