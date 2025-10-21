'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Modal from '../../components/Modal';

interface Event {
  _id: string;
  date: string;
  time: string;
  presenter?: string;
  presenterUrl?: string;
  topic: string;
  location: string;
  locationUrl?: string;
  isVisible: boolean;
  content?: string;
}

export default function AdminEvents() {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    presenter: '',
    presenterUrl: '',
    topic: '',
    location: '',
    locationUrl: '',
    isVisible: true,
    content: ''
  });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/verify');
        const data = await response.json();
        
        if (!data.authenticated) {
          router.push('/admin');
          return;
        }
        fetchEvents();
      } catch (error) {
        console.error('Auth check failed:', error);
        router.push('/admin');
      }
    };
    
    checkAuth();
  }, [router]);

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events?admin=true');
      const data = await response.json();
      if (data.success) {
        setEvents(data.data);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingId ? `/api/events/${editingId}` : '/api/events';
      const method = editingId ? 'PUT' : 'POST';
      
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        await fetchEvents();
        resetForm();
      } else {
        const errorData = await response.json();
        alert('Failed to save event: ' + (errorData.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error saving event:', error);
      alert('Error saving event');
    }
  };

  const handleEdit = (event: Event) => {
    // Convert the date to local timezone for the form input
    const date = new Date(event.date);
    const localDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
    
    setFormData({
      date: localDate.toISOString().split('T')[0],
      time: event.time,
      presenter: event.presenter || '',
      presenterUrl: event.presenterUrl || '',
      topic: event.topic,
      location: event.location,
      locationUrl: event.locationUrl || '',
      isVisible: event.isVisible,
      content: event.content || ''
    });
    setEditingId(event._id);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    
    try {
      const response = await fetch(`/api/events/${id}`, { method: 'DELETE' });
      if (response.ok) {
        await fetchEvents();
      } else {
        alert('Failed to delete event');
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Error deleting event');
    }
  };

  const resetForm = () => {
    setFormData({
      date: '',
      time: '',
      presenter: '',
      presenterUrl: '',
      topic: '',
      location: '',
      locationUrl: '',
      isVisible: true,
      content: ''
    });
    setEditingId(null);
    setShowModal(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  if (loading) return <div className="container">Loading...</div>;

  return (
    <div className="container" style={{ paddingTop: '2em', paddingBottom: '2em' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2em' }}>
          <h1>Manage Events</h1>
          <Link href="/admin/dashboard">← Back to Dashboard</Link>
        </div>

        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          style={{
            padding: '0.75em 1.5em',
            marginBottom: '2em',
            background: '#00ffcc',
            color: '#000',
            border: '2px solid #00f7ff',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontFamily: 'inherit'
          }}
        >
          + Add New Event
        </button>

        {/* Modal for Add/Edit Event */}
        <Modal
          isOpen={showModal}
          onClose={() => { resetForm(); setShowModal(false); }}
          title={editingId ? 'Edit Event' : 'New Event'}
        >
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1em' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5em' }}>Date *</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '0.5em',
                    background: '#000',
                    color: '#00ffcc',
                    border: '2px solid #00ffcc',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5em' }}>Time *</label>
                <input
                  type="text"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  placeholder="10:00 AM ET"
                  required
                  style={{
                    width: '100%',
                    padding: '0.5em',
                    background: '#000',
                    color: '#00ffcc',
                    border: '2px solid #00ffcc',
                    fontFamily: 'inherit'
                  }}
                />
              </div>
            </div>

            <div style={{ marginTop: '1em' }}>
              <label style={{ display: 'block', marginBottom: '0.5em' }}>Topic *</label>
              <input
                type="text"
                value={formData.topic}
                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                required
                style={{
                  width: '100%',
                  padding: '0.5em',
                  background: '#000',
                  color: '#00ffcc',
                  border: '2px solid #00ffcc',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            <div style={{ marginTop: '1em' }}>
              <label style={{ display: 'block', marginBottom: '0.5em' }}>Presenter</label>
              <input
                type="text"
                value={formData.presenter}
                onChange={(e) => setFormData({ ...formData, presenter: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.5em',
                  background: '#000',
                  color: '#00ffcc',
                  border: '2px solid #00ffcc',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            <div style={{ marginTop: '1em' }}>
              <label style={{ display: 'block', marginBottom: '0.5em' }}>Presenter URL</label>
              <input
                type="url"
                value={formData.presenterUrl}
                onChange={(e) => setFormData({ ...formData, presenterUrl: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.5em',
                  background: '#000',
                  color: '#00ffcc',
                  border: '2px solid #00ffcc',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            <div style={{ marginTop: '1em' }}>
              <label style={{ display: 'block', marginBottom: '0.5em' }}>Location *</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
                style={{
                  width: '100%',
                  padding: '0.5em',
                  background: '#000',
                  color: '#00ffcc',
                  border: '2px solid #00ffcc',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            <div style={{ marginTop: '1em' }}>
              <label style={{ display: 'block', marginBottom: '0.5em' }}>Location URL</label>
              <input
                type="url"
                value={formData.locationUrl}
                onChange={(e) => setFormData({ ...formData, locationUrl: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.5em',
                  background: '#000',
                  color: '#00ffcc',
                  border: '2px solid #00ffcc',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            <div style={{ marginTop: '1em' }}>
              <label style={{ display: 'block', marginBottom: '0.5em' }}>Detailed Notes (Markdown)</label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Enter detailed event information using Markdown syntax..."
                rows={8}
                style={{
                  width: '100%',
                  padding: '0.5em',
                  background: '#000',
                  color: '#00ffcc',
                  border: '2px solid #00ffcc',
                  fontFamily: 'inherit',
                  resize: 'vertical'
                }}
              />
              <div style={{ fontSize: '0.9em', color: '#999', marginTop: '0.5em' }}>
                You can use Markdown syntax for formatting. Supports headers, lists, links, code blocks, and more.
              </div>
            </div>

            <div style={{ marginTop: '1em', display: 'flex', alignItems: 'center' }}>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formData.isVisible}
                    onChange={(e) => setFormData({ ...formData, isVisible: e.target.checked })}
                    style={{ marginRight: '0.5em' }}
                  />
                  Visible
                </label>
            </div>

            <div style={{ marginTop: '2em', display: 'flex', gap: '1em', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => { resetForm(); setShowModal(false); }}
                style={{
                  padding: '0.75em 2em',
                  background: '#666',
                  color: '#fff',
                  border: '2px solid #888',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontFamily: 'inherit'
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{
                  padding: '0.75em 2em',
                  background: '#00ffcc',
                  color: '#000',
                  border: '2px solid #00f7ff',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontFamily: 'inherit'
                }}
              >
                {editingId ? 'Update Event' : 'Create Event'}
              </button>
            </div>
          </form>
        </Modal>

        <h2>All Events ({events.length})</h2>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {events.map((event) => (
            <li
              key={event._id}
              style={{
                marginBottom: '1em',
                padding: '1em',
                border: '2px solid #00ffcc',
                background: event.isVisible ? '#121212' : '#333',
                opacity: event.isVisible ? 1 : 0.6
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <strong style={{ fontSize: '1.1em' }}>{formatDate(event.date)} at {event.time}</strong>
                  {event.presenter && <div>Presenter: {event.presenter}</div>}
                  <div>Topic: {event.topic}</div>
                  <div>Location: {event.location}</div>
                  {event.content && (
                    <div style={{ marginTop: '0.5em' }}>
                      <Link 
                        href={`/events/${event._id}`} 
                        target="_blank" 
                        style={{ color: '#00ffcc', textDecoration: 'underline' }}
                      >
                        📝 View Event Page
                      </Link>
                    </div>
                  )}
                  {!event.isVisible && <div style={{ color: '#ff6700' }}>⚠️ Hidden</div>}
                </div>
                <div style={{ display: 'flex', gap: '0.5em' }}>
                  <button
                    onClick={() => handleEdit(event)}
                    style={{
                      padding: '0.5em 1em',
                      background: '#ffff00',
                      color: '#000',
                      border: 'none',
                      cursor: 'pointer',
                      fontFamily: 'inherit'
                    }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(event._id)}
                    style={{
                      padding: '0.5em 1em',
                      background: '#ff0000',
                      color: '#fff',
                      border: 'none',
                      cursor: 'pointer',
                      fontFamily: 'inherit'
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

