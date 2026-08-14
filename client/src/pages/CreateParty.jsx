import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import API from '../services/api';

const SAMPLE_VIDEOS = [
  {
    title: 'Big Buck Bunny (MP4)',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
  },
  {
    title: 'Sintel Open Movie (MP4)',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4'
  },
  {
    title: 'Tears of Steel Sci-Fi (MP4)',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4'
  }
];

function CreateParty() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    videoUrl: SAMPLE_VIDEOS[0].url
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSelectPreset = (url) => {
    setFormData({ ...formData, videoUrl: url });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, description, videoUrl } = formData;

    if (!name.trim() || !videoUrl.trim()) {
      setError('Please provide a party name and video URL');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const res = await API.post('/parties', { name, description, videoUrl });
      if (res.data.success && res.data.party?.roomId) {
        navigate(`/party/${res.data.party.roomId}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create watch party. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <main style={{ flex: 1, padding: '2.5rem 2rem', maxWidth: '680px', margin: '0 auto', width: '100%' }}>
        <div className="glass-card fade-in">
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Host a Watch Party</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Set up your room details and pick a video to watch together in real time.
            </p>
          </div>

          {error && (
            <div style={{
              background: 'var(--danger-bg)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              color: 'var(--danger)',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.875rem',
              marginBottom: '1.5rem'
            }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Watch Party Name</label>
              <input
                type="text"
                name="name"
                className="form-input"
                placeholder="e.g. Friday Movie Night"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description (Optional)</label>
              <input
                type="text"
                name="description"
                className="form-input"
                placeholder="e.g. Hanging out with college friends"
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Video URL (Direct MP4 / Web Stream)</label>
              <input
                type="url"
                name="videoUrl"
                className="form-input"
                placeholder="https://example.com/video.mp4"
                value={formData.videoUrl}
                onChange={handleChange}
                required
              />
            </div>

            {/* Quick Sample Presets */}
            <div style={{ marginBottom: '1.75rem' }}>
              <label className="form-label" style={{ marginBottom: '0.6rem', display: 'block' }}>
                Or select a sample open-source test video:
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {SAMPLE_VIDEOS.map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectPreset(sample.url)}
                    className="btn btn-secondary"
                    style={{
                      justifyContent: 'flex-start',
                      fontSize: '0.85rem',
                      borderColor: formData.videoUrl === sample.url ? 'var(--primary)' : 'var(--bg-glass-border)',
                      background: formData.videoUrl === sample.url ? 'var(--primary-light)' : 'rgba(255, 255, 255, 0.05)'
                    }}
                  >
                    ▶️ {sample.title}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.9rem', fontSize: '1rem' }}
              disabled={loading}
            >
              {loading ? <span className="spinner"></span> : '🚀 Launch Watch Party'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

export default CreateParty;
