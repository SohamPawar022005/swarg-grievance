import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { complaints } from '@/data/mockData';

// Replace with your Mapbox access token
const MAPBOX_TOKEN = 'YOUR_MAPBOX_TOKEN_HERE';

const locationCoords: Record<string, [number, number]> = {
  Varanasi: [82.9739, 25.3176],
  Lucknow: [80.9462, 26.8467],
  Kanpur: [80.3319, 26.4499],
};

const MapboxGlobe = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current || MAPBOX_TOKEN === 'YOUR_MAPBOX_TOKEN_HERE') return;

    mapboxgl.accessToken = MAPBOX_TOKEN;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [80.9462, 26.8467],
      zoom: 5,
      projection: 'globe',
    });

    map.current.on('style.load', () => {
      map.current?.setFog({
        color: 'rgb(186, 210, 235)',
        'high-color': 'rgb(36, 92, 223)',
        'horizon-blend': 0.02,
        'space-color': 'rgb(11, 11, 25)',
        'star-intensity': 0.6,
      });
    });

    // District complaint markers
    const districtCounts: Record<string, { total: number; active: number }> = {};
    complaints.forEach(c => {
      const d = c.location.district;
      if (!districtCounts[d]) districtCounts[d] = { total: 0, active: 0 };
      districtCounts[d].total++;
      if (c.status !== 'resolved') districtCounts[d].active++;
    });

    Object.entries(districtCounts).forEach(([district, counts]) => {
      const coords = locationCoords[district];
      if (!coords) return;

      const size = 24 + counts.total * 6;
      const color = counts.active > 3 ? '#dc2626' : counts.active > 1 ? '#f59e0b' : '#2e7d32';

      const el = document.createElement('div');
      Object.assign(el.style, {
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        background: color,
        opacity: '0.75',
        border: '2px solid white',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: '12px',
        fontWeight: '700',
        boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
      });
      el.textContent = String(counts.total);

      new mapboxgl.Marker(el)
        .setLngLat(coords)
        .setPopup(
          new mapboxgl.Popup({ offset: 15 }).setHTML(
            `<div style="font-family:'Noto Sans',sans-serif;font-size:13px;padding:4px">
              <strong style="color:#1a3a5c">${district}</strong><br/>
              Total Complaints: <strong>${counts.total}</strong><br/>
              Active: <strong style="color:#dc2626">${counts.active}</strong><br/>
              Resolved: <strong style="color:#2e7d32">${counts.total - counts.active}</strong>
            </div>`
          )
        )
        .addTo(map.current!);
    });

    map.current.addControl(new mapboxgl.NavigationControl());

    return () => map.current?.remove();
  }, []);

  if (MAPBOX_TOKEN === 'YOUR_MAPBOX_TOKEN_HERE') {
    return (
      <div className="map-placeholder">
        <div>
          <p style={{ fontSize: '16px', fontWeight: 600, color: 'var(--gov-navy)' }}>
            🌍 Mapbox Globe View
          </p>
          <p style={{ fontSize: '13px', color: 'var(--gov-text-muted)', marginTop: '8px' }}>
            To enable the interactive globe, set your Mapbox access token in
          </p>
          <code style={{ background: '#e5e7eb', padding: '4px 8px', borderRadius: '3px', fontSize: '12px', display: 'inline-block', marginTop: '8px' }}>
            src/components/MapboxGlobe.tsx
          </code>
          <p style={{ fontSize: '12px', color: 'var(--gov-text-muted)', marginTop: '12px' }}>
            Get a free token at <a href="https://account.mapbox.com" target="_blank" rel="noreferrer">mapbox.com</a>
          </p>
        </div>
      </div>
    );
  }

  return <div ref={mapContainer} className="map-container" />;
};

export default MapboxGlobe;
