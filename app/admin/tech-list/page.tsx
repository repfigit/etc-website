'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface TechItem {
  _id: string;
  name: string;
  url: string;
  order: number;
  isVisible: boolean;
}

export default function AdminTechList() {
  const router = useRouter();
  const [techItems, setTechItems] = useState<TechItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    order: 0,
    isVisible: true
  });

  useEffect(() => {
    const isAuth = sessionStorage.getItem('adminAuth');
    if (!isAuth) {
      router.push('/admin');
      return;
    }
    fetchTechItems();
  }, [router]);

  const fetchTechItems = async () => {
    try {
      const response = await fetch('/api/tech-list');
      const data = await response.json();
      if (data.success) {
        setTechItems(data.data);
      }
    } catch (error) {
      console.error('Error fetching tech items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingId ? `/api/tech-list/${editingId}` : '/api/tech-list';
      const method = editingId ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        await fetchTechItems();
        resetForm();
      } else {
        alert('Failed to save tech item');
      }
    } catch (error) {
      console.error('Error saving tech item:', error);
      alert('Error saving tech item');
    }
  };

  const handleEdit = (item: TechItem) => {
    setFormData({
      name: item.name,
      url: item.url,
      order: item.order,
      isVisible: item.isVisible
    });
    setEditingId(item._id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this tech item?')) return;
    
    try {
      const response = await fetch(`/api/tech-list/${id}`, { method: 'DELETE' });
      if (response.ok) {
        await fetchTechItems();
      } else {
        alert('Failed to delete tech item');
      }
    } catch (error) {
      console.error('Error deleting tech item:', error);
      alert('Error deleting tech item');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      url: '',
      order: 0,
      isVisible: true
    });
    setEditingId(null);
    setShowForm(false);
  };

  if (loading) return <div className="container">Loading...</div>;

  return (
    <div className="container" style={{ paddingTop: '2em', paddingBottom: '2em' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2em' }}>
          <h1>Manage Tech List</h1>
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
          {showForm ? 'Cancel' : '+ Add New Tech Item'}
        </button>

        {showForm && (
          <form onSubmit={handleSubmit} style={{ marginBottom: '3em', padding: '2em', border: '2px solid #00ffcc', background: '#121212' }}>
            <h2>{editingId ? 'Edit Tech Item' : 'New Tech Item'}</h2>
            
            <div style={{ marginBottom: '1em' }}>
              <label style={{ display: 'block', marginBottom: '0.5em' }}>Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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

            <div style={{ display: 'flex', gap: '2em', alignItems: 'center' }}>
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
              {editingId ? 'Update Tech Item' : 'Create Tech Item'}
            </button>
          </form>
        )}

        <h2>All Tech Items ({techItems.length})</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1em' }}>
          {techItems.map((item) => (
            <div
              key={item._id}
              style={{
                padding: '1em',
                border: '2px solid #00ffcc',
                background: item.isVisible ? '#121212' : '#333',
                opacity: item.isVisible ? 1 : 0.6
              }}
            >
              <div>
                <strong style={{ fontSize: '1.1em' }}>{item.name}</strong>
                <div style={{ fontSize: '0.9em', marginTop: '0.5em', wordBreak: 'break-all' }}>
                  <a href={item.url} target="_blank" rel="noopener noreferrer">{item.url}</a>
                </div>
                {!item.isVisible && <div style={{ color: '#ff6700', marginTop: '0.5em' }}>⚠️ Hidden</div>}
              </div>
              <div style={{ display: 'flex', gap: '0.5em', marginTop: '1em' }}>
                <button
                  onClick={() => handleEdit(item)}
                  style={{
                    flex: 1,
                    padding: '0.5em',
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
                  onClick={() => handleDelete(item._id)}
                  style={{
                    flex: 1,
                    padding: '0.5em',
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
          ))}
        </div>
      </div>
    </div>
  );
}

