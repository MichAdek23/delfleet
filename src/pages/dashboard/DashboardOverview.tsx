import React from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import {
  Wallet,
  Users,
  Percent,
  TrendingUp,
  MapPin,
  Plus,
  ArrowUpRight,
  ShieldCheck,
  CreditCard,
  Clock,
} from 'lucide-react';
import { FleetMap } from '../../components/FleetMap';

export function DashboardOverview() {
  const navigate = useNavigate();
  const {
    company,
    drivers,
    transactions,
    setIsAddDriverOpen,
    setIsWithdrawalOpen,
  } = useOutletContext<any>();

  const onlineDrivers = drivers.filter((d: any) => d.status !== 'offline').length;
  const inTransitDrivers = drivers.filter((d: any) => d.status === 'in_transit').length;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '1000px', width: '100%', margin: '0 auto' }}>
      
      {/* Welcome Banner */}
      <div style={{
        backgroundColor: '#0D1B2A',
        borderRadius: '24px',
        padding: '32px 40px',
        color: '#FFFFFF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ maxWidth: '520px', zIndex: 2 }}>
          <div style={{ fontSize: '13px', fontWeight: '700', color: '#FF6B6B', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '8px' }}>
            OVERVIEW DASHBOARD
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '8px', letterSpacing: '-0.5px' }}>
            Welcome back, {company?.contact_name || company?.company_name}
          </h1>
          <p style={{ fontSize: '14px', color: '#94A3B8', lineHeight: 1.6 }}>
            Manage your corporate fleet, monitor real-time driver routes, configure commission rates, and execute instant wallet payouts.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', zIndex: 2 }}>
          <button
            onClick={() => navigate('/dashboard/add-driver')}
            className="btn-primary-deliva"
            style={{ padding: '12px 24px', fontSize: '14px' }}
          >
            <Plus size={16} />
            Add New Driver
          </button>
          <button
            onClick={() => navigate('/dashboard/request-payout')}
            className="btn-secondary-deliva"
            style={{ padding: '12px 24px', fontSize: '14px', borderColor: '#FFFFFF', color: '#FFFFFF' }}
          >
            <CreditCard size={16} />
            Request Payout
          </button>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="mobile-grid-1col" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
        
        <div className="card-deliva" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', fontWeight: '700', color: '#475569' }}>Company Wallet Balance</span>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Wallet size={20} color="#10B981" />
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: '800', color: '#0F172A', marginBottom: '12px' }}>
            ₦{Number(company?.wallet_balance || 0).toLocaleString()}
          </div>
          <button
            onClick={() => setIsWithdrawalOpen(true)}
            style={{ background: 'none', color: '#FF6B6B', fontSize: '13px', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
          >
            Withdraw Funds <ArrowUpRight size={14} />
          </button>
        </div>

        <div className="card-deliva" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', fontWeight: '700', color: '#475569' }}>Registered Drivers</span>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: 'rgba(13, 27, 42, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={20} color="#0D1B2A" />
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: '800', color: '#0F172A', marginBottom: '12px' }}>
            {drivers.length}
          </div>
          <div style={{ fontSize: '13px', color: '#10B981', fontWeight: '600' }}>
            ● {onlineDrivers} Online Now ({inTransitDrivers} On Delivery)
          </div>
        </div>

        <div className="card-deliva" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', fontWeight: '700', color: '#475569' }}>Company Commission Rate</span>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: 'rgba(255, 107, 107, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Percent size={20} color="#FF6B6B" />
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: '800', color: '#FF6B6B', marginBottom: '12px' }}>
            {company?.commission_percentage || 15}%
          </div>
          <button
            onClick={() => navigate('/dashboard/commissions')}
            style={{ background: 'none', color: '#0D1B2A', fontSize: '13px', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
          >
            Adjust Rate <ArrowUpRight size={14} />
          </button>
        </div>

        <div className="card-deliva" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', fontWeight: '700', color: '#475569' }}>Deliva Platform Fee</span>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: 'rgba(56, 189, 248, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={20} color="#0284C7" />
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: '800', color: '#0284C7', marginBottom: '12px' }}>
            10.0%
          </div>
          <div style={{ fontSize: '13px', color: '#64748B', fontWeight: '600' }}>
            Fixed Platform Commission
          </div>
        </div>

      </div>

      {/* Live Drivers Map & Route Tracking Card */}
      <div className="card-deliva" style={{ padding: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0F172A' }}>Real-Time Fleet Live Map</h3>
            <p style={{ fontSize: '13px', color: '#475569', marginTop: '2px' }}>
              Live driver tracking across Lagos with real-time status pins
            </p>
          </div>
          <button
            onClick={() => navigate('/dashboard/full-map')}
            className="btn-secondary-deliva"
            style={{ padding: '8px 18px', fontSize: '13px' }}
          >
            📍 Open Full Map View
          </button>
        </div>

        <div style={{ height: '380px', borderRadius: '16px', overflow: 'hidden', border: '1px solid #E2E8F0' }}>
          <FleetMap drivers={drivers} selectedDriverId={null} onSelectDriver={() => {}} />
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="card-deliva" style={{ padding: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0F172A' }}>Recent Fleet Transactions</h3>
          <button
            onClick={() => navigate('/dashboard/payouts')}
            style={{ background: 'none', color: '#FF6B6B', fontSize: '13px', fontWeight: '700' }}
          >
            View All Payouts
          </button>
        </div>

        {transactions.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', color: '#94A3B8', fontSize: '14px' }}>
            No recent transaction history recorded yet.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #E2E8F0', textAlign: 'left', color: '#475569', fontSize: '12px', textTransform: 'uppercase' }}>
                  <th style={{ padding: '12px 16px' }}>Date</th>
                  <th style={{ padding: '12px 16px' }}>Type</th>
                  <th style={{ padding: '12px 16px' }}>Description</th>
                  <th style={{ padding: '12px 16px' }}>Gross Trip Fare</th>
                  <th style={{ padding: '12px 16px' }}>Company Share</th>
                  <th style={{ padding: '12px 16px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx: any) => (
                  <tr key={tx.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '14px 16px', color: '#64748B' }}>
                      {new Date(tx.created_at).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: '700', textTransform: 'capitalize' }}>
                      {tx.transaction_type}
                    </td>
                    <td style={{ padding: '14px 16px', color: '#475569' }}>
                      {tx.description || 'Trip commission split'}
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: '700' }}>
                      ₦{Number(tx.gross_amount || 0).toLocaleString()}
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: '800', color: '#10B981' }}>
                      ₦{Number(tx.fleet_commission || 0).toLocaleString()}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '700',
                        backgroundColor: tx.status === 'completed' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(251, 191, 36, 0.15)',
                        color: tx.status === 'completed' ? '#10B981' : '#D97706',
                      }}>
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
