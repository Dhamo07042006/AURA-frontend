import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Signup({ onSignup }) {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const response = await fetch('https://aura-1jkg.onrender.com/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: username, email, password }),
      });

      if (!response.ok) {
        setError('Unable to create account');
        return;
      }

      // Account created successfully; send user to login screen
      await response.json();
      navigate('/login');
    } catch (err) {
      console.error('Signup error', err);
      setError('Unable to create account. Please try again.');
    }
  };
  return (
    <div className="aura-auth-screen">
      <div className="aura-auth-card signup-card">
        <div className="signup-header">
          <p className="aura-pill">Create workspace</p>
          <h1>Spin up your Aura Gold console</h1>
          <p className="aura-subtext">
            Connect invoicing flows, automate reconciliation and unlock live revenue visibility.
          </p>
        </div>
        <form className="signup-form" onSubmit={handleSubmit}>
          <label>
            Username
            <input
              type="text"
              placeholder="auragold-user"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </label>
          <label>
            Email
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
          <label>
            Confirm password
            <input
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </label>
          <button type="submit" className="signup-primary">Create workspace</button>
        </form>
        {error && <p className="signup-footnote">{error}</p>}
        <p className="signup-footnote">
          By continuing you agree to the Aura Gold Terms and Data Processing Addendum.
        </p>
      </div>
    </div>
  );
}

export default Signup;
