import React, { useEffect, useRef, useState } from 'react';

export interface FleetDriver {
  id: string;
  name: string;
  phone: string;
  status: 'online' | 'offline' | 'in_transit';
  vehicle_type: string;
  vehicle_plate: string;
  avatar_url?: string;
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
  showFullMapButton?: boolean;
  onOpenFullMap?: () => void;
}

export function FleetMap({
  drivers,
  center = { lat: 6.5244, lng: 3.3792 },
  selectedDriverId,
  onSelectDriver,
}: FleetMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapObj = useRef<any>(null);
  const overlaysRef = useRef<{ [key: string]: any }>({});
  const infoWindowRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);
  const deviceLocationRef = useRef<{ lat: number; lng: number } | null>(null);

  const [hasDevicePos, setHasDevicePos] = useState(false);

  // 1. Detect Live Device Geolocation & Pan Map to Device Position
  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const devLat = position.coords.latitude;
          const devLng = position.coords.longitude;
          const devPos = { lat: devLat, lng: devLng };
          deviceLocationRef.current = devPos;
          setHasDevicePos(true);

          if (googleMapObj.current) {
            googleMapObj.current.panTo(devPos);
            googleMapObj.current.setZoom(14);

            const google = (window as any).google;
            if (google && google.maps) {
              if (!userMarkerRef.current) {
                userMarkerRef.current = new google.maps.Marker({
                  position: devPos,
                  map: googleMapObj.current,
                  title: 'Your Device Location',
                  icon: {
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 9,
                    fillColor: '#2563EB',
                    fillOpacity: 1,
                    strokeColor: '#FFFFFF',
                    strokeWeight: 3,
                  },
                });
              } else {
                userMarkerRef.current.setPosition(devPos);
              }
            }
          }
        },
        (err) => {
          console.log('Device Geolocation Info:', err.message);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  }, []);

  // 2. Initialize Google Map
  useEffect(() => {
    if (!mapRef.current) return;

    if (typeof window !== 'undefined' && (window as any).google && (window as any).google.maps) {
      if (!googleMapObj.current) {
        const google = (window as any).google;
        const initialCenter = deviceLocationRef.current || center;

        googleMapObj.current = new google.maps.Map(mapRef.current, {
          center: initialCenter,
          zoom: 13,
          disableDefaultUI: false,
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
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

        infoWindowRef.current = new google.maps.InfoWindow();

        if (deviceLocationRef.current) {
          googleMapObj.current.panTo(deviceLocationRef.current);
          googleMapObj.current.setZoom(14);
        }
      }

      const google = (window as any).google;
      const map = googleMapObj.current;

      // Clear previous overlays
      Object.keys(overlaysRef.current).forEach((key) => {
        if (overlaysRef.current[key]) {
          overlaysRef.current[key].setMap(null);
        }
      });
      overlaysRef.current = {};

      // Render Driver Overlay Pins with Avatar Pictures & Name Tags
      drivers.forEach((driver) => {
        const lat = driver.current_lat || (deviceLocationRef.current ? deviceLocationRef.current.lat + (Math.random() - 0.5) * 0.04 : center.lat + (Math.random() - 0.5) * 0.04);
        const lng = driver.current_lng || (deviceLocationRef.current ? deviceLocationRef.current.lng + (Math.random() - 0.5) * 0.04 : center.lng + (Math.random() - 0.5) * 0.04);
        const pos = { lat, lng };

        const avatar = driver.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(driver.name)}&background=0D1B2A&color=fff&bold=true`;
        const badgeColor = driver.status === 'online' ? '#10B981' : driver.status === 'in_transit' ? '#0284C7' : '#94A3B8';
        const isSelected = selectedDriverId === driver.id;

        const overlay = new google.maps.OverlayView();

        overlay.onAdd = function () {
          const div = document.createElement('div');
          div.style.position = 'absolute';
          div.style.cursor = 'pointer';
          div.style.zIndex = isSelected ? '1000' : '100';

          div.innerHTML = `
            <div style="display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%); filter: drop-shadow(0 6px 14px rgba(0,0,0,0.3)); transition: transform 0.2s ease;">
              <div style="background: #FFFFFF; border: 2px solid ${badgeColor}; border-radius: 24px; padding: 4px 12px 4px 6px; display: flex; align-items: center; gap: 8px; white-space: nowrap; box-shadow: 0 4px 10px rgba(0,0,0,0.15);">
                <div style="position: relative; width: 30px; height: 30px;">
                  <img src="${avatar}" style="width: 30px; height: 30px; border-radius: 50%; object-fit: cover; border: 1px solid #CBD5E1;" />
                  <span style="position: absolute; bottom: 0; right: 0; width: 9px; height: 9px; border-radius: 50%; background: ${badgeColor}; border: 1.5px solid #FFFFFF;"></span>
                </div>
                <div style="display: flex; flex-direction: column; text-align: left;">
                  <span style="font-family: system-ui, sans-serif; font-size: 13px; font-weight: 800; color: #0F172A; line-height: 1.1;">${driver.name}</span>
                  <span style="font-family: system-ui, sans-serif; font-size: 10px; font-weight: 700; color: #64748B;">${driver.vehicle_plate}</span>
                </div>
              </div>
              <div style="width: 0; height: 0; border-left: 7px solid transparent; border-right: 7px solid transparent; border-top: 9px solid ${badgeColor}; margin-top: -1px;"></div>
            </div>
          `;

          div.addEventListener('click', () => {
            if (onSelectDriver) onSelectDriver(driver.id);
            if (infoWindowRef.current) {
              infoWindowRef.current.setContent(`
                <div style="padding: 12px; font-family: system-ui, sans-serif; color: #0F172A; max-width: 220px;">
                  <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                    <img src="${avatar}" style="width: 36px; height: 36px; border-radius: 50%; object-fit: cover;" />
                    <div>
                      <div style="font-weight: 800; font-size: 15px;">${driver.name}</div>
                      <div style="font-size: 12px; color: #64748B;">📞 ${driver.phone}</div>
                    </div>
                  </div>
                  <div style="font-size: 12px; color: #475569; margin-bottom: 8px;">
                    🚗 <strong>${driver.vehicle_type}</strong> (${driver.vehicle_plate})
                  </div>
                  <div style="font-size: 11px; font-weight: 800; display: inline-block; padding: 4px 10px; border-radius: 12px; background: ${driver.status === 'online' ? '#ECFDF5' : driver.status === 'in_transit' ? '#F0F9FF' : '#F1F5F9'}; color: ${badgeColor};">
                    ${driver.status === 'online' ? '🟢 Online & Ready' : driver.status === 'in_transit' ? '📦 On Delivery' : '⚪ Offline'}
                  </div>
                </div>
              `);
              infoWindowRef.current.setPosition(pos);
              infoWindowRef.current.open(map);
            }
          });

          const panes = this.getPanes();
          if (panes) panes.overlayMouseTarget.appendChild(div);
          (this as any).div = div;
        };

        overlay.draw = function () {
          const projection = this.getProjection();
          const div = (this as any).div;
          if (projection && div) {
            const point = projection.fromLatLngToDivPixel(new google.maps.LatLng(pos.lat, pos.lng));
            if (point) {
              div.style.left = point.x + 'px';
              div.style.top = point.y + 'px';
            }
          }
        };

        overlay.onRemove = function () {
          const div = (this as any).div;
          if (div && div.parentNode) {
            div.parentNode.removeChild(div);
          }
        };

        overlay.setMap(map);
        overlaysRef.current[driver.id] = overlay;
      });

      if (selectedDriverId && overlaysRef.current[selectedDriverId]) {
        const selDriver = drivers.find((d) => d.id === selectedDriverId);
        if (selDriver && selDriver.current_lat && selDriver.current_lng) {
          map.panTo({ lat: selDriver.current_lat, lng: selDriver.current_lng });
        }
      }
    }
  }, [drivers, center, selectedDriverId]);

  const handleRecenterDevice = () => {
    if (deviceLocationRef.current && googleMapObj.current) {
      googleMapObj.current.panTo(deviceLocationRef.current);
      googleMapObj.current.setZoom(15);
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '400px', borderRadius: '16px', overflow: 'hidden' }}>
      <div ref={mapRef} style={{ width: '100%', height: '100%', minHeight: '400px' }} />

      {/* Recenter on Device Location Button */}
      {hasDevicePos && (
        <button
          onClick={handleRecenterDevice}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            zIndex: 10,
            padding: '8px 14px',
            fontSize: '12px',
            fontWeight: '800',
            backgroundColor: '#FFFFFF',
            color: '#0F172A',
            border: '1px solid #CBD5E1',
            borderRadius: '10px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          🎯 My Location
        </button>
      )}

      {/* Map Legend Overlay */}
      <div style={{
        position: 'absolute',
        bottom: '16px',
        left: '16px',
        backgroundColor: 'rgba(255, 255, 255, 0.94)',
        backdropFilter: 'blur(8px)',
        padding: '10px 16px',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        fontSize: '12px',
        fontWeight: '700',
        zIndex: 5,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10B981' }} />
          <span>Online ({drivers.filter(d => d.status === 'online').length})</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#0284C7' }} />
          <span>In Transit ({drivers.filter(d => d.status === 'in_transit').length})</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#94A3B8' }} />
          <span>Offline ({drivers.filter(d => d.status === 'offline').length})</span>
        </div>
      </div>
    </div>
  );
}
