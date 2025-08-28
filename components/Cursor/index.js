import React, { useEffect, useState } from 'react'

const CustomCursor = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const updatePosition = (e) => {
      setPosition({ x: e.clientX, y: e.clientY })
      setIsVisible(true)
    }

    const handleMouseEnter = () => setIsVisible(true)
    const handleMouseLeave = () => setIsVisible(false)

    document.addEventListener('mousemove', updatePosition)
    document.addEventListener('mouseenter', handleMouseEnter)
    document.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      document.removeEventListener('mousemove', updatePosition)
      document.removeEventListener('mouseenter', handleMouseEnter)
      document.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [])

  if (!isVisible) return null

  return (
    <div
      className="fixed pointer-events-none z-50 mix-blend-difference"
      style={{
        left: position.x,
        top: position.y,
        transform: 'translate(-50%, -50%)'
      }}
    >
      {/* Crosshair cursor */}
      <div className="relative">
        {/* Horizontal line */}
        <div className="absolute w-6 h-0.5 bg-white rounded-full" style={{ left: '-12px', top: '-1px' }} />
        {/* Vertical line */}
        <div className="absolute w-0.5 h-6 bg-white rounded-full" style={{ left: '-1px', top: '-12px' }} />
        {/* Center dot */}
        <div className="absolute w-1 h-1 bg-white rounded-full" style={{ left: '-0.5px', top: '-0.5px' }} />
      </div>
    </div>
  )
}

export default CustomCursor
