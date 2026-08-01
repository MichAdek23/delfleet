import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Building2, ShieldCheck, Mail, Phone, Lock, CreditCard, ArrowRight } from 'lucide-react';
import { AuthLayout } from '../layouts/AuthLayout';
import { sendEmailOtp } from '../services/emailOtpService';

interface CompanySignupProps {
  onSignupSuccess?: (companyData: any) => void;
}

export function CompanySignup({ onSignupSuccess }: CompanySignupProps = {}) {
  const navigate = useNavigate();
  const [companyName, setCompanyName] = useState('');
  const [contactName, setContactName] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName || !contactName || !registrationNumber || !email || !phone || !password) {
      setErrorMsg('Please complete all required company fields.');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg('');

      const cleanEmail = email.trim().toLowerCase();

      // Cache signup details for OTP verification step
      const signupPayload = {
        company_name: companyName,
        contact_name: contactName,
        registration_number: registrationNumber,
        email: cleanEmail,
        phone,
        password,
      };

      localStorage.setItem('deliva_pending_signup', JSON.stringify(signupPayload));

      // Trigger 6-digit OTP email via send-email-otp Edge Function
      await sendEmailOtp(cleanEmail);

      // Redirect to dedicated 6-box OTP verification page for signup
      navigate(`/verify-otp?email=${encodeURIComponent(cleanEmail)}&type=signup`);

    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Register Fleet Company"
      subtitle="One-time ₦30,000 onboarding fee • Unlimited drivers & split settlements"
    >
      {errorMsg && (
        <div style={{
          backgroundColor: '#FEF2F2',
          border: '1px solid #FCA5A5',
          color: '#991B1B',
          padding: '12px 16px',
          borderRadius: '12px',
          fontSize: '13px',
          fontWeight: '600',
          marginBottom: '20px',
        }}>
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleRegister}>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#0F172A', marginBottom: '6px' }}>
              Company Name *
            </label>
            <input
              type="text"
              placeholder="e.g. Swift Logistics LTD"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              style={{
                width: '100%',
                padding: '11px 14px',
                borderRadius: '10px',
                border: '1px solid #CBD5E1',
                fontSize: '13px',
                color: '#0F172A',
              }}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#0F172A', marginBottom: '6px' }}>
              Contact Person *
            </label>
            <input
              type="text"
              placeholder="Full Name"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              style={{
                width: '100%',
                padding: '11px 14px',
                borderRadius: '10px',
                border: '1px solid #CBD5E1',
                fontSize: '13px',
                color: '#0F172A',
              }}
              required
            />
          </div>
        </div>

        <div style={{ marginBottom: '14px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#0F172A', marginBottom: '6px' }}>
            CAC Registration Number (RC) *
          </label>
          <input
            type="text"
            placeholder="e.g. RC-1289456"
            value={registrationNumber}
            onChange={(e) => setRegistrationNumber(e.target.value)}
            style={{
              width: '100%',
              padding: '11px 14px',
              borderRadius: '10px',
              border: '1px solid #CBD5E1',
              fontSize: '13px',
              color: '#0F172A',
            }}
            required
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#0F172A', marginBottom: '6px' }}>
              Business Email *
            </label>
            <input
              type="email"
              placeholder="admin@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '11px 14px',
                borderRadius: '10px',
                border: '1px solid #CBD5E1',
                fontSize: '13px',
                color: '#0F172A',
              }}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#0F172A', marginBottom: '6px' }}>
              Phone Number *
            </label>
            <input
              type="tel"
              placeholder="+234..."
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={{
                width: '100%',
                padding: '11px 14px',
                borderRadius: '10px',
                border: '1px solid #CBD5E1',
                fontSize: '13px',
                color: '#0F172A',
              }}
              required
            />
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#0F172A', marginBottom: '6px' }}>
            Create Password *
          </label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: '100%',
              padding: '11px 14px',
              borderRadius: '10px',
              border: '1px solid #CBD5E1',
              fontSize: '13px',
              color: '#0F172A',
            }}
            required
          />
        </div>

        {/* Paystack Fee Summary Box */}
        <div style={{
          backgroundColor: '#F8FAFC',
          borderRadius: '14px',
          padding: '14px 18px',
          border: '1px solid #E2E8F0',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontSize: '11px', color: '#64748B', fontWeight: '600' }}>One-Time Onboarding Fee</div>
            <div style={{ fontSize: '20px', fontWeight: '800', color: '#0F172A' }}>₦30,000.00</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10B981', fontWeight: '700', fontSize: '12px' }}>
            <CreditCard size={16} /> Paystack Secure
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary-deliva"
          style={{ width: '100%', justifyContent: 'center', padding: '14px', borderRadius: '12px', opacity: loading ? 0.7 : 1 }}
        >
          {loading ? 'Sending OTP Code...' : 'Continue to OTP Verification'}
          <ArrowRight size={18} />
        </button>

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <span style={{ fontSize: '13px', color: '#475569' }}>Already registered? </span>
          <Link to="/login" style={{ color: '#FF6B6B', fontWeight: '700', fontSize: '13px', textDecoration: 'none' }}>
            Sign In Here
          </Link>
        </div>
      </form>

    </AuthLayout>
  );
}
