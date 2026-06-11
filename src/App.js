import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import LoginPage from './pages/LoginPage';
import AdminLayout from './components/AdminLayout';
import MemberLayout from './components/MemberLayout';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import MembersPage from './pages/admin/Members';
import LoansPage from './pages/admin/Loans';
import InterestPage from './pages/admin/Interest';
import AnalyticsPage from './pages/admin/Analytics';
import ReportsPage from './pages/admin/Reports';
import ActivityPage from './pages/admin/Activity';
import AdminCalculator from './pages/admin/Calculator';
import InvestmentPage from './pages/admin/Investment';
import SamruthyPage from './pages/admin/Samruthy';
import FinesPage from './pages/admin/Fines';
// Member Pages
import MemberDashboard from './pages/member/Dashboard';
import MyLoan from './pages/member/MyLoan';
import MyInvestment from './pages/member/MyInvestment';
import MyPayments from './pages/member/MyPayments';
import MyProfile from './pages/member/MyProfile';
import MemberCalculator from './pages/member/Calculator';
import MySamruthy from './pages/member/MySamruthy';
import MyFines from './pages/member/MyFines';

const ProtectedAdmin = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loader"><i className="ti ti-loader-2 spin" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/member/dashboard" replace />;
  return children;
};

const ProtectedMember = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loader"><i className="ti ti-loader-2 spin" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'member') return <Navigate to="/admin/dashboard" replace />;
  return children;
};

const RootRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loader"><i className="ti ti-loader-2 spin" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  return user.role === 'admin'
    ? <Navigate to="/admin/dashboard" replace />
    : <Navigate to="/member/dashboard" replace />;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<LoginPage />} />

      {/* Admin Routes */}
      <Route path="/admin" element={<ProtectedAdmin><AdminLayout /></ProtectedAdmin>}>
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="members" element={<MembersPage />} />
        <Route path="loans" element={<LoansPage />} />
        <Route path="interest" element={<InterestPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="activity" element={<ActivityPage />} />
        <Route path="calculator" element={<AdminCalculator />} />
        <Route path="investment" element={<InvestmentPage />} />
        <Route path="samruthy" element={<SamruthyPage />} />
        <Route path="fines" element={<FinesPage />} />
      </Route>

      {/* Member Routes */}
      <Route path="/member" element={<ProtectedMember><MemberLayout /></ProtectedMember>}>
        <Route path="dashboard" element={<MemberDashboard />} />
        <Route path="loan" element={<MyLoan />} />
        <Route path="investment" element={<MyInvestment />} />
        <Route path="payments" element={<MyPayments />} />
        <Route path="profile" element={<MyProfile />} />
        <Route path="calculator" element={<MemberCalculator />} />
        <Route path="samruthy" element={<MySamruthy />} />
        <Route path="fines" element={<MyFines />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            style: { background: '#1a2236', color: '#e8edf8', border: '1px solid #2a3550', fontSize: '13px' },
            success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  );
}
