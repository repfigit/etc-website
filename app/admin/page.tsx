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
    <div className="container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ maxWidth: '400px', width: '100%', padding: '2em', border: '2px solid #00f7ff', background: '#121212' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '1em' }}>Admin Login</h1>
        
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '1em' }}>
            <label htmlFor="password" style={{ display: 'block', marginBottom: '0.5em' }}>
              Password:
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5em',
                fontSize: '1em',
                background: '#000',
                color: '#00ffcc',
                border: '2px solid #00ffcc',
                fontFamily: 'inherit'
              }}
              required
            />
          </div>
          
          {error && (
            <p style={{ color: '#ff0000', marginBottom: '1em' }}>{error}</p>
          )}
          
          <button
            type="submit"
            style={{
              width: '100%',
              padding: '0.75em',
              fontSize: '1em',
              background: '#00ffcc',
              color: '#000',
              border: '2px solid #00f7ff',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontFamily: 'inherit'
            }}
          >
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

