import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Center of Ethiopia — sensible default when no coords are known yet.
const ETHIOPIA = { lat: 9.145, lng: 40.4897 };

// CSS-only teardrop pin so we don't depend on Leaflet's default marker PNGs
// (those break under Vite's asset hashing without extra config).
const pinIcon = L.divIcon({
    className: '',
    html: `<div style="
        width:22px;height:22px;border-radius:50% 50% 50% 0;
        background:#c47c3a;border:2px solid #fff;
        transform:rotate(-45deg);
        box-shadow:0 1px 4px rgba(0,0,0,0.4);
    "></div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 22],
});

export default function MapPicker({ value, onChange, readOnly = false }) {
    const containerRef = useRef(null);
    const mapRef = useRef(null);
    const markerRef = useRef(null);
    // Keep a live ref to onChange so map handlers always call the latest one.
    const onChangeRef = useRef(onChange);
    onChangeRef.current = onChange;

    // Initialise the map once.
    useEffect(() => {
        const start = value?.lat && value?.lng ? value : ETHIOPIA;
        const map = L.map(containerRef.current, {
            center: [start.lat, start.lng],
            zoom: value?.lat && value?.lng ? 13 : 5,
            scrollWheelZoom: false,
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors',
            maxZoom: 19,
        }).addTo(map);

        const marker = L.marker([start.lat, start.lng], {
            icon: pinIcon,
            draggable: !readOnly,
            opacity: value?.lat && value?.lng ? 1 : 0, // hidden until a point is set
        }).addTo(map);

        if (!readOnly) {
            marker.on('dragend', () => {
                const { lat, lng } = marker.getLatLng();
                onChangeRef.current?.({ lat, lng });
            });

            map.on('click', (e) => {
                const { lat, lng } = e.latlng;
                marker.setLatLng([lat, lng]).setOpacity(1);
                onChangeRef.current?.({ lat, lng });
            });
        }

        mapRef.current = map;
        markerRef.current = marker;

        // Leaflet mis-sizes if the container animates in; nudge it next frame.
        setTimeout(() => map.invalidateSize(), 0);

        return () => {
            map.remove();
            mapRef.current = null;
            markerRef.current = null;
        };
    }, []);

    // Reflect external coord changes (EXIF autofill, manual typing) onto the map.
    useEffect(() => {
        const map = mapRef.current;
        const marker = markerRef.current;
        if (!map || !marker) return;
        if (value?.lat == null || value?.lng == null || value.lat === '' || value.lng === '') return;

        const lat = Number(value.lat);
        const lng = Number(value.lng);
        if (Number.isNaN(lat) || Number.isNaN(lng)) return;

        const cur = marker.getLatLng();
        if (Math.abs(cur.lat - lat) > 1e-7 || Math.abs(cur.lng - lng) > 1e-7 || marker.options.opacity === 0) {
            marker.setLatLng([lat, lng]).setOpacity(1);
            map.setView([lat, lng], Math.max(map.getZoom(), 13));
        }
    }, [value?.lat, value?.lng]);

    return (
        <div
            ref={containerRef}
            className="rounded-lg overflow-hidden border"
            style={{ height: 260, borderColor: '#d4cab8', zIndex: 0 }}
        />
    );
}
