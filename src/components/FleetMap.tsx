import React, { useEffect, useRef } from 'react';
import { Navigation, Circle, MapPin, Truck } from 'lucide-react';

export interface FleetDriver {
  id: string;
  name: string;
  phone: string;
  status: 'online' | 'offline' | 'in_transit';
  vehicle_type: string;
  vehicle_plate: string;
  current_lat?: number;
  current_lng?: number;
  active_deliveries_count?: number;
  total_deliveries_count?: number;
}

interface FleetMapProps {
  drivers: FleetDriver[];
  center?: { lat: number; lng: number };
  selectedDriverId?: string | null;
  onSelectDriver?: (id: string) => void;
}

export function FleetMap({ drivers, center = { lat: 6.5244, lng: 3.3792 }, selectedDriverId, onSelectDriver }: FleetMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapObj = useRef<any>(null);
  const markersRef = useRef<{ [key: string]: any }>({});

  useEffect(() => {
    if (!mapRef.current) return;

    if (typeof window !== 'undefined' && (window as any).google && (window as any).google.maps) {
      if (!googleMapObj.current) {
        const google = (window as any).google;
        googleMapObj.current = new google.maps.Map(mapRef.current, {
          center: center,
          zoom: 13,
          disableDefaultUI: false,
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          styles: [
            { featureType: 'all', elementType: 'labels.text.fill', stylers: [{ color: '#74787a' }] },
            { featureType: 'all', elementType: 'labels.text.stroke', stylers: [{ visibility: 'on' }, { color: '#ffffff' }, { weight: 2 }] },
            { featureType: 'all', elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
            { featureType: 'landscape', elementType: 'all', stylers: [{ color: '#f2f4f5' }] },
            { featureType: 'landscape.man_made', elementType: 'geometry.fill', stylers: [{ color: '#e2e8f0' }] },
            { featureType: 'building', elementType: 'geometry.fill', stylers: [{ color: '#e2e8f0' }] },
            { featureType: 'poi', elementType: 'all', stylers: [{ visibility: 'off' }] },
            { featureType: 'poi.park', elementType: 'geometry.fill', stylers: [{ color: '#c5ecc2' }, { visibility: 'on' }] },
            { featureType: 'landscape.natural', elementType: 'geometry.fill', stylers: [{ color: '#bce7ba' }, { visibility: 'on' }] },
            { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
            { featureType: 'road.local', elementType: 'geometry.fill', stylers: [{ color: '#ffffff' }] },
            { featureType: 'road.local', elementType: 'geometry.stroke', stylers: [{ color: '#e3e7e9' }, { weight: 1 }] },
            { featureType: 'road.highway', elementType: 'geometry.fill', stylers: [{ color: '#ffe8a3' }] },
            { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#ffd256' }, { weight: 1 }] },
            { featureType: 'water', elementType: 'geometry.fill', stylers: [{ color: '#c4e3fd' }] },
          ],
        });
      }

      const google = (window as any).google;
      const map = googleMapObj.current;

      // Update / Add driver markers
      const updatedIds = new Set<string>();

      drivers.forEach((driver) => {
        const lat = driver.current_lat || center.lat + (Math.random() - 0.5) * 0.05;
        const lng = driver.current_lng || center.lng + (Math.random() - 0.5) * 0.05;
        const pos = { lat, lng };
        updatedIds.add(driver.id);

        let pinColor = '#94a3b8'; // offline
        if (driver.status === 'online') pinColor = '#10b981';
        if (driver.status === 'in_transit') pinColor = '#204b7a';

        if (!markersRef.current[driver.id]) {
          const marker = new google.maps.Marker({
            position: pos,
            map: map,
            title: `${driver.name} (${driver.vehicle_plate})`,
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 12,
              fillColor: pinColor,
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 3,
            },
          });

          const infoWindow = new google.maps.InfoWindow({
            content: `
              <div style="padding:10px;font-family:sans-serif;color:#0f172a;">
                <div style="font-weight:700;font-size:14px;margin-bottom:4px;">${driver.name}</div>
                <div style="font-size:12px;color:#64748b;margin-bottom:6px;">🚗 ${driver.vehicle_type || 'Vehicle'} (${driver.vehicle_plate || 'N/A'})</div>
                <div style="font-size:11px;font-weight:600;display:inline-block;padding:3px 8px;border-radius:12px;background:${driver.status === 'online' ? '#dcfce7' : driver.status === 'in_transit' ? '#e0f2fe' : '#f1f5f9'};color:${driver.status === 'online' ? '#166534' : driver.status === 'in_transit' ? '#0369a1' : '#475569'};">
                  ${driver.status === 'online' ? '🟢 Online' : driver.status === 'in_transit' ? '📦 In Transit' : '⚪ Offline'}
                </div>
              </div>
            `,
          });

          marker.addListener('click', () => {
            infoWindow.open(map, marker);
          });

          markersRef.current[driver.id] = marker;
        } else {
          markersRef.current[driver.id].setPosition(pos);
        }
      });
    }
  }, [drivers, center]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: '16px', overflow: 'hidden' }}>
      <div ref={mapRef} style={{ width: '100%', height: '100%', minHeight: '400px' }} />

      {/* Map Legend Overlay */}
      <div style={{
        position: 'absolute',
        bottom: '16px',
        left: '16px',
        backgroundColor: 'rgba(255, 255, 255, 0.92)',
        backdropFilter: 'blur(8px)',
        padding: '12px 16px',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        fontSize: '12px',
        fontWeight: '600',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10b981' }} />
          <span>Online ({drivers.filter(d => d.status === 'online').length})</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#204b7a' }} />
          <span>In Transit ({drivers.filter(d => d.status === 'in_transit').length})</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#94a3b8' }} />
          <span>Offline ({drivers.filter(d => d.status === 'offline').length})</span>
        </div>
      </div>
    </div>
  );
}
