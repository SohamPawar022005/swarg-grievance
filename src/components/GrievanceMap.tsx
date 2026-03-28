import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Viewer,
  Ion,
  Cartesian3,
  Math as CesiumMath,
  Color,
  VerticalOrigin,
  HorizontalOrigin,
  HeightReference,
  defined,
  ScreenSpaceEventHandler,
  ScreenSpaceEventType,
} from 'cesium';
import 'cesium/Build/Cesium/Widgets/widgets.css';
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

const GrievanceMap = ({ grievances }: GrievanceMapProps) => {
  const mapRootRef = useRef<HTMLDivElement>(null);
  const cesiumContainer = useRef<HTMLDivElement>(null);
  const viewer = useRef<Viewer | null>(null);
  const entitiesRef = useRef<any[]>([]);

  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapStyle, setMapStyle] = useState<MapStyleKey>('dark');
  const [layerMode, setLayerMode] = useState<LayerMode>('points');
  const [selectedState, setSelectedState] = useState<StateAggregate | null>(null);
  const [priorityFilter, setPriorityFilter] = useState<'all' | Complaint['priority']>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | Complaint['status']>('all');
  const [isFullscreen, setIsFullscreen] = useState(false);

  const token = (import.meta.env.VITE_CESIUM_TOKEN as string | undefined)?.trim();
  const hasToken = Boolean(token);

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

  const clearEntities = useCallback(() => {
    if (!viewer.current) return;
    entitiesRef.current.forEach((entity) => {
      viewer.current?.entities.remove(entity);
    });
    entitiesRef.current = [];
  }, []);

  const addPointEntities = useCallback(() => {
    if (!viewer.current) return;

    filteredPoints.forEach((p) => {
      const color = 
        p.priority === 'emergency' ? Color.fromCssColorString('#ef4444') :
        p.priority === 'high' ? Color.fromCssColorString('#f97316') :
        p.priority === 'medium' ? Color.fromCssColorString('#fbbf24') :
        Color.fromCssColorString('#3b82f6');

      const entity = viewer.current!.entities.add({
        position: Cartesian3.fromDegrees(p.lng, p.lat, 0),
        point: {
          pixelSize: 10,
          color: color.withAlpha(0.8),
          outlineColor: Color.WHITE,
          outlineWidth: 1,
          heightReference: HeightReference.CLAMP_TO_GROUND,
        },
        properties: {
          id: p.id,
          title: p.title,
          priority: p.priority,
          status: p.status,
          district: p.district,
          state: p.state,
        },
      });

      entitiesRef.current.push(entity);
    });
  }, [filteredPoints]);

  const addStateMarkers = useCallback(() => {
    if (!viewer.current) return;

    stateAggregates.forEach((state) => {
      const label = viewer.current!.entities.add({
        position: Cartesian3.fromDegrees(state.lng, state.lat, 50000),
        label: {
          text: `${state.name}\n${state.count}`,
          font: '14px sans-serif',
          fillColor: Color.fromCssColorString(TOKENS.text),
          outlineColor: Color.BLACK,
          outlineWidth: 2,
          style: 0,
          verticalOrigin: VerticalOrigin.CENTER,
          horizontalOrigin: HorizontalOrigin.CENTER,
          pixelOffset: { x: 0, y: 0 } as any,
          heightReference: HeightReference.RELATIVE_TO_GROUND,
        },
        properties: {
          type: 'state-label',
          state: state.name,
          count: state.count,
          unresolved: state.unresolved,
          highPriority: state.highPriority,
        },
      });

      entitiesRef.current.push(label);
    });
  }, [stateAggregates]);

  const refreshEntities = useCallback(() => {
    if (!viewer.current || !mapLoaded) return;

    clearEntities();

    if (layerMode === 'points' || layerMode === 'both') {
      addPointEntities();
    }

    addStateMarkers();
  }, [mapLoaded, layerMode, addPointEntities, addStateMarkers, clearEntities]);

  // Initialize Cesium viewer
  useEffect(() => {
    if (!cesiumContainer.current || viewer.current || !hasToken || !token) return;

    Ion.defaultAccessToken = token;

    viewer.current = new Viewer(cesiumContainer.current, {
      animation: false,
      timeline: false,
      baseLayerPicker: true,
      geocoder: false,
      homeButton: true,
      sceneModePicker: true,
      navigationHelpButton: false,
      fullscreenButton: true,
      fullscreenElement: mapRootRef.current ?? undefined,
      vrButton: false,
      scene3DOnly: false,
      shadows: false,
      terrainProvider: undefined,
    });

    // Set initial camera position over India
    viewer.current.camera.setView({
      destination: Cartesian3.fromDegrees(78.9629, 22.5937, 2000000),
      orientation: {
        heading: CesiumMath.toRadians(0),
        pitch: CesiumMath.toRadians(-45),
        roll: 0,
      },
    });

    // Add click handler for entities
    const handler = new ScreenSpaceEventHandler(viewer.current.scene.canvas);
    handler.setInputAction((click: any) => {
      const pickedObject = viewer.current?.scene.pick(click.position);
      if (defined(pickedObject) && defined(pickedObject.id)) {
        const entity = pickedObject.id;
        if (entity.properties) {
          const type = entity.properties.type?.getValue();
          if (type === 'state-label') {
            const stateName = entity.properties.state?.getValue();
            const stateData = stateAggregates.find(s => s.name === stateName);
            if (stateData) {
              setSelectedState(stateData);
              viewer.current?.camera.flyTo({
                destination: Cartesian3.fromDegrees(stateData.lng, stateData.lat, 500000),
                duration: 2,
              });
            }
          }
        }
      }
    }, ScreenSpaceEventType.LEFT_CLICK);

    setMapLoaded(true);

    return () => {
      handler.destroy();
      clearEntities();
      viewer.current?.destroy();
      viewer.current = null;
      setMapLoaded(false);
    };
  }, [hasToken, token, clearEntities, stateAggregates]);

  // Refresh entities when dependencies change
  useEffect(() => {
    refreshEntities();
  }, [refreshEntities]);

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === mapRootRef.current);
    };

    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

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
          Cesium token not configured
        </p>
        <p style={{ fontSize: '13px', color: 'var(--gov-text-muted)', marginBottom: '8px' }}>
          Add your token in .env using:
        </p>
        <code style={{ fontSize: '12px', background: '#e5e7eb', padding: '4px 8px', borderRadius: '4px' }}>
          VITE_CESIUM_TOKEN=your_cesium_token_here
        </code>
      </div>
    );
  }

  return (
    <div ref={mapRootRef} style={{
      position: 'relative',
      width: '100%',
      height: isFullscreen ? '100vh' : '78vh',
      background: TOKENS.bg,
      borderRadius: isFullscreen ? '0' : '10px',
      overflow: 'hidden',
      border: `1px solid ${TOKENS.border}`,
      fontFamily: 'system-ui, sans-serif',
    }}>
      {/* Top toolbar */}
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
          <span style={{ color: TOKENS.text, fontSize: '12px', fontWeight: 700 }}>Grievance Map (3D Globe)</span>
          <span style={{ color: TOKENS.muted, fontSize: '11px' }}>Total: {filteredPoints.length}</span>
          <span style={{ color: TOKENS.warn, fontSize: '11px' }}>Unresolved: {unresolvedCount}</span>
          <span style={{ color: TOKENS.danger, fontSize: '11px' }}>Critical: {criticalCount}</span>
        </div>
      </div>

      {/* Left control panel */}
      <div style={{
        position: 'absolute',
        top: 54,
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
        <div style={{ display: 'flex', gap: '6px', flexDirection: 'column' }}>
          <button 
            type="button" 
            onClick={() => setLayerMode('points')} 
            style={{ 
              fontSize: '11px', 
              padding: '4px 8px',
              background: layerMode === 'points' ? TOKENS.accent : 'transparent',
              color: TOKENS.text,
              border: `1px solid ${TOKENS.border}`,
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Points
          </button>
          <button 
            type="button" 
            onClick={() => setLayerMode('both')} 
            style={{ 
              fontSize: '11px', 
              padding: '4px 8px',
              background: layerMode === 'both' ? TOKENS.accent : 'transparent',
              color: TOKENS.text,
              border: `1px solid ${TOKENS.border}`,
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            With Labels
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <select 
            value={priorityFilter} 
            onChange={(e) => setPriorityFilter(e.target.value as 'all' | Complaint['priority'])}
            style={{
              fontSize: '11px',
              padding: '4px 8px',
              background: TOKENS.bg,
              color: TOKENS.text,
              border: `1px solid ${TOKENS.border}`,
              borderRadius: '4px',
            }}
          >
            <option value="all">All priority</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="emergency">Emergency</option>
          </select>

          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value as 'all' | Complaint['status'])}
            style={{
              fontSize: '11px',
              padding: '4px 8px',
              background: TOKENS.bg,
              color: TOKENS.text,
              border: `1px solid ${TOKENS.border}`,
              borderRadius: '4px',
            }}
          >
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
            viewer.current?.camera.flyTo({
              destination: Cartesian3.fromDegrees(78.9629, 22.5937, 2000000),
              duration: 2,
            });
          }}
          style={{ 
            fontSize: '11px', 
            padding: '6px 8px',
            background: 'transparent',
            color: TOKENS.text,
            border: `1px solid ${TOKENS.border}`,
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Reset India View
        </button>
      </div>

      {/* State info panel */}
      {selectedState && (
        <div style={{
          position: 'absolute',
          top: 54,
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
            <button 
              type="button" 
              onClick={() => setSelectedState(null)}
              style={{
                background: 'transparent',
                border: 'none',
                color: TOKENS.text,
                cursor: 'pointer',
                fontSize: '16px',
              }}
            >
              ×
            </button>
          </div>
          <div style={{ fontSize: '12px', color: TOKENS.muted }}>Total: {selectedState.count}</div>
          <div style={{ fontSize: '12px', color: TOKENS.danger }}>High priority: {selectedState.highPriority}</div>
          <div style={{ fontSize: '12px', color: TOKENS.warn }}>Unresolved: {selectedState.unresolved}</div>
        </div>
      )}

      {/* Cesium viewer container */}
      <div ref={cesiumContainer} style={{ position: 'absolute', inset: 0 }} />
    </div>
  );
};

export default GrievanceMap;
