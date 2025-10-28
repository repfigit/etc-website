'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        router.push('/admin/dashboard');
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Network error. Please try again.');
    }
  };

  return (
    <div className="container admin-login-container">
      <div className="admin-login-form">
        <h1 className="admin-login-title">Admin Login</h1>
        
        <form onSubmit={handleLogin}>
          <div className="admin-login-field">
            <label htmlFor="password" className="admin-login-label">
              Password:
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="admin-login-input"
              required
            />
          </div>
          
          {error && (
            <div className="admin-login-error">{error}</div>
          )}
          
          <button type="submit" className="admin-login-button">
            Login
          </button>
        </form>
        
        <p style={{ textAlign: 'center', marginTop: '1em' }}>
          <Link href="/">← Back to Home</Link>
        </p>
      </div>
    </div>
  );
}

