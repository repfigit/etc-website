'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';
import PDFUploadSubform from '@/app/components/PDFUploadSubform';
import ImageUploadSubform from '@/app/components/ImageUploadSubform';
import Link from 'next/link';
import Modal from '../../components/Modal';
import { uploadFileToBlobClient } from '@/lib/blob-client';
import { formatTimeWithTimezone } from '@/lib/time-utils';

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
  presentations?: {
    filename: string;
    data: Buffer;
    contentType: string;
    size: number;
  }[];
  images?: {
    filename: string;
    contentType: string;
    size: number;
    uploadedAt?: string;
    order?: number;
  }[];
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
  const [formDirty, setFormDirty] = useState(false);
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
    file: File | null;
    name: string;
    size: number;
    type: string;
  }>>([]);

  const [images, setImages] = useState<Array<{
    id: string;
    file: File | null;
    name: string;
    size: number;
    type: string;
    preview?: string;
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

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    setUploadProgress('Saving event...');

    try {
      // Combine time and timezone for the API
      const submitData = {
        ...formData,
        time: `${formData.time} ${formData.timezone}`.trim()
      };

      // Remove timezone from the data sent to API
      const { timezone, ...dataToSubmit } = submitData;

      let eventId = editingId;

      // Step 1: Create or update event with basic data first
      if (!editingId) {
        // Creating new event - create it first to get an ID
        setUploadProgress('Creating event...');
        const createResponse = await fetch('/api/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dataToSubmit)
        });

        if (!createResponse.ok) {
          const errorText = await createResponse.text();
          throw new Error(`Failed to create event: ${errorText}`);
        }

        const createData = await createResponse.json();
        eventId = createData.data._id;
        console.log('Created event with ID:', eventId);
      }

      // Step 2: Upload new files to blob storage using client-side uploads
      const newPresentationFiles = presentations.filter(p => p.file !== null);
      const newImageFiles = images.filter(img => img.file !== null);

      const uploadedPresentations: Array<{ url: string; filename: string; contentType: string; size: number }> = [];
      const uploadedImages: Array<{ url: string; filename: string; contentType: string; size: number }> = [];

      // Upload presentations
      for (let i = 0; i < newPresentationFiles.length; i++) {
        const presentation = newPresentationFiles[i];
        if (presentation.file) {
          setUploadProgress(`Uploading presentation ${i + 1}/${newPresentationFiles.length}: ${presentation.name}`);
          try {
            const result = await uploadFileToBlobClient(
              presentation.file,
              'events',
              eventId!,
              'presentations'
            );
            uploadedPresentations.push(result);
            console.log('Uploaded presentation:', result.url);
          } catch (uploadError) {
            console.error('Error uploading presentation:', uploadError);
            throw new Error(`Failed to upload presentation: ${presentation.name}`);
          }
        }
      }

      // Upload images
      for (let i = 0; i < newImageFiles.length; i++) {
        const image = newImageFiles[i];
        if (image.file) {
          setUploadProgress(`Uploading image ${i + 1}/${newImageFiles.length}: ${image.name}`);
          try {
            const result = await uploadFileToBlobClient(
              image.file,
              'events',
              eventId!,
              'images'
            );
            uploadedImages.push(result);
            console.log('Uploaded image:', result.url);
          } catch (uploadError) {
            console.error('Error uploading image:', uploadError);
            throw new Error(`Failed to upload image: ${image.name}`);
          }
        }
      }

      // Step 3: Update event with file URLs
      setUploadProgress('Finalizing event...');

      // Build the update payload
      const updatePayload: any = { ...dataToSubmit };

      // For presentations: keep existing ones + add new uploaded ones
      const existingPresentations = presentations
        .filter(p => p.file === null)
        .map(p => p.name);

      // For images: keep existing ones (in order) + add new uploaded ones
      const existingImages = images
        .filter(img => img.file === null)
        .map(img => img.name);

      // Send as JSON with blob URLs
      const finalPayload = {
        ...updatePayload,
        // Tell the API which existing files to keep and which new URLs to add
        keepPresentations: existingPresentations,
        newPresentationUrls: uploadedPresentations,
        keepImages: existingImages,
        newImageUrls: uploadedImages,
      };

      console.log('Final payload:', {
        ...finalPayload,
        newPresentationUrls: finalPayload.newPresentationUrls?.length || 0,
        newImageUrls: finalPayload.newImageUrls?.length || 0,
      });

      const updateResponse = await fetch(`/api/events/${eventId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalPayload)
      });

      if (!updateResponse.ok) {
        const errorText = await updateResponse.text();
        throw new Error(`Failed to update event: ${errorText}`);
      }

      await fetchEvents();
      resetForm();
    } catch (error) {
      console.error('Error saving event:', error);
      alert('Failed to save event: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsUploading(false);
      setUploadProgress('');
    }
  };

  const handleEdit = async (event: Event) => {
    // Fetch fresh event data to ensure we have the latest images
    // The list view might have stale data
    let eventData = event;
    try {
      const response = await fetch(`/api/events/${event._id}?admin=true`);
      const data = await response.json();
      if (data.success && data.data) {
        eventData = data.data;
        console.log('Fetched fresh event data:', {
          id: eventData._id,
          hasImages: !!eventData.images,
          imageCount: eventData.images?.length || 0
        });
      }
    } catch (error) {
      console.error('Error fetching event details, using cached data:', error);
    }

    // Convert the stored date back to YYYY-MM-DD format for the form input
    const date = new Date(eventData.date);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;

    // Parse time and timezone from the stored time string
    let timeValue = '';
    let timezoneValue = 'ET';

    if (eventData.time) {
      // Try to extract time in HH:MM format for HTML5 time input
      const timeStr = eventData.time.trim();

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
      id: eventData._id,
      topic: eventData.topic,
      presentations: eventData.presentations?.map(p => ({
        filename: p.filename,
        contentType: p.contentType,
        size: p.size,
        hasData: !!p.data
      })) || [],
      images: eventData.images?.map(img => ({
        filename: img.filename,
        contentType: img.contentType,
        size: img.size,
        order: img.order
      })) || []
    });

    setFormData({
      date: dateString,
      time: timeValue,
      timezone: timezoneValue,
      presenter: eventData.presenter || '',
      presenterUrl: eventData.presenterUrl || '',
      topic: eventData.topic,
      location: eventData.location,
      locationUrl: eventData.locationUrl || '',
      isVisible: eventData.isVisible,
      content: eventData.content || ''
    });

    // Load existing presentations for display
    if (eventData.presentations && eventData.presentations.length > 0) {
      const existingPresentations = eventData.presentations.map(p => ({
        id: Math.random().toString(36).substr(2, 9), // Generate ID for display
        file: null as File | null, // No file object for existing presentations
        name: p.filename,
        size: p.size,
        type: p.contentType
      }));
      setPresentations(existingPresentations);
    } else {
      setPresentations([]);
    }

    // Load existing images for display
    console.log('Loading images for edit:', {
      eventId: eventData._id,
      hasImages: !!eventData.images,
      imageCount: eventData.images?.length || 0,
      images: eventData.images
    });

    if (eventData.images && eventData.images.length > 0) {
      // Sort images by order if available
      const sortedImages = [...eventData.images].sort((a, b) => {
        const orderA = a.order !== undefined ? a.order : 0;
        const orderB = b.order !== undefined ? b.order : 0;
        return orderA - orderB;
      });

      console.log('Sorted images:', sortedImages);

      const existingImages = sortedImages.map(img => ({
        id: Math.random().toString(36).substr(2, 9), // Generate ID for display
        file: null as File | null, // No file object for existing images
        name: img.filename,
        size: img.size,
        type: img.contentType
      }));

      console.log('Setting images state:', existingImages);
      setImages(existingImages);
    } else {
      console.log('No images found in event, clearing images state');
      setImages([]);
    }
    setEditingId(eventData._id);
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
    setImages([]);
    setEditingId(null);
    setShowModal(false);
    setFormDirty(false);
  };

  const updateFormData = (updates: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
    setFormDirty(true);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  if (loading) return <div className="container">Loading...</div>;

  return (
    <div className="container admin-events-container">
      <div className="admin-events-content">
        <div className="admin-events-header">
          <h1>Manage Events</h1>
          <Link href="/admin/dashboard">← Back to Dashboard</Link>
        </div>

        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="admin-events-add-button"
        >
          + Add New Event
        </button>

        {/* Modal for Add/Edit Event */}
        <Modal
          isOpen={showModal}
          onClose={() => { resetForm(); setShowModal(false); }}
          title={editingId ? 'Edit Event' : 'New Event'}
          preventOverlayClose={true}
          confirmClose={formDirty ? "You have unsaved changes. Are you sure you want to close?" : undefined}
        >
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1em' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5em', fontWeight: 'bold' }}>Date *</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => updateFormData({ date: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75em',
                    background: '#000',
                    color: '#4ecdc4',
                    border: '2px solid #4ecdc4',
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
                    onChange={(e) => updateFormData({ time: e.target.value })}
                    required
                    style={{
                      flex: '1',
                      padding: '0.75em',
                      background: '#000',
                      color: '#4ecdc4',
                      border: '2px solid #4ecdc4',
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
                    onChange={(e) => updateFormData({ timezone: e.target.value })}
                    style={{
                      width: '60px',
                      padding: '0.75em',
                      background: '#000',
                      color: '#4ecdc4',
                      border: '2px solid #4ecdc4',
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
                onChange={(e) => updateFormData({ topic: e.target.value })}
                required
                style={{
                  width: '100%',
                  padding: '0.75em',
                  background: '#000',
                  color: '#4ecdc4',
                  border: '2px solid #4ecdc4',
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
                onChange={(e) => updateFormData({ presenter: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.75em',
                  background: '#000',
                  color: '#4ecdc4',
                  border: '2px solid #4ecdc4',
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
                onChange={(e) => updateFormData({ presenterUrl: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.75em',
                  background: '#000',
                  color: '#4ecdc4',
                  border: '2px solid #4ecdc4',
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
                onChange={(e) => updateFormData({ location: e.target.value })}
                required
                style={{
                  width: '100%',
                  padding: '0.75em',
                  background: '#000',
                  color: '#4ecdc4',
                  border: '2px solid #4ecdc4',
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
                onChange={(e) => updateFormData({ locationUrl: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.75em',
                  background: '#000',
                  color: '#4ecdc4',
                  border: '2px solid #4ecdc4',
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
                    background: '#4ecdc4',
                    color: '#000',
                    border: '1px solid #4ecdc4',
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
                onChange={(e) => updateFormData({ content: e.target.value })}
                placeholder="Enter detailed event information using Markdown syntax..."
                rows={8}
                style={{
                  width: '100%',
                  padding: '0.75em',
                  background: '#000',
                  color: '#4ecdc4',
                  border: '2px solid #4ecdc4',
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
                  onChange={(e) => updateFormData({ isVisible: e.target.checked })}
                  style={{ marginRight: '0.5em' }}
                />
                Visible
              </label>
            </div>

            <PDFUploadSubform
              presentations={presentations}
              onPresentationsChange={(newPresentations) => {
                setPresentations(newPresentations);
                setFormDirty(true);
              }}
            />

            <ImageUploadSubform
              images={images}
              onImagesChange={(newImages) => {
                setImages(newImages);
                setFormDirty(true);
              }}
              eventId={editingId || undefined}
            />

            {isUploading && uploadProgress && (
              <div style={{
                marginTop: '1em',
                padding: '1em',
                background: 'rgba(78, 205, 196, 0.1)',
                border: '1px solid #4ecdc4',
                borderRadius: '4px',
                color: '#4ecdc4'
              }}>
                ⏳ {uploadProgress}
              </div>
            )}

            <div style={{ marginTop: '2em', display: 'flex', gap: '1em', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => { resetForm(); setShowModal(false); }}
                disabled={isUploading}
                style={{
                  padding: '0.75em 2em',
                  background: '#666',
                  color: '#fff',
                  border: '2px solid #888',
                  cursor: isUploading ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold',
                  fontFamily: 'inherit',
                  opacity: isUploading ? 0.5 : 1
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isUploading}
                style={{
                  padding: '0.75em 2em',
                  background: isUploading ? '#666' : '#4ecdc4',
                  color: isUploading ? '#999' : '#000',
                  border: '2px solid #00f7ff',
                  cursor: isUploading ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold',
                  fontFamily: 'inherit'
                }}
              >
                {isUploading ? 'Uploading...' : (editingId ? 'Update Event' : 'Create Event')}
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
                  h1: ({ children }) => <h1 style={{ color: '#4ecdc4', marginTop: '2em', marginBottom: '1em', animation: 'none', textShadow: 'none', transform: 'none' }}>{children}</h1>,
                  h2: ({ children }) => <h2 style={{ color: '#4ecdc4', marginTop: '1.5em', marginBottom: '0.8em', animation: 'none', textShadow: 'none', transform: 'none' }}>{children}</h2>,
                  h3: ({ children }) => <h3 style={{ color: '#4ecdc4', marginTop: '1.2em', marginBottom: '0.6em', animation: 'none', textShadow: 'none', transform: 'none' }}>{children}</h3>,
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
                      borderLeft: '4px solid #4ecdc4',
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
                      style={{ color: '#4ecdc4' }}
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
                border: '2px solid #4ecdc4',
                borderRadius: '12px',
                background: event.isVisible ? '#121212' : '#333',
                opacity: event.isVisible ? 1 : 0.6
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <strong style={{ fontSize: '1.1em' }}>{formatDate(event.date)} at {formatTimeWithTimezone(event.date, event.time)}</strong>
                  {event.presenter && <div>Presenter: {event.presenter}</div>}
                  <div>Topic: {event.topic}</div>
                  <div>Location: {event.location}</div>
                  {event.content && (
                    <div style={{ marginTop: '0.5em' }}>
                      <Link
                        href={`/events/${event._id}`}
                        target="_blank"
                        style={{ color: '#4ecdc4' }}
                      >
                        📝 View Event Page
                      </Link>
                    </div>
                  )}
                  {!event.isVisible && <div style={{ color: '#ff6700' }}>⚠️ Hidden</div>}
                  {event.images && event.images.length > 0 && (
                    <div style={{ marginTop: '0.75em', display: 'flex', gap: '0.5em', flexWrap: 'wrap' }}>
                      {event.images.slice(0, 4).map((img, idx) => (
                        <div
                          key={idx}
                          style={{
                            width: '60px',
                            height: '60px',
                            borderRadius: '4px',
                            overflow: 'hidden',
                            border: '1px solid #4ecdc4',
                            background: '#000'
                          }}
                        >
                          <img
                            src={`/api/events/${event._id}/images/${idx}`}
                            alt={img.filename}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover'
                            }}
                          />
                        </div>
                      ))}
                      {event.images.length > 4 && (
                        <div
                          style={{
                            width: '60px',
                            height: '60px',
                            borderRadius: '4px',
                            border: '1px solid #4ecdc4',
                            background: '#1a1a1a',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#4ecdc4',
                            fontSize: '0.9em',
                            fontWeight: 'bold'
                          }}
                        >
                          +{event.images.length - 4}
                        </div>
                      )}
                    </div>
                  )}
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

