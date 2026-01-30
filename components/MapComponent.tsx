
import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { useDrop } from 'react-dnd';
import { SystemState, SOSAlert, GeoLocation, Responder } from '../types';
import { calculateDistance } from '../services/Utils';
import L from 'leaflet';

interface MapComponentProps {
  state: SystemState;
  floodHours?: number;
}

export interface MapRef {
  centerOn: (loc: GeoLocation) => void;
}

// Helper to validate coordinates and prevent Leaflet crashes
const isValidGeo = (loc?: GeoLocation | null): loc is GeoLocation => {
  return !!loc && typeof loc.lat === 'number' && typeof loc.lng === 'number' && !isNaN(loc.lat) && !isNaN(loc.lng);
};

const MapComponent = forwardRef<MapRef, MapComponentProps>(({ state, floodHours = 0 }, ref) => {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hasCenteredOnUser = useRef(false);
  const floodOverlayRef = useRef<L.ImageOverlay | null>(null);
  
  const layerControlRef = useRef<L.Control.Layers | null>(null);
  const groupsRef = useRef<{
    alerts: L.LayerGroup;
    responders: L.LayerGroup;
    shelters: L.LayerGroup;
    self: L.LayerGroup;
    flood: L.LayerGroup;
    routes: L.LayerGroup;
  } | null>(null);
  
  const markersRef = useRef<{ [key: string]: L.Layer }>({});

  useImperativeHandle(ref, () => ({
    centerOn: (loc: GeoLocation) => {
      if (mapRef.current && isValidGeo(loc)) {
        mapRef.current.flyTo([loc.lat, loc.lng], 15, { 
          animate: true,
          duration: 1.5
        });
      }
    }
  }));

  const [, drop] = useDrop(() => ({
    accept: 'ASSET',
    drop: (item: any, monitor) => {
      const offset = monitor.getClientOffset();
      if (!offset || !mapRef.current) return;
      
      const containerPoint = L.point(offset.x, offset.y - 56);
      const latLng = mapRef.current.containerPointToLatLng(containerPoint);
      
      if (!isValidGeo(latLng)) return;

      let nearestDist = Infinity;
      state.alerts.forEach(alert => {
        if (isValidGeo(alert.location)) {
          const d = calculateDistance(latLng, alert.location);
          if (d < nearestDist) {
            nearestDist = d;
          }
        }
      });

      const etaMinutes = nearestDist === Infinity ? 0 : Math.round(nearestDist * 5);

      L.popup()
        .setLatLng(latLng)
        .setContent(`
          <div style="font-family: 'JetBrains Mono', monospace; text-align: center;">
            <div style="color: #3b82f6; font-weight: bold; border-bottom: 1px solid #333; margin-bottom: 4px; font-size: 10px;">TACTICAL DEPLOYMENT</div>
            <div style="font-size: 11px;"><b>${item.name}</b> deployed.</div>
            <div style="font-size: 12px; color: #ef4444; font-weight: bold; margin-top: 4px;">INSTANT ETA: ${etaMinutes} MINS</div>
          </div>
        `)
        .openOn(mapRef.current!);
    }
  }), [state.alerts]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      zoomControl: false,
      attributionControl: true,
    }).setView([19.0760, 72.8777], 12);

    const alertsGroup = L.layerGroup().addTo(map);
    const respondersGroup = L.layerGroup().addTo(map);
    const sheltersGroup = L.layerGroup().addTo(map);
    const selfGroup = L.layerGroup().addTo(map);
    const floodGroup = L.layerGroup().addTo(map);
    const routesGroup = L.layerGroup().addTo(map);

    groupsRef.current = {
      alerts: alertsGroup,
      responders: respondersGroup,
      shelters: sheltersGroup,
      self: selfGroup,
      flood: floodGroup,
      routes: routesGroup
    };

    L.control.zoom({ position: 'bottomright' }).addTo(map);
    mapRef.current = map;

    setTimeout(() => {
      map.invalidateSize();
    }, 100);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !groupsRef.current) return;

    if (floodOverlayRef.current) {
      floodOverlayRef.current.remove();
    }

    if (floodHours > 0) {
      const scaleFactor = 1 + (floodHours * 0.005);
      const baseBounds: L.LatLngBoundsExpression = [
        [19.0 - (0.1 * scaleFactor), 72.8 - (0.1 * scaleFactor)],
        [19.1 + (0.1 * scaleFactor), 72.9 + (0.1 * scaleFactor)]
      ];
      
      const opacity = Math.min(0.1 + (floodHours * 0.08), 0.7);
      const overlayUrl = 'data:image/svg+xml;base64,' + btoa(`
        <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100">
          <rect width="100" height="100" fill="#3b82f6" fill-opacity="0.8"/>
        </svg>
      `);

      floodOverlayRef.current = L.imageOverlay(overlayUrl, baseBounds, {
        opacity: opacity,
        interactive: false
      }).addTo(groupsRef.current.flood);
    }
  }, [floodHours]);

  useEffect(() => {
    if (isValidGeo(state.userLocation) && mapRef.current && !hasCenteredOnUser.current) {
      mapRef.current.flyTo([state.userLocation.lat, state.userLocation.lng], 14, { duration: 2 });
      hasCenteredOnUser.current = true;
    }
  }, [state.userLocation]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !groupsRef.current) return;

    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    if (layerControlRef.current) {
      layerControlRef.current.remove();
    }

    if (!state.isLowBandwidth) {
      const dark = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 20
      });

      const satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Esri'
      });

      const streets = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap'
      });

      const terrain = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        attribution: 'OpenTopoMap',
        maxZoom: 17
      });

      const baseMaps = {
        "Tactical Dark": dark,
        "Satellite Imagery": satellite,
        "Urban Streets": streets,
        "Terrain Analysis": terrain
      };

      const overlayMaps = {
        "SOS ALERTS": groupsRef.current.alerts,
        "FIELD UNITS": groupsRef.current.responders,
        "SAFE SHELTERS": groupsRef.current.shelters,
        "FLOOD RISK": groupsRef.current.flood,
        "ACTIVE ROUTES": groupsRef.current.routes
      };

      dark.addTo(map);

      layerControlRef.current = L.control.layers(baseMaps, overlayMaps, {
        position: 'topright',
        collapsed: false 
      }).addTo(map);
    }
  }, [state.isLowBandwidth, state.theme]);

  // Marker and Routing Sync Logic
  useEffect(() => {
    const map = mapRef.current;
    const groups = groupsRef.current;
    if (!map || !groups) return;

    // Clear routes for redraw
    groups.routes.clearLayers();

    const currentIds = new Set([
      ...state.alerts.map(a => `alert-${a.id}`),
      ...state.responders.map(r => `resp-${r.id}`),
      ...state.shelters.map(s => `shelter-${s.id}`),
      ...(isValidGeo(state.userLocation) ? ['self'] : [])
    ]);

    Object.keys(markersRef.current).forEach(id => {
      if (!currentIds.has(id)) {
        markersRef.current[id].remove();
        delete markersRef.current[id];
      }
    });

    // 1. Self Position
    if (isValidGeo(state.userLocation)) {
      const id = 'self';
      if (markersRef.current[id]) {
        (markersRef.current[id] as L.Marker).setLatLng([state.userLocation.lat, state.userLocation.lng]);
      } else {
        const icon = L.divIcon({
          className: 'self-marker-wrapper',
          html: `<div style="width: 16px; height: 16px; background: #3b82f6; border: 3px solid white; border-radius: 50%; box-shadow: 0 0 20px #3b82f6;"></div>`,
          iconSize: [16, 16],
          iconAnchor: [8, 8]
        });
        markersRef.current[id] = L.marker([state.userLocation.lat, state.userLocation.lng], { icon, zIndexOffset: 1000 })
          .addTo(groups.self);
      }
    }

    // 2. SOS Alerts
    state.alerts.forEach(alert => {
      if (!isValidGeo(alert.location)) return;
      const id = `alert-${alert.id}`;
      if (!markersRef.current[id]) {
        const icon = L.divIcon({
          className: 'sos-marker',
          iconSize: [14, 14],
          iconAnchor: [7, 7]
        });
        markersRef.current[id] = L.marker([alert.location.lat, alert.location.lng], { icon })
          .addTo(groups.alerts)
          .bindPopup(`<div style="font-family: monospace;"><b>${alert.citizenName}</b><br/>${alert.message}</div>`);
      }
    });

    // 3. Responders & Routing Visualization
    state.responders.forEach(resp => {
      if (!isValidGeo(resp.location)) return;
      const id = `resp-${resp.id}`;
      if (markersRef.current[id]) {
        (markersRef.current[id] as L.Marker).setLatLng([resp.location.lat, resp.location.lng]);
      } else {
        const icon = L.divIcon({
          className: 'resp-tactical-marker',
          html: `<div style="width: 20px; height: 20px; background: #3b82f6; border: 2px solid white; border-radius: 4px;"></div>`,
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        });
        markersRef.current[id] = L.marker([resp.location.lat, resp.location.lng], { icon }).addTo(groups.responders);
      }

      // Visualize Route for dispatched responders
      if (resp.status === 'en-route' && resp.currentTaskId) {
        const targetAlert = state.alerts.find(a => a.id === resp.currentTaskId);
        if (targetAlert && isValidGeo(targetAlert.location)) {
          L.polyline([
            [resp.location.lat, resp.location.lng],
            [targetAlert.location.lat, targetAlert.location.lng]
          ], {
            color: '#3b82f6',
            weight: 2,
            opacity: 0.6,
            dashArray: '5, 10',
            className: 'tactical-route-line'
          }).addTo(groups.routes);
        }
      }
    });

    // 4. Shelters
    state.shelters.forEach(shelter => {
      if (!isValidGeo(shelter.location)) return;
      const id = `shelter-${shelter.id}`;
      if (!markersRef.current[id]) {
        markersRef.current[id] = L.circle([shelter.location.lat, shelter.location.lng], {
          color: '#10b981',
          fillColor: '#10b981',
          fillOpacity: 0.2,
          weight: 2,
          radius: 400
        }).addTo(groups.shelters)
          .bindPopup(`<b>${shelter.name}</b><br/>Capacity: ${shelter.occupancy}/${shelter.capacity}`);
      }
    });

  }, [state.alerts, state.responders, state.shelters, state.userLocation]);

  return (
    <div 
      ref={(node) => {
        containerRef.current = node;
        drop(node);
      }} 
      className="absolute inset-0 z-10 w-full h-full" 
    />
  );
});

export default MapComponent;
