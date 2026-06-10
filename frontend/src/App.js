import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

import Login       from './pages/Login';
import Register    from './pages/Register';
import Dashboard   from './pages/Dashboard';
import ProblemPage from './pages/ProblemPage';
import Problems    from './pages/Problems';
import Review      from './pages/Review';
import Navbar      from './components/Navbar';
import SketchCanvas from './components/Sketch/SketchCanvas';

// Protect routes
function PrivateRoute({ children }) {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" />
        <Navbar />

        <Routes>

          {/* Public */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Private */}
          <Route path="/" element={
            <PrivateRoute><Dashboard /></PrivateRoute>
          }/>

          {/* ✅ ADD THESE ROUTES */}
          <Route path="/dashboard" element={
            <PrivateRoute><Dashboard /></PrivateRoute>
          }/>

          <Route path="/problems" element={
            <PrivateRoute><Problems /></PrivateRoute>
          }/>

          <Route path="/review" element={
            <PrivateRoute><Review /></PrivateRoute>
          }/>

          <Route path="/sketch" element={
            <PrivateRoute>
              <div style={{ padding: '2rem', display: 'flex', justifyContent: 'center', background: '#0f0f0f', minHeight: 'calc(100vh - 56px)' }}>
                <SketchCanvas />
              </div>
            </PrivateRoute>
          }/>

          {/* ✅ IMPORTANT (Problem Page) */}
          <Route path="/problem/:contestId/:index" element={
            <PrivateRoute><ProblemPage /></PrivateRoute>
          }/>

          <Route path="/problem/:id" element={
            <PrivateRoute><ProblemPage /></PrivateRoute>
          }/>

          {/* fallback */}
          <Route path="*" element={<div style={{color:"red"}}>Page Not Found</div>} />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}