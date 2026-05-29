import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AppShell from './components/shared/AppShell'
import GaragePage from './pages/GaragePage'
import CarPage from './pages/CarPage'
import TunePage from './pages/TunePage'
import ComparePage from './pages/ComparePage'

export default function App() {
  return (
    <BrowserRouter basename="/Forza-Tuning-Dashboard">
      <AppShell>
        <Routes>
          <Route path="/" element={<GaragePage />} />
          <Route path="/car/:carId" element={<CarPage />} />
          <Route path="/car/:carId/tune/:tuneId" element={<TunePage />} />
          <Route path="/car/:carId/compare" element={<ComparePage />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  )
}

