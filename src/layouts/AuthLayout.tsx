import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import heroBgImg from '../assets/Hero_home.png';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#FFFFFF' }}>
      
      {/* Left Column: 65% Stable Visual Image Banner (No text, no dark overlay) */}
      <div style={{
        width: '65%',
        flex: '0 0 65%',
        position: 'sticky',
        top: 0,
        height: '100vh',
        backgroundColor: '#F8FAFC',
        overflow: 'hidden',
        borderRight: '1px solid #E2E8F0',
      }} className="auth-left-banner-col">
        <img
          src={heroBgImg}
          alt="Deliva Fleet Portal"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center',
            display: 'block',
          }}
        />
      </div>

      {/* Right Column: 35% Form Area */}
      <div className="auth-form-col" style={{
        width: '35%',
        flex: '0 0 35%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '60px 40px',
        backgroundColor: '#FFFFFF',
        overflowY: 'auto',
        minHeight: '100vh',
      }}>
        <div style={{ maxWidth: '440px', width: '100%' }}>
          
          <button
            onClick={() => navigate('/')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'none',
              border: 'none',
              color: '#64748B',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              marginBottom: '32px',
            }}
          >
            <ArrowLeft size={16} /> Back to Home
          </button>

          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#0F172A', letterSpacing: '-0.5px', marginBottom: '8px' }}>
              {title}
            </h2>
            <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.5 }}>
              {subtitle}
            </p>
          </div>

          {children}

        </div>
      </div>

    </div>
  );
}
