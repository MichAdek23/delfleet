import React from 'react';
import { ArrowRight } from 'lucide-react';
import downloadImg from '../assets/download.webp';
import download1Img from '../assets/dowmload_1.webp';
import appleIcon from '../assets/apple_download_icon.webp';
import googleIcon from '../assets/google_download_icon.webp';

interface FooterProps {
  onNavigate: (tab: string) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  return (
    <footer style={{ backgroundColor: '#FFFFFF', paddingBottom: '48px' }}>
      
      {/* Dark CTA Banner matching Footer.tsx */}
      <div style={{ maxWidth: '1200px', margin: '0 auto 60px auto', padding: '0 20px' }}>
        <div className="mobile-stack" style={{
          borderRadius: '24px',
          backgroundColor: '#151515',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '40px 32px',
          position: 'relative',
          minHeight: '300px',
          overflow: 'hidden',
        }}>
          <div style={{ maxWidth: '520px', zIndex: 10 }}>
            <span style={{
              color: '#FF6B6B',
              fontSize: '12px',
              fontWeight: '800',
              textTransform: 'uppercase',
              letterSpacing: '2px',
              marginBottom: '12px',
              display: 'block',
            }}>
              DELIVA FOR BUSINESS
            </span>
            <h2 className="mobile-title-sm" style={{ fontSize: '36px', fontWeight: '800', color: '#FFFFFF', lineHeight: 1.2, marginBottom: '16px', letterSpacing: '-1px' }}>
              Scale Your Logistics Fleet with Deliva Partner Portal
            </h2>
            <p style={{ fontSize: '15px', color: '#94A3B8', lineHeight: 1.6, marginBottom: '28px' }}>
              Onboard drivers, set your company commission, track live GPS routes, and receive automated instant bank payouts across Nigeria.
            </p>

            <div className="mobile-stack-buttons" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <button
                onClick={() => onNavigate('signup')}
                className="btn-primary-deliva"
                style={{ padding: '16px 36px', fontSize: '16px' }}
              >
                Register Fleet Company (₦30,000)
                <ArrowRight size={18} />
              </button>
            </div>
          </div>

          {/* Phone App Mockups (Hidden on mobile) */}
          <div className="mobile-hide" style={{
            position: 'relative',
            width: '340px',
            height: '280px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <img
              src={downloadImg}
              alt="Deliva Mobile App"
              style={{
                width: '170px',
                position: 'absolute',
                left: '20px',
                bottom: '-20px',
                transform: 'rotate(-8deg)',
                borderRadius: '20px',
                boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
              }}
            />
            <img
              src={download1Img}
              alt="Deliva Driver App"
              style={{
                width: '170px',
                position: 'absolute',
                right: '20px',
                bottom: '-40px',
                transform: 'rotate(8deg)',
                borderRadius: '20px',
                boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                zIndex: 2,
              }}
            />
          </div>
        </div>
      </div>

      {/* Main Footer Links matching Footer.tsx */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
        <div className="mobile-grid-1col" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '32px', marginBottom: '48px' }}>
          
          {/* Logo & Tagline */}
          <div style={{ gridColumn: 'span 1' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', marginBottom: '12px' }}>
              <span style={{ fontSize: '32px', fontWeight: '800', color: '#0F172A', letterSpacing: '-1px' }}>
                deliva
              </span>
              <span style={{ fontSize: '34px', fontWeight: '800', color: '#FF6B6B' }}>.</span>
            </div>
            <p style={{ fontSize: '15px', color: '#475569', fontWeight: '500' }}>
              Beyond deliveries
            </p>
          </div>

          {/* Navigations */}
          <div>
            <div style={{ fontSize: '13px', fontWeight: '800', color: '#0D1B2A', textTransform: 'uppercase', letterSpacing: '1.2px', marginBottom: '16px' }}>
              Navigations
            </div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px', color: '#475569' }}>
              <li onClick={() => onNavigate('landing')} style={{ cursor: 'pointer' }}>Our Features</li>
              <li onClick={() => onNavigate('signup')} style={{ cursor: 'pointer' }}>Apply as Fleet Partner</li>
              <li onClick={() => onNavigate('login')} style={{ cursor: 'pointer' }}>Fleet Portal Login</li>
            </ul>
          </div>

          {/* Product */}
          <div>
            <div style={{ fontSize: '13px', fontWeight: '800', color: '#0D1B2A', textTransform: 'uppercase', letterSpacing: '1.2px', marginBottom: '16px' }}>
              Product
            </div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px', color: '#475569' }}>
              <li>About Product</li>
              <li>Advert Placement</li>
              <li>Work With Us</li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <div style={{ fontSize: '13px', fontWeight: '800', color: '#0D1B2A', textTransform: 'uppercase', letterSpacing: '1.2px', marginBottom: '16px' }}>
              Legal
            </div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px', color: '#475569' }}>
              <li>Privacy Policy</li>
              <li>Terms & Conditions</li>
              <li>Request Account Deletion</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <div style={{ fontSize: '13px', fontWeight: '800', color: '#0D1B2A', textTransform: 'uppercase', letterSpacing: '1.2px', marginBottom: '16px' }}>
              Contact
            </div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px', color: '#475569' }}>
              <li>support@delivaglobe.com</li>
              <li>+234 704 delivaglobe</li>
              <li>Lagos, Nigeria</li>
            </ul>
          </div>

        </div>

        <div style={{ height: '1px', backgroundColor: '#E2E8F0', margin: '32px 0' }} />

        {/* Bottom Metadata */}
        <div className="mobile-stack" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', fontSize: '13px', color: '#94A3B8' }}>
          <div>
            © {new Date().getFullYear()} Deliva Globe LTD. All rights reserved.
          </div>
          <div style={{ display: 'flex', gap: '20px', color: '#475569', fontWeight: '600', flexWrap: 'wrap' }}>
            <span>Twitter</span>
            <span>LinkedIn</span>
            <span>Instagram</span>
            <span>Facebook</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
