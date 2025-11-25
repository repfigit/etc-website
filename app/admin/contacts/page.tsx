'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Contact {
  _id: string;
  name: string;
  email: string;
  message: string;
  read: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function AdminContacts() {
  const router = useRouter();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState<'all' | 'unread'>('unread');
  const [error, setError] = useState('');

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/verify');
        const data = await response.json();

        if (!data.authenticated) {
          router.push('/admin');
          return;
        }
        fetchContacts();
      } catch (error) {
        console.error('Auth check failed:', error);
        router.push('/admin');
      }
    };

    checkAuth();
  }, [router, filter]);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/contact?limit=100&unread=${filter === 'unread'}`);
      const data = await response.json();
      if (data.success) {
        setContacts(data.data);
        setUnreadCount(data.unreadCount || 0);
      } else {
        setError(data.error || 'Failed to fetch contacts');
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
      setError('Failed to load contact submissions');
    } finally {
      setLoading(false);
    }
  };

  const toggleReadStatus = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/contact/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ read: !currentStatus }),
      });

      const data = await response.json();
      if (data.success) {
        // Update local state
        setContacts(contacts.map(contact => 
          contact._id === id ? { ...contact, read: !currentStatus } : contact
        ));
        // Update unread count
        if (currentStatus) {
          setUnreadCount(unreadCount + 1);
        } else {
          setUnreadCount(Math.max(0, unreadCount - 1));
        }
      } else {
        alert('Failed to update status: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error updating contact:', error);
      alert('Failed to update contact status');
    }
  };

  const deleteContact = async (id: string) => {
    if (!confirm('Are you sure you want to delete this contact submission?')) {
      return;
    }

    try {
      const response = await fetch(`/api/contact/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (data.success) {
        setContacts(contacts.filter(contact => contact._id !== id));
        // Update unread count if it was unread
        const deletedContact = contacts.find(c => c._id === id);
        if (deletedContact && !deletedContact.read) {
          setUnreadCount(Math.max(0, unreadCount - 1));
        }
      } else {
        alert('Failed to delete: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error deleting contact:', error);
      alert('Failed to delete contact submission');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="admin-dashboard-container">
      <div className="admin-dashboard-content">
        <div className="admin-dashboard-header">
          <div>
            <h1>Contact Submissions</h1>
            {unreadCount > 0 && (
              <p style={{ color: '#d4783e', marginTop: '0.5em' }}>
                {unreadCount} unread submission{unreadCount !== 1 ? 's' : ''}
              </p>
            )}
          </div>
          <div style={{ display: 'flex', gap: '1em', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '0.5em' }}>
              <button
                onClick={() => setFilter('unread')}
                className={`admin-form-button ${filter === 'unread' ? '' : 'secondary'}`}
                style={{ padding: '0.5em 1em' }}
              >
                Unread ({unreadCount})
              </button>
              <button
                onClick={() => setFilter('all')}
                className={`admin-form-button ${filter === 'all' ? '' : 'secondary'}`}
                style={{ padding: '0.5em 1em' }}
              >
                All
              </button>
            </div>
            <Link href="/admin/dashboard" className="admin-form-button secondary">
              ← Dashboard
            </Link>
          </div>
        </div>

        {error && (
          <div className="contact-error-message" style={{ marginBottom: '1em' }}>
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '2em' }}>
            <p>Loading contact submissions...</p>
          </div>
        ) : contacts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2em' }}>
            <p>No contact submissions found.</p>
          </div>
        ) : (
          <div className="contacts-list">
            {contacts.map((contact) => (
              <div
                key={contact._id}
                className={`contact-admin-card ${!contact.read ? 'unread' : ''}`}
              >
                <div className="contact-admin-header">
                  <div className="contact-admin-info">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5em' }}>
                      <strong style={{ fontSize: '1.1em' }}>{contact.name}</strong>
                      {!contact.read && (
                        <span className="unread-badge">New</span>
                      )}
                    </div>
                    <div style={{ color: '#5db8b0', marginTop: '0.25em' }}>
                      {contact.email}
                    </div>
                    <div style={{ color: '#888', fontSize: '0.9em', marginTop: '0.25em' }}>
                      {formatDate(contact.createdAt)}
                    </div>
                  </div>
                  <div className="contact-admin-actions">
                    <button
                      onClick={() => toggleReadStatus(contact._id, contact.read)}
                      className="contact-action-button"
                      title={contact.read ? 'Mark as unread' : 'Mark as read'}
                    >
                      {contact.read ? '📬' : '📭'}
                    </button>
                    <button
                      onClick={() => deleteContact(contact._id)}
                      className="contact-action-button delete"
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                <div className="contact-admin-message">
                  <p>{contact.message}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

