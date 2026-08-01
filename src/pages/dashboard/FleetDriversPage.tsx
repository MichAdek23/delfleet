import React, { useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { UserPlus, Search, ShieldCheck, MapPin, Truck, ExternalLink } from 'lucide-react';
import { FleetDriver } from '../../components/FleetMap';

export function FleetDriversPage() {
  const navigate = useNavigate();
  const { drivers } = useOutletContext<any>();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'online' | 'in_transit' | 'offline'>('all');

  const filteredDrivers = drivers.filter((driver: FleetDriver) => {
    const matchesSearch =
      driver.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      driver.vehicle_plate.toLowerCase().includes(searchQuery.toLowerCase()) ||
      driver.vehicle_type.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'online' && driver.status === 'online') ||
      (statusFilter === 'in_transit' && driver.status === 'in_transit') ||
      (statusFilter === 'offline' && driver.status === 'offline');

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1000px', width: '100%', margin: '0 auto' }}>
      
      {/* Top Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#0F172A', letterSpacing: '-0.5px' }}>
            Fleet Drivers Roster
          </h1>
          <p style={{ fontSize: '14px', color: '#475569', marginTop: '2px' }}>
            Manage all drivers attached to your fleet company database ({drivers.length} Total Drivers)
          </p>
        </div>

        <button
          onClick={() => navigate('/dashboard/add-driver')}
          className="btn-primary-deliva"
          style={{ padding: '12px 24px', fontSize: '14px', borderRadius: '12px' }}
        >
          <UserPlus size={18} />
          Register New Driver
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="card-deliva" style={{ padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        
        {/* Search */}
        <div style={{ position: 'relative', minWidth: '320px', flex: 1 }}>
          <Search size={18} color="#94A3B8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search driver by name, plate number, or vehicle type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '11px 14px 11px 40px',
              borderRadius: '10px',
              border: '1px solid #CBD5E1',
              fontSize: '13px',
              color: '#0F172A',
            }}
          />
        </div>

        {/* Status Filter Buttons */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {(['all', 'online', 'in_transit', 'offline'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: '700',
                cursor: 'pointer',
                border: 'none',
                backgroundColor: statusFilter === filter ? '#0D1B2A' : '#F1F5F9',
                color: statusFilter === filter ? '#FFFFFF' : '#475569',
                textTransform: 'capitalize',
              }}
            >
              {filter.replace('_', ' ')}
            </button>
          ))}
        </div>

      </div>

      {/* Drivers Roster Table */}
      <div className="card-deliva" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', fontSize: '12px', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              <th style={{ padding: '16px 20px' }}>Driver Name</th>
              <th style={{ padding: '16px 20px' }}>Vehicle Info</th>
              <th style={{ padding: '16px 20px' }}>Status</th>
              <th style={{ padding: '16px 20px' }}>Completed Trips</th>
              <th style={{ padding: '16px 20px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDrivers.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: '48px', textAlign: 'center', color: '#94A3B8', fontSize: '14px' }}>
                  No drivers found matching your search.
                </td>
              </tr>
            ) : (
              filteredDrivers.map((driver: FleetDriver) => (
                <tr key={driver.id} style={{ borderBottom: '1px solid #F1F5F9', fontSize: '14px' }}>
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ fontWeight: '700', color: '#0F172A' }}>{driver.name}</div>
                    <div style={{ fontSize: '12px', color: '#64748B' }}>{driver.phone}</div>
                  </td>

                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: '700', color: '#0D1B2A' }}>{driver.vehicle_type}</span>
                      <span style={{ fontSize: '11px', fontWeight: '800', backgroundColor: '#FEF2F2', color: '#FF6B6B', padding: '2px 8px', borderRadius: '6px' }}>
                        {driver.vehicle_plate}
                      </span>
                    </div>
                  </td>

                  <td style={{ padding: '16px 20px' }}>
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '700',
                      backgroundColor:
                        driver.status === 'online' ? 'rgba(16, 185, 129, 0.12)' :
                        driver.status === 'in_transit' ? 'rgba(56, 189, 248, 0.15)' :
                        'rgba(148, 163, 184, 0.15)',
                      color:
                        driver.status === 'online' ? '#10B981' :
                        driver.status === 'in_transit' ? '#0284C7' :
                        '#64748B',
                    }}>
                      ● {driver.status === 'in_transit' ? 'In Transit' : driver.status.toUpperCase()}
                    </span>
                  </td>

                  <td style={{ padding: '16px 20px', fontWeight: '700', color: '#0F172A' }}>
                    {driver.total_deliveries_count || 0} Trips
                  </td>

                  <td style={{ padding: '16px 20px' }}>
                    <button
                      onClick={() => navigate(`/dashboard/drivers/${driver.id}`)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        backgroundColor: '#F1F5F9',
                        color: '#0F172A',
                        border: 'none',
                        padding: '8px 14px',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: '700',
                        cursor: 'pointer',
                      }}
                    >
                      View Details & Stats
                      <ExternalLink size={14} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}
