import React, { useState } from 'react';
import {
  Truck,
  ShieldCheck,
  Zap,
  Percent,
  Users,
  ArrowRight,
  CheckCircle2,
  Building2,
  MapPin,
  TrendingUp,
  CreditCard,
  ChevronRight,
} from 'lucide-react';
import { Footer } from '../components/Footer';
import heroBgImg from '../assets/Hero_home.png';

interface LandingPageProps {
  onNavigate: (tab: string) => void;
}

export function LandingPage({ onNavigate }: LandingPageProps) {
  // Live Split Calculator State
  const [sampleTripFare, setSampleTripFare] = useState<number>(10000);
  const [companyCommissionPct, setCompanyCommissionPct] = useState<number>(15);

  const delivaFee = (sampleTripFare * 10) / 100;
  const companyEarnings = (sampleTripFare * companyCommissionPct) / 100;
  const driverNetEarnings = sampleTripFare - delivaFee - companyEarnings;

  return (
    <div className="animate-fade-in" style={{ backgroundColor: '#FFFFFF', color: '#0F172A' }}>
      
      {/* Hero Section matching main website (100vh Full Background) */}
      <section style={{
        position: 'relative',
        height: '100vh',
        minHeight: '680px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#070F17',
        overflow: 'hidden',
      }}>
        {/* Full 100vh Background Image */}
        <img
          src={heroBgImg}
          alt="Deliva Fleet Hero"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center',
          }}
        />

        {/* Gradient Overlay for legibility & contrast */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, rgba(7, 15, 23, 0.45) 0%, rgba(7, 15, 23, 0.75) 100%)',
          zIndex: 1,
        }} />

        <div style={{
          position: 'relative',
          zIndex: 2,
          maxWidth: '1200px',
          width: '100%',
          padding: '120px 32px 60px 32px',
        }}>
          <div style={{ maxWidth: '740px' }}>

            {/* Heading matching main website */}
            <h1 style={{
              fontSize: '52px',
              fontWeight: '800',
              lineHeight: '62px',
              letterSpacing: '-1.5px',
              color: '#FFFFFF',
              marginBottom: '24px',
              textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
            }}>
              Building the Trust Infrastructure for Logistics Commerce
            </h1>

            {/* Subheading matching main website */}
            <p style={{
              fontSize: '18px',
              color: 'rgba(255, 255, 255, 0.9)',
              lineHeight: '28px',
              marginBottom: '40px',
              fontWeight: '400',
              textShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
            }}>
              A technology-enabled logistics platform helping corporate fleet partners move goods reliably, fulfill orders seamlessly, and grow with confidence through transparent automated 3-way split solutions.
            </p>

            {/* Button Row matching main website */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <button
                onClick={() => onNavigate('signup')}
                className="btn-primary-deliva"
                style={{ padding: '16px 36px', fontSize: '16px' }}
              >
                Register Fleet Company (₦30,000)
                <ArrowRight size={18} />
              </button>

              <button
                onClick={() => onNavigate('login')}
                className="btn-secondary-deliva"
                style={{
                  padding: '16px 32px',
                  fontSize: '16px',
                  borderColor: '#FFFFFF',
                  color: '#FFFFFF',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(8px)',
                }}
              >
                Sign In to Fleet Portal
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* Metrics Bar */}
      <section style={{ backgroundColor: '#FFFFFF', padding: '50px 24px 0 24px' }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '24px',
          padding: '32px 40px',
          backgroundColor: '#F8FAFC',
          borderRadius: '24px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.04)',
        }}>
          <div>
            <div style={{ fontSize: '34px', fontWeight: '800', color: '#0D1B2A' }}>10% Fixed</div>
            <div style={{ fontSize: '14px', color: '#475569', fontWeight: '600', marginTop: '2px' }}>Deliva Platform Fee</div>
          </div>
          <div style={{ borderLeft: '1px solid #E2E8F0', borderRight: '1px solid #E2E8F0', paddingLeft: '36px' }}>
            <div style={{ fontSize: '34px', fontWeight: '800', color: '#FF6B6B' }}>Custom %</div>
            <div style={{ fontSize: '14px', color: '#475569', fontWeight: '600', marginTop: '2px' }}>Your Company Commission</div>
          </div>
          <div style={{ paddingLeft: '36px' }}>
            <div style={{ fontSize: '34px', fontWeight: '800', color: '#10B981' }}>Instant</div>
            <div style={{ fontSize: '14px', color: '#475569', fontWeight: '600', marginTop: '2px' }}>3-Way Wallet Settlement</div>
          </div>
        </div>
      </section>

      {/* Interactive Revenue Split Calculator Section */}
      <section style={{ backgroundColor: '#FFFFFF', padding: '90px 24px', borderBottom: '1px solid #E2E8F0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <h2 style={{ fontSize: '36px', fontWeight: '800', color: '#0F172A', letterSpacing: '-1px' }}>
              Transparent Automated 3-Way Revenue Split
            </h2>
            <p style={{ fontSize: '16px', color: '#475569', marginTop: '8px' }}>
              Test your revenue distribution live per delivery trip.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '40px',
            backgroundColor: '#F8FAFC',
            borderRadius: '24px',
            padding: '40px',
            border: '1px solid #E2E8F0',
            alignItems: 'center',
          }}>
            <div>
              <h3 style={{ fontSize: '22px', fontWeight: '800', color: '#0F172A', marginBottom: '20px' }}>
                Commission Split Simulator
              </h3>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#475569', marginBottom: '8px' }}>
                  Sample Delivery Trip Fare (₦)
                </label>
                <input
                  type="number"
                  value={sampleTripFare}
                  onChange={(e) => setSampleTripFare(Number(e.target.value) || 0)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    border: '1px solid #CBD5E1',
                    fontSize: '18px',
                    fontWeight: '800',
                    color: '#0F172A',
                    backgroundColor: '#FFFFFF',
                  }}
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <label style={{ fontSize: '13px', fontWeight: '700', color: '#475569' }}>
                    Your Fleet Company Rate (%)
                  </label>
                  <span style={{ fontSize: '18px', fontWeight: '800', color: '#FF6B6B' }}>
                    {companyCommissionPct}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="40"
                  step="1"
                  value={companyCommissionPct}
                  onChange={(e) => setCompanyCommissionPct(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#FF6B6B', cursor: 'pointer' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#94A3B8', marginTop: '4px', fontWeight: '600' }}>
                  <span>0%</span>
                  <span>15% (Standard)</span>
                  <span>40% (Max)</span>
                </div>
              </div>

              <div style={{ backgroundColor: '#FFFFFF', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '13px', color: '#475569' }}>
                💡 <strong>Instant Settlement:</strong> Delivery payments are split automatically into your company wallet immediately upon trip completion.
              </div>
            </div>

            {/* Live Result Display */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ padding: '20px', borderRadius: '16px', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '12px', color: '#94A3B8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  TRIP FARE
                </div>
                <div style={{ fontSize: '26px', fontWeight: '800', color: '#0F172A', marginTop: '2px' }}>
                  ₦{sampleTripFare.toLocaleString()}
                </div>
              </div>

              <div style={{ padding: '24px', borderRadius: '16px', backgroundColor: '#0D1B2A', color: '#FFFFFF' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ fontSize: '13px', color: '#94A3B8', fontWeight: '600' }}>Deliva Platform Fee (10%)</span>
                  <span style={{ fontSize: '16px', fontWeight: '800', color: '#38BDF8' }}>₦{delivaFee.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ fontSize: '13px', color: '#FF6B6B', fontWeight: '700' }}>Company Fleet Share ({companyCommissionPct}%)</span>
                  <span style={{ fontSize: '20px', fontWeight: '800', color: '#FF6B6B' }}>₦{companyEarnings.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                  <span style={{ fontSize: '13px', color: '#6EE7B7', fontWeight: '600' }}>Driver Net Earning</span>
                  <span style={{ fontSize: '20px', fontWeight: '800', color: '#10B981' }}>₦{driverNetEarnings.toLocaleString()}</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* Fleet Capabilities Section matching CoresSection.tsx */}
      <section style={{ padding: '90px 24px', backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <h2 style={{ fontSize: '36px', fontWeight: '800', color: '#0F172A', letterSpacing: '-1px' }}>
              Enterprise Logistics Capabilities
            </h2>
            <p style={{ fontSize: '16px', color: '#475569', marginTop: '8px' }}>
              Logistics solutions built for growing businesses. Manage deliveries and scale with confidence.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
            
            <div className="card-deliva">
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: 'rgba(13, 27, 42, 0.06)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '20px',
              }}>
                <MapPin size={24} color="#0D1B2A" />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '8px', color: '#0F172A' }}>
                Real-Time Live Driver Map
              </h3>
              <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.6 }}>
                Track your active fleet drivers in real time with complete visibility. View online statuses, active delivery routes, vehicle plate details, and order progress.
              </p>
            </div>

            <div className="card-deliva">
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: 'rgba(255, 107, 107, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '20px',
              }}>
                <Percent size={24} color="#FF6B6B" />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '8px', color: '#0F172A' }}>
                Custom Commission Controls
              </h3>
              <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.6 }}>
                You maintain total control over your fleet profitability. Adjust your company commission rate anytime from your interactive Fleet Control Dashboard.
              </p>
            </div>

            <div className="card-deliva">
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '20px',
              }}>
                <CreditCard size={24} color="#10B981" />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '8px', color: '#0F172A' }}>
                Direct Bank Payouts
              </h3>
              <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.6 }}>
                Withdraw accrued company commissions directly into your registered business bank account instantly via Paystack settlement engine.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Onboarding & Pricing Section */}
      <section style={{ backgroundColor: '#FFFFFF', padding: '90px 24px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{
            backgroundColor: '#F8FAFC',
            borderRadius: '24px',
            padding: '48px',
            border: '1px solid #E2E8F0',
            display: 'grid',
            gridTemplateColumns: '1.2fr 0.8fr',
            gap: '40px',
            alignItems: 'center',
          }}>
            <div>
              <h2 style={{ fontSize: '32px', fontWeight: '800', color: '#0F172A', marginBottom: '12px', letterSpacing: '-0.5px' }}>
                One-Time Company Registration
              </h2>
              <p style={{ fontSize: '15px', color: '#475569', lineHeight: 1.6, marginBottom: '24px' }}>
                Register your business, verify CAC registration details, and gain instant access to the Corporate Fleet Partner Portal.
              </p>

              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: '#334155', fontWeight: '600' }}>
                  <CheckCircle2 size={18} color="#10B981" /> Unlimited Fleet Drivers onboarding under your company
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: '#334155', fontWeight: '600' }}>
                  <CheckCircle2 size={18} color="#10B981" /> Interactive Live Drivers Map & Route Tracking
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: '#334155', fontWeight: '600' }}>
                  <CheckCircle2 size={18} color="#10B981" /> Customizable Commission Rate Controls
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: '#334155', fontWeight: '600' }}>
                  <CheckCircle2 size={18} color="#10B981" /> Automated 3-Way Payment Settlement Engine
                </li>
              </ul>
            </div>

            <div style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '20px',
              padding: '36px 28px',
              textAlign: 'center',
              boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.04)',
            }}>
              <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '600', marginBottom: '4px' }}>
                Partner Registration Fee
              </div>
              <div style={{ fontSize: '46px', fontWeight: '800', color: '#0F172A', marginBottom: '4px' }}>
                ₦30,000
              </div>
              <div style={{ fontSize: '12px', color: '#FF6B6B', fontWeight: '700', marginBottom: '24px' }}>
                One-Time Payment • No Monthly Subscription Fees
              </div>

              <button
                onClick={() => onNavigate('signup')}
                className="btn-primary-deliva"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                Register Company Now
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Official Deliva Footer */}
      <Footer onNavigate={onNavigate} />

    </div>
  );
}
