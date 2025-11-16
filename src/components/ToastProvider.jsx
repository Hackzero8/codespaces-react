import React, { createContext, useContext, useState, useCallback } from 'react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const add = useCallback((message, opts = {}) => {
    const id = Math.random().toString(36).slice(2)
    const t = { id, message, ...opts }
    setToasts((s) => [...s, t])
    const ttl = opts.duration ?? 4000
    setTimeout(() => {
      setToasts((s) => s.filter((x) => x.id !== id))
    }, ttl)
  }, [])

  const value = { add }

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-50 space-y-2">
        {toasts.map((t) => (
          <div key={t.id} className="bg-black/90 text-white px-4 py-2 rounded-md shadow-lg text-sm">
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx.add
}
