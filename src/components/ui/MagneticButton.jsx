import { useRef, useState } from 'react'

const isTouch = () => 'ontouchstart' in window || navigator.maxTouchPoints > 0

export default function MagneticButton({ children, className = '', onClick, href, strength = 0.35, target, rel, onMouseEnter, onMouseLeave: onMouseLeaveProp }) {
  const ref = useRef(null)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const touch = isTouch()

  const onMouseMove = (e) => {
    if (touch) return
    const rect = ref.current.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    setOffset({
      x: (e.clientX - cx) * strength,
      y: (e.clientY - cy) * strength,
    })
  }

  const onMouseLeave = () => {
    setOffset({ x: 0, y: 0 })
    onMouseLeaveProp?.()
  }

  const style = {
    transform: `translate(${offset.x}px, ${offset.y}px)`,
    transition: offset.x === 0 && offset.y === 0
      ? 'transform 0.5s cubic-bezier(0.19, 1, 0.22, 1)'
      : 'transform 0.1s linear',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  }

  const Tag = href ? 'a' : 'button'

  return (
    <Tag
      ref={ref}
      href={href}
      target={target}
      rel={rel}
      onClick={onClick}
      className={className}
      style={style}
      onMouseMove={onMouseMove}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      data-cursor
    >
      {children}
    </Tag>
  )
}
