import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/globals.css'
import App from './App.jsx'
import GlobalToast from './components/common/GlobalToast.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
    <GlobalToast />
  </StrictMode>,
)
