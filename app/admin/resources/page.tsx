'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Modal from '../../components/Modal';
import ImageUpload from '../../components/ImageUpload';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Resource {
  _id: string;
  title: string;
  url: string;
  description?: string;
  thumbnail?: {
    filename: string;
    data: Buffer;
    contentType: string;
    size: number;
  };
  featured: boolean;
  order: number;
  isVisible: boolean;
}

// Sortable Resource Item Component
function SortableResourceItem({ resource, onEdit, onDelete }: { 
  resource: Resource; 
  onEdit: (resource: Resource) => void; 
  onDelete: (id: string) => void; 
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: resource._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      className={`resource-admin-item ${!resource.isVisible ? 'hidden' : ''}`}
      style={{
        ...style,
      }}
      {...attributes}
    >
      <div className="resource-admin-item-header">
        <div 
          className="resource-admin-drag-handle"
          {...listeners}
        >
          ⋮⋮
        </div>
        <div className="resource-admin-content">
          {resource.thumbnail && (
            <div className="resource-admin-thumbnail-container">
              <img 
                src={`/api/resources/${resource._id}/thumbnail`}
                alt={resource.title}
                className="resource-admin-thumbnail"
              />
            </div>
          )}
          <strong className="resource-admin-title">{resource.title}</strong>
          {resource.featured && (
            <div style={{ display: 'inline-block', marginLeft: '0.5em', background: '#f1c40f', color: '#000', padding: '0.1em 0.4em', fontSize: '0.7em', fontWeight: 'bold' }}>
              FEATURED
            </div>
          )}
          {resource.description && (
            <div className="resource-admin-description">
              {resource.description}
            </div>
          )}
          <div className="resource-admin-url">
            <a href={resource.url} target="_blank" rel="noopener noreferrer">{resource.url}</a>
          </div>
          {!resource.isVisible && <div className="resource-admin-hidden-label">⚠️ Hidden</div>}
        </div>
      </div>
      <div className="resource-admin-actions">
        <button
          onClick={(e) => {

            e.stopPropagation();
            onEdit(resource);
          }}
          className="resource-admin-edit-button"
        >
          Edit
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(resource._id);
          }}
          className="resource-admin-delete-button"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

export default function AdminResources() {
  const router = useRouter();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    description: '',
    featured: false,
    order: 0,
    isVisible: true
  });
  
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [existingThumbnailUrl, setExistingThumbnailUrl] = useState<string | null>(null);
  const [removeThumbnail, setRemoveThumbnail] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/verify');
        const data = await response.json();
        
        if (!data.authenticated) {
          router.push('/admin');
          return;
        }
        fetchResources();
      } catch (error) {
        console.error('Auth check failed:', error);
        router.push('/admin');
      }
    };
    
    checkAuth();
  }, [router]);

  const fetchResources = async () => {
    try {
      const response = await fetch('/api/resources?admin=true');
      const data = await response.json();
      if (data.success) {
        setResources(data.data);
      }
    } catch (error) {
      console.error('Error fetching resources:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingId ? `/api/resources/${editingId}` : '/api/resources';
      const method = editingId ? 'PUT' : 'POST';
      
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('url', formData.url);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('featured', String(formData.featured));
      formDataToSend.append('order', String(formData.order));
      formDataToSend.append('isVisible', String(formData.isVisible));
      
      if (thumbnailFile) {
        formDataToSend.append('thumbnail', thumbnailFile);
      }
      
      if (removeThumbnail) {
        formDataToSend.append('removeThumbnail', 'true');
      }
      
      const response = await fetch(url, {
        method,
        body: formDataToSend
      });
      
      if (response.ok) {
        await fetchResources();
        resetForm();
      } else {
        alert('Failed to save resource');
      }
    } catch (error) {
      console.error('Error saving resource:', error);
      alert('Error saving resource');
    }
  };

  const handleEdit = (resource: Resource) => {
    setFormData({
      title: resource.title,
      url: resource.url,
      description: resource.description || '',
      featured: resource.featured,
      order: resource.order,
      isVisible: resource.isVisible
    });
    
    // Set existing thumbnail URL if exists
    if (resource.thumbnail) {
      setExistingThumbnailUrl(`/api/resources/${resource._id}/thumbnail`);
    } else {
      setExistingThumbnailUrl(null);
    }
    
    setThumbnailFile(null);
    setRemoveThumbnail(false);
    setEditingId(resource._id);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this resource?')) return;
    
    try {
      const response = await fetch(`/api/resources/${id}`, { method: 'DELETE' });
      if (response.ok) {
        await fetchResources();
      } else {
        alert('Failed to delete resource');
      }
    } catch (error) {
      console.error('Error deleting resource:', error);
      alert('Error deleting resource');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      url: '',
      description: '',
      featured: false,
      order: 0,
      isVisible: true
    });
    setThumbnailFile(null);
    setExistingThumbnailUrl(null);
    setRemoveThumbnail(false);
    setEditingId(null);
    setShowModal(false);
  };

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = resources.findIndex((resource) => resource._id === active.id);
      const newIndex = resources.findIndex((resource) => resource._id === over.id);
      
      const newResources = arrayMove(resources, oldIndex, newIndex);
      setResources(newResources);

      // Update order values and send to API
      const updatedResources = newResources.map((resource, index) => ({
        ...resource,
        order: index + 1
      }));

      try {
        // Update all resources with new order values
        const updatePromises = updatedResources.map((resource, index) =>
          fetch(`/api/resources/${resource._id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...resource, order: index + 1 })
          })
        );
        
        await Promise.all(updatePromises);

      } catch (error) {
        // Revert the local state if API call fails
        await fetchResources();
      }
    }
  };

  if (loading) return <div className="container">Loading...</div>;

  return (
    <div className="container" style={{ paddingTop: '2em', paddingBottom: '2em' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2em' }}>
          <h1>Manage Resources</h1>
          <Link href="/admin/dashboard">← Back to Dashboard</Link>
        </div>

        <button
          onClick={() => setShowModal(true)}
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
          + Add New Resource
        </button>

        {/* Modal for Add/Edit Resource */}
        <Modal
          isOpen={showModal}
          onClose={() => { resetForm(); setShowModal(false); }}
          title={editingId ? 'Edit Resource' : 'New Resource'}
        >
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1em' }}>
              <label style={{ display: 'block', marginBottom: '0.5em' }}>Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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

            <div style={{ marginBottom: '1em' }}>
              <label style={{ display: 'block', marginBottom: '0.5em' }}>URL *</label>
              <input
                type="url"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
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

            <div style={{ marginBottom: '1em' }}>
              <label style={{ display: 'block', marginBottom: '0.5em' }}>Description (optional)</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
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
            </div>

            <ImageUpload
              currentImage={existingThumbnailUrl}
              onImageChange={(file) => {
                setThumbnailFile(file);
                setRemoveThumbnail(false);
              }}
              onRemoveImage={() => {
                setThumbnailFile(null);
                setExistingThumbnailUrl(null);
                setRemoveThumbnail(true);
              }}
            />

              <div style={{ display: 'flex', alignItems: 'center' }}>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', marginRight: '1em' }}>
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    style={{ marginRight: '0.5em' }}
                  />
                  Featured
                </label>
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
                  border: '2px solid #666',
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
              {editingId ? 'Update Resource' : 'Create Resource'}
            </button>
            </div>
          </form>
        </Modal>

        <h2>All Resources ({resources.length})</h2>
        <div style={{ marginBottom: '1em', fontSize: '0.9em', color: '#d4d8d5' }}>
          💡 Drag and drop to reorder resources. The order field is automatically updated.
        </div>
        
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext 
            items={resources.map(r => r._id)} 
            strategy={verticalListSortingStrategy}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1em' }}>
          {resources.map((resource) => (
                <SortableResourceItem
              key={resource._id}
                  resource={resource}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}

