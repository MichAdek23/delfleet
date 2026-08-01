import React, { useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { MapPin, Search, Phone, ExternalLink, RefreshCw, Compass } from 'lucide-react';
import { FleetMap, FleetDriver } from '../../components/FleetMap';

export function FullMapPage() {
  const navigate = useNavigate();
  const { drivers, onRefresh, loading } = useOutletContext<any>();

  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'online' | 'in_transit' | 'offline'>('all');

  const filteredDrivers = (drivers || []).filter((driver: FleetDriver) => {
    const matchesSearch =
      driver.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      driver.vehicle_plate.toLowerCase().includes(searchQuery.toLowerCase()) ||
      driver.phone.includes(searchQuery);

    const matchesStatus = statusFilter === 'all' || driver.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const selectedDriver = drivers.find((d: FleetDriver) => d.id === selectedDriverId);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)', width: '100%', gap: '16px' }}>
      
      {/* Top Controls Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', backgroundColor: '#FFFFFF', padding: '16px 24px', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#0F172A', letterSpacing: '-0.5px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Compass size={22} color="#FF6B6B" /> Live Drivers Fleet Tracking Map
          </h1>
          <p style={{ fontSize: '13px', color: '#475569', marginTop: '2px' }}>
            Real-time GPS positioning of all active drivers with profile pictures and status tracking.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={onRefresh}
            className="btn-secondary-deliva"
            style={{ padding: '8px 16px', fontSize: '13px' }}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh GPS
          </button>
        </div>
      </div>

      {/* Main Full Map Workspace Split */}
      <div className="mobile-grid-1col" style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: '16px', flex: 1, minHeight: 0 }}>
        
        {/* Left Side: Drivers Roster Sidebar */}
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', overflow: 'hidden' }}>
          
          {/* Search Input */}
          <div style={{ position: 'relative' }}>
            <Search size={16} color="#64748B" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search driver by name, plate..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px 10px 36px',
                borderRadius: '10px',
                border: '1px solid #CBD5E1',
                fontSize: '13px',
              }}
            />
          </div>

          {/* Status Filter Tabs */}
          <div style={{ display: 'flex', gap: '6px', backgroundColor: '#F8FAFC', padding: '4px', borderRadius: '10px' }}>
            {[
              { id: 'all', label: 'All' },
              { id: 'online', label: 'Online' },
              { id: 'in_transit', label: 'Transit' },
              { id: 'offline', label: 'Offline' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id as any)}
                style={{
                  flex: 1,
                  padding: '6px 4px',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '11px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  backgroundColor: statusFilter === tab.id ? '#0D1B2A' : 'transparent',
                  color: statusFilter === tab.id ? '#FFFFFF' : '#64748B',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Drivers Roster List */}
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {filteredDrivers.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: '#94A3B8', fontSize: '13px' }}>
                No matching drivers found.
              </div>
            ) : (
              filteredDrivers.map((driver: FleetDriver) => {
                const avatar = driver.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(driver.name)}&background=0D1B2A&color=fff&bold=true`;
                const isSelected = selectedDriverId === driver.id;
                const badgeColor = driver.status === 'online' ? '#10B981' : driver.status === 'in_transit' ? '#0284C7' : '#94A3B8';

                return (
                  <div
                    key={driver.id}
                    onClick={() => setSelectedDriverId(driver.id)}
                    style={{
                      padding: '12px',
                      borderRadius: '12px',
                      border: isSelected ? '2px solid #FF6B6B' : '1px solid #E2E8F0',
                      backgroundColor: isSelected ? '#FFF0EC' : '#FFFFFF',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ position: 'relative', width: '40px', height: '40px', flexShrink: 0 }}>
                      <img src={avatar} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #CBD5E1' }} />
                      <span style={{ position: 'absolute', bottom: 0, right: 0, width: '11px', height: '11px', borderRadius: '50%', background: badgeColor, border: '2px solid #FFFFFF' }} />
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '14px', fontWeight: '800', color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {driver.name}
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                        <span>🚗 {driver.vehicle_plate}</span>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/dashboard/drivers/${driver.id}`);
                      }}
                      style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', padding: '4px' }}
                      title="View Driver Details"
                    >
                      <ExternalLink size={16} />
                    </button>
                  </div>
                );
              })
            )}
          </div>

        </div>

        {/* Right Side: Full Map View */}
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', overflow: 'hidden', height: '100%', width: '100%', position: 'relative' }}>
          <FleetMap
            drivers={filteredDrivers}
            selectedDriverId={selectedDriverId}
            onSelectDriver={(id) => setSelectedDriverId(id)}
            center={selectedDriver && selectedDriver.current_lat ? { lat: selectedDriver.current_lat, lng: selectedDriver.current_lng || 3.3792 } : undefined}
          />
        </div>

      </div>

    </div>
  );
}
