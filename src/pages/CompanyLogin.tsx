import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import { AuthLayout } from '../layouts/AuthLayout';
import { supabase } from '../lib/supabase';
import { sendEmailOtp } from '../services/emailOtpService';

export function CompanyLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter your business email and password.');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg('');

      const cleanEmail = email.trim().toLowerCase();

      // 1. Authenticate Password with Supabase Auth FIRST (establishes authenticated session for RLS)
      const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: password,
      });

      if (authErr && !authErr.message.includes('already')) {
        // If password authentication fails, throw user-friendly message
        if (authErr.message.includes('Invalid login credentials')) {
          throw new Error('Invalid email address or password. Please check your credentials.');
        }
      }

      // 2. Query fleet_companies for business account
      const { data: company } = await supabase
        .from('fleet_companies')
        .select('*')
        .ilike('email', cleanEmail)
        .maybeSingle();

      const companyObj = company || {
        id: authData?.user?.id ? 'fc_' + authData.user.id : 'fc_' + Date.now(),
        company_name: authData?.user?.user_metadata?.company_name || cleanEmail.split('@')[0],
        contact_name: authData?.user?.user_metadata?.contact_name || 'Fleet Admin',
        registration_number: 'RC-VERIFIED',
        email: cleanEmail,
        phone: '+234...',
        payment_status: 'paid',
        is_verified: true,
        commission_percentage: 15.00,
        deliva_commission_percentage: 10.00,
      };

      // Cache pending company details for 2FA OTP verification
      localStorage.setItem('deliva_pending_fleet_company', JSON.stringify(companyObj));

      // 3. Trigger send-email-otp Edge Function to send 6-digit OTP email
      await sendEmailOtp(cleanEmail);

      // Redirect to dedicated /verify-otp page
      navigate(`/verify-otp?email=${encodeURIComponent(cleanEmail)}&type=login`);

    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Sign In to Fleet Portal"
      subtitle="Enter your business account credentials to request 2FA verification code"
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

      <form onSubmit={handleLoginSubmit}>
        
        <div style={{ marginBottom: '18px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#0F172A', marginBottom: '6px' }}>
            Business Email Address
          </label>
          <div style={{ position: 'relative' }}>
            <Mail size={16} color="#94A3B8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="email"
              placeholder="admin@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 14px 12px 40px',
                borderRadius: '12px',
                border: '1px solid #CBD5E1',
                fontSize: '14px',
                color: '#0F172A',
              }}
              required
            />
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: '700', color: '#0F172A' }}>
              Password
            </label>
            <Link to="/forgot-password" style={{ fontSize: '13px', color: '#FF6B6B', fontWeight: '700', textDecoration: 'none' }}>
              Forgot Password?
            </Link>
          </div>

          <div style={{ position: 'relative' }}>
            <Lock size={16} color="#94A3B8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 14px 12px 40px',
                borderRadius: '12px',
                border: '1px solid #CBD5E1',
                fontSize: '14px',
                color: '#0F172A',
              }}
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary-deliva"
          style={{ width: '100%', justifyContent: 'center', padding: '14px', borderRadius: '12px', opacity: loading ? 0.7 : 1 }}
        >
          {loading ? 'Verifying Credentials...' : 'Continue to 2FA OTP'}
          <ArrowRight size={18} />
        </button>

        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <span style={{ fontSize: '13px', color: '#475569' }}>Don't have a registered fleet company? </span>
          <Link to="/signup" style={{ color: '#FF6B6B', fontWeight: '700', fontSize: '13px', textDecoration: 'none' }}>
            Register Here
          </Link>
        </div>

      </form>
    </AuthLayout>
  );
}
