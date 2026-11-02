import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { probeStorage, startAutosave } from './storage/db'
import { initLang } from './strings/lang'
import './ui/app.css'

initLang()
startAutosave()
void probeStorage()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
