import React from 'react'

export default function Footer() {
  return (
    <footer className="w-full border-t border-gray-200 dark:border-twitter-800 bg-transparent py-6 mt-8">
      <div className="container-center text-sm text-[rgb(var(--muted))] flex flex-col md:flex-row items-center justify-between gap-2">
        <div>© {new Date().getFullYear()} 𝕏 Clone. Todos los derechos reservados.</div>
        <div className="flex gap-4">
          <a className="hover:underline" href="#">Privacidad</a>
          <a className="hover:underline" href="#">Términos</a>
          <a className="hover:underline" href="#">Contacto</a>
        </div>
      </div>
    </footer>
  )
}
