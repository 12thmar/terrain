import React from 'react';
import Layout from '../components/Layout';

const CARDS = [
    { label: 'Farms', icon: '🌱', desc: 'Register and manage your farms', page: 'farm-register' },
    { label: 'Washing Stations', icon: '💧', desc: 'Link farms to washing stations', page: null },
    { label: 'Coffee Lots', icon: '☕', desc: 'Submit lots and price breakdowns', page: null },
];

const STATE_COLORS = {
    draft:     { bg: '#f5f0e8', text: '#7a6a4f' },
    submitted: { bg: '#e8f0fd', text: '#3a5aad' },
    approved:  { bg: '#edf7ee', text: '#2d6a4f' },
    active:    { bg: '#edf7ee', text: '#1a5235' },
};

export default function Dashboard({ supplier, farms = [], navigate }) {
    return (
        <Layout supplier={supplier}>
            <div className="mb-8">
                <h1 className="text-2xl font-semibold" style={{ color: '#1e3a2f' }}>
                    Welcome back{supplier?.name ? `, ${supplier.name.split(' ')[0]}` : ''}
                </h1>
                <p className="text-sm mt-1" style={{ color: '#5a6e63' }}>
                    Your sourcing dashboard
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
                {CARDS.map(card => (
                    <div
                        key={card.label}
                        onClick={() => card.page && navigate(card.page)}
                        className="bg-white rounded-xl border border-gray-100 p-6 transition-shadow"
                        style={{ cursor: card.page ? 'pointer' : 'default' }}
                        onMouseEnter={e => card.page && (e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)')}
                        onMouseLeave={e => (e.currentTarget.style.boxShadow = '')}
                    >
                        <div className="text-2xl mb-3">{card.icon}</div>
                        <h3 className="font-semibold text-sm" style={{ color: '#1e3a2f' }}>{card.label}</h3>
                        <p className="text-xs mt-1" style={{ color: '#9aab9f' }}>{card.desc}</p>
                        <div className="mt-4 text-xs font-medium" style={{ color: '#c47c3a' }}>
                            {card.page ? 'Register →' : 'Coming soon →'}
                        </div>
                    </div>
                ))}
            </div>

            {farms.length > 0 && (
                <section>
                    <h2 className="text-sm font-semibold mb-4" style={{ color: '#1e3a2f' }}>
                        Your farms ({farms.length})
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {farms.map(farm => {
                            const colors = STATE_COLORS[farm.state] || STATE_COLORS.draft;
                            return (
                                <div
                                    key={farm.id}
                                    onClick={() => navigate('farm-profile', farm)}
                                    className="bg-white rounded-xl border border-gray-100 overflow-hidden cursor-pointer transition-shadow"
                                    onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)')}
                                    onMouseLeave={e => (e.currentTarget.style.boxShadow = '')}
                                >
                                    {farm.cover ? (
                                        <img
                                            src={farm.cover}
                                            alt={farm.name}
                                            className="w-full h-32 object-cover"
                                        />
                                    ) : (
                                        <div
                                            className="w-full h-32 flex items-center justify-center text-3xl"
                                            style={{ background: '#f5f0e8' }}
                                        >
                                            🌱
                                        </div>
                                    )}
                                    <div className="p-4">
                                        <div className="flex items-start justify-between gap-2">
                                            <h3 className="font-semibold text-sm leading-tight" style={{ color: '#1e3a2f' }}>
                                                {farm.name}
                                            </h3>
                                            <span
                                                className="text-xs px-2 py-0.5 rounded-full shrink-0 capitalize"
                                                style={{ background: colors.bg, color: colors.text }}
                                            >
                                                {farm.state}
                                            </span>
                                        </div>
                                        <p className="text-xs mt-1" style={{ color: '#9aab9f' }}>{farm.region}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>
            )}
        </Layout>
    );
}
