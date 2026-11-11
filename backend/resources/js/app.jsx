import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import FarmRegister from './pages/FarmRegister';
import FarmProfile from './pages/FarmProfile';

const el = document.getElementById('app');
const initialPage = el.dataset.page;
const supplier = el.dataset.supplier !== 'null' ? JSON.parse(el.dataset.supplier) : null;
const initialFarms = JSON.parse(el.dataset.farms || '[]');
const error = el.dataset.error || null;

function App() {
    const [page, setPage] = useState(initialPage);
    const [farms, setFarms] = useState(initialFarms);
    const [selectedFarm, setSelectedFarm] = useState(null);

    function navigate(p, payload) {
        // Refresh farms list when returning to dashboard after registration
        if (p === 'dashboard') {
            fetch('/farms')
                .then(r => r.json())
                .then(data => setFarms(data))
                .catch(() => {});
        }
        if (p === 'farm-profile') {
            setSelectedFarm(payload);
        }
        setPage(p);
    }

    if (page === 'dashboard') {
        return <Dashboard supplier={supplier} farms={farms} navigate={navigate} />;
    }
    if (page === 'farm-register') {
        return <FarmRegister supplier={supplier} navigate={navigate} />;
    }
    if (page === 'farm-profile') {
        return <FarmProfile supplier={supplier} farm={selectedFarm} navigate={navigate} />;
    }
    return <Login error={error} />;
}

createRoot(el).render(<App />);
