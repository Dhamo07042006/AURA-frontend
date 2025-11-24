import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import './index.css';
import './App.css';
import './styles/aura.css';
import './styles/login.css';
import './styles/signup.css';
import './styles/home.css';
import './styles/upload.css';
import './styles/manual.css';
import './styles/revenue.css';

import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from './pages/Home';
import UploadInvoice from './pages/UploadInvoice';
import ManualInvoiceEntry from './pages/ManualInvoiceEntry';
import RevenueDashboard from './pages/RevenueDashboard';
import Invoices from './pages/Invoices';

function App() {
  const [user, setUser] = useState(null);

  const handleLogin = (userData) => {
    setUser(userData || { id: 1, username: 'auragold-user' });
  };

  const handleSignup = (userData) => {
    setUser(userData || { id: 1, username: 'auragold-user' });
  };

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <BrowserRouter>
      <div className="aura-root">
        <header className="aura-header">
          <div className="aura-logo">Aura<span>Gold</span></div>
          <nav className="aura-nav">
            {user && (
              <>
                <Link to="/">Home</Link>
                <Link to="/upload">Upload Invoice</Link>
                <Link to="/manual">Manual Entry</Link>
                <Link to="/invoices">Invoices</Link>
                <Link to="/revenue">Revenue</Link>
                <span className="aura-user-name">
                  {user.name || user.username || user.email || 'User'}
                </span>
              </>
            )}
            {!user && <Link to="/login">Login</Link>}
            {!user && <Link to="/signup">Signup</Link>}
            {user && (
              <button type="button" className="aura-gold-button" onClick={handleLogout}>
                Logout
              </button>
            )}
          </nav>
        </header>
        <main className="aura-main">
          <Routes>
            <Route
              path="/"
              element={user ? <Home user={user} /> : <Navigate to="/login" replace />}
            />
            <Route
              path="/upload"
              element={user ? <UploadInvoice user={user} /> : <Navigate to="/login" replace />}
            />
            <Route
              path="/manual"
              element={user ? <ManualInvoiceEntry user={user} /> : <Navigate to="/login" replace />}
            />
            <Route
              path="/invoices"
              element={user ? <Invoices user={user} /> : <Navigate to="/login" replace />}
            />
            <Route
              path="/revenue"
              element={user ? <RevenueDashboard user={user} /> : <Navigate to="/login" replace />}
            />
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            <Route path="/signup" element={<Signup onSignup={handleSignup} />} />
            <Route path="*" element={<Navigate to={user ? '/' : '/login'} replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
