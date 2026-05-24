import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import getApiBase from '../utils/apiBase';
import { useAuth } from '../context/AuthContext';

export default function ProfileModal({ onClose }) {
  const { token } = useAuth();
  const [profile, setProfile] = useState({ age: '', height: '', weight: '', gender: '', goal: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${getApiBase()}/api/user/profile`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data) {
          setProfile({
            age: data.age || '',
            height: data.height || '',
            weight: data.weight || '',
            gender: data.gender || '',
            goal: data.goal || ''
          });
        }
      } catch (err) {
        console.error("Failed to fetch profile", err);
      }
    };
    fetchProfile();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await fetch(`${getApiBase()}/api/user/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          age: Number(profile.age) || undefined,
          height: Number(profile.height) || undefined,
          weight: Number(profile.weight) || undefined,
          gender: profile.gender,
          goal: profile.goal
        })
      });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (err) {
      console.error("Failed to save profile", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-md" onClick={onClose}></div>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative bg-[var(--app-surface)] rounded-3xl shadow-2xl border border-[var(--app-border)] p-6 max-w-md w-full"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-[var(--app-text)]">Health Profile</h2>
          <button onClick={onClose} className="text-[var(--app-text-muted)] hover:text-[var(--app-text)]">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p className="text-sm text-[var(--app-text-muted)] mb-4">
          BiteTrack AI uses this data to calculate your personalized daily calorie requirements.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--app-text)] mb-1">Age (Years)</label>
              <input type="number" min="1" max="120" value={profile.age} onChange={e => setProfile({...profile, age: e.target.value})} className="w-full px-4 py-2 bg-[var(--app-surface-soft)] border border-[var(--app-border)] rounded-xl text-[var(--app-text)] focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--app-text)] mb-1">Gender</label>
              <select value={profile.gender} onChange={e => setProfile({...profile, gender: e.target.value})} className="w-full px-4 py-2 bg-[var(--app-surface-soft)] border border-[var(--app-border)] rounded-xl text-[var(--app-text)] focus:ring-2 focus:ring-blue-500 outline-none">
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--app-text)] mb-1">Height (cm)</label>
              <input type="number" min="50" max="300" value={profile.height} onChange={e => setProfile({...profile, height: e.target.value})} className="w-full px-4 py-2 bg-[var(--app-surface-soft)] border border-[var(--app-border)] rounded-xl text-[var(--app-text)] focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--app-text)] mb-1">Weight (kg)</label>
              <input type="number" min="20" max="300" value={profile.weight} onChange={e => setProfile({...profile, weight: e.target.value})} className="w-full px-4 py-2 bg-[var(--app-surface-soft)] border border-[var(--app-border)] rounded-xl text-[var(--app-text)] focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
          </div>

          <button type="submit" disabled={isLoading} className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2">
            {isLoading ? 'Saving...' : (isSaved ? 'Saved! ✨' : 'Save Profile')}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
