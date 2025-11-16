import React from 'react'
import FocusLock from 'react-focus-lock'

export default class ErrorOverlay extends React.Component {
  constructor(props) {
    super(props)
    this.state = { error: null, info: null, visible: false }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    this.setState({ error, info, visible: true })
    // also log to console to keep normal devtools flow
    console.error('Captured by ErrorOverlay:', error, info)
    // block background scrolling while overlay visible
    try { document.body.style.overflow = 'hidden' } catch (e) {}
  }

  showGlobalError = (errorMessage, stack) => {
    const err = new Error(errorMessage)
    err.stack = stack || err.stack
    this.setState({ error: err, info: null, visible: true })
  }

  clear = () => this.setState({ error: null, info: null, visible: false })

  reload = () => window.location.reload()

  componentWillUnmount() {
    try { document.body.style.overflow = '' } catch (e) {}
  }

  copy = async () => {
    const payload = {
      message: this.state.error?.message || '',
      stack: this.state.error?.stack || '',
      info: this.state.info || null,
    }
    try {
      await navigator.clipboard.writeText(JSON.stringify(payload, null, 2))
      alert('Error copiado al portapapeles')
    } catch (e) {
      alert('No se pudo copiar: ' + e.message)
    }
  }

  render() {
    const { error, info, visible } = this.state
    if (!visible || !error) return this.props.children || null

    return (
      <div>
        {this.props.children}
        <div className="fixed inset-0 z-[9999] flex items-start justify-center px-4 py-6" role="dialog" aria-modal="true">
          <FocusLock returnFocus={true} autoFocus={true}>
          <div className="max-w-3xl w-full bg-white dark:bg-twitter-900 border border-red-600 rounded-lg shadow-2xl overflow-auto">
            <div className="p-4 border-b border-red-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center text-white font-bold">!</div>
                <div>
                  <div className="font-bold text-lg text-red-700">Error capturado</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">La aplicación encontró un error en tiempo de ejecución.</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={this.copy} className="px-3 py-1 rounded-md bg-gray-100 dark:bg-twitter-800">Copiar</button>
                <button onClick={this.reload} className="px-3 py-1 rounded-md bg-blue-600 text-white">Recargar</button>
                <button onClick={this.clear} className="px-3 py-1 rounded-md bg-gray-200">Cerrar</button>
              </div>
            </div>

            <div className="p-4">
              <div className="mb-3 font-mono text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-words">
                <strong>Mensaje:</strong> {error.message}
              </div>

              <details className="bg-gray-50 dark:bg-twitter-800 p-3 rounded-md">
                <summary className="cursor-pointer font-semibold">Stack / Info (click)</summary>
                <pre className="max-h-80 overflow-auto text-xs p-2 mt-2 bg-black/5 dark:bg-white/5 rounded">{error.stack}</pre>
                {info && <pre className="max-h-80 overflow-auto text-xs p-2 mt-2 bg-black/5 dark:bg-white/5 rounded">{JSON.stringify(info, null, 2)}</pre>}
              </details>
            </div>
          </div>
          </FocusLock>
        </div>
      </div>
    )
  }
}
