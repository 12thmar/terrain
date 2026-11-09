import React, { useRef, useState } from 'react';
import { gps } from 'exifr';

export default function PhotoUpload({ onUploaded, onGps }) {
    const inputRef = useRef();
    const [photos, setPhotos] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const csrf = document.querySelector('meta[name=csrf-token]')?.content;

    async function handleFiles(files) {
        const list = Array.from(files).filter(f => f.type.startsWith('image/'));
        if (!list.length) return;

        setUploading(true);
        const results = [];

        for (const file of list) {
            const preview = URL.createObjectURL(file);

            // Extract GPS from EXIF before upload
            let coords = null;
            try {
                const exif = await gps(file);
                if (exif?.latitude && exif?.longitude) {
                    coords = { lat: exif.latitude, lng: exif.longitude };
                }
            } catch (_) {}

            // Upload to backend
            const form = new FormData();
            form.append('file', file);
            form.append('_token', csrf);

            let result = null;
            try {
                const res = await fetch('/upload/photo', { method: 'POST', body: form });
                result = await res.json();
            } catch (err) {
                console.error('Upload failed', err);
            }

            if (result?.url) {
                const entry = { preview, url: result.url, key: result.key, coords };
                results.push(entry);
                if (coords) onGps?.(coords);
                onUploaded?.(entry);
            }
        }

        setPhotos(prev => [...prev, ...results]);
        setUploading(false);
    }

    function remove(key) {
        setPhotos(prev => prev.filter(p => p.key !== key));
    }

    return (
        <div>
            <div
                onClick={() => inputRef.current.click()}
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={e => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
                className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors"
                style={{
                    borderColor: dragOver ? '#c47c3a' : '#d4cab8',
                    background: dragOver ? '#fdf6ec' : '#fdfaf5',
                }}
            >
                {uploading ? (
                    <p className="text-sm" style={{ color: '#c47c3a' }}>Uploading…</p>
                ) : (
                    <>
                        <p className="text-sm font-medium" style={{ color: '#1e3a2f' }}>
                            Drop farm photos here, or click to select
                        </p>
                        <p className="text-xs mt-1" style={{ color: '#9aab9f' }}>
                            GPS location will be read automatically from photo metadata
                        </p>
                    </>
                )}
            </div>
            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={e => handleFiles(e.target.files)}
            />

            {photos.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-3">
                    {photos.map(p => (
                        <div key={p.key} className="relative group">
                            <img
                                src={p.preview}
                                alt=""
                                className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                            />
                            {p.coords && (
                                <span
                                    className="absolute bottom-1 left-1 text-xs px-1 rounded"
                                    style={{ background: 'rgba(30,58,47,0.75)', color: '#fff', fontSize: '9px' }}
                                >
                                    GPS
                                </span>
                            )}
                            <button
                                type="button"
                                onClick={() => remove(p.key)}
                                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                                style={{ background: '#c0392b' }}
                            >
                                ×
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
