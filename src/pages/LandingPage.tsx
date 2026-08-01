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
      
      {/* Hero Section */}
      <section style={{
        position: 'relative',
        minHeight: '640px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
        overflow: 'hidden',
      }}>
        {/* Background Image without overlay */}
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
            opacity: 0.95,
          }}
        />

        <div style={{
          position: 'relative',
          zIndex: 2,
          maxWidth: '1200px',
          width: '100%',
          padding: '130px 24px 70px 24px',
        }}>
          <div style={{ maxWidth: '740px' }}>

            {/* Heading in Black */}
            <h1 className="mobile-title-sm" style={{
              fontSize: '50px',
              fontWeight: '800',
              lineHeight: '1.2',
              letterSpacing: '-1.5px',
              color: '#0F172A',
              marginBottom: '24px',
            }}>
              Building the Trust Infrastructure for Logistics Commerce
            </h1>

            {/* Subheading in Dark Charcoal */}
            <p className="mobile-text-sm" style={{
              fontSize: '18px',
              color: '#334155',
              lineHeight: '1.6',
              marginBottom: '40px',
              fontWeight: '600',
            }}>
              A technology-enabled logistics platform helping corporate fleet partners move goods reliably, fulfill orders seamlessly, and grow with confidence through transparent automated 3-way split solutions.
            </p>

            {/* Button Row */}
            <div className="mobile-stack-buttons" style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <button
                onClick={() => onNavigate('signup')}
                className="btn-primary-deliva"
                style={{ padding: '16px 36px', fontSize: '16px' }}
              >
                Register Fleet Company
                <ArrowRight size={18} />
              </button>

              <button
                onClick={() => onNavigate('login')}
                className="btn-secondary-deliva"
                style={{
                  padding: '16px 32px',
                  fontSize: '16px',
                  borderColor: '#0D1B2A',
                  color: '#0D1B2A',
                  backgroundColor: '#FFFFFF',
                }}
              >
                Sign In to Fleet Portal
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* Interactive Revenue Split & Live Pie Chart Section */}
      <section style={{ backgroundColor: '#FFFFFF', padding: '60px 20px', borderBottom: '1px solid #E2E8F0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h2 className="mobile-title-sm" style={{ fontSize: '36px', fontWeight: '800', color: '#204b7a', letterSpacing: '-1px' }}>
              Transparent Automated 3-Way Revenue Split
            </h2>
            <p style={{ fontSize: '15px', color: '#475569', marginTop: '8px' }}>
              Real-time distribution visualization powered by Deliva's automated settlement engine.
            </p>
          </div>

          <div className="mobile-grid-1col" style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '32px',
            backgroundColor: '#F8FAFC',
            borderRadius: '24px',
            padding: '36px 24px',
            border: '1px solid #E2E8F0',
            alignItems: 'center',
          }}>
            {/* Left Part: Dynamic Interactive Pie Chart */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: '#FFFFFF', padding: '32px 24px', borderRadius: '20px', border: '1px solid #E2E8F0', boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.04)' }}>
              <div style={{ fontSize: '16px', fontWeight: '800', color: '#204b7a', marginBottom: '20px', textAlign: 'center' }}>
                📊 Revenue Split Pie Chart Visualization
              </div>

              {/* Dynamic Conic-Gradient Pie Chart */}
              <div style={{
                position: 'relative',
                width: '200px',
                height: '200px',
                borderRadius: '50%',
                background: `conic-gradient(#204b7a 0% 10%, #FF6B6B 10% ${10 + companyCommissionPct}%, #0D1B2A ${10 + companyCommissionPct}% 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 24px rgba(32, 75, 122, 0.15)',
                marginBottom: '28px',
              }}>
                <div style={{
                  width: '120px',
                  height: '120px',
                  borderRadius: '50%',
                  backgroundColor: '#FFFFFF',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.1)',
                }}>
                  <span style={{ fontSize: '11px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase' }}>Trip Fare</span>
                  <span style={{ fontSize: '18px', fontWeight: '800', color: '#204b7a' }}>₦{sampleTripFare.toLocaleString()}</span>
                </div>
              </div>

              {/* Pie Chart Legend Items */}
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: '10px', backgroundColor: 'rgba(32, 75, 122, 0.08)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#204b7a' }} />
                    <span style={{ fontSize: '13px', fontWeight: '700', color: '#204b7a' }}>Deliva Platform Fee (10%)</span>
                  </div>
                  <span style={{ fontSize: '14px', fontWeight: '800', color: '#204b7a' }}>₦{delivaFee.toLocaleString()}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: '10px', backgroundColor: 'rgba(255, 107, 107, 0.08)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#FF6B6B' }} />
                    <span style={{ fontSize: '13px', fontWeight: '700', color: '#FF6B6B' }}>Company Fleet Share ({companyCommissionPct}%)</span>
                  </div>
                  <span style={{ fontSize: '14px', fontWeight: '800', color: '#FF6B6B' }}>₦{companyEarnings.toLocaleString()}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: '10px', backgroundColor: 'rgba(13, 27, 42, 0.06)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#0D1B2A' }} />
                    <span style={{ fontSize: '13px', fontWeight: '700', color: '#0D1B2A' }}>Driver Net Earning ({90 - companyCommissionPct}%)</span>
                  </div>
                  <span style={{ fontSize: '14px', fontWeight: '800', color: '#0D1B2A' }}>₦{driverNetEarnings.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Right Part: Interactive Simulator Controls */}
            <div>
              <h3 style={{ fontSize: '22px', fontWeight: '800', color: '#204b7a', marginBottom: '8px' }}>
                Commission Split Simulator
              </h3>
              <p style={{ fontSize: '14px', color: '#475569', marginBottom: '24px' }}>
                Adjust trip fare and your company commission percentage to see live calculations.
              </p>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#0F172A', marginBottom: '8px' }}>
                  Sample Delivery Trip Fare (₦) *
                </label>
                <input
                  type="number"
                  value={sampleTripFare}
                  onChange={(e) => setSampleTripFare(Number(e.target.value) || 0)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    border: '2px solid #204b7a',
                    fontSize: '18px',
                    fontWeight: '800',
                    color: '#204b7a',
                    backgroundColor: '#FFFFFF',
                  }}
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <label style={{ fontSize: '13px', fontWeight: '700', color: '#0F172A' }}>
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
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748B', marginTop: '4px', fontWeight: '600' }}>
                  <span>0%</span>
                  <span>15% (Recommended)</span>
                  <span>40% (Max)</span>
                </div>
              </div>

              <div style={{ backgroundColor: '#204b7a', padding: '20px', borderRadius: '16px', color: '#FFFFFF', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ fontSize: '13px', fontWeight: '700', opacity: 0.9 }}>
                  💡 Automated Paystack Settlement
                </div>
                <div style={{ fontSize: '14px', lineHeight: '1.5' }}>
                  When a driver completes a <strong>₦{sampleTripFare.toLocaleString()}</strong> order, <strong>₦{companyEarnings.toLocaleString()}</strong> is routed directly into your fleet company wallet instantly.
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* Fleet Capabilities Section matching CoresSection.tsx */}
      <section style={{ padding: '60px 20px', backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h2 className="mobile-title-sm" style={{ fontSize: '36px', fontWeight: '800', color: '#0F172A', letterSpacing: '-1px' }}>
              Enterprise Logistics Capabilities
            </h2>
            <p style={{ fontSize: '15px', color: '#475569', marginTop: '8px' }}>
              Logistics solutions built for growing businesses. Manage deliveries and scale with confidence.
            </p>
          </div>

          <div className="mobile-grid-1col" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
            
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
      <section style={{ backgroundColor: '#FFFFFF', padding: '60px 20px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div className="mobile-grid-1col" style={{
            backgroundColor: '#F8FAFC',
            borderRadius: '24px',
            padding: '36px 24px',
            border: '1px solid #E2E8F0',
            display: 'grid',
            gridTemplateColumns: '1.2fr 0.8fr',
            gap: '32px',
            alignItems: 'center',
          }}>
            <div>
              <h2 className="mobile-title-sm" style={{ fontSize: '32px', fontWeight: '800', color: '#0F172A', marginBottom: '12px', letterSpacing: '-0.5px' }}>
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
              padding: '32px 20px',
              textAlign: 'center',
              boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.04)',
            }}>
              <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '600', marginBottom: '4px' }}>
                Partner Registration Fee
              </div>
              <div style={{ fontSize: '42px', fontWeight: '800', color: '#0F172A', marginBottom: '4px' }}>
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
