import { Route, Routes } from 'react-router-dom'
import ErrorBoundary from './components/ErrorBoundary'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import NotFoundPage from './pages/NotFoundPage'
import SessionPage from './pages/SessionPage'

export default function App() {
  return (
    // Shows a message instead of a white page if a page throws while rendering
    <ErrorBoundary>
      <Routes>
        {/* All pages share the same header via <Layout> and its <Outlet> */}
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="sessions/:sessionId" element={<SessionPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </ErrorBoundary>
  )
}
