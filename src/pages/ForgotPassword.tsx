import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, ArrowRight } from 'lucide-react';
import { AuthLayout } from '../layouts/AuthLayout';
import { sendEmailOtp } from '../services/emailOtpService';

export function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMsg('Please enter your registered business email address.');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg('');

      const cleanEmail = email.trim().toLowerCase();
      
      // Trigger send-email-otp Edge Function
      await sendEmailOtp(cleanEmail);

      // Redirect to dedicated /reset-password page
      navigate(`/reset-password?email=${encodeURIComponent(cleanEmail)}`);

    } catch (err: any) {
      setErrorMsg(err.message || 'Failed sending OTP code. Please check your email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Forgot Password"
      subtitle="Enter your business email address to receive a 6-digit OTP security reset code"
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

      <form onSubmit={handleRequestReset}>
        
        <div style={{ marginBottom: '24px' }}>
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

        <button
          type="submit"
          disabled={loading}
          className="btn-primary-deliva"
          style={{ width: '100%', justifyContent: 'center', padding: '14px', borderRadius: '12px', opacity: loading ? 0.7 : 1 }}
        >
          {loading ? 'Sending OTP Code...' : 'Send Reset OTP Code'}
          <ArrowRight size={18} />
        </button>

        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <span style={{ fontSize: '13px', color: '#475569' }}>Remember your password? </span>
          <Link to="/login" style={{ color: '#FF6B6B', fontWeight: '700', fontSize: '13px', textDecoration: 'none' }}>
            Sign In Here
          </Link>
        </div>

      </form>
    </AuthLayout>
  );
}
