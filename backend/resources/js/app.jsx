import React from 'react';
import { createRoot } from 'react-dom/client';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

const el = document.getElementById('app');
const page = el.dataset.page;
const supplier = el.dataset.supplier !== 'null' ? JSON.parse(el.dataset.supplier) : null;
const error = el.dataset.error || null;

const root = createRoot(el);

if (page === 'dashboard') {
    root.render(<Dashboard supplier={supplier} />);
} else {
    root.render(<Login error={error} />);
}
