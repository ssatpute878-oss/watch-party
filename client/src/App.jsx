import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';

// Temporary placeholder components for routes created in upcoming milestones
const CreatePartyPlaceholder = () => <div style={{ padding: '2rem' }}>Create Party Placeholder</div>;
const JoinPartyPlaceholder = () => <div style={{ padding: '2rem' }}>Join Party Placeholder</div>;
const WatchPartyPlaceholder = () => <div style={{ padding: '2rem' }}>Watch Party Room Placeholder</div>;

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/create-party" element={<CreatePartyPlaceholder />} />
            <Route path="/join-party" element={<JoinPartyPlaceholder />} />
            <Route path="/party/:roomId" element={<WatchPartyPlaceholder />} />
          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
