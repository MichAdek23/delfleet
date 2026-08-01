import React, { useState, useEffect } from 'react';
import { Truck, ShieldCheck, LogOut, LayoutDashboard, ArrowRight, Menu, X } from 'lucide-react';

interface NavbarProps {
  currentTab?: string;
  onNavigate: (tab: string) => void;
  companyName?: string;
  onLogout?: () => void;
}

export function Navbar({ currentTab, onNavigate, companyName, onLogout }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isTransparentMode = currentTab === 'landing' && !scrolled;

  const logoColor = '#0F172A';
  const linkColor = '#475569';
  const linkActiveColor = '#FF6B6B';

  const handleNavClick = (tab: string) => {
    onNavigate(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
      height: '76px',
      backgroundColor: isTransparentMode ? 'transparent' : 'rgba(255, 255, 255, 0.96)',
      borderBottom: isTransparentMode ? 'none' : '1px solid #E2E8F0',
      backdropFilter: isTransparentMode ? 'none' : 'blur(16px)',
      WebkitBackdropFilter: isTransparentMode ? 'none' : 'blur(16px)',
      boxShadow: isTransparentMode ? 'none' : '0 4px 20px -2px rgba(15, 23, 42, 0.04)',
      transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 24px',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        {/* Main Website Brand Logo: deliva. */}
        <div 
          onClick={() => handleNavClick('landing')}
          style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
        >
          <div style={{ display: 'flex', alignItems: 'baseline' }}>
            <span style={{
              fontSize: '26px',
              fontWeight: '800',
              color: logoColor,
              letterSpacing: '-0.8px',
              transition: 'color 0.3s ease',
            }}>
              deliva
            </span>
            <span style={{ fontSize: '28px', fontWeight: '800', color: '#FF6B6B' }}>.</span>
          </div>
        </div>

        {/* Center Desktop Links */}
        <nav className="mobile-hide" style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          <button
            onClick={() => handleNavClick('landing')}
            style={{
              background: 'none',
              color: currentTab === 'landing' ? linkActiveColor : linkColor,
              fontWeight: currentTab === 'landing' ? '700' : '600',
              fontSize: '14px',
              transition: 'color 0.3s ease',
            }}
          >
            Home
          </button>
          <button
            onClick={() => handleNavClick('landing')}
            style={{
              background: 'none',
              color: linkColor,
              fontWeight: '600',
              fontSize: '14px',
              transition: 'color 0.3s ease',
            }}
          >
            Our Features
          </button>
          <button
            onClick={() => handleNavClick('landing')}
            style={{
              background: 'none',
              color: linkColor,
              fontWeight: '600',
              fontSize: '14px',
              transition: 'color 0.3s ease',
            }}
          >
            Revenue Split
          </button>
          {companyName && (
            <button
              onClick={() => handleNavClick('dashboard')}
              style={{
                background: 'none',
                color: currentTab === 'dashboard' ? linkActiveColor : linkColor,
                fontWeight: currentTab === 'dashboard' ? '700' : '600',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'color 0.3s ease',
              }}
            >
              <LayoutDashboard size={16} />
              Fleet Dashboard
            </button>
          )}
        </nav>

        {/* Right Desktop Actions */}
        <div className="mobile-hide" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {companyName ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 14px',
                borderRadius: '20px',
                backgroundColor: isTransparentMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 107, 107, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
              }}>
                <ShieldCheck size={16} color="#10B981" />
                <span style={{ color: isTransparentMode ? '#FFFFFF' : '#0F172A', fontWeight: '700', fontSize: '13px' }}>
                  {companyName}
                </span>
              </div>

              {onLogout && (
                <button
                  onClick={onLogout}
                  className="btn-secondary-deliva"
                  style={{
                    padding: '8px 18px',
                    fontSize: '13px',
                    borderRadius: '30px',
                    color: '#EF4444',
                    borderColor: '#FECACA',
                    backgroundColor: isTransparentMode ? 'rgba(255, 255, 255, 0.9)' : 'transparent',
                  }}
                >
                  <LogOut size={14} />
                  Sign Out
                </button>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                onClick={() => handleNavClick('login')}
                className="btn-secondary-deliva"
                style={{
                  padding: '10px 22px',
                  fontSize: '14px',
                  borderRadius: '30px',
                  color: isTransparentMode ? '#FFFFFF' : '#0D1B2A',
                  borderColor: isTransparentMode ? 'rgba(255, 255, 255, 0.5)' : '#0D1B2A',
                  backgroundColor: isTransparentMode ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                }}
              >
                Sign In
              </button>
              <button
                onClick={() => handleNavClick('signup')}
                className="btn-primary-deliva"
                style={{ padding: '10px 22px', fontSize: '14px', borderRadius: '30px' }}
              >
                Register
                <ArrowRight size={16} />
              </button>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Toggle Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="mobile-hamburger"
          style={{
            background: 'none',
            border: 'none',
            color: isTransparentMode ? '#FFFFFF' : '#0F172A',
            padding: '8px',
            cursor: 'pointer',
          }}
        >
          {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/* Mobile Menu Slide-down Drawer */}
      {mobileMenuOpen && (
        <div style={{
          position: 'fixed',
          top: '76px',
          left: 0,
          right: 0,
          backgroundColor: '#0D1B2A',
          color: '#FFFFFF',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          zIndex: 999,
        }}>
          <button
            onClick={() => handleNavClick('landing')}
            style={{
              textAlign: 'left',
              background: 'none',
              color: '#FFFFFF',
              fontSize: '16px',
              fontWeight: '700',
              padding: '10px 0',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            Home
          </button>
          
          {companyName ? (
            <>
              <button
                onClick={() => handleNavClick('dashboard')}
                className="btn-primary-deliva"
                style={{ width: '100%', justifyContent: 'center', marginTop: '8px' }}
              >
                <LayoutDashboard size={18} />
                Open Fleet Dashboard
              </button>
              {onLogout && (
                <button
                  onClick={() => { onLogout(); setMobileMenuOpen(false); }}
                  className="btn-secondary-deliva"
                  style={{ width: '100%', justifyContent: 'center', color: '#EF4444', borderColor: '#EF4444' }}
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
              )}
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
              <button
                onClick={() => handleNavClick('signup')}
                className="btn-primary-deliva"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                Register Fleet Company (₦30,000)
                <ArrowRight size={18} />
              </button>
              <button
                onClick={() => handleNavClick('login')}
                className="btn-secondary-deliva"
                style={{ width: '100%', justifyContent: 'center', color: '#FFFFFF', borderColor: '#FFFFFF' }}
              >
                Sign In to Fleet Portal
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
