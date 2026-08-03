import React, { useState, useEffect } from 'react';
import { X, UserPlus, Truck, Mail, Phone, Lock, CheckCircle2, ShieldCheck, RefreshCw, ArrowRight, User, Check, Sparkles, Calendar } from 'lucide-react';
import { Nin11Input } from './Nin11Input';
import { OtpInput } from './OtpInput';
import { supabase } from '../lib/supabase';

interface AddDriverModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddDriver: (driverData: {
    nin: string;
    first_name: string;
    middle_name?: string;
    last_name: string;
    email: string;
    phone: string;
    address?: string;
    date_of_birth?: string;
    vehicle_type: string;
    vehicle_plate: string;
    vehicle_make_model?: string;
    vehicle_color?: string;
    password?: string;
    avatar_url?: string;
  }) => Promise<void>;
}

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

export function AddDriverModal({ isOpen, onClose, onAddDriver }: AddDriverModalProps) {
  // NIN Step State (Step 1 vs Step 2)
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

  // Email Verification & OTP State (6 Multi-Box Input)
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

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      setNin('');
      setNinVerified(false);
      setNinError('');
      setErrorMsg('');
      setSuccessMsg('');
      setFirstName('');
      setMiddleName('');
      setLastName('');
      setDateOfBirth('');
      setEmail('');
      setPhone('');
      setAddress('');
      setAvatarUrl('');
      setSendingOtp(false);
      setShowOtpInput(false);
      setOtpCode('');
      setExpectedOtp(null);
      setEmailVerified(false);
      setEmailOtpError('');
      setVehiclePlate('');
      setMakeModel('');
      setVehicleColor('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

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
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nin || !firstName || !lastName || !email || !phone || !vehiclePlate) {
      setErrorMsg('Please complete all required driver & vehicle details.');
      return;
    }

    if (!emailVerified) {
      setErrorMsg('Please verify the driver\'s email address via OTP first.');
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim();

    try {
      setLoading(true);
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

      // Call parent onAddDriver callback
      await onAddDriver({
        nin: nin.trim(),
        first_name: firstName,
        middle_name: middleName,
        last_name: lastName,
        email: cleanEmail,
        phone: cleanPhone,
        address,
        date_of_birth: dateOfBirth,
        vehicle_type: vehicleCategory,
        vehicle_plate: vehiclePlate.toUpperCase().trim(),
        vehicle_make_model: makeModel,
        vehicle_color: vehicleColor,
        password: generatedPassword,
        avatar_url: avatarUrl,
      });

      setSuccessMsg(`Driver account created successfully! Credentials (${generatedPassword}) with special characters dispatched to ${cleanEmail}.`);
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to register fleet driver.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(7, 15, 30, 0.78)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      padding: '16px',
    }}>
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '24px',
        maxWidth: '640px',
        width: '100%',
        maxHeight: '90vh',
        boxShadow: '0 25px 60px -15px rgba(15, 23, 42, 0.3)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        animation: 'fadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        border: '1px solid #E2E8F0',
      }}>
        
        {/* Header */}
        <div style={{
          backgroundColor: '#204b7a',
          padding: '24px 28px',
          color: '#FFFFFF',
          position: 'relative',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '14px',
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(8px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(255, 255, 255, 0.25)',
              }}>
                <UserPlus size={22} color="#FFFFFF" />
              </div>
              <div>
                <h3 style={{ fontSize: '20px', fontWeight: '800', letterSpacing: '-0.3px', margin: 0, lineHeight: 1.2 }}>
                  Register Fleet Driver Account
                </h3>
                <p style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.85)', margin: '4px 0 0 0', fontWeight: '500' }}>
                  {!ninVerified ? 'Step 1 of 2: National Identity Verification' : 'Step 2 of 2: Driver Account Onboarding'}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              style={{
                background: 'rgba(255, 255, 255, 0.12)',
                border: 'none',
                color: '#FFFFFF',
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Progress Bar */}
          <div style={{ display: 'flex', gap: '8px', marginTop: '20px' }}>
            <div style={{ flex: 1, height: '4px', borderRadius: '2px', backgroundColor: '#FFFFFF', opacity: 1 }} />
            <div style={{ flex: 1, height: '4px', borderRadius: '2px', backgroundColor: '#FFFFFF', opacity: ninVerified ? 1 : 0.3, transition: 'all 0.3s ease' }} />
          </div>
        </div>

        {/* Scrollable Body */}
        <div style={{ overflowY: 'auto', flex: 1 }}>
          
          {/* STEP 1: 11 INPUT BOXES FOR NIN FIRST */}
          {!ninVerified ? (
            <form onSubmit={handleVerifyNin} style={{ padding: '36px 28px' }}>
              <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                <div style={{
                  width: '72px',
                  height: '72px',
                  borderRadius: '24px',
                  backgroundColor: 'rgba(32, 75, 122, 0.08)',
                  border: '1px solid rgba(32, 75, 122, 0.15)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px',
                  boxShadow: '0 8px 20px -4px rgba(32, 75, 122, 0.12)',
                }}>
                  <ShieldCheck size={36} color="#204b7a" />
                </div>
                <h4 style={{ fontSize: '22px', fontWeight: '800', color: '#0F172A', marginBottom: '8px', letterSpacing: '-0.4px' }}>
                  Verify Driver NIN First
                </h4>
                <p style={{ fontSize: '14px', color: '#475569', maxWidth: '440px', margin: '0 auto', lineHeight: 1.6 }}>
                  Enter the 11-digit National Identity Number across the boxes below. We check system database records before pulling NIMC details.
                </p>
              </div>

              {ninError && (
                <div style={{
                  backgroundColor: '#FEF2F2',
                  color: '#991B1B',
                  padding: '14px 18px',
                  borderRadius: '14px',
                  fontSize: '13px',
                  fontWeight: '700',
                  marginBottom: '24px',
                  border: '1px solid #FCA5A5',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}>
                  <X size={16} /> {ninError}
                </div>
              )}

              {/* 11 Input Boxes */}
              <div style={{ marginBottom: '32px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', color: '#204b7a', marginBottom: '12px', textAlign: 'center', letterSpacing: '0.5px' }}>
                  NATIONAL IDENTITY NUMBER (11 DIGITS) *
                </label>
                <Nin11Input value={nin} onChange={(newNin) => { setNin(newNin); setNinError(''); }} disabled={verifyingNin} />
              </div>

              {/* Action Row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', paddingTop: '16px', borderTop: '1px solid #F1F5F9' }}>
                <button type="button" onClick={onClose} className="btn-secondary-deliva" style={{ padding: '12px 24px', borderRadius: '12px' }}>
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={verifyingNin || nin.length !== 11}
                  className="btn-primary-deliva"
                  style={{
                    padding: '14px 32px',
                    fontSize: '15px',
                    borderRadius: '12px',
                    opacity: verifyingNin || nin.length !== 11 ? 0.6 : 1,
                    cursor: verifyingNin || nin.length !== 11 ? 'not-allowed' : 'pointer',
                  }}
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
            <form onSubmit={handleSubmit} style={{ padding: '28px' }}>
              {errorMsg && (
                <div style={{
                  backgroundColor: '#FEF2F2',
                  color: '#991B1B',
                  padding: '14px 18px',
                  borderRadius: '14px',
                  fontSize: '13px',
                  fontWeight: '600',
                  marginBottom: '20px',
                  border: '1px solid #FCA5A5',
                }}>
                  {errorMsg}
                </div>
              )}

              {successMsg && (
                <div style={{
                  backgroundColor: '#ECFDF5',
                  color: '#065F46',
                  padding: '14px 18px',
                  borderRadius: '14px',
                  fontSize: '13px',
                  fontWeight: '700',
                  marginBottom: '20px',
                  border: '1px solid #A7F3D0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}>
                  <CheckCircle2 size={18} /> {successMsg}
                </div>
              )}

              {/* Verified Driver Banner Card with NIN Photo Preview */}
              <div style={{
                backgroundColor: '#F8FAFC',
                padding: '20px',
                borderRadius: '18px',
                border: '1px solid #E2E8F0',
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  {/* NIN Photo Preview */}
                  <div style={{ position: 'relative' }}>
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt="NIN Official Photo"
                        style={{ width: '64px', height: '64px', borderRadius: '16px', objectFit: 'cover', border: '3px solid #204b7a', boxShadow: '0 4px 12px rgba(32, 75, 122, 0.15)' }}
                      />
                    ) : (
                      <div style={{ width: '64px', height: '64px', borderRadius: '16px', backgroundColor: 'rgba(32, 75, 122, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#204b7a', fontWeight: '800', fontSize: '22px', border: '2px solid #204b7a' }}>
                        {firstName.charAt(0)}{lastName.charAt(0)}
                      </div>
                    )}
                    <span style={{ position: 'absolute', bottom: '-4px', right: '-4px', backgroundColor: '#10B981', color: '#FFF', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #FFF' }}>
                      <CheckCircle2 size={12} />
                    </span>
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '17px', fontWeight: '800', color: '#0F172A' }}>
                        {firstName} {middleName ? `${middleName} ` : ''}{lastName}
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748B', marginTop: '4px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <ShieldCheck size={14} color="#10B981" /> Verified NIMC Photo & NIN Record ({nin})
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setNinVerified(false)}
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    color: '#204b7a',
                    fontSize: '12px',
                    fontWeight: '700',
                    padding: '8px 14px',
                    borderRadius: '10px',
                    cursor: 'pointer',
                  }}
                >
                  Change NIN
                </button>
              </div>

              {/* Card 1: 👤 Driver Personal Details */}
              <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '16px', border: '1px solid #E2E8F0', marginBottom: '20px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: '800', color: '#204b7a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <User size={16} /> 1. Driver Personal Details (NIMC Verified)
                </h4>

                {/* Locked First, Middle, Last Name */}
                <div className="mobile-grid-1col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                  <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: '700', color: '#64748B', marginBottom: '6px' }}>
                      <Lock size={12} /> First Name *
                    </label>
                    <input
                      type="text"
                      value={firstName}
                      readOnly
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '13px', fontWeight: '700', backgroundColor: '#F1F5F9', color: '#334155' }}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: '700', color: '#64748B', marginBottom: '6px' }}>
                      <Lock size={12} /> Middle Name
                    </label>
                    <input
                      type="text"
                      value={middleName}
                      readOnly
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '13px', fontWeight: '700', backgroundColor: '#F1F5F9', color: '#334155' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: '700', color: '#64748B', marginBottom: '6px' }}>
                      <Lock size={12} /> Last Name *
                    </label>
                    <input
                      type="text"
                      value={lastName}
                      readOnly
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '13px', fontWeight: '700', backgroundColor: '#F1F5F9', color: '#334155' }}
                      required
                    />
                  </div>
                </div>

                {/* Locked Date of Birth & Phone Number */}
                <div className="mobile-grid-1col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                  <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: '700', color: '#64748B', marginBottom: '6px' }}>
                      <Lock size={12} /> Date of Birth (from NIN)
                    </label>
                    <input
                      type="text"
                      placeholder="DD/MM/YYYY"
                      value={dateOfBirth}
                      readOnly
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '13px', fontWeight: '700', backgroundColor: '#F1F5F9', color: '#334155' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#0F172A', marginBottom: '6px' }}>
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      placeholder="+234 801 234 5678"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '14px', fontWeight: '600', backgroundColor: '#FFFFFF' }}
                      required
                    />
                  </div>
                </div>

                {/* Driver Email Address & 6-Box OTP Verification */}
                <div style={{ marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <label style={{ fontSize: '12px', fontWeight: '700', color: '#0F172A' }}>
                      Driver Email Address *
                    </label>
                    {emailVerified && (
                      <span style={{ fontSize: '11px', color: '#10B981', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <CheckCircle2 size={13} /> Email Verified
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="email"
                      placeholder="driver@company.com"
                      value={email}
                      disabled={emailVerified}
                      onChange={(e) => setEmail(e.target.value)}
                      style={{ flex: 1, padding: '10px 14px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '14px', backgroundColor: emailVerified ? '#F1F5F9' : '#FFFFFF' }}
                      required
                    />
                    {!emailVerified && (
                      <button
                        type="button"
                        onClick={handleSendEmailOtp}
                        disabled={sendingOtp || !email}
                        className="btn-primary-deliva"
                        style={{ padding: '10px 16px', fontSize: '13px', borderRadius: '10px', whiteSpace: 'nowrap' }}
                      >
                        {sendingOtp ? <RefreshCw size={14} className="animate-spin" /> : 'Verify Email (Send OTP)'}
                      </button>
                    )}
                  </div>
                  {emailOtpError && <p style={{ fontSize: '12px', color: '#EF4444', marginTop: '6px', fontWeight: '600' }}>{emailOtpError}</p>}
                </div>

                {/* 6-DIGIT MULTI-BOX OTP INPUT */}
                {showOtpInput && !emailVerified && (
                  <div style={{ backgroundColor: 'rgba(32, 75, 122, 0.05)', padding: '18px 16px', borderRadius: '14px', border: '1px solid rgba(32, 75, 122, 0.2)', marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', color: '#204b7a', marginBottom: '8px', textAlign: 'center' }}>
                      ENTER 6-DIGIT EMAIL VERIFICATION CODE *
                    </label>

                    {/* 6 Multi-Box Input */}
                    <OtpInput value={otpCode} onChange={(code) => { setOtpCode(code); setEmailOtpError(''); }} length={6} disabled={verifyingOtp} />

                    <div style={{ textAlign: 'center', marginTop: '12px' }}>
                      <button
                        type="button"
                        onClick={handleVerifyOtp}
                        disabled={verifyingOtp || otpCode.length !== 6}
                        className="btn-primary-deliva"
                        style={{ padding: '10px 24px', fontSize: '13px', borderRadius: '10px' }}
                      >
                        {verifyingOtp ? <RefreshCw size={14} className="animate-spin" /> : 'Confirm & Verify Email'}
                      </button>
                    </div>
                  </div>
                )}

                {/* EDITABLE Residential Address (Auto-filled from NIN string/object) */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#0F172A', marginBottom: '6px' }}>
                    Residential Address (Auto-filled from NIN, Editable)
                  </label>
                  <input
                    type="text"
                    placeholder="Street address, City, State"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '14px', backgroundColor: '#FFFFFF', fontWeight: '500' }}
                  />
                </div>
              </div>

              {/* Card 2: 🚚 Vehicle Information */}
              <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '16px', border: '1px solid #E2E8F0', marginBottom: '20px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: '800', color: '#204b7a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Truck size={16} /> 2. Vehicle Information
                </h4>

                <div className="mobile-grid-1col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>
                      Vehicle Category *
                    </label>
                    <select
                      value={vehicleCategory}
                      onChange={(e) => setVehicleCategory(e.target.value)}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '13px', backgroundColor: '#FFFFFF', fontWeight: '600' }}
                    >
                      <option value="Motorcycle (Dispatch Bike)">Motorcycle (Dispatch Bike)</option>
                      <option value="Car / Sedan">Car / Sedan</option>
                      <option value="Minivan / Bus">Minivan / Bus</option>
                      <option value="Truck / Van">Truck / Van</option>
                      <option value="Bicycle / Foot">Bicycle / Foot</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>
                      Vehicle Plate Number *
                    </label>
                    <input
                      type="text"
                      placeholder="E.G. KSF-849-XY"
                      value={vehiclePlate}
                      onChange={(e) => setVehiclePlate(e.target.value)}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '13px', textTransform: 'uppercase' }}
                      required
                    />
                  </div>
                </div>

                <div className="mobile-grid-1col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>
                      Make & Model
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Bajaj Boxer 150 / Honda Civic"
                      value={makeModel}
                      onChange={(e) => setMakeModel(e.target.value)}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>
                      Vehicle Color
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Black / Red"
                      value={vehicleColor}
                      onChange={(e) => setVehicleColor(e.target.value)}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                    />
                  </div>
                </div>
              </div>

              {/* Card 3: 🔒 Secure Backend Account Password Notice */}
              <div style={{ backgroundColor: 'rgba(32, 75, 122, 0.06)', padding: '18px 20px', borderRadius: '16px', border: '1px solid rgba(32, 75, 122, 0.2)', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                  <ShieldCheck size={18} color="#204b7a" />
                  <span style={{ fontSize: '13px', fontWeight: '800', color: '#204b7a' }}>
                    Backend Secure Credentials & Special Characters Dispatch
                  </span>
                </div>
                <p style={{ fontSize: '12px', color: '#475569', lineHeight: 1.5, margin: 0, fontWeight: '500' }}>
                  🔒 Driver account password will be generated automatically on the backend using <strong>alphanumeric and special characters</strong> (e.g. <code>K9#m2P@8x!</code>). Full registration details will be dispatched directly to <strong>{email || 'the driver\'s email'}</strong> upon submission.
                </p>
              </div>

              {/* Bottom Sticky Action Footer */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '14px', paddingTop: '16px', borderTop: '1px solid #E2E8F0' }}>
                <button type="button" onClick={onClose} className="btn-secondary-deliva" style={{ padding: '12px 24px', borderRadius: '12px' }}>
                  Cancel
                </button>
                <button type="submit" disabled={loading || !emailVerified} className="btn-primary-deliva" style={{ padding: '12px 32px', borderRadius: '12px', fontSize: '15px', opacity: loading || !emailVerified ? 0.6 : 1 }}>
                  {loading ? 'Registering Driver...' : 'Register Fleet Driver Account'}
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
