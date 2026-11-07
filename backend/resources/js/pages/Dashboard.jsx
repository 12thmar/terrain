import React from 'react';
import Layout from '../components/Layout';

export default function Dashboard({ supplier }) {
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {[
                    { label: 'Farms', icon: '🌱', desc: 'Register and manage your farms' },
                    { label: 'Washing Stations', icon: '💧', desc: 'Link farms to washing stations' },
                    { label: 'Coffee Lots', icon: '☕', desc: 'Submit lots and price breakdowns' },
                ].map(card => (
                    <div key={card.label} className="bg-white rounded-xl border border-gray-100 p-6 hover:shadow-md transition-shadow cursor-pointer">
                        <div className="text-2xl mb-3">{card.icon}</div>
                        <h3 className="font-semibold text-sm" style={{ color: '#1e3a2f' }}>{card.label}</h3>
                        <p className="text-xs mt-1" style={{ color: '#9aab9f' }}>{card.desc}</p>
                        <div className="mt-4 text-xs font-medium" style={{ color: '#c47c3a' }}>
                            Coming soon →
                        </div>
                    </div>
                ))}
            </div>
        </Layout>
    );
}
