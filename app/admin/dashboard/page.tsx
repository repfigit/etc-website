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
    <div className="container admin-dashboard-container">
      <div className="admin-dashboard-content">
        <div className="admin-dashboard-header">
          <h1>Admin Dashboard</h1>
          <button
            onClick={handleLogout}
            className="admin-logout-button"
          >
            Logout
          </button>
        </div>

        <div className="admin-dashboard-grid">
          <Link
            href="/admin/events"
            className="admin-dashboard-card"
          >
            <h2 className="admin-dashboard-card-title">📅 Manage Events</h2>
            <p className="admin-dashboard-card-description">Add, edit, or delete caucus events</p>
          </Link>

          <Link
            href="/admin/tech-list"
            className="admin-dashboard-card"
          >
            <h2 className="admin-dashboard-card-title">🔬 Manage Tech List</h2>
            <p className="admin-dashboard-card-description">Add, edit, or delete technology items</p>
          </Link>

          <Link
            href="/admin/resources"
            className="admin-dashboard-card"
          >
            <h2 className="admin-dashboard-card-title">📚 Manage Resources</h2>
            <p className="admin-dashboard-card-description">Add, edit, or delete resource links</p>
          </Link>

          <Link
            href="/admin/contacts"
            className="admin-dashboard-card"
          >
            <h2 className="admin-dashboard-card-title">✉️ Contact Submissions</h2>
            <p className="admin-dashboard-card-description">View and manage contact form submissions</p>
          </Link>
        </div>

        <p style={{ marginTop: '2em', textAlign: 'center' }}>
          <Link href="/">← Back to Website</Link>
        </p>
      </div>
    </div>
  );
}

