import React from 'react';
import Layout from '../components/Layout';
import MapPicker from '../components/MapPicker';

const STATE_COLORS = {
    draft:     { bg: '#f5f0e8', text: '#7a6a4f' },
    submitted: { bg: '#e8f0fd', text: '#3a5aad' },
    approved:  { bg: '#edf7ee', text: '#2d6a4f' },
    active:    { bg: '#edf7ee', text: '#1a5235' },
};

const LOCATION_LABEL = {
    exif: 'GPS from photo',
    map: 'Pinned on map',
    manual: 'Entered manually',
};

function Detail({ label, value }) {
    return (
        <div>
            <dt className="text-xs font-medium mb-0.5" style={{ color: '#9aab9f' }}>{label}</dt>
            <dd className="text-sm" style={{ color: '#1e3a2f' }}>{value || '—'}</dd>
        </div>
    );
}

export default function FarmProfile({ supplier, farm, navigate }) {
    if (!farm) {
        return (
            <Layout supplier={supplier}>
                <div className="max-w-lg mx-auto text-center py-16">
                    <p className="text-sm mb-6" style={{ color: '#5a6e63' }}>Farm not found.</p>
                    <button
                        onClick={() => navigate('dashboard')}
                        className="text-sm font-medium px-6 py-2 rounded-lg text-white"
                        style={{ background: '#1e3a2f' }}
                    >
                        Back to dashboard
                    </button>
                </div>
            </Layout>
        );
    }

    const colors = STATE_COLORS[farm.state] || STATE_COLORS.draft;
    const hasCoords = farm.latitude != null && farm.longitude != null
        && farm.latitude !== '' && farm.longitude !== '';
    const altitude = [farm.altitude_min, farm.altitude_max].filter(v => v != null && v !== '');
    const altitudeText = altitude.length
        ? `${altitude.join(' – ')} masl`
        : null;
    const photos = farm.photos || [];

    return (
        <Layout supplier={supplier}>
            <div className="max-w-3xl mx-auto">
                <button
                    onClick={() => navigate('dashboard')}
                    className="text-sm mb-6 flex items-center gap-1 hover:opacity-70 transition-opacity"
                    style={{ color: '#5a6e63' }}
                >
                    ← Dashboard
                </button>

                <div className="flex items-start justify-between gap-3 mb-1">
                    <h1 className="text-2xl font-semibold" style={{ color: '#1e3a2f' }}>
                        {farm.name}
                    </h1>
                    <span
                        className="text-xs px-2.5 py-1 rounded-full shrink-0 capitalize"
                        style={{ background: colors.bg, color: colors.text }}
                    >
                        {farm.state}
                    </span>
                </div>
                <p className="text-sm mb-8" style={{ color: '#5a6e63' }}>
                    {[farm.region, farm.zone].filter(Boolean).join(' · ') || 'No region set'}
                </p>

                {/* Photos */}
                {photos.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
                        {photos.map((p, i) => (
                            <img
                                key={p.key || i}
                                src={p.url}
                                alt={`${farm.name} photo ${i + 1}`}
                                className="w-full h-32 object-cover rounded-lg border"
                                style={{ borderColor: '#e5ddcf' }}
                            />
                        ))}
                    </div>
                ) : (
                    <div
                        className="w-full h-40 flex items-center justify-center text-4xl rounded-xl mb-8"
                        style={{ background: '#f5f0e8' }}
                    >
                        🌱
                    </div>
                )}

                {/* Details */}
                <section className="bg-white rounded-xl border border-gray-100 p-5 mb-6">
                    <h2 className="text-sm font-semibold mb-4" style={{ color: '#1e3a2f' }}>Farm details</h2>
                    <dl className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        <Detail label="Region" value={farm.region} />
                        <Detail label="Altitude" value={altitudeText} />
                        <Detail label="Variety" value={farm.variety} />
                        <Detail label="Harvest months" value={farm.harvest_months} />
                        <Detail label="Size" value={farm.size_hectares ? `${farm.size_hectares} ha` : null} />
                    </dl>
                </section>

                {/* Location */}
                <section className="bg-white rounded-xl border border-gray-100 p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-sm font-semibold" style={{ color: '#1e3a2f' }}>Location</h2>
                        {hasCoords && farm.location_source && (
                            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: '#edf7ee', color: '#2d6a4f' }}>
                                {LOCATION_LABEL[farm.location_source] || 'Location set'}
                            </span>
                        )}
                    </div>

                    {hasCoords ? (
                        <>
                            <MapPicker value={{ lat: farm.latitude, lng: farm.longitude }} readOnly />
                            <p className="text-xs mt-3" style={{ color: '#9aab9f' }}>
                                {Number(farm.latitude).toFixed(6)}, {Number(farm.longitude).toFixed(6)}
                            </p>
                        </>
                    ) : (
                        <p className="text-sm" style={{ color: '#9aab9f' }}>No location recorded for this farm.</p>
                    )}
                </section>
            </div>
        </Layout>
    );
}
