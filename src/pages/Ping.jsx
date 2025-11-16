import React from 'react'

export default function Ping() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="bg-white dark:bg-twitter-900 rounded-lg shadow-lg p-6 text-center">
        <h1 className="text-2xl font-bold">Pong ✅</h1>
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">Router y layout están funcionando correctamente.</p>
      </div>
    </div>
  )
}
