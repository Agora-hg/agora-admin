import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './auth/AuthContext'
import { Layout } from './components/Layout'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AiMatchPage } from './pages/AiMatchPage'
import { AiSessionReadPage } from './pages/AiSessionReadPage'
import { AiSessionsPage } from './pages/AiSessionsPage'
import { DashboardPage } from './pages/DashboardPage'
import { LoginPage } from './pages/LoginPage'
import { OfferFormPage } from './pages/OfferFormPage'
import { OffersPage } from './pages/OffersPage'
import { SupplierFormPage } from './pages/SupplierFormPage'
import { BroadcastPage } from './pages/BroadcastPage'
import { RfqDetailPage } from './pages/RfqDetailPage'
import { RfqNewPage } from './pages/RfqNewPage'
import { RfqsPage } from './pages/RfqsPage'
import { SuppliersPage } from './pages/SuppliersPage'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<DashboardPage />} />
            <Route path="/offers" element={<OffersPage />} />
            <Route path="/offers/new" element={<OfferFormPage />} />
            <Route path="/offers/:id" element={<OfferFormPage />} />
            <Route path="/suppliers" element={<SuppliersPage />} />
            <Route path="/suppliers/new" element={<SupplierFormPage />} />
            <Route path="/suppliers/:id" element={<SupplierFormPage />} />
            <Route path="/rfqs" element={<RfqsPage />} />
            <Route path="/rfqs/new" element={<RfqNewPage />} />
            <Route path="/rfqs/:id" element={<RfqDetailPage />} />
            <Route path="/broadcast" element={<BroadcastPage />} />
            <Route path="/ai" element={<AiMatchPage />} />
            <Route path="/ai/sessions" element={<AiSessionsPage />} />
            <Route path="/ai/sessions/:id" element={<AiSessionReadPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
