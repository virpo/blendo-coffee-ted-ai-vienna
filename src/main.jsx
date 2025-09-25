import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/global.scss'
import App from './App.jsx'
import { initializeAccessibility } from './utils/accessibility'
import { initializePerformance } from './utils/performance'

// Initialize features
initializeAccessibility()
initializePerformance()

// Add main content landmark
const rootElement = document.getElementById('root')
rootElement.setAttribute('id', 'main-content')
rootElement.setAttribute('role', 'main')

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
