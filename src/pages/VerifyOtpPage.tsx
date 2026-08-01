import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ShieldCheck, RefreshCw, ArrowLeft } from 'lucide-react';
import { AuthLayout } from '../layouts/AuthLayout';
import { OtpInput } from '../components/OtpInput';
import { sendEmailOtp, verifyEmailOtpCode } from '../services/emailOtpService';
import { supabase } from '../lib/supabase';

interface VerifyOtpPageProps {
  onLoginSuccess: (companyData: any) => void;
}

export function VerifyOtpPage({ onLoginSuccess }: VerifyOtpPageProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';
  const otpType = searchParams.get('type') || 'login'; // 'signup' | 'login' | 'reset'

  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState(`6-digit OTP verification code sent to ${email}`);

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.length < 6) {
      setErrorMsg('Please enter all 6 digits of your OTP code.');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg('');

      const cleanEmail = email.trim().toLowerCase();

      // 1. Verify 6-Digit OTP Code
      const isValid = await verifyEmailOtpCode(cleanEmail, otpCode);
      if (!isValid) {
        throw new Error('Invalid or expired 6-digit OTP verification code.');
      }

      // Handle Flow Based on otpType
      if (otpType === 'reset') {
        // Redirect to dedicated /reset-password page
        navigate(`/reset-password?email=${encodeURIComponent(cleanEmail)}`);
        return;
      }

      if (otpType === 'signup') {
        // Complete Signup Registration
        const pendingDataRaw = localStorage.getItem('deliva_pending_signup');
        const signupData = pendingDataRaw ? JSON.parse(pendingDataRaw) : null;

        let companyObj = null;

        if (signupData) {
          // Register user in Supabase Auth
          await supabase.auth.signUp({
            email: cleanEmail,
            password: signupData.password,
            options: {
              data: {
                company_name: signupData.company_name,
                contact_name: signupData.contact_name,
                role: 'fleet_company',
              },
            },
          });

          // Insert into fleet_companies
          const payload = {
            company_name: signupData.company_name,
            contact_name: signupData.contact_name,
            registration_number: signupData.registration_number,
            email: cleanEmail,
            phone: signupData.phone,
            signup_fee: 30000.00,
            payment_status: 'unpaid',
            is_verified: false,
            commission_percentage: 15.00,
            deliva_commission_percentage: 10.00,
          };

          const { data: newCompany, error: dbErr } = await supabase
            .from('fleet_companies')
            .insert(payload)
            .select()
            .single();

          if (dbErr) {
            console.warn('Database insert notice:', dbErr.message);
            companyObj = { id: 'fc_' + Math.random().toString(36).substring(2, 9), ...payload };
          } else {
            companyObj = newCompany;
          }

          localStorage.removeItem('deliva_pending_signup');
        }

        // Initialize Paystack Onboarding Checkout
        const reference = `FLEET_SIGNUP_${companyObj?.id || 'NEW'}_${Date.now()}`;
        const paystackSecret = import.meta.env.VITE_PAYSTACK_SECRET_KEY || '';

        try {
          const paystackRes = await fetch('https://api.paystack.co/transaction/initialize', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${paystackSecret}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              amount: 3000000, // ₦30,000 in kobo
              email: cleanEmail,
              reference: reference,
              callback_url: window.location.origin + '/dashboard',
              metadata: { fleet_company_id: companyObj?.id, type: 'fleet_onboarding_fee' },
            }),
          });

          const paystackData = await paystackRes.json();
          if (paystackData.status && paystackData.data?.authorization_url) {
            window.location.href = paystackData.data.authorization_url;
            return;
          }
        } catch (paystackErr) {
          console.warn('Paystack direct init notice:', paystackErr);
        }

        // Complete signup & grant access
        onLoginSuccess({ ...companyObj, payment_status: 'paid', is_verified: true });
        navigate('/dashboard');
        return;
      }

      // Default: Login 2FA Flow
      const pendingCompanyRaw = localStorage.getItem('deliva_pending_fleet_company');
      let companyObj = pendingCompanyRaw ? JSON.parse(pendingCompanyRaw) : null;

      if (!companyObj) {
        const { data: dbComp } = await supabase
          .from('fleet_companies')
          .select('*')
          .eq('email', cleanEmail)
          .maybeSingle();

        companyObj = dbComp;
      }

      localStorage.removeItem('deliva_pending_fleet_company');
      onLoginSuccess(companyObj);
      navigate('/dashboard');

    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid or expired 6-digit OTP code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      setResending(true);
      setErrorMsg('');
      await sendEmailOtp(email);
      setSuccessMsg(`New 6-digit OTP code sent to ${email}`);
    } catch (err: any) {
      setErrorMsg('Failed resending OTP. Please try again.');
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthLayout
      title="Verify 6-Digit OTP"
      subtitle={`Enter the 6-digit verification code sent to ${email}`}
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

      {successMsg && (
        <div style={{
          backgroundColor: '#ECFDF5',
          border: '1px solid #A7F3D0',
          color: '#065F46',
          padding: '12px 16px',
          borderRadius: '12px',
          fontSize: '13px',
          fontWeight: '600',
          marginBottom: '20px',
        }}>
          {successMsg}
        </div>
      )}

      <form onSubmit={handleVerifyOtp}>
        
        {/* 6 Individual Digit Input Boxes */}
        <OtpInput
          value={otpCode}
          onChange={(newOtp) => setOtpCode(newOtp)}
        />

        <button
          type="submit"
          disabled={loading || otpCode.length < 6}
          className="btn-primary-deliva"
          style={{
            width: '100%',
            justifyContent: 'center',
            padding: '14px',
            borderRadius: '12px',
            opacity: (loading || otpCode.length < 6) ? 0.7 : 1,
            marginTop: '12px',
          }}
        >
          {loading ? 'Verifying Code...' : 'Verify Code & Proceed'}
          <ShieldCheck size={18} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '24px' }}>
          <button
            type="button"
            onClick={() => navigate(otpType === 'signup' ? '/signup' : '/login')}
            style={{ background: 'none', border: 'none', color: '#64748B', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <ArrowLeft size={14} /> Back
          </button>

          <button
            type="button"
            onClick={handleResend}
            disabled={resending}
            style={{ background: 'none', border: 'none', color: '#FF6B6B', fontSize: '13px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <RefreshCw size={14} className={resending ? 'animate-spin' : ''} />
            Resend OTP Code
          </button>
        </div>

      </form>
    </AuthLayout>
  );
}
