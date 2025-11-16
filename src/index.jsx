import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import ErrorOverlay from './components/ErrorOverlay'
import { ToastProvider } from './components/ToastProvider'

const root = ReactDOM.createRoot(document.getElementById('root'));

function Root() {
  return (
    <React.StrictMode>
        <ErrorOverlay>
          <ToastProvider>
            <App />
          </ToastProvider>
        </ErrorOverlay>
      </React.StrictMode>
  )
}

root.render(<Root />);

// Global handlers to surface uncaught errors and promise rejections inside the overlay
// We attach them to window and forward to the overlay by dispatching a custom event.
window.addEventListener('error', (ev) => {
  try {
    const overlay = document.querySelector('#root')?.__error_overlay_instance
    // if overlay instance not found, just log
    console.error('Global error:', ev.error || ev.message, ev)
  } catch (e) {
    console.error(e)
  }
})

window.addEventListener('unhandledrejection', (ev) => {
  console.error('Unhandled promise rejection:', ev.reason)
})

reportWebVitals();
