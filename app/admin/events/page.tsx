'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';
import PDFUploadSubform from '@/app/components/PDFUploadSubform';
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
  presentation?: {
    filename: string;
    data: Buffer;
    contentType: string;
    size: number;
  };
  isVisible: boolean;
  content?: string;
}

export default function AdminEvents() {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  // Force recompilation
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showMarkdownPreview, setShowMarkdownPreview] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    timezone: 'ET',
    presenter: '',
    presenterUrl: '',
    topic: '',
    location: '',
    locationUrl: '',
    isVisible: true,
    content: ''
  });
  
  const [presentations, setPresentations] = useState<Array<{
    id: string;
    file: File;
    name: string;
    size: number;
    type: string;
  }>>([]);

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
      
      // Combine time and timezone for the API
      const submitData = {
        ...formData,
        time: `${formData.time} ${formData.timezone}`.trim()
      };
      
      console.log('Form data before submission:', {
        presentations: presentations.map(p => ({
          name: p.name,
          size: p.size,
          type: p.type
        }))
      });
      
      // Remove timezone from the data sent to API
      const { timezone, ...dataToSubmit } = submitData;
      
      // Always use FormData for editing events to handle presentations properly
      const formDataToSend = new FormData();
      
      // Add all form fields
      Object.entries(dataToSubmit).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formDataToSend.append(key, value.toString());
        }
      });
      
      // Add presentation files (only new files, not existing ones)
      presentations.forEach(presentation => {
        if (presentation.file) {
          formDataToSend.append('presentations', presentation.file);
        }
      });
      
      // Add information about which presentations to keep (for editing)
      if (editingId) {
        const presentationsToKeep = presentations
          .filter(p => p.file === null) // Only existing presentations (no file object)
          .map(p => p.name);
        
        presentationsToKeep.forEach(filename => {
          formDataToSend.append('keepPresentations', filename);
        });
      }
      
      console.log('Sending FormData with fields:', Array.from(formDataToSend.keys()));
      console.log('Presentation files:', presentations.map(p => `${p.name} (${p.size} bytes)`));
      
      const response = await fetch(url, {
        method,
        body: formDataToSend
      });
        
        if (response.ok) {
          await fetchEvents();
          resetForm();
        } else {
          const errorText = await response.text();
          console.error('Server error:', errorText);
          console.error('Response status:', response.status);
          console.error('Response headers:', Object.fromEntries(response.headers.entries()));
          alert('Failed to save event: ' + (errorText || 'Unknown error'));
        }
    } catch (error) {
      console.error('Error saving event:', error);
      alert('Error saving event');
    }
  };

  const handleEdit = (event: Event) => {
    // Convert the stored date back to YYYY-MM-DD format for the form input
    const date = new Date(event.date);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;
    
    // Parse time and timezone from the stored time string
    let timeValue = '';
    let timezoneValue = 'ET';
    
    if (event.time) {
      // Try to extract time in HH:MM format for HTML5 time input
      const timeStr = event.time.trim();
      
      // Handle various time formats
      if (timeStr.includes('AM') || timeStr.includes('PM')) {
        // 12-hour format: "2:30 PM ET" or "2:30 PM"
        const ampmMatch = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)\s*(.*)$/i);
        if (ampmMatch) {
          let hours = parseInt(ampmMatch[1]);
          const minutes = ampmMatch[2];
          const ampm = ampmMatch[3].toUpperCase();
          timezoneValue = ampmMatch[4].trim() || 'ET';
          
          // Convert to 24-hour format for HTML5 time input
          if (ampm === 'PM' && hours !== 12) {
            hours += 12;
          } else if (ampm === 'AM' && hours === 12) {
            hours = 0;
          }
          
          timeValue = `${hours.toString().padStart(2, '0')}:${minutes}`;
        } else {
          // Fallback: try to extract just the time part
          const simpleMatch = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)/i);
          if (simpleMatch) {
            let hours = parseInt(simpleMatch[1]);
            const minutes = simpleMatch[2];
            const ampm = simpleMatch[3].toUpperCase();
            
            if (ampm === 'PM' && hours !== 12) {
              hours += 12;
            } else if (ampm === 'AM' && hours === 12) {
              hours = 0;
            }
            
            timeValue = `${hours.toString().padStart(2, '0')}:${minutes}`;
            timezoneValue = timeStr.replace(/^\d{1,2}:\d{2}\s*(AM|PM)\s*/i, '').trim() || 'ET';
          }
        }
      } else {
        // 24-hour format: "14:30 ET" or "14:30"
        const timeMatch = timeStr.match(/^(\d{1,2}):(\d{2})\s*(.*)$/);
        if (timeMatch) {
          const hours = timeMatch[1].padStart(2, '0');
          const minutes = timeMatch[2];
          timeValue = `${hours}:${minutes}`;
          timezoneValue = timeMatch[3].trim() || 'ET';
        } else {
          // Fallback: assume it's just time
          timeValue = timeStr;
        }
      }
    }
    
    console.log('Editing event:', {
      id: event._id,
      topic: event.topic,
      presentations: event.presentations?.map(p => ({
        filename: p.filename,
        contentType: p.contentType,
        size: p.size,
        hasData: !!p.data
      })) || []
    });
    
    setFormData({
      date: dateString,
      time: timeValue,
      timezone: timezoneValue,
      presenter: event.presenter || '',
      presenterUrl: event.presenterUrl || '',
      topic: event.topic,
      location: event.location,
      locationUrl: event.locationUrl || '',
      isVisible: event.isVisible,
      content: event.content || ''
    });
    
    // Load existing presentations for display
    if (event.presentations && event.presentations.length > 0) {
      const existingPresentations = event.presentations.map(p => ({
        id: Math.random().toString(36).substr(2, 9), // Generate ID for display
        file: null as any, // No file object for existing presentations
        name: p.filename,
        size: p.size,
        type: p.contentType
      }));
      setPresentations(existingPresentations);
    } else {
      setPresentations([]);
    }
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
      timezone: 'ET',
      presenter: '',
      presenterUrl: '',
      topic: '',
      location: '',
      locationUrl: '',
      isVisible: true,
      content: ''
    });
    setPresentations([]);
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
                <label style={{ display: 'block', marginBottom: '0.5em', fontWeight: 'bold' }}>Date *</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75em',
                    background: '#000',
                    color: '#00ffcc',
                    border: '2px solid #00ffcc',
                    borderRadius: '4px',
                    fontFamily: 'inherit',
                    fontSize: '1em',
                    cursor: 'pointer'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5em', fontWeight: 'bold' }}>Time *</label>
                <div style={{ display: 'flex', gap: '0.5em' }}>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    required
                    style={{
                      flex: '1',
                      padding: '0.75em',
                      background: '#000',
                      color: '#00ffcc',
                      border: '2px solid #00ffcc',
                      borderRadius: '4px',
                      fontFamily: 'inherit',
                      fontSize: '1em',
                      cursor: 'pointer'
                    }}
                  />
                  <input
                    type="text"
                    placeholder="ET"
                    value={formData.timezone || 'ET'}
                    onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                    style={{
                      width: '60px',
                      padding: '0.75em',
                      background: '#000',
                      color: '#00ffcc',
                      border: '2px solid #00ffcc',
                      borderRadius: '4px',
                      fontFamily: 'inherit',
                      fontSize: '1em',
                      textAlign: 'center'
                    }}
                  />
                </div>
                <small style={{ color: '#888', fontSize: '0.8em', marginTop: '0.25em', display: 'block' }}>
                  Use 24-hour format (e.g., 14:30)
                </small>
              </div>
            </div>

            <div style={{ marginTop: '1em' }}>
              <label style={{ display: 'block', marginBottom: '0.5em', fontWeight: 'bold' }}>Topic *</label>
              <input
                type="text"
                value={formData.topic}
                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                required
                style={{
                  width: '100%',
                  padding: '0.75em',
                  background: '#000',
                  color: '#00ffcc',
                  border: '2px solid #00ffcc',
                  borderRadius: '4px',
                  fontFamily: 'inherit',
                  fontSize: '1em'
                }}
              />
            </div>

            <div style={{ marginTop: '1em' }}>
              <label style={{ display: 'block', marginBottom: '0.5em', fontWeight: 'bold' }}>Presenter</label>
              <input
                type="text"
                value={formData.presenter}
                onChange={(e) => setFormData({ ...formData, presenter: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.75em',
                  background: '#000',
                  color: '#00ffcc',
                  border: '2px solid #00ffcc',
                  borderRadius: '4px',
                  fontFamily: 'inherit',
                  fontSize: '1em'
                }}
              />
            </div>

            <div style={{ marginTop: '1em' }}>
              <label style={{ display: 'block', marginBottom: '0.5em', fontWeight: 'bold' }}>Presenter URL</label>
              <input
                type="url"
                value={formData.presenterUrl}
                onChange={(e) => setFormData({ ...formData, presenterUrl: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.75em',
                  background: '#000',
                  color: '#00ffcc',
                  border: '2px solid #00ffcc',
                  borderRadius: '4px',
                  fontFamily: 'inherit',
                  fontSize: '1em'
                }}
              />
            </div>

            <div style={{ marginTop: '1em' }}>
              <label style={{ display: 'block', marginBottom: '0.5em', fontWeight: 'bold' }}>Location *</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
                style={{
                  width: '100%',
                  padding: '0.75em',
                  background: '#000',
                  color: '#00ffcc',
                  border: '2px solid #00ffcc',
                  borderRadius: '4px',
                  fontFamily: 'inherit',
                  fontSize: '1em'
                }}
              />
            </div>

            <div style={{ marginTop: '1em' }}>
              <label style={{ display: 'block', marginBottom: '0.5em', fontWeight: 'bold' }}>Location URL</label>
              <input
                type="url"
                value={formData.locationUrl}
                onChange={(e) => setFormData({ ...formData, locationUrl: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.75em',
                  background: '#000',
                  color: '#00ffcc',
                  border: '2px solid #00ffcc',
                  borderRadius: '4px',
                  fontFamily: 'inherit',
                  fontSize: '1em'
                }}
              />
            </div>

            <div style={{ marginTop: '1em' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5em' }}>
                <label style={{ fontWeight: 'bold' }}>Detailed Notes (Markdown)</label>
                <button
                  type="button"
                  onClick={() => setShowMarkdownPreview(true)}
                  style={{
                    background: '#00ffcc',
                    color: '#000',
                    border: '1px solid #00ffcc',
                    padding: '0.5em 1em',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    fontWeight: 'bold',
                    fontSize: '0.9em',
                    borderRadius: '3px'
                  }}
                >
                  👁️ Preview
                </button>
              </div>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Enter detailed event information using Markdown syntax..."
                rows={8}
                style={{
                  width: '100%',
                  padding: '0.75em',
                  background: '#000',
                  color: '#00ffcc',
                  border: '2px solid #00ffcc',
                  borderRadius: '4px',
                  fontFamily: 'inherit',
                  fontSize: '1em',
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

            <PDFUploadSubform
              presentations={presentations}
              onPresentationsChange={setPresentations}
            />

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

        {/* Markdown Preview Modal */}
        <Modal
          isOpen={showMarkdownPreview}
          onClose={() => setShowMarkdownPreview(false)}
          title="Markdown Preview"
        >
          <div style={{ 
            maxHeight: '70vh', 
            overflowY: 'auto',
            padding: '1em',
            background: '#000',
            color: '#d4d8d5',
            lineHeight: '1.6',
            fontSize: '1.1em'
          }}>
            {formData.content ? (
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
                components={{
                  h1: ({ children }) => <h1 style={{ color: '#00ffcc', marginTop: '2em', marginBottom: '1em', animation: 'none', textShadow: 'none', transform: 'none' }}>{children}</h1>,
                  h2: ({ children }) => <h2 style={{ color: '#00ffcc', marginTop: '1.5em', marginBottom: '0.8em', animation: 'none', textShadow: 'none', transform: 'none' }}>{children}</h2>,
                  h3: ({ children }) => <h3 style={{ color: '#00ffcc', marginTop: '1.2em', marginBottom: '0.6em', animation: 'none', textShadow: 'none', transform: 'none' }}>{children}</h3>,
                  p: ({ children }) => <p style={{ marginBottom: '1em', animation: 'none', textShadow: 'none', transform: 'none' }}>{children}</p>,
                  ul: ({ children }) => <ul style={{ marginBottom: '1em', paddingLeft: '2em', animation: 'none', textShadow: 'none', transform: 'none' }}>{children}</ul>,
                  ol: ({ children }) => <ol style={{ marginBottom: '1em', paddingLeft: '2em', animation: 'none', textShadow: 'none', transform: 'none' }}>{children}</ol>,
                  li: ({ children }) => <li style={{ marginBottom: '0.5em', animation: 'none', textShadow: 'none', transform: 'none' }}>{children}</li>,
                  code: ({ children, className }) => {
                    const isInline = !className;
                    return isInline ? (
                      <code style={{ 
                        background: '#333', 
                        padding: '0.2em 0.4em', 
                        borderRadius: '3px',
                        fontSize: '0.9em'
                      }}>
                        {children}
                      </code>
                    ) : (
                      <code className={className}>{children}</code>
                    );
                  },
                  pre: ({ children }) => (
                    <pre style={{ 
                      background: '#1a1a1a', 
                      padding: '1em', 
                      borderRadius: '5px', 
                      overflow: 'auto',
                      marginBottom: '1em',
                      border: '1px solid #333'
                    }}>
                      {children}
                    </pre>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote style={{ 
                      borderLeft: '4px solid #00ffcc', 
                      paddingLeft: '1em', 
                      marginLeft: '0',
                      marginBottom: '1em',
                      fontStyle: 'italic',
                      animation: 'none',
                      textShadow: 'none',
                      transform: 'none'
                    }}>
                      {children}
                    </blockquote>
                  ),
                  a: ({ children, href }) => (
                    <a 
                      href={href} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{ color: '#00ffcc', textDecoration: 'underline' }}
                    >
                      {children}
                    </a>
                  ),
                  table: ({ children }) => (
                    <div style={{ overflowX: 'auto', marginBottom: '1em' }}>
                      <table style={{ 
                        borderCollapse: 'collapse', 
                        width: '100%',
                        border: '1px solid #333'
                      }}>
                        {children}
                      </table>
                    </div>
                  ),
                  th: ({ children }) => (
                    <th style={{ 
                      border: '1px solid #333', 
                      padding: '0.5em', 
                      background: '#333',
                      textAlign: 'left'
                    }}>
                      {children}
                    </th>
                  ),
                  td: ({ children }) => (
                    <td style={{ 
                      border: '1px solid #333', 
                      padding: '0.5em'
                    }}>
                      {children}
                    </td>
                  ),
                }}
              >
                {formData.content}
              </ReactMarkdown>
            ) : (
              <div style={{ 
                padding: '2em', 
                border: '2px dashed #666', 
                textAlign: 'center',
                color: '#999'
              }}>
                <p>No content to preview. Start typing in the Detailed Notes field above.</p>
              </div>
            )}
          </div>
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

