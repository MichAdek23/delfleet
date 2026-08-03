import React, { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { User, Phone, Mail, Truck, ShieldCheck, ArrowLeft, Save, CheckCircle2, AlertCircle, RefreshCw, ArrowRight, Lock, X, Calendar } from 'lucide-react';
import { Nin11Input } from '../../components/Nin11Input';
import { OtpInput } from '../../components/OtpInput';
import { supabase } from '../../lib/supabase';

function generateSecureSpecialPassword(length = 10): string {
  const uppers = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lowers = 'abcdefghijkmnpqrstuvwxyz';
  const numbers = '23456789';
  const symbols = '!@#$%^&*_-+=';
  
  let pass = '';
  pass += uppers.charAt(Math.floor(Math.random() * uppers.length));
  pass += lowers.charAt(Math.floor(Math.random() * lowers.length));
  pass += numbers.charAt(Math.floor(Math.random() * numbers.length));
  pass += symbols.charAt(Math.floor(Math.random() * symbols.length));
  
  const allChars = uppers + lowers + numbers + symbols;
  for (let i = 4; i < length; i++) {
    pass += allChars.charAt(Math.floor(Math.random() * allChars.length));
  }
  
  return pass.split('').sort(() => 0.5 - Math.random()).join('');
}

export function AddDriverPage() {
  const navigate = useNavigate();
  const { company, fetchDashboardData, onRefresh } = useOutletContext<any>();
  // NIN Step State (11 Box Input)
  const [nin, setNin] = useState('');
  const [ninVerified, setNinVerified] = useState(false);
  const [verifyingNin, setVerifyingNin] = useState(false);
  const [ninError, setNinError] = useState('');

  // Personal Info State (Names & DOB LOCKED via NIN)
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  // Email OTP Verification State (6 Multi-Box Input)
  const [email, setEmail] = useState('');
  const [sendingOtp, setSendingOtp] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [expectedOtp, setExpectedOtp] = useState<string | null>(null);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [emailOtpError, setEmailOtpError] = useState('');

  // Vehicle Information State
  const [vehicleCategory, setVehicleCategory] = useState('Motorcycle (Dispatch Bike)');
  const [vehiclePlate, setVehiclePlate] = useState('');
  const [makeModel, setMakeModel] = useState('');
  const [vehicleColor, setVehicleColor] = useState('');

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Step 1: NIN Verification Handler
  const handleVerifyNin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanNin = nin.trim();
    setNinError('');
    setErrorMsg('');

    if (!cleanNin || cleanNin.length !== 11 || !/^\d+$/.test(cleanNin)) {
      setNinError('Please enter a valid 11-digit NIN across all 11 boxes.');
      return;
    }

    setVerifyingNin(true);
    try {
      // 1. BACKEND DATABASE PRE-CHECK: Stop if NIN exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, nin')
        .eq('nin', cleanNin)
        .maybeSingle();

      if (existingProfile) {
        setNinError('User already exists');
        setNinVerified(false);
        setVerifyingNin(false);
        return;
      }

      // 2. Call Edge Function / QoreID API for NIN lookup & photo retrieval
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseKey) {
        setNinError('Supabase configuration missing.');
        setNinVerified(false);
        setVerifyingNin(false);
        return;
      }

      const response = await fetch(`${supabaseUrl}/functions/v1/discover-nin-qoreid`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({ nin: cleanNin }),
      });

      const resData = await response.json().catch(() => ({}));

      if (!response.ok || !resData.success) {
        const errText = resData.error || resData.message || 'User already exists or NIN lookup failed';
        setNinError(errText);
        setNinVerified(false);
        setVerifyingNin(false);
        return;
      }

      const data = resData.data;
      if (!data) {
        setNinError('No identity data returned for this NIN.');
        setNinVerified(false);
        setVerifyingNin(false);
        return;
      }

      const fetchedFirstName = data.firstName || data.firstname || '';
      const fetchedMiddleName = data.middleName || data.middlename || '';
      const fetchedLastName = data.lastName || data.lastname || data.surname || '';
      const fetchedDob = data.dateOfBirth || data.birthdate || data.dob || '';
      const fetchedPhone = data.phone || data.phoneNumber || '';
      const fetchedPhoto = data.photo || '';

      // Format address safely if it is a string or object
      let formattedAddress = '';
      const rawAddress = data.address || data.residenceAddress || data.residence || data.residence_address || '';
      if (typeof rawAddress === 'string') {
        formattedAddress = rawAddress;
      } else if (rawAddress && typeof rawAddress === 'object') {
        formattedAddress = [
          rawAddress.addressLine || rawAddress.line1 || rawAddress.street || rawAddress.address,
          rawAddress.lga || rawAddress.city || rawAddress.town,
          rawAddress.state,
        ].filter(Boolean).join(', ');
      }

      if (!fetchedFirstName || !fetchedLastName) {
        setNinError('NIN record incomplete or unverified.');
        setNinVerified(false);
        setVerifyingNin(false);
        return;
      }

      setFirstName(fetchedFirstName);
      setMiddleName(fetchedMiddleName);
      setLastName(fetchedLastName);
      if (fetchedDob) setDateOfBirth(fetchedDob);
      if (fetchedPhone) setPhone(fetchedPhone);
      if (formattedAddress) setAddress(formattedAddress);
      if (fetchedPhoto) {
        const photoUri = fetchedPhoto.startsWith('data:') || fetchedPhoto.startsWith('http')
          ? fetchedPhoto
          : `data:image/jpeg;base64,${fetchedPhoto}`;
        setAvatarUrl(photoUri);
      }

      setNinVerified(true);
    } catch (err: any) {
      console.error('[NIN Verification Error]', err);
      setNinError(err.message || 'Failed to verify NIN with server.');
      setNinVerified(false);
    } finally {
      setVerifyingNin(false);
    }
  };

  // Step 2: Send Driver Email OTP
  const handleSendEmailOtp = async () => {
    const cleanEmail = email.trim().toLowerCase();
    setEmailOtpError('');
    if (!cleanEmail || !/\S+@\S+\.\S+/.test(cleanEmail)) {
      setEmailOtpError('Please enter a valid driver email address.');
      return;
    }

    setSendingOtp(true);
    try {
      const { data: existingEmail } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', cleanEmail)
        .maybeSingle();

      if (existingEmail) {
        setEmailOtpError('User already exists');
        setSendingOtp(false);
        return;
      }

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const response = await fetch(`${supabaseUrl}/functions/v1/send-email-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({ email: cleanEmail }),
      });

      const resData = await response.json().catch(() => ({}));

      if (!response.ok || !resData.success) {
        const errText = resData.error || resData.message || 'Failed sending OTP to driver email.';
        setEmailOtpError(errText);
        setSendingOtp(false);
        return;
      }

      if (resData.code) {
        setExpectedOtp(resData.code);
      }

      setShowOtpInput(true);
    } catch (err: any) {
      setEmailOtpError(err.message || 'Failed sending OTP code to driver email.');
    } finally {
      setSendingOtp(false);
    }
  };

  // Step 2: Confirm OTP Code
  const handleVerifyOtp = async () => {
    const cleanOtp = otpCode.trim();
    setEmailOtpError('');
    if (!cleanOtp || cleanOtp.length !== 6) {
      setEmailOtpError('Please enter 6-digit OTP code sent to driver email.');
      return;
    }

    setVerifyingOtp(true);
    try {
      if (expectedOtp && cleanOtp !== expectedOtp) {
        setEmailOtpError('Invalid OTP verification code. Please check driver email.');
        setVerifyingOtp(false);
        return;
      }

      setEmailVerified(true);
      setShowOtpInput(false);
    } catch (err: any) {
      setEmailOtpError(err.message || 'Invalid verification OTP code.');
    } finally {
      setVerifyingOtp(false);
    }
  };

  // Final Driver Registration
  const handleRegisterDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nin || !firstName || !lastName || !email || !phone || !vehiclePlate) {
      setErrorMsg('Please complete all required driver and vehicle details.');
      return;
    }

    if (!emailVerified) {
      setErrorMsg('Please verify the driver\'s email address via OTP first.');
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim();

    try {
      setSaving(true);
      setErrorMsg('');

      const generatedPassword = generateSecureSpecialPassword(10);
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseKey) {
        throw new Error('Supabase project configuration is missing.');
      }

      // Create Driver Account via Service Role Edge Function
      const createRes = await fetch(`${supabaseUrl}/functions/v1/create-driver-account`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({
          email: cleanEmail,
          password: generatedPassword,
          firstName: firstName.trim(),
          middleName: middleName.trim() || undefined,
          lastName: lastName.trim(),
          dateOfBirth: dateOfBirth.trim() || undefined,
          phone: cleanPhone,
          vehicleType: vehicleCategory,
          vehiclePlateNumber: vehiclePlate.toUpperCase().trim(),
          vehicleMakeModel: makeModel.trim() || undefined,
          vehicleColor: vehicleColor.trim() || undefined,
          fleetId: company?.id,
          nin: nin.trim(),
          address: address.trim() || undefined,
          profilePictureUri: avatarUrl || undefined,
        }),
      });

      const createData = await createRes.json().catch(() => ({}));

      if (!createRes.ok || !createData.success) {
        const errText = createData.error || createData.message || 'Failed to create driver user account';
        throw new Error(errText);
      }

      setSuccessMsg(`Driver account registered successfully! Password (${generatedPassword}) with special characters dispatched to ${cleanEmail}.`);
      const refreshFn = fetchDashboardData || onRefresh;
      if (typeof refreshFn === 'function') {
        const refreshFn = fetchDashboardData || onRefresh;
        if (typeof refreshFn === 'function') {
          await refreshFn();
        }
      }

      setTimeout(() => {
        navigate('/dashboard/drivers');
      }, 1500);

    } catch (err: any) {
      setErrorMsg(err.message || 'Failed registering driver. Please check inputs.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1000px', width: '100%', margin: '0 auto' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <button
            onClick={() => navigate('/dashboard/drivers')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: '#64748B', fontSize: '13px', fontWeight: '600', cursor: 'pointer', marginBottom: '8px' }}
          >
            <ArrowLeft size={16} /> Back to Drivers Roster
          </button>
          <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#0F172A', letterSpacing: '-0.5px' }}>
            Register New Fleet Driver Account
          </h1>
          <p style={{ fontSize: '14px', color: '#475569', marginTop: '2px' }}>
            {!ninVerified ? 'Step 1: Enter 11-Digit NIN First across 11 boxes' : 'Step 2: Review NIN Photo Preview & Verify Driver Email'}
          </p>
        </div>
      </div>

      {/* Main Registration Card */}
      <div className="card-deliva" style={{ padding: '36px' }}>
        
        {successMsg && (
          <div style={{
            backgroundColor: '#ECFDF5',
            border: '1px solid #A7F3D0',
            color: '#065F46',
            padding: '14px 18px',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: '600',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <CheckCircle2 size={18} /> {successMsg}
          </div>
        )}

        {/* STEP 1: 11 INPUT BOXES FOR NIN FIRST */}
        {!ninVerified ? (
          <form onSubmit={handleVerifyNin} style={{ padding: '20px 0' }}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{
                width: '72px',
                height: '72px',
                borderRadius: '24px',
                backgroundColor: 'rgba(32, 75, 122, 0.08)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
              }}>
                <ShieldCheck size={36} color="#204b7a" />
              </div>
              <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#204b7a', marginBottom: '8px' }}>
                Enter Driver's 11-Digit NIN First
              </h2>
              <p style={{ fontSize: '15px', color: '#475569', maxWidth: '480px', margin: '0 auto', lineHeight: 1.6 }}>
                Type the 11-digit NIN across the boxes below. We check database records first before retrieving NIMC details.
              </p>
            </div>

            {ninError && (
              <div style={{
                backgroundColor: '#FEF2F2',
                color: '#991B1B',
                padding: '14px 18px',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '700',
                marginBottom: '24px',
                border: '1px solid #FCA5A5',
                maxWidth: '520px',
                margin: '0 auto 24px auto',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}>
                <X size={16} /> {ninError}
              </div>
            )}

            <div style={{ maxWidth: '560px', margin: '0 auto 32px auto' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#204b7a', marginBottom: '8px', textAlign: 'center' }}>
                National Identity Number (11 Digits) *
              </label>
              <Nin11Input value={nin} onChange={(newNin) => { setNin(newNin); setNinError(''); }} disabled={verifyingNin} />
            </div>

            <div style={{ textAlign: 'center' }}>
              <button
                type="submit"
                disabled={verifyingNin || nin.length !== 11}
                className="btn-primary-deliva"
                style={{ padding: '16px 36px', fontSize: '16px', borderRadius: '12px' }}
              >
                {verifyingNin ? (
                  <>
                    <RefreshCw size={18} className="animate-spin" />
                    Checking Database...
                  </>
                ) : (
                  <>
                    Verify NIN & Retrieve Details
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          /* STEP 2: FULL AUTO-FILLED REGISTRATION FORM */
          <form onSubmit={handleRegisterDriver}>
            {errorMsg && (
              <div style={{
                backgroundColor: '#FEF2F2',
                border: '1px solid #FCA5A5',
                color: '#991B1B',
                padding: '14px 18px',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '600',
                marginBottom: '24px',
              }}>
                {errorMsg}
              </div>
            )}

            {/* Verified Driver Banner with NIN Photo Preview */}
            <div style={{
              backgroundColor: 'rgba(16, 185, 129, 0.08)',
              padding: '20px',
              borderRadius: '16px',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              marginBottom: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                {/* NIN Photo Preview */}
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="NIN Official Photo"
                    style={{ width: '64px', height: '64px', borderRadius: '16px', objectFit: 'cover', border: '3px solid #204b7a' }}
                  />
                ) : (
                  <div style={{ width: '64px', height: '64px', borderRadius: '16px', backgroundColor: 'rgba(32, 75, 122, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#204b7a', fontWeight: '800', fontSize: '22px' }}>
                    {firstName.charAt(0)}{lastName.charAt(0)}
                  </div>
                )}

                <div>
                  <div style={{ fontSize: '18px', fontWeight: '800', color: '#065F46' }}>
                    {firstName} {middleName ? `${middleName} ` : ''}{lastName}
                  </div>
                  <div style={{ fontSize: '13px', color: '#475569', marginTop: '2px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ShieldCheck size={16} color="#10B981" /> Verified NIMC Photo & NIN Record ({nin})
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setNinVerified(false)}
                style={{ background: '#FFFFFF', border: '1px solid #CBD5E1', color: '#204b7a', fontSize: '13px', fontWeight: '700', padding: '8px 14px', borderRadius: '10px', cursor: 'pointer' }}
              >
                Change NIN
              </button>
            </div>

            {/* Section 1: Personal Details */}
            <div style={{ marginBottom: '32px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#204b7a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <User size={18} color="#204b7a" /> 1. Driver Personal Details (NIMC Verified)
              </h3>

              {/* Locked First, Middle, Last Name */}
              <div className="mobile-grid-1col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: '700', color: '#64748B', marginBottom: '6px' }}>
                    <Lock size={13} /> First Name *
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    readOnly
                    style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '14px', fontWeight: '700', backgroundColor: '#F1F5F9', color: '#334155' }}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: '700', color: '#64748B', marginBottom: '6px' }}>
                    <Lock size={13} /> Middle Name
                  </label>
                  <input
                    type="text"
                    value={middleName}
                    readOnly
                    style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '14px', fontWeight: '700', backgroundColor: '#F1F5F9', color: '#334155' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: '700', color: '#64748B', marginBottom: '6px' }}>
                    <Lock size={13} /> Last Name *
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    readOnly
                    style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '14px', fontWeight: '700', backgroundColor: '#F1F5F9', color: '#334155' }}
                    required
                  />
                </div>
              </div>

              {/* Locked Date of Birth & Phone Number */}
              <div className="mobile-grid-1col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: '700', color: '#64748B', marginBottom: '6px' }}>
                    <Lock size={13} /> Date of Birth (from NIN)
                  </label>
                  <input
                    type="text"
                    placeholder="DD/MM/YYYY"
                    value={dateOfBirth}
                    readOnly
                    style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '14px', fontWeight: '700', backgroundColor: '#F1F5F9', color: '#334155' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#0F172A', marginBottom: '6px' }}>
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    placeholder="+234 801 234 5678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '14px', fontWeight: '600', backgroundColor: '#FFFFFF' }}
                    required
                  />
                </div>
              </div>

              {/* Driver Email Address & 6-Box OTP Verification */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <label style={{ fontSize: '13px', fontWeight: '700', color: '#0F172A' }}>
                    Driver Email Address *
                  </label>
                  {emailVerified && (
                    <span style={{ fontSize: '12px', color: '#10B981', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <CheckCircle2 size={14} /> Email Verified
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <input
                    type="email"
                    placeholder="driver@company.com"
                    value={email}
                    disabled={emailVerified}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ flex: 1, padding: '12px 14px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '14px', backgroundColor: emailVerified ? '#F1F5F9' : '#FFFFFF' }}
                    required
                  />
                  {!emailVerified && (
                    <button
                      type="button"
                      onClick={handleSendEmailOtp}
                      disabled={sendingOtp || !email}
                      className="btn-primary-deliva"
                      style={{ padding: '12px 20px', fontSize: '14px', borderRadius: '10px', whiteSpace: 'nowrap' }}
                    >
                      {sendingOtp ? <RefreshCw size={16} className="animate-spin" /> : 'Verify Email (Send OTP)'}
                    </button>
                  )}
                </div>
                {emailOtpError && <p style={{ fontSize: '12px', color: '#EF4444', marginTop: '6px', fontWeight: '600' }}>{emailOtpError}</p>}
              </div>

              {/* 6-DIGIT MULTI-BOX OTP INPUT */}
              {showOtpInput && !emailVerified && (
                <div style={{ backgroundColor: 'rgba(32, 75, 122, 0.05)', padding: '20px 18px', borderRadius: '14px', border: '1px solid rgba(32, 75, 122, 0.2)', marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', color: '#204b7a', marginBottom: '8px', textAlign: 'center' }}>
                    ENTER 6-DIGIT EMAIL VERIFICATION CODE *
                  </label>

                  {/* 6 Multi-Box Input */}
                  <OtpInput value={otpCode} onChange={(code) => { setOtpCode(code); setEmailOtpError(''); }} length={6} disabled={verifyingOtp} />

                  <div style={{ textAlign: 'center', marginTop: '14px' }}>
                    <button
                      type="button"
                      onClick={handleVerifyOtp}
                      disabled={verifyingOtp || otpCode.length !== 6}
                      className="btn-primary-deliva"
                      style={{ padding: '12px 28px', fontSize: '14px', borderRadius: '10px' }}
                    >
                      {verifyingOtp ? <RefreshCw size={16} className="animate-spin" /> : 'Confirm & Verify Email'}
                    </button>
                  </div>
                </div>
              )}

              {/* EDITABLE Residential Address (Auto-filled from NIN string/object) */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#0F172A', marginBottom: '6px' }}>
                  Residential Address (Auto-filled from NIN, Editable)
                </label>
                <input
                  type="text"
                  placeholder="Street address, City, State"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '14px', backgroundColor: '#FFFFFF', fontWeight: '500' }}
                />
              </div>
            </div>

            {/* Section 2: Vehicle Details */}
            <div style={{ marginBottom: '32px', paddingTop: '24px', borderTop: '1px solid #E2E8F0' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#204b7a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Truck size={18} color="#204b7a" /> 2. Vehicle Information
              </h3>

              <div className="mobile-grid-1col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#0F172A', marginBottom: '6px' }}>
                    Vehicle Category *
                  </label>
                  <select
                    value={vehicleCategory}
                    onChange={(e) => setVehicleCategory(e.target.value)}
                    style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '14px', backgroundColor: '#FFFFFF', fontWeight: '600' }}
                  >
                    <option value="Motorcycle (Dispatch Bike)">Motorcycle (Dispatch Bike)</option>
                    <option value="Car / Sedan">Car / Sedan</option>
                    <option value="Minivan / Bus">Minivan / Bus</option>
                    <option value="Truck / Van">Truck / Van</option>
                    <option value="Bicycle / Foot">Bicycle / Foot</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#0F172A', marginBottom: '6px' }}>
                    Vehicle Plate Number *
                  </label>
                  <input
                    type="text"
                    placeholder="E.G. KSF-849-XY"
                    value={vehiclePlate}
                    onChange={(e) => setVehiclePlate(e.target.value)}
                    style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '14px', textTransform: 'uppercase' }}
                    required
                  />
                </div>
              </div>

              <div className="mobile-grid-1col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#0F172A', marginBottom: '6px' }}>
                    Make & Model
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Bajaj Boxer 150 / Honda Civic"
                    value={makeModel}
                    onChange={(e) => setMakeModel(e.target.value)}
                    style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '14px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#0F172A', marginBottom: '6px' }}>
                    Vehicle Color
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Black / Red"
                    value={vehicleColor}
                    onChange={(e) => setVehicleColor(e.target.value)}
                    style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '14px' }}
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Backend Account Password Notice */}
            <div style={{ backgroundColor: 'rgba(32, 75, 122, 0.06)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(32, 75, 122, 0.2)', marginBottom: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                <ShieldCheck size={20} color="#204b7a" />
                <span style={{ fontSize: '14px', fontWeight: '800', color: '#204b7a' }}>
                  Backend Secure Credentials & Special Characters Dispatch
                </span>
              </div>
              <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.5, margin: 0, fontWeight: '500' }}>
                🔒 Driver account password will be generated automatically on the backend using <strong>alphanumeric and special characters</strong> (e.g. <code>K9#m2P@8x!</code>). Full registration details will be dispatched directly to <strong>{email || 'the driver\'s email'}</strong> upon submission.
              </p>
            </div>

            {/* Submit Action */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px', paddingTop: '24px', borderTop: '1px solid #E2E8F0' }}>
              <button
                type="button"
                onClick={() => navigate('/dashboard/drivers')}
                className="btn-secondary-deliva"
                style={{ padding: '12px 24px', fontSize: '14px' }}
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving || !emailVerified}
                className="btn-primary-deliva"
                style={{ padding: '12px 32px', fontSize: '14px', opacity: saving || !emailVerified ? 0.6 : 1 }}
              >
                <Save size={16} />
                {saving ? 'Registering Driver...' : 'Register Fleet Driver Account'}
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
}
