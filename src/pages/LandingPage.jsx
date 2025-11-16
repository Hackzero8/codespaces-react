import React from 'react'
import { Link } from 'react-router-dom'

export default function LandingPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-gradient-to-br from-twitter-50 to-white dark:from-twitter-900 dark:to-black py-12">
      <div className="max-w-4xl w-full p-8 bg-white dark:bg-twitter-900 rounded-2xl shadow-xl">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1">
            <h1 className="text-4xl font-extrabold mb-4">Conecta. Comparte. Descubre.</h1>
            <p className="text-gray-600 dark:text-gray-300 mb-6">Una red social minimalista para compartir ideas, seguir a personas y recibir notificaciones relevantes. Regístrate, publica y sigue el flujo de tu comunidad.</p>
            <div className="flex items-center gap-3">
              <Link to="/feed" className="btn-primary">Explorar el feed</Link>
              <Link to="/signup" className="btn-secondary">Crear cuenta</Link>
            </div>
          </div>
          <div className="w-80 hidden md:block">
            <img src="/LandingIllustration.png" alt="landing" className="rounded-xl shadow-lg" />
          </div>
        </div>
      </div>
    </div>
  )
}
