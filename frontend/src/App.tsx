import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './Login';
import UserDashboard from './UserDashboard';
import AdminDashboard from './AdminDashboard';
import BookingPage from './BookingPage';

// Protected Route Component
const ProtectedRoute = ({ children }: { children: any }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      {/* User Routes */}
      <Route path="/" element={
        <ProtectedRoute><UserDashboard /></ProtectedRoute>
      } />
      
      <Route path="/booking/:id" element={
        <ProtectedRoute><BookingPage /></ProtectedRoute>
      } />

      {/* Admin Route */}
      <Route path="/admin" element={
        <ProtectedRoute><AdminDashboard /></ProtectedRoute>
      } />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}