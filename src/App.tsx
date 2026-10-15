import { GuidePage, GuidesIndex } from './pages/Guides'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Home } from './pages/Home'
import { Pantry } from './pages/Pantry'
import { Privacy } from './pages/Privacy'
import { Reflect } from './pages/Reflect'
import { Swaps } from './pages/Swaps'

export default function App() {
  return (
    <BrowserRouter basename="/">
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="pantry" element={<Pantry />} />
          <Route path="reflect" element={<Reflect />} />
          <Route path="swaps" element={<Swaps />} />
          <Route path="guides" element={<GuidesIndex />} />
          <Route path="guides/:slug" element={<GuidePage />} />
          <Route path="privacy" element={<Privacy />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
