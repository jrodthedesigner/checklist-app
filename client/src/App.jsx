import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Dashboard from './pages/Dashboard'
import ChecklistDetail from './pages/ChecklistDetail'

export default function App() {
  return (
    <>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            fontFamily: "'DM Sans', sans-serif",
            background: '#3f3a35',
            color: '#faf9f7',
            borderRadius: '12px',
          },
        }}
      />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/checklist/:id" element={<ChecklistDetail />} />
      </Routes>
    </>
  )
}
