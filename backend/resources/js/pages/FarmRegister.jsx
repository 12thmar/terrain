import React, { useState } from 'react';
import Layout from '../components/Layout';
import PhotoUpload from '../components/PhotoUpload';

const REGIONS = ['Guji', 'Yirgacheffe', 'Sidama', 'Jimma', 'Limu', 'Harrar', 'Other'];

export default function FarmRegister({ supplier, navigate }) {
    const csrf = document.querySelector('meta[name=csrf-token]')?.content;

    const [form, setForm] = useState({
        name: '',
        region: '',
        altitude_min: '',
        altitude_max: '',
        variety: 'Heirloom Ethiopian',
        harvest_months: '',
        size_hectares: '',
        latitude: '',
        longitude: '',
    });
    const [photoKeys, setPhotoKeys] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    function set(field, value) {
        setForm(prev => ({ ...prev, [field]: value }));
    }

    function handleGps({ lat, lng }) {
        // Only auto-fill if not already set
        setForm(prev => ({
            ...prev,
            latitude: prev.latitude || String(lat.toFixed(6)),
            longitude: prev.longitude || String(lng.toFixed(6)),
        }));
    }

    function handleUploaded(entry) {
        setPhotoKeys(prev => [...prev, entry.key]);
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError(null);
        setSubmitting(true);

        try {
            const res = await fetch('/farms', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrf },
                body: JSON.stringify({ ...form, photo_keys: photoKeys }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to save farm');
            setSuccess(true);
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    }

    if (success) {
        return (
            <Layout supplier={supplier}>
                <div className="max-w-lg mx-auto text-center py-16">
                    <div className="text-4xl mb-4">🌱</div>
                    <h2 className="text-xl font-semibold mb-2" style={{ color: '#1e3a2f' }}>
                        Farm registered
                    </h2>
                    <p className="text-sm mb-8" style={{ color: '#5a6e63' }}>
                        Your farm has been submitted for review.
                    </p>
                    <button
                        onClick={() => navigate('dashboard')}
                        className="text-sm font-medium px-6 py-2 rounded-lg text-white transition-opacity hover:opacity-90"
                        style={{ background: '#1e3a2f' }}
                    >
                        Back to dashboard
                    </button>
                </div>
            </Layout>
        );
    }

    return (
        <Layout supplier={supplier}>
            <div className="max-w-2xl mx-auto">
                <button
                    onClick={() => navigate('dashboard')}
                    className="text-sm mb-6 flex items-center gap-1 hover:opacity-70 transition-opacity"
                    style={{ color: '#5a6e63' }}
                >
                    ← Dashboard
                </button>

                <h1 className="text-2xl font-semibold mb-1" style={{ color: '#1e3a2f' }}>
                    Register a farm
                </h1>
                <p className="text-sm mb-8" style={{ color: '#5a6e63' }}>
                    Photos with GPS metadata will auto-fill the location.
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Photos */}
                    <section>
                        <label className="block text-sm font-medium mb-2" style={{ color: '#1e3a2f' }}>
                            Farm photos
                        </label>
                        <PhotoUpload onUploaded={handleUploaded} onGps={handleGps} />
                    </section>

                    {/* Basic info */}
                    <section className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
                        <h2 className="text-sm font-semibold" style={{ color: '#1e3a2f' }}>Farm details</h2>

                        <div>
                            <label className="block text-xs font-medium mb-1" style={{ color: '#5a6e63' }}>
                                Farm name *
                            </label>
                            <input
                                required
                                type="text"
                                value={form.name}
                                onChange={e => set('name', e.target.value)}
                                placeholder="e.g. Kebele Daro Farm"
                                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-800/30"
                                style={{ borderColor: '#d4cab8' }}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium mb-1" style={{ color: '#5a6e63' }}>
                                    Region *
                                </label>
                                <select
                                    required
                                    value={form.region}
                                    onChange={e => set('region', e.target.value)}
                                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-800/30"
                                    style={{ borderColor: '#d4cab8' }}
                                >
                                    <option value="">Select…</option>
                                    {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium mb-1" style={{ color: '#5a6e63' }}>
                                    Size (ha)
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.1"
                                    value={form.size_hectares}
                                    onChange={e => set('size_hectares', e.target.value)}
                                    placeholder="e.g. 2.5"
                                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-800/30"
                                    style={{ borderColor: '#d4cab8' }}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium mb-1" style={{ color: '#5a6e63' }}>
                                    Altitude min (masl)
                                </label>
                                <input
                                    type="number"
                                    value={form.altitude_min}
                                    onChange={e => set('altitude_min', e.target.value)}
                                    placeholder="e.g. 1700"
                                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-800/30"
                                    style={{ borderColor: '#d4cab8' }}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium mb-1" style={{ color: '#5a6e63' }}>
                                    Altitude max (masl)
                                </label>
                                <input
                                    type="number"
                                    value={form.altitude_max}
                                    onChange={e => set('altitude_max', e.target.value)}
                                    placeholder="e.g. 2200"
                                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-800/30"
                                    style={{ borderColor: '#d4cab8' }}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium mb-1" style={{ color: '#5a6e63' }}>
                                    Variety
                                </label>
                                <input
                                    type="text"
                                    value={form.variety}
                                    onChange={e => set('variety', e.target.value)}
                                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-800/30"
                                    style={{ borderColor: '#d4cab8' }}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium mb-1" style={{ color: '#5a6e63' }}>
                                    Harvest months
                                </label>
                                <input
                                    type="text"
                                    value={form.harvest_months}
                                    onChange={e => set('harvest_months', e.target.value)}
                                    placeholder="e.g. Oct–Jan"
                                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-800/30"
                                    style={{ borderColor: '#d4cab8' }}
                                />
                            </div>
                        </div>
                    </section>

                    {/* Location */}
                    <section className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-sm font-semibold" style={{ color: '#1e3a2f' }}>Location</h2>
                            {form.latitude && form.longitude && (
                                <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: '#edf7ee', color: '#2d6a4f' }}>
                                    GPS filled from photo
                                </span>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium mb-1" style={{ color: '#5a6e63' }}>
                                    Latitude
                                </label>
                                <input
                                    type="number"
                                    step="any"
                                    value={form.latitude}
                                    onChange={e => set('latitude', e.target.value)}
                                    placeholder="e.g. 6.1250"
                                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-800/30"
                                    style={{ borderColor: '#d4cab8' }}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium mb-1" style={{ color: '#5a6e63' }}>
                                    Longitude
                                </label>
                                <input
                                    type="number"
                                    step="any"
                                    value={form.longitude}
                                    onChange={e => set('longitude', e.target.value)}
                                    placeholder="e.g. 38.7500"
                                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-800/30"
                                    style={{ borderColor: '#d4cab8' }}
                                />
                            </div>
                        </div>
                        <p className="text-xs" style={{ color: '#9aab9f' }}>
                            Upload a photo with GPS metadata and coordinates will fill automatically.
                            Otherwise enter them manually.
                        </p>
                    </section>

                    {error && (
                        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-2">{error}</p>
                    )}

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-8 py-2.5 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                            style={{ background: '#1e3a2f' }}
                        >
                            {submitting ? 'Saving…' : 'Register farm'}
                        </button>
                    </div>
                </form>
            </div>
        </Layout>
    );
}
