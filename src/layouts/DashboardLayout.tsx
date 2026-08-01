import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Percent,
  CreditCard,
  Settings,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  Building2,
  RefreshCw,
  Bell,
  Search,
} from 'lucide-react';

interface DashboardLayoutProps {
  company: any;
  drivers: any[];
  transactions: any[];
  onLogout: () => void;
  loading: boolean;
  onRefresh: () => void;
  setIsAddDriverOpen: (open: boolean) => void;
  setIsWithdrawalOpen: (open: boolean) => void;
  handleSaveCommission: (rate: number) => Promise<void>;
}

export function DashboardLayout({
  company,
  drivers,
  transactions,
  onLogout,
  loading,
  onRefresh,
  setIsAddDriverOpen,
  setIsWithdrawalOpen,
  handleSaveCommission,
}: DashboardLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const navItems = [
    { label: 'Overview', path: '/dashboard', icon: LayoutDashboard, end: true },
    { label: 'Drivers & Live Map', path: '/dashboard/drivers', icon: Users },
    { label: 'Commission Rates', path: '/dashboard/commissions', icon: Percent },
    { label: 'Bank Payouts', path: '/dashboard/payouts', icon: CreditCard },
    { label: 'Company Settings', path: '/dashboard/settings', icon: Settings },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F8FAFC' }}>
      
      {/* Mobile Drawer Overlay Backdrop */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(4px)',
            zIndex: 999,
          }}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        style={{
          width: '270px',
          backgroundColor: '#0D1B2A',
          color: '#FFFFFF',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          top: 0,
          bottom: 0,
          left: 0,
          zIndex: 1000,
          transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          transform: mobileMenuOpen ? 'translateX(0)' : 'translateX(0)',
          boxShadow: '4px 0 24px rgba(0, 0, 0, 0.12)',
        }}
        className="sidebar-container"
      >
        {/* Brand Header */}
        <div style={{ padding: '24px 24px 20px 24px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div
              onClick={() => navigate('/')}
              style={{ display: 'flex', alignItems: 'baseline', cursor: 'pointer' }}
            >
              <span style={{ fontSize: '26px', fontWeight: '800', color: '#FFFFFF', letterSpacing: '-0.8px' }}>
                deliva
              </span>
              <span style={{ fontSize: '28px', fontWeight: '800', color: '#FF6B6B' }}>.</span>
              <span style={{ fontSize: '11px', fontWeight: '700', color: '#FF6B6B', marginLeft: '6px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Fleet
              </span>
            </div>

            <button
              onClick={() => setMobileMenuOpen(false)}
              style={{ background: 'none', color: '#94A3B8', display: 'none' }}
              className="mobile-close-btn"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Company Profile Card */}
        <div style={{ padding: '16px 20px' }}>
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.06)',
            borderRadius: '16px',
            padding: '14px 16px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              backgroundColor: '#FF6B6B',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '800',
              fontSize: '18px',
            }}>
              {company?.company_name?.[0] || 'C'}
            </div>

            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '14px', fontWeight: '700', color: '#FFFFFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {company?.company_name || 'Fleet Partner'}
              </div>
              <div style={{ fontSize: '11px', color: '#10B981', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '700', marginTop: '2px' }}>
                <ShieldCheck size={12} /> Verified Company
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav style={{ flex: 1, padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                onClick={() => setMobileMenuOpen(false)}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  borderRadius: '14px',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: isActive ? '700' : '600',
                  color: isActive ? '#FFFFFF' : '#94A3B8',
                  backgroundColor: isActive ? '#FF6B6B' : 'transparent',
                  transition: 'all 0.2s ease',
                  boxShadow: isActive ? '0 4px 14px rgba(255, 107, 107, 0.3)' : 'none',
                })}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom Profile Footer */}
        <div style={{ padding: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <button
            onClick={onLogout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '12px',
              borderRadius: '12px',
              backgroundColor: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              color: '#F87171',
              fontWeight: '700',
              fontSize: '13px',
            }}
          >
            <LogOut size={16} />
            Sign Out Company
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div style={{ flex: 1, marginLeft: '270px', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        
        {/* Top Navbar */}
        <header style={{
          height: '72px',
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid #E2E8F0',
          padding: '0 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 900,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{
                background: 'none',
                border: 'none',
                color: '#0F172A',
                cursor: 'pointer',
                display: 'none',
              }}
              className="mobile-hamburger"
            >
              <Menu size={22} />
            </button>

            <div style={{ fontSize: '18px', fontWeight: '800', color: '#0F172A' }}>
              Fleet Management Portal
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              onClick={onRefresh}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 14px',
                borderRadius: '10px',
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                color: '#475569',
                fontSize: '13px',
                fontWeight: '600',
              }}
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              <span>Refresh Data</span>
            </button>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '6px 14px',
              borderRadius: '20px',
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0',
            }}>
              <Building2 size={16} color="#0D1B2A" />
              <span style={{ fontSize: '13px', fontWeight: '700', color: '#0F172A' }}>
                RC: {company?.registration_number || 'CAC-OK'}
              </span>
            </div>
          </div>
        </header>

        {/* Page Content Rendered Here */}
        <main style={{
          flex: 1,
          padding: '36px 40px',
          maxWidth: '1280px',
          width: '100%',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box',
        }}>
          <Outlet context={{ company, drivers, transactions, loading, onRefresh, setIsAddDriverOpen, setIsWithdrawalOpen, handleSaveCommission }} />
        </main>
      </div>

    </div>
  );
}
