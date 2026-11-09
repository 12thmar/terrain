import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import FarmRegister from './pages/FarmRegister';

const el = document.getElementById('app');
const initialPage = el.dataset.page;
const supplier = el.dataset.supplier !== 'null' ? JSON.parse(el.dataset.supplier) : null;
const error = el.dataset.error || null;

function App() {
    const [page, setPage] = useState(initialPage);

    if (page === 'dashboard') {
        return <Dashboard supplier={supplier} navigate={setPage} />;
    }
    if (page === 'farm-register') {
        return <FarmRegister supplier={supplier} navigate={setPage} />;
    }
    return <Login error={error} />;
}

createRoot(el).render(<App />);
