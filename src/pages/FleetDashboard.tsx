import React, { useState, useEffect } from 'react';
import {
  Users,
  Truck,
  Wallet,
  TrendingUp,
  Percent,
  Plus,
  ArrowUpRight,
  ShieldCheck,
  RefreshCw,
  Search,
  CheckCircle2,
  Clock,
  MapPin,
  CircleDot,
  FileText
} from 'lucide-react';
import { FleetMap, FleetDriver } from '../components/FleetMap';
import { CommissionControl } from '../components/CommissionControl';
import { AddDriverModal } from '../components/AddDriverModal';
import { WithdrawalModal } from '../components/WithdrawalModal';
import { supabase } from '../lib/supabase';

interface FleetDashboardProps {
  company: any;
}

export function FleetDashboard({ company: initialCompany }: FleetDashboardProps) {
  const [company, setCompany] = useState(initialCompany);
  const [drivers, setDrivers] = useState<FleetDriver[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modals
  const [isAddDriverOpen, setIsAddDriverOpen] = useState(false);
  const [isWithdrawalOpen, setIsWithdrawalOpen] = useState(false);
  const [driverSearchQuery, setDriverSearchQuery] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, [company?.id]);

  const fetchDashboardData = async () => {
    if (!company?.id) return;
    try {
      setLoading(true);

      const { data: updatedComp } = await supabase
        .from('fleet_companies')
        .select('*')
        .eq('id', company.id)
        .maybeSingle();

      if (updatedComp) setCompany(updatedComp);

      const { data: driverProfiles } = await supabase
        .from('profiles')
        .select('*')
        .eq('fleet_id', company.id);

      if (driverProfiles) {
        const mappedDrivers: FleetDriver[] = driverProfiles.map((d) => ({
          id: d.id,
          name: `${d.first_name || 'Driver'} ${d.last_name || ''}`,
          phone: d.phone || 'N/A',
          status: d.is_online ? (d.on_delivery ? 'in_transit' : 'online') : 'offline',
          vehicle_type: d.vehicle_type || 'Motorcycle',
          vehicle_plate: d.vehicle_plate_number || d.license_number || 'REG-PENDING',
          current_lat: d.current_latitude ? Number(d.current_latitude) : 6.5244 + (Math.random() - 0.5) * 0.04,
          current_lng: d.current_longitude ? Number(d.current_longitude) : 3.3792 + (Math.random() - 0.5) * 0.04,
          total_deliveries_count: d.total_deliveries_count || 0,
        }));
        setDrivers(mappedDrivers);
      }

      const { data: txList } = await supabase
        .from('fleet_transactions')
        .select('*')
        .eq('fleet_company_id', company.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (txList) setTransactions(txList);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCommission = async (newPercentage: number) => {
    const { error } = await supabase
      .from('fleet_companies')
      .update({ commission_percentage: newPercentage })
      .eq('id', company.id);

    if (error) throw error;
    setCompany((prev: any) => ({ ...prev, commission_percentage: newPercentage }));
  };

  const handleAddDriver = async (driverData: any) => {
    const { error } = await supabase
      .from('profiles')
      .insert({
        nin: driverData.nin,
        nin_verified: true,
        first_name: driverData.first_name,
        middle_name: driverData.middle_name || null,
        last_name: driverData.last_name,
        email: driverData.email,
        phone: driverData.phone,
        address: driverData.address || null,
        role: 'driver',
        fleet_id: company.id,
        is_fleet_driver: true,
        vehicle_type: driverData.vehicle_type,
        vehicle_plate_number: driverData.vehicle_plate,
        vehicle_make_model: driverData.vehicle_make_model,
        vehicle_color: driverData.vehicle_color,
        avatar_url: driverData.avatar_url || null,
        is_verified: true,
      });

    if (error) throw error;

    // Trigger driver welcome email credentials dispatch if function endpoint exists
    try {
      await supabase.functions.invoke('send-email-otp', {
        body: {
          email: driverData.email,
          type: 'driver_welcome',
          password: driverData.password,
          company_name: company?.company_name || 'Fleet Partner',
        },
      });
    } catch (e) {
      console.warn('[Welcome Email Notice]', e);
    }

    await fetchDashboardData();
  };

  const handleRequestWithdrawal = async (amount: number, bankDetails: any) => {
    const { error: dbErr } = await supabase.rpc('increment_fleet_wallet_balance', {
      p_fleet_company_id: company.id,
      p_amount: -amount,
    });

    if (dbErr) throw dbErr;

    await supabase.from('fleet_transactions').insert({
      fleet_company_id: company.id,
      transaction_type: 'withdrawal',
      gross_amount: amount,
      fleet_commission: amount,
      status: 'completed',
      description: `Payout transfer to ${bankDetails.bank_name} (${bankDetails.account_number})`,
    });

    await fetchDashboardData();
  };

  const filteredDrivers = drivers.filter(
    (d) =>
      d.name.toLowerCase().includes(driverSearchQuery.toLowerCase()) ||
      d.vehicle_plate.toLowerCase().includes(driverSearchQuery.toLowerCase()) ||
      d.phone.includes(driverSearchQuery)
  );

  return (
    <div className="animate-fade-in" style={{ backgroundColor: '#f8fafc', padding: '32px 24px 80px 24px', minHeight: 'calc(100vh - 72px)' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        
        {/* Top Header Banner */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '24px 32px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 4px rgba(15, 23, 42, 0.03)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '28px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: '14px',
              backgroundColor: '#204b7a',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '22px',
              fontWeight: '800',
            }}>
              {company.company_name?.[0] || 'F'}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a' }}>{company.company_name}</h1>
                <span style={{ fontSize: '12px', fontWeight: '700', color: '#10b981', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <ShieldCheck size={14} color="#10b981" /> Verified Partner
                </span>
              </div>
              <div style={{ fontSize: '13px', color: '#64748b', marginTop: '3px', display: 'flex', gap: '14px' }}>
                <span>CAC RC: <strong>{company.registration_number}</strong></span>
                <span>•</span>
                <span>Contact: <strong>{company.contact_name}</strong></span>
                <span>•</span>
                <span>Onboarding: <strong style={{ color: '#10b981' }}>Paid (₦30,000)</strong></span>
              </div>
            </div>
          </div>

          <button
            onClick={fetchDashboardData}
            className="btn-outline"
            style={{ padding: '9px 16px', fontSize: '13px' }}
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {/* Metric Cards Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '28px' }}>
          
          <div className="deliva-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '13px', fontWeight: '700', color: '#64748b' }}>Company Wallet</span>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Wallet size={18} color="#10b981" />
              </div>
            </div>
            <div style={{ fontSize: '26px', fontWeight: '800', color: '#0f172a', marginBottom: '12px' }}>
              ₦{Number(company.wallet_balance || 0).toLocaleString()}
            </div>
            <button
              onClick={() => setIsWithdrawalOpen(true)}
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '8px', fontSize: '12px', borderRadius: '8px' }}
            >
              Request Payout
              <ArrowUpRight size={14} />
            </button>
          </div>

          <div className="deliva-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '13px', fontWeight: '700', color: '#64748b' }}>Total Fleet Earnings</span>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'rgba(32, 75, 122, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <TrendingUp size={18} color="#204b7a" />
              </div>
            </div>
            <div style={{ fontSize: '26px', fontWeight: '800', color: '#204b7a', marginBottom: '6px' }}>
              ₦{Number(company.total_earned || 0).toLocaleString()}
            </div>
            <span style={{ fontSize: '12px', color: '#10b981', fontWeight: '600' }}>
              ↑ 3-way auto-split active
            </span>
          </div>

          <div className="deliva-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '13px', fontWeight: '700', color: '#64748b' }}>Fleet Drivers</span>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'rgba(255, 107, 107, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Users size={18} color="#ff6b6b" />
              </div>
            </div>
            <div style={{ fontSize: '26px', fontWeight: '800', color: '#0f172a', marginBottom: '6px' }}>
              {drivers.length} Drivers
            </div>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>
              🟢 {drivers.filter(d => d.status === 'online' || d.status === 'in_transit').length} Active Now
            </span>
          </div>

          <div className="deliva-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '13px', fontWeight: '700', color: '#64748b' }}>Company Rate</span>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'rgba(2, 132, 199, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Percent size={18} color="#0284c7" />
              </div>
            </div>
            <div style={{ fontSize: '26px', fontWeight: '800', color: '#0f172a', marginBottom: '6px' }}>
              {company.commission_percentage}%
            </div>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>
              Deliva Fee: 10% (Fixed)
            </span>
          </div>

        </div>

        {/* Live Map + Commission Control Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '7fr 5fr', gap: '24px', marginBottom: '28px' }}>
          
          <div className="deliva-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>Live Drivers Location Map</h3>
                <p style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>Real-time GPS tracking for active fleet drivers</p>
              </div>
              <button
                onClick={() => setIsAddDriverOpen(true)}
                className="btn-primary"
                style={{ padding: '8px 14px', fontSize: '13px', borderRadius: '8px' }}
              >
                <Plus size={15} /> Onboard Driver
              </button>
            </div>

            <div style={{ flex: 1, minHeight: '380px' }}>
              <FleetMap drivers={drivers} />
            </div>
          </div>

          <div>
            <CommissionControl
              currentCommission={Number(company.commission_percentage || 15)}
              delivaCommission={Number(company.deliva_commission_percentage || 10)}
              onSaveCommission={handleSaveCommission}
            />
          </div>

        </div>

        {/* Driver Management Directory */}
        <div className="deliva-card" style={{ padding: '24px', marginBottom: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>Fleet Driver Directory</h3>
              <p style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>Registered drivers associated with {company.company_name}</p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ position: 'relative', width: '240px' }}>
                <Search size={15} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  placeholder="Search drivers..."
                  value={driverSearchQuery}
                  onChange={(e) => setDriverSearchQuery(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px 8px 34px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <button onClick={() => setIsAddDriverOpen(true)} className="btn-primary" style={{ padding: '8px 16px', fontSize: '13px', borderRadius: '8px' }}>
                <Plus size={15} /> Onboard Driver
              </button>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #f1f5f9', color: '#64748b', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  <th style={{ padding: '12px 16px' }}>Driver Name</th>
                  <th style={{ padding: '12px 16px' }}>Vehicle Details</th>
                  <th style={{ padding: '12px 16px' }}>Phone</th>
                  <th style={{ padding: '12px 16px' }}>Status</th>
                  <th style={{ padding: '12px 16px' }}>Total Deliveries</th>
                </tr>
              </thead>
              <tbody>
                {filteredDrivers.length > 0 ? (
                  filteredDrivers.map((driver) => (
                    <tr key={driver.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '14px 16px', fontWeight: '700', color: '#0f172a' }}>
                        {driver.name}
                      </td>
                      <td style={{ padding: '14px 16px', color: '#475569' }}>
                        🚗 {driver.vehicle_type} ({driver.vehicle_plate})
                      </td>
                      <td style={{ padding: '14px 16px', color: '#475569' }}>
                        {driver.phone}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{
                          padding: '4px 10px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: '700',
                          backgroundColor: driver.status === 'online' ? '#dcfce7' : driver.status === 'in_transit' ? '#e0f2fe' : '#f1f5f9',
                          color: driver.status === 'online' ? '#166534' : driver.status === 'in_transit' ? '#0369a1' : '#475569',
                        }}>
                          {driver.status === 'online' ? '🟢 Online' : driver.status === 'in_transit' ? '📦 In Transit' : '⚪ Offline'}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', fontWeight: '700', color: '#0f172a' }}>
                        {driver.total_deliveries_count || 0} completed
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '36px', color: '#94a3b8' }}>
                      No registered fleet drivers found. Click <strong>+ Onboard Driver</strong> to register your first driver.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Transactions Table */}
        <div className="deliva-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', marginBottom: '16px' }}>
            Recent Automated 3-Way Split Settlements
          </h3>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #f1f5f9', color: '#64748b', fontSize: '11px', textTransform: 'uppercase' }}>
                  <th style={{ padding: '12px 16px' }}>Timestamp</th>
                  <th style={{ padding: '12px 16px' }}>Gross Fare</th>
                  <th style={{ padding: '12px 16px' }}>Deliva (10%)</th>
                  <th style={{ padding: '12px 16px' }}>Company Share ({company.commission_percentage}%)</th>
                  <th style={{ padding: '12px 16px' }}>Driver Net</th>
                  <th style={{ padding: '12px 16px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length > 0 ? (
                  transactions.map((tx) => (
                    <tr key={tx.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px 16px', color: '#64748b' }}>
                        {new Date(tx.created_at).toLocaleString()}
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: '700', color: '#0f172a' }}>
                        ₦{Number(tx.gross_amount).toLocaleString()}
                      </td>
                      <td style={{ padding: '12px 16px', color: '#0284c7', fontWeight: '600' }}>
                        ₦{Number(tx.deliva_commission).toLocaleString()}
                      </td>
                      <td style={{ padding: '12px 16px', color: '#204b7a', fontWeight: '700' }}>
                        ₦{Number(tx.fleet_commission).toLocaleString()}
                      </td>
                      <td style={{ padding: '12px 16px', color: '#166534', fontWeight: '700' }}>
                        ₦{Number(tx.driver_earning).toLocaleString()}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ padding: '3px 8px', borderRadius: '8px', backgroundColor: '#dcfce7', color: '#15803d', fontWeight: '700', fontSize: '11px' }}>
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: '#94a3b8' }}>
                      No split transactions recorded yet. Completed trips from your drivers will appear here automatically.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modals */}
        <AddDriverModal
          isOpen={isAddDriverOpen}
          onClose={() => setIsAddDriverOpen(false)}
          onAddDriver={handleAddDriver}
        />

        <WithdrawalModal
          isOpen={isWithdrawalOpen}
          onClose={() => setIsWithdrawalOpen(false)}
          currentBalance={Number(company.wallet_balance || 0)}
          onRequestWithdrawal={handleRequestWithdrawal}
        />
      </div>
    </div>
  );
}
