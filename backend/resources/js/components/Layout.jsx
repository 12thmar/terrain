import React from 'react';

export default function Layout({ supplier, children }) {
    const csrf = document.querySelector('meta[name=csrf-token]')?.content;

    return (
        <div className="min-h-screen" style={{ background: '#f7f2ea' }}>
            <nav style={{ background: '#1e3a2f' }}>
                <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
                    <span className="text-white font-bold tracking-tight text-lg">Terrain</span>
                    <div className="flex items-center gap-4">
                        {supplier?.avatar && (
                            <img src={supplier.avatar} alt="" className="w-7 h-7 rounded-full" />
                        )}
                        <span className="text-sm text-white/70">{supplier?.email}</span>
                        <form action="/auth/logout" method="POST" className="inline">
                            <input type="hidden" name="_token" value={csrf} />
                            <button type="submit" className="text-xs text-white/50 hover:text-white/80 transition-colors">
                                Sign out
                            </button>
                        </form>
                    </div>
                </div>
            </nav>
            <main className="max-w-6xl mx-auto px-6 py-8">
                {children}
            </main>
        </div>
    );
}
