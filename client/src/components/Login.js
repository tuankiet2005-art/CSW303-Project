import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/auth';
import './Login.css';

function Login({ setUser }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await login(username, password);
      setUser(data.user);
      navigate(data.user.role === 'manager' ? '/manager' : '/employee');
    } catch (err) {
      setError(err.response?.data?.error || 'Login Fail');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Log in</h1>
        <p className="subtitle">Leave Management System</p>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="Enter username"
            />
          </div>
          
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter password"
            />
          </div>
          
          <button type="submit" disabled={loading} className="login-button">
            {loading ? 'login...' : 'Log in'}
          </button>
        </form>
        
        <div className="login-info">
          <p>Management System</p>
        </div>
      </div>
    </div>
  );
}

export default Login;

