
import React, { useEffect, useRef, useImperativeHandle, forwardRef, useState, useCallback } from 'react';
import { useDrop } from 'react-dnd';
import { SystemState, SOSAlert, GeoLocation, Responder } from '../types';
import { calculateDistance, getNearestRegionDensity, calculateResilienceScore } from '../services/Utils';
import L from 'leaflet';
import 'leaflet.heat';

interface MapComponentProps {
  state: SystemState;
  floodHours?: number;
  onResilienceScoreUpdate?: (score: string) => void;
  onUpdateRadius: (radius: number) => void;
}

export interface MapRef {
  centerOn: (loc: GeoLocation) => void;
}

const isValidGeo = (loc?: GeoLocation | null): loc is GeoLocation => {
  return !!loc && typeof loc.lat === 'number' && typeof loc.lng === 'number' && !isNaN(loc.lat) && !isNaN(loc.lng);
};

// Overpass API Mirrors for high-availability
const OVERPASS_MIRRORS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass.osm.ch/api/interpreter'
];

const MapComponent = forwardRef<MapRef, MapComponentProps>(({ state, floodHours = 0, onResilienceScoreUpdate, onUpdateRadius }, ref) => {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isMounted = useRef(true);
  const hasCenteredOnUser = useRef(false);
  const floodOverlayRef = useRef<L.ImageOverlay | null>(null);
  const heatmapLayerRef = useRef<any>(null);
  const isFetchingRelief = useRef(false);
  const [showSearchButton, setShowSearchButton] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isMobile] = useState(window.innerWidth < 768);
  
  const layerControlRef = useRef<L.Control.Layers | null>(null);
  const groupsRef = useRef<{
    alerts: L.LayerGroup;
    responders: L.LayerGroup;
    shelters: L.LayerGroup;
    self: L.LayerGroup;
    flood: L.LayerGroup;
    routes: L.LayerGroup;
    heatmap: L.LayerGroup;
    reliefPoints: L.LayerGroup;
    growthHeatmap: L.LayerGroup;
  } | null>(null);
  
  const markersRef = useRef<{ [key: string]: L.Layer }>({});

  useImperativeHandle(ref, () => ({
    centerOn: (loc: GeoLocation) => {
      if (mapRef.current && isMounted.current && isValidGeo(loc)) {
        try {
          mapRef.current.flyTo([loc.lat, loc.lng], isMobile ? 14 : 15, { 
            animate: true,
            duration: 1.5
          });
        } catch (e) {
          console.warn("Map navigation failed", e);
        }
      }
    }
  }));

  const fetchWithRetry = async (query: string, retries = 2, delay = 1000): Promise<any> => {
    let lastError: any;
    
    for (const mirror of OVERPASS_MIRRORS) {
      for (let i = 0; i < retries; i++) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 15000);
          
          const response = await fetch(`${mirror}?data=${encodeURIComponent(query)}`, {
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);

          if (response.status === 429 || response.status >= 500) {
            throw new Error(`Server error: ${response.status}`);
          }
          
          if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
          return await response.json();
        } catch (err: any) {
          lastError = err;
          if (i < retries - 1) {
            await new Promise(r => setTimeout(r, delay * (i + 1)));
          }
        }
      }
    }
    throw lastError || new Error("All Overpass mirrors failed");
  };

  const updateReliefMarkers = useCallback(async (map: L.Map, lat: number, lon: number) => {
    if (!isMounted.current || !groupsRef.current || isFetchingRelief.current) return;
    
    isFetchingRelief.current = true;
    setFetchError(null);
    const radius = state.reliefSearchRadius || 10000; 
    const query = `[out:json][timeout:25];(node["amenity"~"hospital|police"](around:${radius},${lat},${lon}););out body;`;

    try {
      const data = await fetchWithRetry(query);
      
      if (!isMounted.current || !groupsRef.current || !mapRef.current || mapRef.current !== map) return;

      const reliefPointsGroup = groupsRef.current.reliefPoints;
      reliefPointsGroup.clearLayers();
      const bounds = map.getBounds();
      
      if (data.elements && Array.isArray(data.elements)) {
        data.elements.forEach((element: any) => {
          if (!isMounted.current || typeof element.lat !== 'number' || typeof element.lon !== 'number') return;
          if (!bounds.contains([element.lat, element.lon])) return;

          const type = element.tags.amenity === 'hospital' ? '🏥' : '👮';
          const name = element.tags.name || "Unnamed Facility";
          const phone = element.tags.phone || element.tags['contact:phone'] || "N/A";
          
          const icon = L.divIcon({
            className: 'relief-marker',
            html: `<div style="font-size: 24px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));">${type}</div>`,
            iconSize: [32, 32],
            iconAnchor: [16, 16]
          });

          const popupContent = `
            <div style="font-family: 'JetBrains Mono', monospace; width: 240px; font-size: 12px; line-height: 1.4; color: #fff; background: #111; padding: 12px; border-radius: 12px;">
              <div style="border-bottom: 1px solid #333; margin-bottom: 10px; padding-bottom: 6px;">
                <span style="font-weight: black; text-transform: uppercase; color: #3b82f6;">${element.tags.amenity} UNIT</span>
              </div>
              <div style="font-size: 14px; font-weight: bold; margin-bottom: 8px; color: #fff;">${name}</div>
              <div style="color: #a1a1aa; margin-bottom: 10px;">📞 ${phone}</div>
            </div>
          `;

          try {
            L.marker([element.lat, element.lon], { icon })
                .addTo(reliefPointsGroup)
                .bindPopup(popupContent, {
                  className: 'tactical-relief-popup',
                  maxWidth: 260
                });
          } catch (e) {
            console.debug("Error adding relief marker", e);
          }
        });

        const density = getNearestRegionDensity({ lat, lng: lon });
        const score = calculateResilienceScore(data.elements.length, density);
        if (onResilienceScoreUpdate && isMounted.current) onResilienceScoreUpdate(score);
      }
      if (isMounted.current) setShowSearchButton(false);
    } catch (error: any) {
      console.error("Failed to fetch relief markers:", error);
      if (isMounted.current) {
        setFetchError("DATA UPLINK TIMEOUT (504/OFFLINE). TAP TO RETRY SCAN.");
      }
    } finally {
      isFetchingRelief.current = false;
    }
  }, [state.reliefSearchRadius, onResilienceScoreUpdate]);

  const handleManualSearch = () => {
    if (mapRef.current && isMounted.current) {
      const center = mapRef.current.getCenter();
      updateReliefMarkers(mapRef.current, center.lat, center.lng);
    }
  };

  const [, drop] = useDrop(() => ({
    accept: 'ASSET',
    drop: (item: any, monitor) => {
      const offset = monitor.getClientOffset();
      if (!offset || !mapRef.current || !isMounted.current) return;
      try {
        const containerPoint = L.point(offset.x, offset.y - 56);
        const latLng = mapRef.current.containerPointToLatLng(containerPoint);
        if (!isValidGeo(latLng)) return;

        let nearestDist = Infinity;
        state.alerts.forEach(alert => {
          if (isValidGeo(alert.location)) {
            const d = calculateDistance(latLng, alert.location);
            if (d < nearestDist) nearestDist = d;
          }
        });

        const etaMinutes = nearestDist === Infinity ? 0 : Math.round(nearestDist * 5);
        L.popup().setLatLng(latLng).setContent(`
            <div style="font-family: 'JetBrains Mono', monospace; text-align: center; padding: 8px;">
              <div style="color: #3b82f6; font-weight: bold; border-bottom: 1px solid #333; margin-bottom: 4px; font-size: 10px;">TACTICAL DEPLOYMENT</div>
              <div style="font-size: 11px;"><b>${item.name}</b> deployed.</div>
              <div style="font-size: 12px; color: #ef4444; font-weight: bold; margin-top: 4px;">INSTANT ETA: ${etaMinutes} MINS</div>
            </div>
          `).openOn(mapRef.current!);
      } catch (e) {
        console.warn("Drop interaction failed", e);
      }
    }
  }), [state.alerts]);

  useEffect(() => {
    isMounted.current = true;
    if (!containerRef.current || mapRef.current) return;

    try {
      const map = L.map(containerRef.current, {
        zoomControl: false, // Ensure top-left zoom control is removed
        attributionControl: true,
        tap: isMobile, 
        dragging: true,
        scrollWheelZoom: true,
        touchZoom: true,
        bounceAtZoomLimits: true
      }).setView([19.0760, 72.8777], isMobile ? 11 : 12);

      groupsRef.current = {
        alerts: L.layerGroup().addTo(map),
        responders: L.layerGroup().addTo(map),
        shelters: L.layerGroup().addTo(map),
        self: L.layerGroup().addTo(map),
        flood: L.layerGroup().addTo(map),
        routes: L.layerGroup().addTo(map),
        heatmap: L.layerGroup().addTo(map),
        reliefPoints: L.layerGroup().addTo(map),
        growthHeatmap: L.layerGroup()
      };

      if (!isMobile) {
          L.control.scale({ position: 'bottomleft' }).addTo(map);
      }
      
      mapRef.current = map;

      map.on('moveend', () => {
        if (!isMounted.current) return;
        if (!isMobile) {
          const center = map.getCenter();
          updateReliefMarkers(map, center.lat, center.lng);
        } else {
          setShowSearchButton(true);
        }
      });

      updateReliefMarkers(map, 19.0760, 72.8777);
      setTimeout(() => {
        if (mapRef.current && isMounted.current) mapRef.current.invalidateSize();
      }, 100);
    } catch (err) {
      console.error("Leaflet init error", err);
    }

    return () => {
      isMounted.current = false;
      if (mapRef.current) {
        try {
          mapRef.current.off();
          mapRef.current.remove();
        } catch (e) {
          console.debug("Cleanup removal error suppressed");
        }
        mapRef.current = null;
      }
      groupsRef.current = null;
    };
  }, [updateReliefMarkers, isMobile]);

  useEffect(() => {
    if (mapRef.current && isMounted.current) {
        const center = mapRef.current.getCenter();
        updateReliefMarkers(mapRef.current, center.lat, center.lng);
    }
  }, [state.reliefSearchRadius, updateReliefMarkers]);

  useEffect(() => {
    const map = mapRef.current;
    const groups = groupsRef.current;
    if (!map || !groups || !isMounted.current) return;

    try {
      map.eachLayer((layer) => {
        if (layer instanceof L.TileLayer) map.removeLayer(layer);
      });

      if (layerControlRef.current) {
        layerControlRef.current.remove();
        layerControlRef.current = null;
      }

      const dark = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { attribution: '&copy; CARTO', subdomains: 'abcd', maxZoom: 20 });
      const satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { attribution: 'Esri' });
      const streets = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap' });
      const hillshade = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Elevation/World_Hillshade/MapServer/tile/{z}/{y}/{x}', { attribution: 'Esri' });

      const baseMaps = {
        "TACTICAL DARK": dark,
        "TERRAIN ANALYSIS (HILLSHADE)": hillshade,
        "SATELLITE IMAGERY": satellite,
        "URBAN STREETS": streets
      };

      const overlayMaps = {
        "SOS ALERTS": groups.alerts,
        "INCIDENT HEATMAP": groups.heatmap,
        "RELIEF POINTS (VIEWPORT)": groups.reliefPoints,
        "FIELD UNITS": groups.responders,
        "SAFE SHELTERS": groups.shelters,
        "FLOOD RISK OVERLAY": groups.flood,
        "ACTIVE ROUTES": groups.routes,
        "HILLSHADE OVERLAY": L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Elevation/World_Hillshade/MapServer/tile/{z}/{y}/{x}', { opacity: 0.4 })
      };

      streets.addTo(map); 
      
      // Placed in top-right as requested
      layerControlRef.current = L.control.layers(baseMaps, overlayMaps, { 
          position: 'topright', 
          collapsed: true 
      }).addTo(map);
      
    } catch (e) {
      console.warn("Layer sync failed", e);
    }
  }, [state.isLowBandwidth, state.theme, isMobile]);

  // Marker Sync Logic
  useEffect(() => {
    const map = mapRef.current;
    const groups = groupsRef.current;
    if (!map || !groups || !isMounted.current) return;
    
    try {
      groups.routes.clearLayers();

      const currentIds = new Set([
        ...state.alerts.map(a => `alert-${a.id}`),
        ...state.responders.map(r => `resp-${r.id}`),
        ...state.shelters.map(s => `shelter-${s.id}`),
        ...(isValidGeo(state.userLocation) ? ['self'] : [])
      ]);

      Object.keys(markersRef.current).forEach(id => {
        if (!currentIds.has(id)) {
          const marker = markersRef.current[id];
          if (marker) {
            try { marker.remove(); } catch (e) {}
            delete markersRef.current[id];
          }
        }
      });

      if (isValidGeo(state.userLocation)) {
        const id = 'self';
        if (markersRef.current[id]) {
          (markersRef.current[id] as L.Marker).setLatLng([state.userLocation.lat, state.userLocation.lng]);
        } else {
          const icon = L.divIcon({
            className: 'self-marker-wrapper',
            html: `<div style="width: 20px; height: 20px; background: #3b82f6; border: 4px solid white; border-radius: 50%; box-shadow: 0 0 24px #3b82f6;"></div>`,
            iconSize: [20, 20],
            iconAnchor: [10, 10]
          });
          markersRef.current[id] = L.marker([state.userLocation.lat, state.userLocation.lng], { icon, zIndexOffset: 1000 }).addTo(groups.self);
        }
      }

      state.alerts.forEach(alert => {
        if (!isMounted.current || !isValidGeo(alert.location)) return;
        const id = `alert-${alert.id}`;
        if (!markersRef.current[id]) {
          const icon = L.divIcon({ className: 'sos-marker', iconSize: [18, 18], iconAnchor: [9, 9] });
          markersRef.current[id] = L.marker([alert.location.lat, alert.location.lng], { icon }).addTo(groups.alerts).bindPopup(`<div style="font-family: 'JetBrains Mono', monospace; font-size: 13px; padding: 10px;"><b>${alert.citizenName}</b><br/>${alert.message}</div>`);
        }
      });
    } catch (e) {
      console.warn("Marker sync failed", e);
    }
  }, [state.alerts, state.responders, state.shelters, state.userLocation]);

  return (
    <div className="absolute inset-0 z-10 w-full h-full overflow-hidden">
      <div 
        ref={(node) => { containerRef.current = node; drop(node); }} 
        className="w-full h-full"
      />
      
      {/* Floating Tactical Scan Range Control */}
      <div className={`absolute top-24 left-6 z-20 flex flex-col p-4 rounded-3xl border backdrop-blur-xl shadow-2xl transition-all ${state.theme === 'light' ? 'bg-white/80 border-zinc-200' : 'bg-black/60 border-white/10'}`}>
         <div className="flex items-center justify-between mb-3">
            <h4 className={`text-[10px] font-black uppercase tracking-widest font-mono ${state.theme === 'light' ? 'text-zinc-500' : 'text-zinc-400'}`}>Scan Range</h4>
            <span className="text-[10px] font-mono font-bold text-blue-500">{(state.reliefSearchRadius / 1000).toFixed(1)}KM</span>
         </div>
         <div className="flex items-center gap-3">
            <span className="text-[8px] text-zinc-500 font-mono">1k</span>
            <input 
              type="range" min="1000" max="50000" step="1000"
              value={state.reliefSearchRadius}
              onChange={(e) => onUpdateRadius(parseInt(e.target.value))}
              className="w-32 md:w-48 h-1.5 bg-blue-600/20 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <span className="text-[8px] text-zinc-500 font-mono">50k</span>
         </div>
      </div>

      {fetchError && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000]">
          <button onClick={handleManualSearch} className="bg-red-600 text-white px-6 py-3 rounded-full shadow-2xl font-black uppercase text-[10px] border border-white/20 active:scale-95 transition-all">
            {fetchError}
          </button>
        </div>
      )}

      {showSearchButton && !fetchError && isMobile && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000]">
          <button onClick={handleManualSearch} className="bg-blue-600 text-white px-6 py-3 rounded-full shadow-2xl font-black uppercase text-[11px] border border-white/20 active:scale-95 transition-all">
            Search Area
          </button>
        </div>
      )}
    </div>
  );
});

export default MapComponent;
