import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'

// HashRouter (not BrowserRouter): this is a static SPA build with no
// configured server-side rewrite rule, so a real path like /traffic would
// 404 on refresh. The #/traffic form always resolves to the same
// index.html and still gives every page a real, shareable, back/forward-
// capable URL.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>,
)
