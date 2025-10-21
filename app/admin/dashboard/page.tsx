'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminDashboard() {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/verify');
        const data = await response.json();
        
        if (!data.authenticated) {
          router.push('/admin');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        router.push('/admin');
      }
    };
    
    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/login', {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
    router.push('/admin');
  };

  return (
    <div className="container" style={{ minHeight: '100vh', paddingTop: '2em' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2em' }}>
          <h1>Admin Dashboard</h1>
          <button
            onClick={handleLogout}
            style={{
              padding: '0.5em 1em',
              background: '#ff6700',
              color: '#000',
              border: '2px solid #00f7ff',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontFamily: 'inherit'
            }}
          >
            Logout
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2em' }}>
          <Link
            href="/admin/events"
            style={{
              display: 'block',
              padding: '2em',
              border: '2px solid #00ffcc',
              background: '#121212',
              textDecoration: 'none',
              transition: 'all 0.3s'
            }}
          >
            <h2 style={{ marginTop: 0 }}>📅 Manage Events</h2>
            <p>Add, edit, or delete caucus events</p>
          </Link>

          <Link
            href="/admin/tech-list"
            style={{
              display: 'block',
              padding: '2em',
              border: '2px solid #00ffcc',
              background: '#121212',
              textDecoration: 'none',
              transition: 'all 0.3s'
            }}
          >
            <h2 style={{ marginTop: 0 }}>🔬 Manage Tech List</h2>
            <p>Add, edit, or delete technology items</p>
          </Link>

          <Link
            href="/admin/resources"
            style={{
              display: 'block',
              padding: '2em',
              border: '2px solid #00ffcc',
              background: '#121212',
              textDecoration: 'none',
              transition: 'all 0.3s'
            }}
          >
            <h2 style={{ marginTop: 0 }}>📚 Manage Resources</h2>
            <p>Add, edit, or delete resource links</p>
          </Link>
        </div>

        <p style={{ marginTop: '2em', textAlign: 'center' }}>
          <Link href="/">← Back to Website</Link>
        </p>
      </div>
    </div>
  );
}

