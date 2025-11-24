import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login({ onLogin }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);

    try {
      const response = await fetch('https://aura-1jkg.onrender.com/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        setError('Invalid email or password');
        return;
      }

      const user = await response.json();
      if (onLogin) {
        onLogin(user);
      }
      navigate('/');
    } catch (err) {
      console.error('Login error', err);
      setError('Unable to login. Please try again.');
    }
  };
  return (
    <div className="aura-auth-screen">
      <div className="aura-auth-card login-card">
        <div className="login-header">
          <p className="aura-pill">Aura Gold Access</p>
          <h1>Sign in to your workspace</h1>
          <p className="aura-subtext">
            Securely manage invoices, reconciliation and revenue health from a single pane.
          </p>
        </div>
        <form className="login-form" onSubmit={handleSubmit}>
          <label>
            Work email
            <input
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label>
            Password
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          <button type="submit" className="login-primary">Continue</button>
        </form>
        {error && <p className="manual-status manual-status--error">{error}</p>}
        <p className="login-footnote">
          Protected by device fingerprinting, anomaly detection and just‑in‑time access.
        </p>
      </div>
    </div>
  );
}

export default Login;
