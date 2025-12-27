import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CasesList from './pages/CasesList';
import NewCase from './pages/NewCase';
import CaseResult from './pages/CaseResult';
import EditCase from './pages/EditCase';
import AnalysisDetail from './pages/AnalysisDetail';
import ProfileSettings from './pages/ProfileSettings';
import LandingPage from './pages/LandingPage';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import AuthRedirect from './components/AuthRedirect';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          {/* Public Routes - Redirect to dashboard if logged in */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<AuthRedirect><Login /></AuthRedirect>} />
          <Route path="/register" element={<AuthRedirect><Register /></AuthRedirect>} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Layout />}>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="cases" element={<CasesList />} />
              <Route path="cases/new" element={<NewCase />} />
              <Route path="cases/:id" element={<CaseResult />} />
              <Route path="cases/:id/edit" element={<EditCase />} />
              <Route path="cases/:id/analysis/:analysisId" element={<AnalysisDetail />} />

              {/* Settings */}
              <Route path="settings" element={<ProfileSettings />} />

              {/* Analysis list placeholder */}
              <Route path="analysis" element={<div className="text-center mt-20 text-gray-500">بخش تحلیل‌ها به زودی اضافه خواهد شد.</div>} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
