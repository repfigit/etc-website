'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Event {
  _id: string;
  date: string;
  time: string;
  presenter?: string;
  presenterUrl?: string;
  topic: string;
  location: string;
  locationUrl?: string;
  order: number;
  isVisible: boolean;
}

export default function AdminEvents() {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    presenter: '',
    presenterUrl: '',
    topic: '',
    location: '',
    locationUrl: '',
    order: 0,
    isVisible: true
  });

  useEffect(() => {
    const isAuth = sessionStorage.getItem('adminAuth');
    if (!isAuth) {
      router.push('/admin');
      return;
    }
    fetchEvents();
  }, [router]);

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events');
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
        alert('Failed to save event');
      }
    } catch (error) {
      console.error('Error saving event:', error);
      alert('Error saving event');
    }
  };

  const handleEdit = (event: Event) => {
    setFormData({
      date: event.date.split('T')[0],
      time: event.time,
      presenter: event.presenter || '',
      presenterUrl: event.presenterUrl || '',
      topic: event.topic,
      location: event.location,
      locationUrl: event.locationUrl || '',
      order: event.order,
      isVisible: event.isVisible
    });
    setEditingId(event._id);
    setShowForm(true);
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
      order: 0,
      isVisible: true
    });
    setEditingId(null);
    setShowForm(false);
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
          onClick={() => { setShowForm(!showForm); if (showForm) resetForm(); }}
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
          {showForm ? 'Cancel' : '+ Add New Event'}
        </button>

        {showForm && (
          <form onSubmit={handleSubmit} style={{ marginBottom: '3em', padding: '2em', border: '2px solid #00ffcc', background: '#121212' }}>
            <h2>{editingId ? 'Edit Event' : 'New Event'}</h2>
            
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

            <div style={{ marginTop: '1em', display: 'flex', gap: '2em' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5em' }}>Order</label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                  style={{
                    width: '100px',
                    padding: '0.5em',
                    background: '#000',
                    color: '#00ffcc',
                    border: '2px solid #00ffcc',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center' }}>
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
            </div>

            <button
              type="submit"
              style={{
                marginTop: '1.5em',
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
          </form>
        )}

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

