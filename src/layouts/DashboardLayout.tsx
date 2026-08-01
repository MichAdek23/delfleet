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
  Compass,
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
    { label: 'Live GPS Map', path: '/dashboard/full-map', icon: Compass },
    { label: 'Drivers', path: '/dashboard/drivers', icon: Users },
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
          boxShadow: '4px 0 24px rgba(0, 0, 0, 0.12)',
        }}
        className={`sidebar-container sidebar-deliva ${mobileMenuOpen ? 'open' : ''}`}
      >
        {/* Brand Header: Logo without "Fleet" */}
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

        {/* Company Profile Card with RC Number */}
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
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              backgroundColor: '#FF6B6B',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '800',
              fontSize: '18px',
              flexShrink: 0,
            }}>
              {company?.company_name?.[0] || 'C'}
            </div>

            <div style={{ overflow: 'hidden', flex: 1 }}>
              <div style={{ fontSize: '14px', fontWeight: '700', color: '#FFFFFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {company?.company_name || 'Fleet Partner'}
              </div>
              
              <div style={{ fontSize: '11px', color: '#10B981', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '700', marginTop: '2px' }}>
                <ShieldCheck size={12} /> Verified Company
              </div>

              {/* RC Number on Sidebar */}
              <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: '600', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Building2 size={11} color="#94A3B8" />
                <span>RC: {company?.registration_number || 'CAC-OK'}</span>
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
      <div className="dashboard-main-content" style={{ flex: 1, marginLeft: '270px', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        
        {/* Mobile Floating Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="mobile-hamburger"
          style={{
            position: 'fixed',
            top: '16px',
            left: '16px',
            zIndex: 800,
            backgroundColor: '#0D1B2A',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '12px',
            padding: '10px 14px',
            display: 'none',
            alignItems: 'center',
            gap: '8px',
            fontSize: '13px',
            fontWeight: '700',
            boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
          }}
        >
          <Menu size={18} /> Menu
        </button>

        {/* Page Content Rendered Here */}
        <main className="dashboard-main-padding" style={{
          flex: 1,
          padding: '36px 40px',
          maxWidth: '1280px',
          width: '100%',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '32px',
        }}>
          <Outlet context={{ company, drivers, transactions, loading, onRefresh, setIsAddDriverOpen, setIsWithdrawalOpen, handleSaveCommission }} />
        </main>

      </div>
    </div>
  );
}
