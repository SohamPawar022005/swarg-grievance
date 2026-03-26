import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Complaint } from '@/data/mockData';

type MapStyleKey = 'dark' | 'satellite' | 'streets';
type LayerMode = 'heatmap' | 'points' | 'both';

type GrievanceMapProps = {
  grievances: Complaint[];
};

type GrievancePoint = {
  id: string;
  lat: number;
  lng: number;
  state: string;
  district: string;
  priority: Complaint['priority'];
  status: Complaint['status'];
  title: string;
  createdAt: string;
};

type StateAggregate = {
  name: string;
  count: number;
  unresolved: number;
  highPriority: number;
  lat: number;
  lng: number;
};

const TOKENS = {
  bg: '#09090b',
  panel: 'rgba(9,9,11,0.96)',
  border: 'rgba(255,255,255,0.1)',
  text: '#f4f4f5',
  muted: 'rgba(255,255,255,0.6)',
  accent: '#f97316',
  danger: '#ef4444',
  warn: '#fbbf24',
  ok: '#22c55e',
};

const DISTRICT_COORDS: Record<string, [number, number]> = {
  Varanasi: [82.9739, 25.3176],
  Lucknow: [80.9462, 26.8467],
  Kanpur: [80.3319, 26.4499],
};

const MAP_STYLES: Record<MapStyleKey, string> = {
  dark: 'mapbox://styles/mapbox/dark-v11',
  satellite: 'mapbox://styles/mapbox/satellite-streets-v12',
  streets: 'mapbox://styles/mapbox/streets-v12',
};

const GrievanceMap = ({ grievances }: GrievanceMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const refreshLayersRef = useRef<() => void>(() => undefined);

  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapStyle, setMapStyle] = useState<MapStyleKey>('dark');
  const [layerMode, setLayerMode] = useState<LayerMode>('heatmap');
  const [selectedState, setSelectedState] = useState<StateAggregate | null>(null);
  const [priorityFilter, setPriorityFilter] = useState<'all' | Complaint['priority']>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | Complaint['status']>('all');

  const token = (import.meta.env.VITE_MAPBOX_KEY as string | undefined)?.trim();
  const hasToken = Boolean(token && token.startsWith('pk.'));

  const points = useMemo<GrievancePoint[]>(() => {
    return grievances
      .map((g) => {
        const coords = DISTRICT_COORDS[g.location.district];
        if (!coords) return null;

        const jitterLng = coords[0] + (Math.random() - 0.5) * 0.2;
        const jitterLat = coords[1] + (Math.random() - 0.5) * 0.2;

        return {
          id: g.id,
          lat: jitterLat,
          lng: jitterLng,
          state: g.location.state,
          district: g.location.district,
          priority: g.priority,
          status: g.status,
          title: g.title,
          createdAt: g.createdAt,
        };
      })
      .filter((v): v is GrievancePoint => Boolean(v));
  }, [grievances]);

  const filteredPoints = useMemo(() => {
    return points.filter((p) => {
      const priorityOk = priorityFilter === 'all' || p.priority === priorityFilter;
      const statusOk = statusFilter === 'all' || p.status === statusFilter;
      return priorityOk && statusOk;
    });
  }, [points, priorityFilter, statusFilter]);

  const stateAggregates = useMemo<StateAggregate[]>(() => {
    const grouped = new Map<string, { pts: GrievancePoint[] }>();

    for (const p of filteredPoints) {
      if (!grouped.has(p.state)) grouped.set(p.state, { pts: [] });
      grouped.get(p.state)?.pts.push(p);
    }

    const unresolvedStatus = new Set(['pending', 'assigned', 'escalated']);

    return Array.from(grouped.entries()).map(([stateName, data]) => {
      const count = data.pts.length;
      const unresolved = data.pts.filter((p) => unresolvedStatus.has(p.status)).length;
      const highPriority = data.pts.filter((p) => p.priority === 'high' || p.priority === 'emergency').length;
      const lat = data.pts.reduce((sum, p) => sum + p.lat, 0) / Math.max(count, 1);
      const lng = data.pts.reduce((sum, p) => sum + p.lng, 0) / Math.max(count, 1);

      return {
        name: stateName,
        count,
        unresolved,
        highPriority,
        lat,
        lng,
      };
    });
  }, [filteredPoints]);

  const geojson = useMemo(() => {
    return {
      type: 'FeatureCollection' as const,
      features: filteredPoints.map((p) => ({
        type: 'Feature' as const,
        geometry: {
          type: 'Point' as const,
          coordinates: [p.lng, p.lat] as [number, number],
        },
        properties: {
          id: p.id,
          state: p.state,
          district: p.district,
          title: p.title,
          priority: p.priority,
          status: p.status,
          weight: p.priority === 'emergency' ? 1 : p.priority === 'high' ? 0.8 : p.priority === 'medium' ? 0.55 : 0.35,
        },
      })),
    };
  }, [filteredPoints]);

  const clearStateMarkers = useCallback(() => {
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];
  }, []);

  const addStateMarkers = useCallback(() => {
    if (!map.current) return;

    clearStateMarkers();

    stateAggregates.forEach((state) => {
      const markerEl = document.createElement('button');
      markerEl.type = 'button';
      markerEl.style.cssText = [
        'background: rgba(9,9,11,0.88)',
        `border: 1px solid ${TOKENS.border}`,
        'border-radius: 8px',
        'padding: 6px 8px',
        'cursor: pointer',
        'display: flex',
        'flex-direction: column',
        'align-items: center',
        `color: ${TOKENS.text}`,
      ].join(';');

      markerEl.innerHTML = `
        <span style="font-size:11px;font-weight:700;color:${TOKENS.accent}">${state.count}</span>
        <span style="font-size:10px;max-width:90px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${state.name}</span>
      `;

      markerEl.onclick = () => {
        setSelectedState(state);
        map.current?.flyTo({ center: [state.lng, state.lat], zoom: 6.5, duration: 1200 });
      };

      const marker = new mapboxgl.Marker({ element: markerEl })
        .setLngLat([state.lng, state.lat])
        .addTo(map.current as mapboxgl.Map);

      markersRef.current.push(marker);
    });
  }, [clearStateMarkers, stateAggregates]);

  const refreshLayers = useCallback(() => {
    if (!map.current || !mapLoaded) return;

    const m = map.current;
    if (!m.isStyleLoaded()) return;

    if (m.getLayer('grievance-heat')) m.removeLayer('grievance-heat');
    if (m.getLayer('grievance-points')) m.removeLayer('grievance-points');
    if (m.getSource('grievances')) m.removeSource('grievances');

    m.addSource('grievances', {
      type: 'geojson',
      data: geojson,
    });

    if (layerMode === 'heatmap' || layerMode === 'both') {
      m.addLayer({
        id: 'grievance-heat',
        type: 'heatmap',
        source: 'grievances',
        paint: {
          'heatmap-weight': ['get', 'weight'],
          'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 0, 1, 9, 3],
          'heatmap-color': [
            'interpolate', ['linear'], ['heatmap-density'],
            0, 'rgba(0,0,0,0)',
            0.15, 'rgba(59,130,246,0.5)',
            0.35, 'rgba(34,197,94,0.65)',
            0.55, 'rgba(251,191,36,0.8)',
            0.75, 'rgba(249,115,22,0.9)',
            1, 'rgba(239,68,68,1)',
          ],
          'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 0, 20, 9, 34],
          'heatmap-opacity': ['interpolate', ['linear'], ['zoom'], 7, 1, 10, 0.2],
        },
      });
    }

    if (layerMode === 'points' || layerMode === 'both') {
      m.addLayer({
        id: 'grievance-points',
        type: 'circle',
        source: 'grievances',
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 4, 4, 10, 10],
          'circle-color': '#f97316',
          'circle-stroke-color': '#ffffff',
          'circle-stroke-width': 1,
          'circle-opacity': 0.8,
        },
      });
    }

    addStateMarkers();
  }, [mapLoaded, geojson, layerMode, addStateMarkers]);

  useEffect(() => {
    refreshLayersRef.current = refreshLayers;
  }, [refreshLayers]);

  useEffect(() => {
    if (!mapContainer.current || map.current || !hasToken || !token) return;

    mapboxgl.accessToken = token;
    const mapboxMaybe = mapboxgl as unknown as { setTelemetryEnabled?: (enabled: boolean) => void };
    if (typeof mapboxMaybe.setTelemetryEnabled === 'function') {
      mapboxMaybe.setTelemetryEnabled(false);
    }

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: MAP_STYLES.dark,
      center: [78.9629, 22.5937],
      zoom: 4.5,
      minZoom: 3,
      maxZoom: 15,
      pitch: 0,
      bearing: 0,
    });

    map.current.addControl(new mapboxgl.NavigationControl({ showCompass: true }), 'top-right');
    map.current.addControl(new mapboxgl.FullscreenControl(), 'top-right');

    map.current.on('style.load', () => {
      map.current?.setFog({
        'horizon-blend': 0.08,
        color: '#1a1a2e',
        'high-color': '#0e0e1a',
        'space-color': '#05050a',
        'star-intensity': 0.1,
      });

      refreshLayersRef.current();
    });

    map.current.on('load', () => {
      setMapLoaded(true);
    });

    return () => {
      clearStateMarkers();
      map.current?.remove();
      map.current = null;
      setMapLoaded(false);
    };
  }, [hasToken, token, clearStateMarkers]);

  useEffect(() => {
    if (map.current) {
      map.current.setStyle(MAP_STYLES[mapStyle]);
    }
  }, [mapStyle]);

  useEffect(() => {
    refreshLayers();
  }, [refreshLayers]);

  const unresolvedCount = filteredPoints.filter((p) => p.status !== 'resolved').length;
  const criticalCount = filteredPoints.filter((p) => p.priority === 'high' || p.priority === 'emergency').length;

  if (!hasToken) {
    return (
      <div style={{
        border: '1px solid var(--gov-border)',
        borderRadius: '8px',
        background: '#f8fafc',
        padding: '20px',
      }}>
        <p style={{ fontSize: '16px', fontWeight: 600, color: 'var(--gov-navy)', marginBottom: '8px' }}>
          Mapbox key not configured
        </p>
        <p style={{ fontSize: '13px', color: 'var(--gov-text-muted)', marginBottom: '8px' }}>
          Add your key in .env using:
        </p>
        <code style={{ fontSize: '12px', background: '#e5e7eb', padding: '4px 8px', borderRadius: '4px' }}>
          VITE_MAPBOX_KEY=pk.your_actual_mapbox_key
        </code>
      </div>
    );
  }

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: '78vh',
      background: TOKENS.bg,
      borderRadius: '10px',
      overflow: 'hidden',
      border: `1px solid ${TOKENS.border}`,
      fontFamily: 'system-ui, sans-serif',
    }}>
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 2,
        background: 'rgba(9,9,11,0.85)',
        borderBottom: `1px solid ${TOKENS.border}`,
        padding: '10px 12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ color: TOKENS.text, fontSize: '12px', fontWeight: 700 }}>Grievance Heatmap</span>
          <span style={{ color: TOKENS.muted, fontSize: '11px' }}>Total: {filteredPoints.length}</span>
          <span style={{ color: TOKENS.warn, fontSize: '11px' }}>Unresolved: {unresolvedCount}</span>
          <span style={{ color: TOKENS.danger, fontSize: '11px' }}>Critical: {criticalCount}</span>
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button type="button" onClick={() => setMapStyle('dark')} style={{ fontSize: '11px', padding: '4px 8px' }}>Dark</button>
          <button type="button" onClick={() => setMapStyle('satellite')} style={{ fontSize: '11px', padding: '4px 8px' }}>Satellite</button>
          <button type="button" onClick={() => setMapStyle('streets')} style={{ fontSize: '11px', padding: '4px 8px' }}>Streets</button>
        </div>
      </div>

      <div style={{
        position: 'absolute',
        top: 44,
        left: 10,
        zIndex: 2,
        background: TOKENS.panel,
        border: `1px solid ${TOKENS.border}`,
        borderRadius: '8px',
        padding: '10px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
      }}>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button type="button" onClick={() => setLayerMode('heatmap')} style={{ fontSize: '11px', padding: '4px 8px' }}>Heatmap</button>
          <button type="button" onClick={() => setLayerMode('points')} style={{ fontSize: '11px', padding: '4px 8px' }}>Points</button>
          <button type="button" onClick={() => setLayerMode('both')} style={{ fontSize: '11px', padding: '4px 8px' }}>Both</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value as 'all' | Complaint['priority'])}>
            <option value="all">All priority</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="emergency">Emergency</option>
          </select>

          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as 'all' | Complaint['status'])}>
            <option value="all">All status</option>
            <option value="pending">Pending</option>
            <option value="assigned">Assigned</option>
            <option value="resolved">Resolved</option>
            <option value="escalated">Escalated</option>
          </select>
        </div>

        <button
          type="button"
          onClick={() => {
            setSelectedState(null);
            map.current?.flyTo({ center: [78.9629, 22.5937], zoom: 4.5, duration: 1200 });
          }}
          style={{ fontSize: '11px', padding: '6px 8px' }}
        >
          Reset India View
        </button>
      </div>

      {selectedState && (
        <div style={{
          position: 'absolute',
          top: 44,
          right: 10,
          zIndex: 2,
          width: 260,
          background: TOKENS.panel,
          border: `1px solid ${TOKENS.border}`,
          borderRadius: '8px',
          padding: '12px',
          color: TOKENS.text,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <strong style={{ fontSize: '14px' }}>{selectedState.name}</strong>
            <button type="button" onClick={() => setSelectedState(null)}>x</button>
          </div>
          <div style={{ fontSize: '12px', color: TOKENS.muted }}>Total: {selectedState.count}</div>
          <div style={{ fontSize: '12px', color: TOKENS.danger }}>High priority: {selectedState.highPriority}</div>
          <div style={{ fontSize: '12px', color: TOKENS.warn }}>Unresolved: {selectedState.unresolved}</div>
        </div>
      )}

      <div ref={mapContainer} style={{ position: 'absolute', inset: 0 }} />
    </div>
  );
};

export default GrievanceMap;
