import React, { useEffect, useRef } from 'react'

const CustomCursor = () => {
  const cursorRef  = useRef(null)
  const dotRef     = useRef(null)
  const isVisible  = useRef(false)

  useEffect(() => {
    // Raw mouse position — no React state, no re-renders
    const mouse = { x: -200, y: -200 }
    // Current lerped position
    const pos   = { x: -200, y: -200 }
    let rafId

    const onMove = (e) => {
      mouse.x = e.clientX
      mouse.y = e.clientY

      if (!isVisible.current) {
        // Snap to cursor on first move to avoid the "fly-in" from 0,0
        pos.x = mouse.x
        pos.y = mouse.y
        isVisible.current = true
        if (cursorRef.current) cursorRef.current.style.opacity = '1'
      }

      // Detect pointer
      const tag = e.target.tagName
      const isPointer =
        tag === 'A' ||
        tag === 'BUTTON' ||
        e.target.closest('a, button') !== null

      if (dotRef.current) {
        dotRef.current.style.transform = isPointer ? 'scale(2)' : 'scale(1)'
        dotRef.current.style.background = isPointer ? 'var(--selected-color, #339AF0)' : 'white'
      }
    }

    const onLeave = () => {
      if (cursorRef.current) cursorRef.current.style.opacity = '0'
    }
    const onEnter = () => {
      if (cursorRef.current && isVisible.current) cursorRef.current.style.opacity = '1'
    }

    // RAF loop — lerp factor 0.35 = snappy but still smooth
    const loop = () => {
      const factor = 0.35
      pos.x += (mouse.x - pos.x) * factor
      pos.y += (mouse.y - pos.y) * factor

      if (cursorRef.current) {
        // translate3d is GPU-composited — no layout reflow
        cursorRef.current.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0) translate(-50%, -50%)`
      }

      rafId = requestAnimationFrame(loop)
    }
    rafId = requestAnimationFrame(loop)

    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseleave', onLeave)
    document.addEventListener('mouseenter', onEnter)

    return () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseleave', onLeave)
      document.removeEventListener('mouseenter', onEnter)
      cancelAnimationFrame(rafId)
    }
  }, []) // ← empty: set up once, never re-created

  return (
    <div
      ref={cursorRef}
      className='fixed pointer-events-none z-[9999] mix-blend-difference'
      style={{
        top: 0,
        left: 0,
        opacity: 0,
        willChange: 'transform',
        transition: 'opacity 0.2s',
      }}
    >
      <div className='relative'>
        {/* Crosshair arms */}
        <div className='absolute bg-white/70' style={{ width: '18px', height: '1px', left: '-9px', top: 0 }} />
        <div className='absolute bg-white/70' style={{ width: '1px', height: '18px', left: 0, top: '-9px' }} />
        {/* Centre dot */}
        <div
          ref={dotRef}
          className='absolute rounded-full bg-white'
          style={{
            width: '5px',
            height: '5px',
            left: '-2.5px',
            top: '-2.5px',
            transition: 'transform 0.2s ease, background 0.2s ease',
          }}
        />
      </div>
    </div>
  )
}

export default CustomCursor
