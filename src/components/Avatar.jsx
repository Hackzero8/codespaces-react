import React from 'react'

export default function Avatar({ src, alt, size = 48 }) {
  const s = typeof size === 'number' ? `${size}px` : size
  return (
    <div className="flex-shrink-0">
      {src ? (
        <img src={src} alt={alt} style={{ width: s, height: s }} className="rounded-full object-cover shadow-sm" />
      ) : (
        <div className="rounded-full bg-gradient-to-br from-[#1DA1F2] to-[#4C9BF5] text-white flex items-center justify-center" style={{ width: s, height: s }}>
          {alt?.charAt(0)?.toUpperCase() || 'U'}
        </div>
      )}
    </div>
  )
}
